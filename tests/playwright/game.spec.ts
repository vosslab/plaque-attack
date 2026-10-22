import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { chooseFirstSurgeonIfNeeded } from "./helper_first_run";

// Selector contract: src/index.html:18 owns named regions, buttons, arena and HUD IDs;
// src/ui.ts:55/91/121 owns briefing, HUD and result text;
// src/main.ts:139/411 and src/dialogs.ts:167 own pause, art retry and score display;
// src/save_load.ts:83 owns v1 migration and v2 campaign-tagged device saves.
// Failures require repairing the corresponding user journey before release.
const save_key = "plaque_trouble_save";

async function controlledPage(page: Page): Promise<void> {
  const start = new Date("2026-10-22T12:00:00.000Z");
  await page.clock.install({ time: start });
  await page.goto("/");
  await chooseFirstSurgeonIfNeeded(page);
  await expect(page.getByRole("button", { name: "Play campaign", exact: true })).toBeVisible();
  // Art loads independently of the menu; finish startup before freezing game time.
  await expect(page.locator("#start_level")).toBeEnabled();
  const ready = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(ready + 100));
}

async function startLevel(page: Page): Promise<void> {
  const start = page.getByRole("button", { name: "Start stage", exact: true });
  await expect(start).toBeEnabled();
  await start.click();
  await page.clock.runFor(100);
  await expect(page.getByRole("region", { name: "Arcade arena" })).toBeVisible();
  await expect(page.locator("#arena")).toBeFocused();
}

async function untilRunEnds(page: Page, move = false): Promise<void> {
  const result = page
    .getByRole("region")
    .filter({ has: page.getByRole("heading", { name: "Run ended", exact: true }) });
  // Actual movement meets drifting hazards; practice overload also ends an idle run.
  for (let elapsed = 0; elapsed < 240_000 && !(await result.isVisible()); elapsed += 3000) {
    const direction = elapsed % 6000 === 0 ? "ArrowLeft" : "ArrowRight";
    if (move) await page.keyboard.down(direction);
    await page.clock.runFor(3000);
    if (move) await page.keyboard.up(direction);
  }
  await expect(result).toBeVisible();
}

test("smoke: campaign opens the first briefing and returns to the menu", async ({ page }) => {
  const page_errors: string[] = [];
  page.on("pageerror", (error) => page_errors.push(error.message));

  await page.goto("/");
  await chooseFirstSurgeonIfNeeded(page);
  const menu = page.getByRole("region", { name: "Plaque Attack", exact: true });
  const play = page.getByRole("button", { name: "Play campaign", exact: true });
  await expect(menu).toBeVisible();
  await play.click();

  const briefing = page.getByRole("region", { name: /^Stage 1:/ });
  await expect(briefing).toBeVisible();
  await expect(menu).toBeHidden();
  await expect(briefing.getByRole("heading", { name: /^Stage 1:/ })).toBeVisible();
  await briefing.getByRole("button", { name: "Back to menu", exact: true }).click();

  await expect(menu).toBeVisible();
  await expect(briefing).toBeHidden();
  await expect(play).toBeFocused();
  expect(page_errors, "Uncaught application errors during campaign navigation").toEqual([]);
});

test("movement and held fire split plaque, and P and Escape freeze and resume the game", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await controlledPage(page);
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await startLevel(page);
  await page.clock.runFor(3200);
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(100);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.down("ArrowLeft");
  await page.clock.runFor(100);
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.down("Space");
  // Observe an actual split rather than assuming a particular fragment travel time.
  for (let elapsed = 0; elapsed < 30_000; elapsed += 250) {
    await page.clock.runFor(250);
    const complete = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return (
        raw !== null &&
        (
          JSON.parse(raw) as { settings: { completedTutorials: string[] } }
        ).settings.completedTutorials.includes("split")
      );
    }, save_key);
    if (complete) break;
  }
  await page.keyboard.up("Space");
  await expect(page.getByRole("region", { name: "Arcade arena" })).toBeVisible();
  expect(Number(await page.locator("#hud_score").textContent())).toBeGreaterThan(0);
  const tutorials = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw === null
      ? []
      : (JSON.parse(raw) as { settings: { completedTutorials: string[] } }).settings
          .completedTutorials;
  }, save_key);
  expect(tutorials).toContain("move");
  expect(tutorials).toContain("fire");
  expect(tutorials).toContain("split");

  for (const key of ["p", "Escape"]) {
    await page.keyboard.press(key);
    const pause = page.getByRole("dialog", { name: "Take a breather" });
    await expect(pause).toBeVisible();
    await expect(pause.getByRole("heading", { name: "Take a breather" })).toBeFocused();
    const frozen = await page.locator(".game_hud").innerText();
    await page.clock.runFor(5000);
    expect(await page.locator(".game_hud").innerText()).toBe(frozen);
    await page.keyboard.press(key);
    await expect(pause).toBeHidden();
    await expect(page.locator("#arena")).toBeFocused();
    const before = await page.locator("#hud_time").textContent();
    await page.clock.runFor(1100);
    await expect(page.locator("#hud_time")).not.toHaveText(before ?? "");
  }
  await page.keyboard.down("Space");
  const cleared = page.getByRole("heading", { name: "Plaque cleared!", exact: true });
  for (let elapsed = 0; elapsed < 120_000 && !(await cleared.isVisible()); elapsed += 1000) {
    await page.clock.runFor(1000);
  }
  await page.keyboard.up("Space");
  await expect(cleared).toBeVisible();
  const recovery = page.getByRole("dialog", { name: "Patient recovery", exact: true });
  await expect(recovery).toBeHidden();
  await expect(page.locator("#result_recovery_note")).toContainText("Route restored");
  await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
  await expect(recovery).toBeVisible();
  await recovery.getByRole("button", { name: "Close", exact: true }).click();
  await expect(recovery).toBeHidden();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Stage 2: Little trouble", exact: true }),
  ).toBeVisible();
  await startLevel(page);
  await expect(page.locator("#hud_level")).toHaveText("Stage 2: Little trouble");
});

