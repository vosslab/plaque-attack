import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { chooseFirstSurgeonIfNeeded } from "./helper_first_run";

// Selector contract: src/index.html:99/183/197 owns keyboard hints, celebration status and
// the inline recovery note; src/ui.ts:47 owns screen visibility and the terminal HUD;
// src/main.ts:336/506 owns the presentation clock and fresh-key continuation;
// src/renderer.ts:270 hands the selected victory asset to the real canvas.
// Failures require repairing the clear-to-next-stage journey before release.

async function tabTo(page: Page, control: Locator, backwards = false): Promise<void> {
  for (let step = 0; step < 12; step += 1) {
    if (await control.evaluate((node) => node === document.activeElement)) return;
    await page.keyboard.press(backwards ? "Shift+Tab" : "Tab");
  }
  await expect(control).toBeFocused();
}

async function drawnVictory(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const sources = Reflect.get(globalThis, "__clearFlowDrawnAssets") as Set<string>;
    return [...sources].some((source) => source.endsWith("/assets/surgeon_maya_victory.svg"));
  });
}

async function canvasImage(page: Page): Promise<string> {
  return page.locator("#arena").evaluate((node) => (node as HTMLCanvasElement).toDataURL());
}

for (const advanceKey of ["Enter", "Space"]) {
  test(`a real clear celebrates before fresh ${advanceKey} advances, with keyboard controls intact`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      type CanvasDraw = (this: CanvasRenderingContext2D, ...args: unknown[]) => void;
      const sources = new Set<string>();
      const draw = Reflect.get(CanvasRenderingContext2D.prototype, "drawImage") as CanvasDraw;
      CanvasRenderingContext2D.prototype.drawImage = function (
        this: CanvasRenderingContext2D,
        ...args: unknown[]
      ): void {
        const source = args[0];
        if (source instanceof HTMLImageElement) sources.add(source.currentSrc || source.src);
        draw.apply(this, args);
      };
      Object.defineProperty(globalThis, "__clearFlowDrawnAssets", { value: sources });
    });
    await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
    await page.goto("/");
    await chooseFirstSurgeonIfNeeded(page);
    const play = page.getByRole("button", { name: "Play campaign", exact: true });
    await expect(play).toBeVisible();
    await expect(page.locator("#start_level")).toBeEnabled();
    const ready = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(new Date(ready + 100));
    await tabTo(page, play);
    await page.keyboard.press("Enter");

    const briefing = page.locator("#level_briefing");
    const arena = page.getByRole("region", { name: "Arcade arena", exact: true });
    const status = page.locator("#celebration_status");
    const cleared = page.getByRole("heading", { name: "Plaque cleared!", exact: true });
    await expect(briefing).toBeVisible();
    await expect(page.locator("#briefing_keyboard_hint")).toContainText("Enter or Space");
    await page.keyboard.press("Space");
    await expect(arena).toBeVisible();
    await expect(page.locator("#arena")).toBeFocused();

    // Hold ordinary fire through the actual final collision; no simulation state is injected.
    await page.keyboard.down("Space");
    for (let elapsed = 0; elapsed < 120_000 && !(await status.isVisible()); elapsed += 100)
      await page.clock.runFor(100);
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute("role", "status");
    await expect(cleared).toBeHidden();
    await expect(arena).toBeVisible();
    expect(await drawnVictory(page), "The last pop precedes the victory pose").toBe(false);
    const frozenHud = await page.locator(".game_hud").innerText();

    // A paused presentation freezes its own effects as well as the terminal simulation.
    for (const key of ["p", "Escape"]) {
      await page.keyboard.press(key);
      const pause = page.getByRole("dialog", { name: "Take a breather", exact: true });
      await expect(pause).toBeVisible();
      const frozenCanvas = await canvasImage(page);
      await page.clock.runFor(5000);
      await expect(pause).toBeVisible();
      expect(
        (await canvasImage(page)) === frozenCanvas,
        "Paused presentation canvas must stay unchanged",
      ).toBe(true);
      expect(await page.locator(".game_hud").innerText()).toBe(frozenHud);
      await expect(cleared).toBeHidden();
      await page.keyboard.press(key);
      await expect(pause).toBeHidden();
      await expect(status).toBeVisible();
    }

    for (let elapsed = 0; elapsed < 2000 && !(await drawnVictory(page)); elapsed += 100)
      await page.clock.runFor(100);
    expect(await drawnVictory(page), "The selected surgeon celebrates on the live canvas").toBe(
      true,
    );
    await expect(status).toBeVisible();
    await expect(cleared).toBeHidden();
    expect(await page.locator(".game_hud").innerText()).toBe(frozenHud);
    // Repeated keydown while Space is still held cannot arm the next screen.
    await page.keyboard.down("Space");
    for (let elapsed = 0; elapsed < 5000 && !(await cleared.isVisible()); elapsed += 100)
      await page.clock.runFor(100);
    await expect(cleared).toBeVisible();
    await expect(status).toBeHidden();
    await page.keyboard.down("Space");
    await page.keyboard.up("Space");
    await expect(cleared).toBeVisible();
    await expect(briefing).toBeHidden();
    await expect(page.locator("#result_keyboard_hint")).toContainText("Enter or Space");
    await expect(page.locator("#result_recovery_note")).toContainText("Route restored");
    const recovery = page.getByRole("dialog", { name: "Patient recovery", exact: true });
    await expect(recovery).toBeHidden();

    if (advanceKey === "Enter") {
      // Native secondary controls retain their own keyboard action and modal focus.
      await tabTo(page, page.getByRole("button", { name: "Patient recovery", exact: true }));
      await page.keyboard.press("Enter");
      await expect(recovery).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(recovery).toBeVisible();
      await expect(briefing).toBeHidden();
      await page.keyboard.press("Escape");
      await expect(recovery).toBeHidden();
      await tabTo(page, page.getByRole("button", { name: "Continue", exact: true }), true);
    }

    await page.keyboard.down(advanceKey);
    await page.keyboard.down(advanceKey);
    await expect(cleared).toBeVisible();
    await page.keyboard.up(advanceKey);
    await expect(
      page.getByRole("heading", { name: "Stage 2: Little trouble", exact: true }),
    ).toBeVisible();
    await expect(arena).toBeHidden();
    // One release advances once; repeating a still-held press never starts the new stage.
    const startKey = advanceKey === "Enter" ? "Space" : "Enter";
    await page.keyboard.down(startKey);
    await page.keyboard.down(startKey);
    await expect(briefing).toBeVisible();
    await page.keyboard.up(startKey);
    await expect(arena).toBeVisible();
    await expect(briefing).toBeHidden();
    await page.clock.runFor(100);
    await expect(page.locator("#hud_level")).toHaveText("Stage 2: Little trouble");
    expect(errors).toEqual([]);
  });
}
