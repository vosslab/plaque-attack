/**
 * Real-input gameplay captures used by capture_docs_screenshots.mjs.
 *
 * This module deliberately stays outside the permanent browser-test suite.  It
 * starts the production build through its visible controls, and uses a save
 * fixture only to expose Practice stages whose floor geometry is otherwise
 * later in the campaign.  It never changes the production simulation.
 */
import assert from "node:assert/strict";

const PRACTICE_SAVE = {
  version: 3,
  settings: {
    music: false,
    effects: false,
    completedTutorials: ["move", "fire", "split"],
    surgeonId: "maya",
  },
  unlockedLevel: 15,
  records: [],
  completedLevelIds: [],
};

async function waitForVisibleArt(page) {
  await page.waitForFunction(async () => {
    await document.fonts.ready;
    const images = [...document.images];
    await Promise.all(
      images
        .filter((image) => image.complete && image.naturalWidth > 0)
        .map((image) => image.decode().catch(() => undefined)),
    );
    return true;
  });
}

async function advanceUntil(page, predicate, label, limit = 120_000) {
  for (let elapsed = 0; elapsed < limit; elapsed += 50) {
    if (await predicate()) return elapsed;
    await page.clock.runFor(50);
  }
  throw new Error(`Timed out waiting for ${label} after ${limit}ms of controlled game time.`);
}

async function withPage(browser, url, { practice = false } = {}, work) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  try {
    if (practice) {
      await context.addInitScript((save) => {
        localStorage.setItem("plaque_trouble_save", JSON.stringify(save));
      }, PRACTICE_SAVE);
    }
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.clock.install({ time: new Date("2026-10-22T12:00:00Z") });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator("#start_level:enabled").waitFor({ state: "attached" });
    const chooser = page.getByRole("dialog", { name: "Choose your surgeon", exact: true });
    await chooser
      .getByRole("button", { name: "Choose Dr. Maya Chen; same abilities", exact: true })
      .click();
    await chooser.getByRole("button", { name: "Continue", exact: true }).click();
    await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
    await waitForVisibleArt(page);
    const result = await work(page);
    assert.deepEqual(errors, [], "Capture page emitted no runtime or console errors");
    return result;
  } finally {
    await context.close();
  }
}

async function startPractice(page, stage) {
  await page.getByRole("button", { name: "Practice", exact: true }).click();
  await page.getByRole("button", { name: new RegExp(`^Stage ${stage}:`) }).click();
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await page.locator("#gameplay").waitFor({ state: "visible" });
  await page.locator("#arena").waitFor({ state: "visible" });
  await page.clock.runFor(3200);
}

async function startCampaign(page) {
  await page.getByRole("button", { name: "Play campaign", exact: true }).click();
  await page.getByRole("button", { name: "Start stage", exact: true }).click();
  await page.locator("#gameplay").waitFor({ state: "visible" });
  await page.locator("#arena").waitFor({ state: "visible" });
}

/**
 * Capture the real game states used throughout the README and supporting docs.
 *
 * `save(name, subject, provenance)` writes a quality-90 WebP from an in-memory
 * PNG. `montage(name, panels, provenance)` composes in-memory PNG buffers in a
 * browser document before creating its quality-90 WebP. Both helpers belong to
 * the caller so every documentation capture shares one encoder and manifest.
 */