test("a campaign ends once, records its score, and offers a fresh retry", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: save_key,
    value: JSON.stringify({
      version: 3,
      settings: { music: false, effects: false, completedTutorials: [], surgeonId: "maya" },
      unlockedLevel: 1,
      records: [],
      completedLevelIds: [1],
    }),
  });
  await controlledPage(page);
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await startLevel(page);
  await untilRunEnds(page, true);
  const result = page
    .getByRole("region")
    .filter({ has: page.getByRole("heading", { name: "Run ended", exact: true }) });
  await expect(result).toBeVisible();
  await expect(result.getByRole("heading", { name: "Run ended" })).toBeFocused();
  await expect(result).toContainText("High-score rank: 1 / 5");
  await expect(result.getByRole("button", { name: "Continue", exact: true })).toBeHidden();
  const saved = await page.evaluate((key) => localStorage.getItem(key), save_key);
  expect(saved).not.toBeNull();
  const data = JSON.parse(saved ?? "null") as {
    version: number;
    records: { campaign: string; levelReached: number; outcome: string }[];
    completedLevelIds: number[];
  };
  expect(data.version).toBe(3);
  expect(data.completedLevelIds).toEqual([1]);
  expect(data.records).toHaveLength(1);
  expect(data.records[0]).toMatchObject({
    campaign: "expanded",
    levelReached: 1,
    outcome: "ended",
  });
  await page.clock.runFor(10_000);
  expect(await page.evaluate((key) => localStorage.getItem(key), save_key)).toBe(saved);
  await result.getByRole("button", { name: "Retry campaign", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Stage 1:/ })).toBeVisible();
  await startLevel(page);
  await expect(page.locator("#hud_lives")).toContainText("3 / 3");
  await expect(page.locator("#hud_score")).toHaveText("000000");
  await page.keyboard.press("p");
  await page.getByRole("button", { name: "Main menu", exact: true }).click();
  await page.clock.runFor(1);
  await page.getByRole("button", { name: "Leave campaign", exact: true }).click();
  await page.getByRole("button", { name: "High scores", exact: true }).click();
  const scores = page.getByRole("dialog", { name: "High scores", exact: true });
  await expect(scores.getByRole("listitem")).toHaveCount(1);
  await expect(scores).toContainText("Expanded 24 / Stage 1 / Run ended");
  expect(await page.evaluate((key) => localStorage.getItem(key), save_key)).toBe(saved);
});

