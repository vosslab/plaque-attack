import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { chooseFirstSurgeonIfNeeded } from "./helper_first_run";

// This is deliberately a browser contract rather than a renderer-pixel snapshot. It protects
// the choice a player makes, its accessible controls, its device persistence and the identity
// handed to the live canvas. Recovery assertions join this file once the recovery map is wired.
const saveKey = "plaque_trouble_save";

const surgeons = [
  ["maya", "Dr. Maya Chen"],
  ["jules", "Dr. Jules Okafor"],
  ["imani", "Dr. Imani Patel"],
  ["leo", "Dr. Leo Rivera"],
  ["samira", "Dr. Samira Haddad"],
  ["alex", "Dr. Alex Morgan"],
] as const;

type SurgeonId = (typeof surgeons)[number][0];

const campaignOrder = [
  1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10, 11, 12, 13, 14, 24, 15,
];

async function waitForReady(page: Page): Promise<void> {
  await chooseFirstSurgeonIfNeeded(page);
  await expect(page.getByRole("button", { name: "Play campaign", exact: true })).toBeVisible();
  await expect(page.locator("#start_level")).toBeEnabled();
}

function surgeonButton(page: Page, name: string): Locator {
  return page.getByRole("button", { name: `Choose ${name}; same abilities`, exact: true });
}

async function openRoster(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Choose surgeon", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Choose your surgeon", exact: true }),
  ).toBeVisible();
}

async function closeRoster(page: Page): Promise<void> {
  await page
    .getByRole("dialog", { name: "Choose your surgeon", exact: true })
    .getByRole("button", { name: "Done", exact: true })
    .click();
}

async function selectedSurgeon(page: Page): Promise<SurgeonId> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), saveKey);
  if (raw === null) return "maya";
  const value = JSON.parse(raw ?? "null") as { settings?: { surgeonId?: SurgeonId } };
  if (value.settings?.surgeonId === undefined) throw new Error("Surgeon selection was not saved");
  return value.settings.surgeonId;
}

async function savedRecovery(page: Page): Promise<number[]> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), saveKey);
  const value = JSON.parse(raw ?? "null") as { completedLevelIds?: number[] };
  if (value.completedLevelIds === undefined) throw new Error("Recovery progress was not saved");
  return value.completedLevelIds;
}

async function controlledPage(page: Page): Promise<void> {
  await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
  await page.goto("/");
  await waitForReady(page);
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(now + 100));
}

async function startFirstStage(page: Page, mode: "campaign" | "practice"): Promise<void> {
  if (mode === "campaign") {
    await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Practice", exact: true }).click();
    await page.getByRole("button", { name: /^Stage 1:/ }).click();
  }
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await expect(page.getByRole("region", { name: "Arcade arena", exact: true })).toBeVisible();
}

async function clearFirstStage(page: Page): Promise<void> {
  await page.keyboard.down("Space");
  const cleared = page.getByRole("heading", { name: "Plaque cleared!", exact: true });
  for (let elapsed = 0; elapsed < 120_000 && !(await cleared.isVisible()); elapsed += 5000)
    await page.clock.runFor(5000);
  await page.keyboard.up("Space");
  await expect(cleared).toBeVisible();
}

test("the first campaign requires an explicit surgeon choice and remembers it", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Choose your surgeon", exact: true });
  const start = dialog.getByRole("button", { name: "Continue", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { pressed: true })).toHaveCount(0);
  await expect(start).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("region", { name: "Plaque Attack", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await expect(dialog).toBeVisible();
  await surgeonButton(page, "Dr. Maya Chen").click();
  await expect(surgeonButton(page, "Dr. Maya Chen")).toHaveAttribute("aria-pressed", "true");
  await expect(start).toBeEnabled();
  await start.click();
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Stage 1:/ })).toBeVisible();
  expect(await selectedSurgeon(page)).toBe("maya");

  await page.getByRole("button", { name: "Back to menu", exact: true }).click();
  await page.reload();
  await expect(dialog).toBeHidden();
  expect(await selectedSurgeon(page)).toBe("maya");
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: /^Stage 1:/ })).toBeVisible();

  // The existing Settings roster is also an explicit choice, including before first play.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await surgeonButton(page, "Dr. Samira Haddad").click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(dialog).toBeHidden();
  expect(await selectedSurgeon(page)).toBe("samira");
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await expect(page.getByRole("heading", { name: /^Stage 1:/ })).toBeVisible();
});

