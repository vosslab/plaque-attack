import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { chooseFirstSurgeonIfNeeded } from "./helper_first_run";

// Selector contract: src/index.html owns #hud_streak, #hud_multiplier and #arena;
// src/ui.ts:updateHud owns the visible current reward, src/renderer.ts owns canvas
// milestone text, and src/main.ts owns campaign advancement and pause/menu actions.
// Observe real canvas text without altering simulation state. If this journey fails,
// repair hit-to-feedback synchronization before accepting the streak presentation.
// The arena must retain its visible extent after the hidden inter-stage briefing;
// investigate src/style.css grid sizing if a correct-ratio canvas collapses there.
type ObservedFeedback = { milestones: string[]; frame: string[]; rewards: string[] };

async function feedback(page: Page): Promise<ObservedFeedback> {
  return page.evaluate(
    () => Reflect.get(globalThis, "__observedStreakFeedback") as ObservedFeedback,
  );
}

async function holdFireUntil(page: Page, ready: () => Promise<boolean>): Promise<void> {
  await page.keyboard.down("Space");
  for (let elapsed = 0; elapsed < 120_000 && !(await ready()); elapsed += 100)
    await page.clock.runFor(100);
  await page.keyboard.up("Space");
  expect(await ready(), "Ordinary held fire must reach the requested visible reward").toBe(true);
}

test("real hits show both streak milestones and starting the next stage resets the reward display", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const observed: ObservedFeedback = { milestones: [], frame: [], rewards: [] };
    Object.defineProperty(globalThis, "__observedStreakFeedback", { value: observed });
    const originalText = Reflect.get(CanvasRenderingContext2D.prototype, "fillText");
    const originalClear = Reflect.get(CanvasRenderingContext2D.prototype, "clearRect");
    CanvasRenderingContext2D.prototype.clearRect = function (...args): void {
      observed.frame = [];
      originalClear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.fillText = function (...args): void {
      const text = args[0];
      if (text.includes("HIT STREAK")) {
        if (!observed.milestones.includes(text)) observed.milestones.push(text);
        observed.frame.push(text);
      }
      if (/^\+\d+$/.test(text)) {
        if (!observed.rewards.includes(text)) observed.rewards.push(text);
        observed.frame.push(text);
      }
      originalText.apply(this, args);
    };
  });
  await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
  await page.goto("/");
  await chooseFirstSurgeonIfNeeded(page);
  await expect(page.getByRole("button", { name: "Play campaign", exact: true })).toBeVisible();
  await expect(page.locator("#start_level")).toBeEnabled();
  const ready = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(ready + 100));
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await page.clock.runFor(100);
  await expect(page.locator("#hud_streak")).toHaveText("0-hit streak");
  await expect(page.locator("#hud_multiplier")).toHaveText("x1 points");
  const firstStageArena = await page.locator("#arena").boundingBox();
  expect(firstStageArena).not.toBeNull();

  await holdFireUntil(page, async () =>
    (await feedback(page)).milestones.includes("5-HIT STREAK / x2 POINTS"),
  );
  await expect(page.locator("#hud_multiplier")).toHaveText("x2 points");
  expect((await feedback(page)).rewards.length).toBeGreaterThan(0);
  const cleared = page.getByRole("heading", { name: "Plaque cleared!", exact: true });
  await holdFireUntil(page, () => cleared.isVisible());
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await page.clock.runFor(100);
  await expect(page.locator("#hud_streak")).toHaveText("0-hit streak");
  await expect(page.locator("#hud_multiplier")).toHaveText("x1 points");
  const nextStageArena = await page.locator("#arena").boundingBox();
  expect(nextStageArena).not.toBeNull();
  if (firstStageArena === null || nextStageArena === null)
    throw new Error("Both stage arenas must remain visible");
  // Stage 2 removes the first-stage tutorial, so its available arena can grow.
  expect(nextStageArena.width).toBeGreaterThanOrEqual(firstStageArena.width);
  expect(nextStageArena.height).toBeGreaterThanOrEqual(firstStageArena.height);
  expect((await feedback(page)).frame).toEqual([]);

  await holdFireUntil(page, async () =>
    (await feedback(page)).milestones.includes("10-HIT STREAK / x3 POINTS"),
  );
  await expect(page.locator("#hud_multiplier")).toHaveText("x3 points");
  expect((await feedback(page)).milestones).toEqual([
    "5-HIT STREAK / x2 POINTS",
    "10-HIT STREAK / x3 POINTS",
  ]);
  expect(errors).toEqual([]);
});
