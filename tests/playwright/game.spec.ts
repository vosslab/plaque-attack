import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// Selector contract: src/index.html owns named regions, buttons, arena and HUD IDs;
// src/ui.ts:updateHud/showResult owns visible gameplay and result text;
// src/main.ts owns navigation, pause focus, tutorials and asset retry;
// src/save_load.ts owns the version-one device-save schema used as prior progress.
// Failures require repairing the corresponding user journey before release.
const save_key = "plaque_trouble_save";

async function controlledPage(page: Page): Promise<void> {
  const start = new Date("2026-10-22T12:00:00.000Z");
  await page.clock.install({ time: start });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Play campaign", exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
}

async function startLevel(page: Page): Promise<void> {
  const start = page.getByRole("button", { name: "Start level", exact: true });
  await expect(start).toBeEnabled();
  await start.click();
  await page.clock.runFor(100);
  await expect(page.getByRole("region", { name: "Arcade arena" })).toBeVisible();
  await expect(page.locator("#arena")).toBeFocused();
}

async function idleUntilRunEnds(page: Page): Promise<void> {
  const result = page
    .getByRole("region")
    .filter({ has: page.getByRole("heading", { name: "Run ended", exact: true }) });
  // Run every animation frame, stopping when the result proves the run ended.
  for (let elapsed = 0; elapsed < 120_000 && !(await result.isVisible()); elapsed += 5000) {
    await page.clock.runFor(5000);
  }
  await expect(result).toBeVisible();
}

test("smoke: campaign opens the first briefing and returns to the menu", async ({ page }) => {
  const page_errors: string[] = [];
  page.on("pageerror", (error) => page_errors.push(error.message));

  await page.goto("/");
  const menu = page.getByRole("region", { name: "Plaque Trouble", exact: true });
  const play = page.getByRole("button", { name: "Play campaign", exact: true });
  await expect(menu).toBeVisible();
  await play.click();

  const briefing = page.getByRole("region", { name: /^Level 1:/ });
  await expect(briefing).toBeVisible();
  await expect(menu).toBeHidden();
  await expect(briefing.getByRole("heading", { name: /^Level 1:/ })).toBeVisible();
  await briefing.getByRole("button", { name: "Back to menu", exact: true }).click();

  await expect(menu).toBeVisible();
  await expect(briefing).toBeHidden();
  await expect(play).toBeFocused();
  expect(page_errors, "Uncaught application errors during campaign navigation").toEqual([]);
});

test("held fire splits plaque, and P and Escape freeze and resume the game", async ({ page }) => {
  await controlledPage(page);
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await startLevel(page);
  await page.keyboard.down("Space");
  await page.clock.runFor(12_000);
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
  expect(tutorials).toContain("fire");
  expect(tutorials).toContain("split");

  for (const key of ["p", "Escape"]) {
    await page.keyboard.press(key);
    const pause = page.getByRole("dialog", { name: "Take a breather" });
    await expect(pause).toBeVisible();
    await expect(pause.getByRole("button", { name: "Resume game" })).toBeFocused();
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
});

test("an idle campaign ends once, records its score, and offers a fresh retry", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await controlledPage(page);
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await startLevel(page);
  await idleUntilRunEnds(page);
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
    records: { levelReached: number; outcome: string }[];
  };
  expect(data.records).toHaveLength(1);
  expect(data.records[0]).toMatchObject({ levelReached: 1, outcome: "ended" });
  await page.clock.runFor(10_000);
  expect(await page.evaluate((key) => localStorage.getItem(key), save_key)).toBe(saved);
  await result.getByRole("button", { name: "Main menu", exact: true }).click();
  await page.getByRole("button", { name: "High scores", exact: true }).click();
  const scores = page.getByRole("dialog", { name: "High scores", exact: true });
  await expect(scores.getByRole("listitem")).toHaveCount(1);
  await expect(scores).toContainText("Level 1 / Run ended");
  await scores.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await startLevel(page);
  await idleUntilRunEnds(page);
  await result.getByRole("button", { name: "Retry campaign", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Level 1:/ })).toBeVisible();
  await startLevel(page);
  await expect(page.locator("#hud_lives")).toContainText("3 / 3");
  await expect(page.locator("#hud_score")).toHaveText("000000");
});

test("prior progress unlocks the drug and maintenance practice modes without ranking", async ({
  page,
}) => {
  test.setTimeout(60_000);
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
  for (const [id, tool] of [
    [6, "Aspirin"],
    [8, "Clopidogrel"],
    [15, "Dual antiplatelet mode"],
  ] as const) {
    await page.getByRole("button", { name: "Practice", exact: true }).click();
    await page.getByRole("button", { name: new RegExp(`^Level ${id}:`) }).click();
    await expect(page.locator("#briefing_weapon")).toHaveText(tool);
    await startLevel(page);
    await expect(page.locator("#hud_level")).toContainText(`Level ${id}:`);
    await expect(page.locator("#hud_level")).toContainText("Practice");
    await expect(page.locator("#hud_weapon")).toHaveText(tool);
    await page.clock.runFor(4000);
    await expect(page.locator("#hud_time_label")).toHaveText(id === 15 ? "Remaining" : "Elapsed");
    await expect(page.locator("#hud_objective")).toContainText(
      id === 15 ? "Active platelet hazards:" : "Hazards remaining:",
    );
    await page.keyboard.press("p");
    await page.getByRole("button", { name: "Restart practice", exact: true }).click();
    await page.clock.runFor(100);
    await expect(page.locator("#hud_level")).toContainText(`Level ${id}:`);
    await expect(page.locator("#hud_score")).toHaveText("000000");
    await idleUntilRunEnds(page);
    const result = page
      .getByRole("region")
      .filter({ has: page.getByRole("heading", { name: "Run ended", exact: true }) });
    await expect(result).toBeVisible();
    await expect(result).toContainText("Practice / Unranked");
    await expect(result).not.toContainText("High-score rank");
    await result.getByRole("button", { name: "Retry practice", exact: true }).click();
    await expect(page.getByRole("heading", { name: new RegExp(`^Level ${id}:`) })).toBeVisible();
    await page.getByRole("button", { name: "Back to menu", exact: true }).click();
  }
  expect(await page.evaluate((key) => localStorage.getItem(key), save_key)).toBe(prior);
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
  await expect(page.getByRole("button", { name: /^Level 1:/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /^Level 2:/ })).toBeDisabled();
});

test("failed required art blocks play and can be retried without reloading", async ({ page }) => {
  await page.route("**/assets/clopidogrel.svg", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start level", exact: true })).toBeDisabled();
  await expect(
    page.getByText("Could not load clopidogrel art. Check your connection and retry."),
  ).toBeVisible();
  await page.unroute("**/assets/clopidogrel.svg");
  await page.getByRole("button", { name: "Retry loading art", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start level", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Start level", exact: true }).click();
  await expect(page.getByRole("region", { name: "Arcade arena" })).toBeVisible();
  await expect(page.locator("#arena")).toBeFocused();
});
