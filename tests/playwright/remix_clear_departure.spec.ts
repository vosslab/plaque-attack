import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type {} from "../../src/acceptance";
import { nextLevelId } from "../../src/constants";
import { chooseFirstSurgeonIfNeeded } from "./helper_first_run";

// Selector contract: src/index.html:25/102/194/199 owns menu/start/celebration/result;
// src/main.ts:344 owns clear credit and src/main.ts:122/216 owns departure/pause dialogs.
// Failures require repairing campaign clear credit before the interruptible celebration.
// The opt-in acceptance snapshot is read-only; this journey clears with ordinary fire.
const saveKey = "plaque_trouble_save";
const secondLevelId = nextLevelId(1);

async function savedProgress(page: Page): Promise<{
  completedLevelIds: number[];
  unlockedLevel: number;
  records: unknown[];
}> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error("Expected campaign save");
    return JSON.parse(raw) as {
      completedLevelIds: number[];
      unlockedLevel: number;
      records: unknown[];
    };
  }, saveKey);
}

test("leaving a real clear during celebration preserves recovery and records the run once", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
  await page.goto("/?acceptance");
  await chooseFirstSurgeonIfNeeded(page);
  await expect(page.locator("#start_level")).toBeEnabled();
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(now + 100));
  await page.locator("#play_campaign").click();
  await page.locator("#start_level").click();
  await page.keyboard.down("Space");
  const celebration = page.locator("#celebration_status");
  for (let elapsed = 0; elapsed < 120_000 && !(await celebration.isVisible()); elapsed += 100)
    await page.clock.runFor(100);
  await page.keyboard.up("Space");
  await expect(celebration).toBeVisible();
  await expect(page.locator("#result_panel")).toBeHidden();
  const cleared = await page.evaluate(() => window.__plaqueAcceptance?.().simulation);
  expect(cleared?.phase).toBe("level_complete");
  expect(cleared?.level.id).toBe(1);
  expect(await savedProgress(page)).toMatchObject({
    completedLevelIds: [1],
    unlockedLevel: secondLevelId,
    records: [],
  });

  await page.keyboard.press("p");
  await page.getByRole("button", { name: "Main menu", exact: true }).click();
  await page.clock.runFor(1);
  await page.getByRole("button", { name: "Keep playing", exact: true }).click();
  await expect(celebration).toBeVisible();
  expect(await page.evaluate(() => window.__plaqueAcceptance?.().simulation)).toMatchObject({
    phase: "level_complete",
    score: cleared?.score,
    level: { id: 1 },
  });
  expect((await savedProgress(page)).records).toEqual([]);

  await page.keyboard.press("p");
  await page.getByRole("button", { name: "Main menu", exact: true }).click();
  await page.clock.runFor(1);
  await page.getByRole("button", { name: "Leave campaign", exact: true }).click();
  await expect(page.locator("#main_menu")).toBeVisible();
  const saved = await savedProgress(page);
  expect(saved.completedLevelIds).toEqual([1]);
  expect(saved.unlockedLevel).toBe(secondLevelId);
  expect(saved.records).toHaveLength(1);
  expect(saved.records[0]).toMatchObject({
    campaign: "remix",
    score: cleared?.score,
    levelReached: 1,
    outcome: "ended",
    retryCount: 0,
  });
  await page.clock.runFor(5000);
  expect(await savedProgress(page)).toEqual(saved);
  await page.reload();
  expect(await savedProgress(page)).toEqual(saved);
});