function stageNode(page: Page, levelId: number): Locator {
  return page.locator(`.recovery_stage_list_button[data-stage="${levelId}"]`);
}

function territoryNode(page: Page, levelId: number): Locator {
  return page.locator(`.recovery_territory[data-stage="${levelId}"]`);
}

test("six equally able surgeons are accessible, selectable, and persist after reload", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await waitForReady(page);
  await openRoster(page);
  const dialog = page.getByRole("dialog", { name: "Choose your surgeon", exact: true });
  await expect(dialog).toContainText("Six personalities. Same abilities.");
  await expect(surgeonButton(page, "Dr. Maya Chen")).toHaveAttribute("aria-pressed", "true");
  await expect(
    dialog.getByRole("group", { name: "Choose your surgeon", exact: true }).getByRole("button"),
  ).toHaveCount(surgeons.length);

  for (const [id, name] of surgeons) {
    const card = surgeonButton(page, name);
    await expect(card).toBeVisible();
    await expect(card.locator("img")).toHaveAttribute("src", `assets/surgeon_${id}.svg`);
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "true");
    expect(await selectedSurgeon(page)).toBe(id);
    for (const [, otherName] of surgeons.filter((entry) => entry[0] !== id))
      await expect(surgeonButton(page, otherName)).toHaveAttribute("aria-pressed", "false");
  }
  await closeRoster(page);

  await page.reload();
  await waitForReady(page);
  await openRoster(page);
  await expect(surgeonButton(page, "Dr. Alex Morgan")).toHaveAttribute("aria-pressed", "true");
  await closeRoster(page);
});

test("the selected surgeon is the one rendered in a live stage after an ordinary reload", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    type CanvasDraw = (this: CanvasRenderingContext2D, ...args: unknown[]) => void;
    const drawnAssets: string[] = [];
    const draw = Reflect.get(CanvasRenderingContext2D.prototype, "drawImage") as CanvasDraw;
    CanvasRenderingContext2D.prototype.drawImage = function (
      this: CanvasRenderingContext2D,
      ...args: unknown[]
    ): void {
      const source = args[0];
      if (source instanceof HTMLImageElement) drawnAssets.push(source.currentSrc || source.src);
      draw.apply(this, args);
    };
    Object.defineProperty(globalThis, "__plaqueTroubleDrawnAssets", {
      configurable: true,
      value: drawnAssets,
    });
  });
  await page.goto("/");
  await waitForReady(page);
  await openRoster(page);
  await surgeonButton(page, "Dr. Samira Haddad").click();
  await closeRoster(page);

  await page.reload();
  await waitForReady(page);
  expect(await selectedSurgeon(page)).toBe("samira");
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await expect(page.getByRole("region", { name: "Arcade arena", exact: true })).toBeVisible();
  await page.waitForTimeout(100);
  const drawn = await page.evaluate(
    () => Reflect.get(globalThis, "__plaqueTroubleDrawnAssets") as string[],
  );
  expect(drawn.some((source) => source.endsWith("/assets/surgeon_samira.svg"))).toBe(true);
  expect(drawn.some((source) => /\/assets\/surgeon_(?!samira\.svg)/.test(source))).toBe(false);
});

