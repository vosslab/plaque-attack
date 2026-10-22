import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

async function expectInViewport(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box === null || viewport === null) throw new Error("Missing visible layout");
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
}

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 844, height: 390 },
  { width: 320, height: 568 },
]) {
  test(`dialog actions stay visible and gameplay stays 16:10 at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.clock.install({ time: new Date("2026-10-22T12:00:00Z") });
    await page.goto("/");
    await expect(page.locator("#start_level")).toBeEnabled();
    await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
    const dialog = page.locator("#game_dialog");
    const checkPinned = async (label: string): Promise<void> => {
      const action = dialog.getByRole("button", { name: label, exact: true });
      await expectInViewport(page, dialog.getByRole("heading", { level: 2 }).first());
      await expectInViewport(page, action);
      const before = await action.boundingBox();
      await dialog.locator(".dialog_content").evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      expect(await action.boundingBox()).toEqual(before);
      await expectInViewport(page, dialog.getByRole("heading", { level: 2 }).first());
    };
    for (const [id, label] of [
      ["instructions_button", "Got it"],
      ["settings_button", "Done"],
      ["surgeon_button", "Done"],
      ["recovery_button", "Close"],
      ["scores_button", "Close"],
    ] as const) {
      await page.locator(`#${id}`).click();
      if (id === "settings_button") {
        for (let i = 0; i < 8; i++)
          await dialog.getByRole("button", { name: "Reset tutorial prompts", exact: true }).click();
      }
      await checkPinned(label);
      await dialog.getByRole("heading", { level: 2 }).first().focus();
      const dismiss = dialog.getByRole("button", { name: label, exact: true });
      for (
        let step = 0;
        step < 60 && !(await dismiss.evaluate((node) => node === document.activeElement));
        step++
      )
        await page.keyboard.press("Tab");
      await expect(dialog.getByRole("button", { name: label, exact: true })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeHidden();
    }
    await page.getByRole("button", { name: "Play campaign", exact: true }).click();
    await page.getByRole("button", { name: "The real medicine", exact: true }).click();
    await checkPinned("Close");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Start stage", exact: true }).click();
    await page.clock.runFor(100);
    const arena = await page.locator("#arena").boundingBox();
    expect(arena).not.toBeNull();
    if (arena === null) throw new Error("Missing arena");
    expect(arena.width / arena.height).toBeCloseTo(1.6, 2);
    await expectInViewport(page, page.locator("#arena"));
    await page.keyboard.press("p");
    await checkPinned("Resume game");
    await dialog.getByRole("button", { name: "Resume game", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("#arena")).toBeFocused();
  });
}
