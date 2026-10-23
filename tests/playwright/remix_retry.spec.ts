import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type {} from "../../src/acceptance";

// main.ts owns attempt finalization; game_state.ts owns retry rollback; input.ts owns fresh presses.
// acceptance.ts is observation only: tests send ordinary controls and never replace runtime state.
const saveKey = "plaque_trouble_save";

type RetrySnapshot = {
  screen: string | undefined;
  phase: string;
  score: number;
  entryScore: number;
  entrySeed: number;
  retries: number;
  lives: number;
  levelId: number;
  nextProjectileId: number;
  readyRemaining: number;
};

async function snapshot(page: Page): Promise<RetrySnapshot> {
  return page.evaluate(() => {
    const state = window.__plaqueAcceptance?.().simulation;
    if (state === undefined) throw new Error("Acceptance simulation is unavailable");
    return {
      screen: window.__plaqueAcceptance?.().screen,
      phase: state.phase,
      score: state.score,
      entryScore: state.levelStartScore,
      entrySeed: state.remix.retry.entrySeed,
      retries: state.remix.retry.retryCount,
      lives: state.player.lives,
      levelId: state.level.id,
      nextProjectileId: state.nextProjectileId,
      readyRemaining: state.readyRemaining,
    };
  });
}

async function savedRecords(page: Page): Promise<unknown[]> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw === null ? [] : (JSON.parse(raw) as { records: unknown[] }).records;
  }, saveKey);
}

test("acceptance observation is opt-in and detached while preserving simulation collections", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.evaluate(() => window.__plaqueAcceptance)).toBeUndefined();
  await page.goto("/?acceptance");
  expect(await page.evaluate(() => typeof window.__plaqueAcceptance)).toBe("function");
});

test("menu best score and grouped rankings keep campaign editions separate", async ({ page }) => {
  await page.addInitScript((key) => {
    const fields = { levelReached: 1, outcome: "ended", date: "2026-10-22T12:00:00.000Z" };
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 4,
        settings: {
          music: false,
          effects: false,
          completedTutorials: [],
          surgeonId: "maya",
          surgeonChosen: true,
        },
        unlockedLevel: 1,
        completedLevelIds: [],
        records: [
          { ...fields, campaign: "classic", score: 900 },
          { ...fields, campaign: "expanded", score: 700 },
          { ...fields, campaign: "remix", score: 100, retryCount: 2 },
        ],
      }),
    );
  }, saveKey);
  await page.goto("/");
  await expect(page.locator("#menu_best_score")).toHaveText("Best score: 100");
  await page.locator("#scores_button").click();
  const dialog = page.getByRole("dialog", { name: "High scores", exact: true });
  for (const edition of ["Remix 24", "Expanded 24", "Classic 15"]) {
    await expect(dialog.getByRole("heading", { name: edition, exact: true })).toBeVisible();
  }
  await expect(dialog.getByRole("list")).toHaveCount(3);
  await expect(dialog.getByRole("listitem").filter({ hasText: "Remix 24" })).toContainText(
    "Retries: 2",
  );
  await expect(dialog.getByRole("listitem").filter({ hasText: "Classic 15" })).not.toContainText(
    "Retries",
  );
});

