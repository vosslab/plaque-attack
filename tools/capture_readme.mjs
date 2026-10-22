// Capture the built app through normal controls in three fresh browser profiles.
// Start the built preview first, then run:
// PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright node tools/capture_readme.mjs http://localhost:8728/
// Inspect /tmp/plaque_attack_capture/*.png before copying them to docs/screenshots/.
// Recovery uses explicitly synthetic demonstration progress; Practice uses a
// synthetic unlock solely for access. Movement and carving use keyboard controls.
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import assert from "node:assert/strict";

const url = process.argv[2] ?? "http://localhost:8728/";
const directory = "/tmp/plaque_attack_capture";
const viewport = { width: 1536, height: 960 };
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const errors = [];

async function servedIdentity() {
  const files = [
    "index.html",
    "main.js",
    "style.css",
    "assets/cardiac_recovery.svg",
    ...["maya", "jules", "imani", "leo", "samira", "alex"].map((id) => `assets/surgeon_${id}.svg`),
  ];
  return Object.fromEntries(
    await Promise.all(
      files.map(async (file) => {
        const response = await fetch(new URL(file, url));
        assert.equal(response.ok, true, `Cannot read built ${file}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        return [file, createHash("sha256").update(bytes).digest("hex")];
      }),
    ),
  );
}

async function freshContext(save) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await context.addInitScript((seedSave) => {
    // Repeatable particles and hazards; this never changes the application's code.
    let seed = 20261022;
    Math.random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    if (seedSave !== undefined)
      localStorage.setItem("plaque_trouble_save", JSON.stringify(seedSave));
  }, save);
  return context;
}

function demonstrationSave(completedLevelIds, unlockedLevel) {
  return {
    version: 3,
    settings: {
      music: false,
      effects: false,
      completedTutorials: ["move", "fire", "split"],
      surgeonId: "maya",
    },
    unlockedLevel,
    records: [],
    completedLevelIds,
  };
}

async function readyPage(context) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-22T12:00:00.000Z") });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("#start_level:enabled").waitFor({ state: "attached" });
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(now + 100));
  return page;
}

async function captureDialog(page, name, filename) {
  const dialog = page.getByRole("dialog", { name, exact: true });
  await dialog.waitFor({ state: "visible" });
  for (const image of await dialog.locator("img").all()) {
    await image.evaluate((node) => node.decode());
    assert.equal(await image.evaluate((node) => node.complete && node.naturalWidth > 0), true);
  }
  // Capture only the production dialog, with no screenshot-only styling or zoom.
  await dialog.screenshot({ path: join(directory, filename), animations: "disabled" });
}

try {
  const sourceIdentity = await servedIdentity();
  const rosterContext = await freshContext();
  const roster = await readyPage(rosterContext);
  await roster.locator("#surgeon_button").click();
  assert.equal(await roster.locator(".surgeon_card").count(), 6);
  for (const card of await roster.locator(".surgeon_card").all()) {
    const box = await card.boundingBox();
    assert.ok(box !== null && box.y >= 0 && box.y + box.height <= viewport.height);
  }
  await captureDialog(roster, "Choose your surgeon", "surgeon_roster.png");
  await rosterContext.close();

  const recoveryContext = await freshContext(demonstrationSave([1, 16, 2, 3, 4, 5, 6, 17], 7));
  const recovery = await readyPage(recoveryContext);
  await recovery.locator("#recovery_button").click();
  assert.equal(await recovery.locator('.recovery_stage[data-completed="true"]').count(), 8);
  await captureDialog(recovery, "Patient recovery", "patient_recovery.png");
  await recoveryContext.close();

  const practiceContext = await freshContext(demonstrationSave([], 15));
  const practice = await readyPage(practiceContext);
  await practice.getByRole("button", { name: "Practice", exact: true }).click();
  await practice.getByRole("button", { name: /^Stage 4:/ }).click();
  await practice.getByRole("button", { name: "Start stage", exact: true }).click();
  await practice.clock.runFor(3200);
  await practice.keyboard.down("ArrowLeft");
  await practice.clock.runFor(700);
  await practice.keyboard.up("ArrowLeft");
  await practice.keyboard.down("Space");
  await practice.clock.runFor(3000);
  await practice.keyboard.up("Space");
  assert.match(await practice.locator("#hud_level").textContent(), /Stage 4:.*Practice/);
  assert.equal(await practice.locator("#arena").isVisible(), true);
  const arena = await practice.locator("#arena").boundingBox();
  assert.ok(arena !== null && Math.abs(arena.width / arena.height - 1.6) < 0.02);
  await practice.screenshot({ path: join(directory, "tissue_carving.png") });
  await practiceContext.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(await servedIdentity(), sourceIdentity, "Build changed during capture");
  await writeFile(
    join(directory, "capture_receipt.json"),
    `${JSON.stringify({ capturedAt: new Date().toISOString(), url, sourceIdentity, viewport, demonstrationCompletedLevelIds: [1, 16, 2, 3, 4, 5, 6, 17] }, null, 2)}\n`,
  );
  console.log(
    `Captured surgeon roster, demonstration recovery, and Stage 4 Practice in ${directory}`,
  );
} finally {
  await browser.close();
}