test("prior progress unlocks the drug and maintenance practice modes without ranking", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const prior = JSON.stringify({
    version: 1,
    settings: { music: false, effects: false, completedTutorials: ["move", "fire", "split"] },
    unlockedLevel: 15,
    records: [
      { score: 1234, levelReached: 15, outcome: "completed", date: "2026-10-21T12:00:00.000Z" },
    ],
  });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: save_key,
    value: prior,
  });
  await controlledPage(page);
  const chosenSave = await page.evaluate((key) => localStorage.getItem(key), save_key);
  expect(JSON.parse(chosenSave ?? "null")).toMatchObject({
    version: 3,
    unlockedLevel: 15,
    settings: { surgeonId: "maya", surgeonChosen: true },
    records: [{ campaign: "classic", score: 1234, levelReached: 15, outcome: "completed" }],
  });
  await page.getByRole("button", { name: "High scores", exact: true }).click();
  const scores = page.getByRole("dialog", { name: "High scores", exact: true });
  await expect(scores).toContainText("Classic 15 / Stage 15 / Completed");
  await expect(scores).not.toContainText("Stage 24");
  await scores.getByRole("button", { name: "Close", exact: true }).click();
  for (const [ordinal, tool] of [
    [7, "Aspirin"],
    [13, "Clopidogrel"],
    [24, "Dual antiplatelet mode"],
  ] as const) {
    await page.getByRole("button", { name: "Practice", exact: true }).click();
    await page.getByRole("button", { name: new RegExp(`^Stage ${ordinal}:`) }).click();
    await expect(page.locator("#briefing_weapon")).toHaveText(tool);
    await startLevel(page);
    await expect(page.locator("#hud_level")).toContainText(`Stage ${ordinal}:`);
    await expect(page.locator("#hud_level")).toContainText("Practice");
    await expect(page.locator("#hud_weapon")).toHaveText(tool);
    await page.clock.runFor(4000);
    await expect(page.locator("#hud_time_label")).toHaveText(
      ordinal === 24 ? "Remaining" : "Elapsed",
    );
    await expect(page.locator("#hud_objective")).toContainText(
      ordinal === 24 ? "Active platelet hazards:" : "Hazards remaining:",
    );
    await page.keyboard.press("p");
    await page.getByRole("button", { name: "Restart practice", exact: true }).click();
    await page.clock.runFor(100);
    await expect(page.locator("#hud_level")).toContainText(`Stage ${ordinal}:`);
    await expect(page.locator("#hud_score")).toHaveText("000000");
    await untilRunEnds(page);
    const result = page
      .getByRole("region")
      .filter({ has: page.getByRole("heading", { name: "Run ended", exact: true }) });
    await expect(result).toBeVisible();
    await expect(result).toContainText("Practice / Unranked");
    await expect(result).not.toContainText("High-score rank");
    await result.getByRole("button", { name: "Retry practice", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: new RegExp(`^Stage ${ordinal}:`) }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to menu", exact: true }).click();
  }
  expect(await page.evaluate((key) => localStorage.getItem(key), save_key)).toBe(chosenSave);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const settings = page.getByRole("dialog", { name: "Settings", exact: true });
  await settings.getByLabel("Music", { exact: true }).check();
  await settings.getByRole("button", { name: "Done", exact: true }).click();
  const migratedRaw = await page.evaluate((key) => localStorage.getItem(key), save_key);
  const migrated = JSON.parse(migratedRaw ?? "null") as {
    version: number;
    unlockedLevel: number;
    records: { campaign: string; levelReached: number; outcome: string }[];
  };
  expect(migrated.version).toBe(3);
  expect(migrated.unlockedLevel).toBe(15);
  expect(migrated.records).toHaveLength(1);
  expect(migrated.records[0]).toMatchObject({
    campaign: "classic",
    levelReached: 15,
    outcome: "completed",
  });
});

test("malformed saved bytes survive settings changes with a visible recovery explanation", async ({
  page,
}) => {
  const malformed = "{unreadable saved progress";
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: save_key,
    value: malformed,
  });
  await page.goto("/");
  await chooseFirstSurgeonIfNeeded(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const settings = page.getByRole("dialog", { name: "Settings", exact: true });
  await expect(settings).toContainText("Saved data could not be read");
  await expect(settings).toContainText("existing data is preserved");
  await settings.getByLabel("Music", { exact: true }).check();
  await settings.getByLabel("Sound effects", { exact: true }).check();
  await settings.getByRole("button", { name: "Reset tutorial prompts" }).click();
  await expect(settings).toContainText(
    "Tutorial prompts will appear on your next level-one attempt.",
  );
  await settings.getByRole("button", { name: "Done", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), save_key)).toBe(malformed);
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Stage 1:/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /^Stage 2:/ })).toBeDisabled();
});

test("failed required art blocks play and can be retried without reloading", async ({ page }) => {
  await page.route("**/assets/clopidogrel.svg", (route) => route.abort());
  await page.goto("/");
  await chooseFirstSurgeonIfNeeded(page);
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start stage", exact: true })).toBeDisabled();
  await expect(
    page.getByText("Could not load clopidogrel art. Check your connection and retry."),
  ).toBeVisible();
  await page.unroute("**/assets/clopidogrel.svg");
  await page.getByRole("button", { name: "Retry loading art", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start stage", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await expect(page.getByRole("region", { name: "Arcade arena" })).toBeVisible();
  await expect(page.locator("#arena")).toBeFocused();
});