test("retry rolls back the current attempt and only confirmed departure finalizes it once", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 3,
        settings: {
          music: false,
          effects: false,
          completedTutorials: ["move", "fire", "split"],
          surgeonId: "maya",
          surgeonChosen: true,
        },
        unlockedLevel: 15,
        records: [],
        completedLevelIds: [],
      }),
    );
  }, saveKey);
  await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
  await page.goto("/?acceptance");
  await expect(page.locator("#start_level")).toBeEnabled();
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(now + 100));
  await page.locator("#play_campaign").click();
  await page.locator("#start_level").click();
  await page.clock.runFor(3200);
  expect(
    await page.evaluate(() => {
      const copy = window.__plaqueAcceptance?.().simulation;
      if (copy === undefined) throw new Error("Missing snapshot");
      const collections =
        copy.merge.contacts instanceof Set && copy.merge.lastAttemptTicks instanceof Map;
      copy.score = 999999;
      copy.player.lives = 99;
      copy.merge.contacts.add("detached");
      const next = window.__plaqueAcceptance?.().simulation;
      return (
        collections &&
        next?.score !== 999999 &&
        next?.player.lives !== 99 &&
        !next?.merge.contacts.has("detached")
      );
    }),
  ).toBe(true);
  await page.keyboard.down("Space");
  for (let elapsed = 0; elapsed < 15000 && (await snapshot(page)).score === 0; elapsed += 250) {
    await page.clock.runFor(250);
  }
  await page.keyboard.up("Space");
  expect((await snapshot(page)).score).toBeGreaterThan(0);
  for (
    let elapsed = 0;
    elapsed < 240000 && (await snapshot(page)).screen !== "game_over";
    elapsed += 3000
  ) {
    const direction = elapsed % 6000 === 0 ? "ArrowLeft" : "ArrowRight";
    await page.keyboard.down(direction);
    await page.clock.runFor(3000);
    await page.keyboard.up(direction);
  }
  const failed = await snapshot(page);
  expect(failed.screen).toBe("game_over");
  expect(await savedRecords(page)).toEqual([]);
  await page.locator("#result_menu").click();
  await page.getByRole("button", { name: "Keep playing", exact: true }).click();
  expect((await snapshot(page)).screen).toBe("game_over");
  expect(await savedRecords(page)).toEqual([]);
  await page.keyboard.down("Space");
  await page.getByRole("button", { name: "Retry this stage", exact: true }).click();
  const retried = await snapshot(page);
  expect(retried).toMatchObject({
    screen: "gameplay",
    phase: "ready",
    levelId: failed.levelId,
    score: failed.entryScore,
    entrySeed: failed.entrySeed,
    retries: 1,
    lives: 3,
  });
  expect(retried.readyRemaining).toBeGreaterThan(0);
  expect(retried.readyRemaining).toBeLessThanOrEqual(1);
  await page.keyboard.down("Space");
  await page.clock.runFor(1250);
  expect((await snapshot(page)).nextProjectileId).toBe(1);
  expect(await savedRecords(page)).toEqual([]);
  await page.keyboard.up("Space");
  await page.keyboard.down("Space");
  await page.clock.runFor(100);
  expect((await snapshot(page)).nextProjectileId).toBeGreaterThan(1);
  await page.keyboard.press("p");
  await page.keyboard.down("Space");
  await page.getByRole("button", { name: "Resume game", exact: true }).click();
  const resumed = (await snapshot(page)).nextProjectileId;
  await page.keyboard.down("Space");
  await page.clock.runFor(400);
  expect((await snapshot(page)).nextProjectileId).toBe(resumed);
  await page.keyboard.up("Space");
  const ended = await snapshot(page);
  await page.keyboard.press("p");
  await page.getByRole("button", { name: "Main menu", exact: true }).click();
  await page.clock.runFor(1);
  await page.getByRole("button", { name: "Leave campaign", exact: true }).click();
  const records = await savedRecords(page);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({
    campaign: "remix",
    score: ended.score,
    levelReached: ended.levelId,
    outcome: "ended",
    retryCount: 1,
  });
  await page.locator("#scores_button").click();
  await expect(page.getByRole("dialog")).toContainText("Retries: 1");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.locator("#play_campaign").click();
  await page.locator("#back_menu").click();
  expect(await savedRecords(page)).toEqual(records);
});

test("confirmed practice departure records the failed attempt and practice remains unranked", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
  await page.goto("/?acceptance");
  const chooser = page.getByRole("dialog", { name: "Choose your surgeon", exact: true });
  await chooser
    .getByRole("button", { name: "Choose Dr. Maya Chen; same abilities", exact: true })
    .click();
  await chooser.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#start_level")).toBeEnabled();
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(now + 100));
  await page.locator("#play_campaign").click();
  await page.locator("#start_level").click();
  for (
    let elapsed = 0;
    elapsed < 240000 && (await snapshot(page)).screen !== "game_over";
    elapsed += 3000
  ) {
    const direction = elapsed % 6000 === 0 ? "ArrowLeft" : "ArrowRight";
    await page.keyboard.down(direction);
    await page.clock.runFor(3000);
    await page.keyboard.up(direction);
  }
  const failed = await snapshot(page);
  expect(failed.screen).toBe("game_over");
  expect(await savedRecords(page)).toEqual([]);
  await page.locator("#practice_current").click();
  await page.getByRole("button", { name: "Leave campaign", exact: true }).click();
  const records = await savedRecords(page);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({
    campaign: "remix",
    score: failed.score,
    levelReached: failed.levelId,
    retryCount: 0,
  });
  await expect(page.locator("#level_briefing")).toBeVisible();
  await page.locator("#start_level").click();
  await page.clock.runFor(100);
  await page.keyboard.press("p");
  await page.getByRole("button", { name: "Main menu", exact: true }).click();
  await page.clock.runFor(1);
  expect(await savedRecords(page)).toEqual(records);
  expect(await page.evaluate(() => window.__plaqueAcceptance?.().screen)).toBe("menu");
});
