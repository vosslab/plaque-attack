import { expect, test } from "@playwright/test";

// Selector contract: src/index.html:14-18 labels the main-menu region and Play
// campaign button; src/index.html:22-28 labels the briefing and Back to menu.
// src/main.ts:20-31 sets the level heading and switches between these screens.
// A failure means campaign entry/return or app boot needs repair before release.
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