test("patient recovery presents empty, partial, and complete coronary circuits without a health percentage", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await waitForReady(page);
  await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Patient recovery", exact: true });
  await expect(dialog).toContainText("Restore the coronary routes.");
  await expect(dialog).toContainText("waiting for its first clear route");
  await expect(dialog.locator(".recovery_stage_list_button")).toHaveCount(campaignOrder.length);
  await expect(stageNode(page, 1)).toHaveAttribute("data-state", "unlocked");
  await expect(stageNode(page, 16)).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Patient recovery", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();

  await page.evaluate(
    ({ key, completedLevelIds }) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 3,
          settings: { music: false, effects: false, completedTutorials: [], surgeonId: "maya" },
          unlockedLevel: 2,
          records: [],
          completedLevelIds,
        }),
      ),
    { key: saveKey, completedLevelIds: [1, 16] },
  );
  await page.reload();
  await waitForReady(page);
  await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
  await expect(dialog).toContainText("2 of 24 routes restored");
  await expect(territoryNode(page, 1)).toHaveAttribute("data-completed", "true");
  await expect(territoryNode(page, 16)).toHaveAttribute("data-completed", "true");
  await expect(stageNode(page, 2)).toHaveAttribute("data-state", "unlocked");
  await expect(stageNode(page, 3)).toHaveAttribute("data-state", "locked");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();

  await page.evaluate(
    ({ key, completedLevelIds }) => {
      const raw = localStorage.getItem(key);
      const value = JSON.parse(raw ?? "null") as Record<string, unknown>;
      value.unlockedLevel = 15;
      value.completedLevelIds = completedLevelIds;
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: saveKey, completedLevelIds: campaignOrder },
  );
  await page.reload();
  await waitForReady(page);
  await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
  await expect(dialog).toContainText("A full recovery circuit is complete.");
  await expect(dialog.locator('.recovery_territory[data-completed="true"]')).toHaveCount(
    campaignOrder.length,
  );
});

test("recovery keeps its Close control inside compact desktop and landscape-mobile dialogs", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const partialSave = JSON.stringify({
    version: 3,
    settings: { music: false, effects: false, completedTutorials: [], surgeonId: "maya" },
    unlockedLevel: 15,
    records: [],
    completedLevelIds: [1, 16, 2, 3, 4, 5],
  });
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 844, height: 390 },
  ]) {
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: saveKey,
      value: partialSave,
    });
    await page.setViewportSize(viewport);
    await page.goto("/");
    await waitForReady(page);
    await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Patient recovery", exact: true });
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await expect(close).toBeVisible();
    const [dialogBox, closeBox] = await Promise.all([dialog.boundingBox(), close.boundingBox()]);
    expect(
      dialogBox,
      `Dialog must have a layout box at ${viewport.width}x${viewport.height}`,
    ).not.toBeNull();
    expect(
      closeBox,
      `Close must have a layout box at ${viewport.width}x${viewport.height}`,
    ).not.toBeNull();
    const dialogBottom = (dialogBox?.y ?? 0) + (dialogBox?.height ?? 0);
    const closeBottom = (closeBox?.y ?? 0) + (closeBox?.height ?? 0);
    expect(closeBox?.y ?? -1).toBeGreaterThanOrEqual(dialogBox?.y ?? 0);
    expect(closeBottom).toBeLessThanOrEqual(Math.min(dialogBottom, viewport.height));
    await page.keyboard.press("Escape");
  }
});

test("an ordinary campaign clear restores its route exactly once", async ({ page }) => {
  test.setTimeout(90_000);
  await controlledPage(page);
  await startFirstStage(page, "campaign");
  await clearFirstStage(page);
  await page.clock.runFor(1);
  const recovery = page.getByRole("dialog", { name: "Patient recovery", exact: true });
  await expect(recovery).toBeHidden();
  await expect(page.locator("#result_recovery_note")).toContainText("Route restored");
  await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
  await expect(recovery).toBeVisible();
  await expect(recovery).toContainText("Route restored: Stage 1");
  expect(await savedRecovery(page)).toEqual([1]);
  await recovery.getByRole("button", { name: "Close", exact: true }).click();
});

test("ordinary practice preserves earned recovery", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: saveKey,
    value: JSON.stringify({
      version: 3,
      settings: { music: false, effects: false, completedTutorials: [], surgeonId: "maya" },
      unlockedLevel: 1,
      records: [],
      completedLevelIds: [1],
    }),
  });
  await controlledPage(page);
  await startFirstStage(page, "practice");
  await clearFirstStage(page);
  expect(await savedRecovery(page)).toEqual([1]);
  await expect(page.locator("#result_recovery_note")).toBeHidden();
  const recovery = page.getByRole("dialog", { name: "Patient recovery", exact: true });
  await expect(recovery).toBeHidden();
});