export async function captureGameplay({ browser, url, save, montage }) {
  assert.ok(browser, "captureGameplay requires a launched Playwright browser");
  assert.equal(typeof url, "string", "captureGameplay requires the built preview URL");
  assert.equal(typeof save, "function", "captureGameplay requires a save helper");
  assert.equal(typeof montage, "function", "captureGameplay requires a montage helper");

  const captures = [];
  const saveCapture = async (name, subject, provenance) => {
    const result = await save(name, subject, provenance);
    captures.push({ name, provenance, result: result ?? null });
  };

  const floorStages = [
    [
      10,
      "basin",
      "Basin with raised flanks; actual Practice stage entered through the visible stage picker.",
    ],
    [
      14,
      "shelf",
      "Shelf with a broad central platform; actual Practice stage entered through the visible stage picker.",
    ],
    [
      17,
      "shoulder",
      "Shoulder with unequal flanks; actual Practice stage entered through the visible stage picker.",
    ],
  ];
  for (const [stage, label, description] of floorStages) {
    await withPage(browser, url, { practice: true }, async (page) => {
      await startPractice(page, stage);
      await page.keyboard.down("ArrowLeft");
      await page.clock.runFor(450);
      await page.keyboard.up("ArrowLeft");
      const arena = page.locator("#arena");
      const box = await arena.boundingBox();
      assert.ok(
        box && Math.abs(box.width / box.height - 1.6) < 0.02,
        `${label} capture preserves the 16:10 arena`,
      );
      await saveCapture(
        `floor_${label}`,
        arena,
        `${description} The only staged state is the normal local unlock save; geometry, hazards, and physics are the production build.`,
      );
    });
  }

  await withPage(browser, url, { practice: true }, async (page) => {
    await startPractice(page, 4);
    await page.keyboard.down("ArrowLeft");
    await page.clock.runFor(700);
    await page.keyboard.up("ArrowLeft");
    await page.keyboard.down("Space");
    await page.clock.runFor(3000);
    await page.keyboard.up("Space");
    await saveCapture(
      "tissue_carving",
      page,
      "Actual Stage 4 Practice: normal keyboard movement and stent shots repeatedly carve the real tissue obstacle. The local unlock save only exposes Practice; no targets, tissue, or physics are altered.",
    );
  });

  await withPage(browser, url, {}, async (page) => {
    await startCampaign(page);
    await page.keyboard.down("Space");
    await advanceUntil(
      page,
      () =>
        page
          .locator("#hud_multiplier")
          .innerText()
          .then((text) => text === "x2 points"),
      "the visible five-hit streak multiplier",
    );
    await page.keyboard.up("Space");
    await saveCapture(
      "streak_feedback",
      page,
      "Actual first campaign stage entered through Play campaign and Start stage. Held Space is ordinary player input; the capture waits for the game to award its visible five-hit streak multiplier.",
    );
  });

  await withPage(browser, url, {}, async (page) => {
    await startCampaign(page);
    await page.keyboard.down("Space");
    await advanceUntil(
      page,
      () => page.locator("#celebration_status").isVisible(),
      "the real final-pop celebration",
    );
    const finalPop = await page.locator("#arena").screenshot({ type: "png" });
    await page.clock.runFor(350);
    const arenaBox = await page.locator("#arena").boundingBox();
    assert.ok(arenaBox, "The victory close-up has a visible arena");
    const victory = await page.screenshot({
      type: "png",
      clip: {
        x: arenaBox.x + arenaBox.width * 0.4,
        y: arenaBox.y + arenaBox.height * 0.76,
        width: arenaBox.width * 0.2,
        height: arenaBox.height * 0.24,
      },
    });
    await page.clock.runFor(900);
    await page.keyboard.up("Space");
    await page
      .getByRole("heading", { name: "Plaque cleared!", exact: true })
      .waitFor({ state: "visible" });
    const results = await page.locator("#result_panel").screenshot({ type: "png" });
    await montage(
      "clear_celebration",
      [
        { label: "Final lipid pop", png: finalPop },
        { label: "Surgeon celebration (+350 ms)", png: victory },
        { label: "Stage complete (+1.25 s)", png: results },
      ],
      "Actual first campaign stage played from visible controls with ordinary held-Space input. The three panels are chronological captures of the final pop, the surgeon's celebration, and the resulting completion screen.",
    );
    captures.push({
      name: "clear_celebration",
      provenance: "Actual campaign clear montage",
      result: null,
    });
  });

  await withPage(browser, url, {}, async (page) => {
    await startCampaign(page);
    await page.clock.runFor(4200);
    await saveCapture(
      "art_identity_game",
      page,
      "Current first-stage campaign gameplay entered from Play campaign and Start stage. This is a single current production scene, not a historical before/after comparison.",
    );
  });

  return captures;
}
