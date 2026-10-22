// Capture the built app through normal controls in two fresh browser profiles.
// Start the built preview first, then run:
// PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers node tools/capture_readme.mjs http://localhost:8728/
// Inspect /tmp/plaque_attack_capture/*.png before copying them to docs/screenshots/.
// The Stage 4 image uses synthetic unlocked progress solely to enter Practice;
// all movement and tissue carving use ordinary keyboard controls.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";

const url = process.argv[2] ?? "http://localhost:8728/";
const directory = "/tmp/plaque_attack_capture";
const viewport = { width: 1536, height: 960 };
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const errors = [];

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

try {
  const menuContext = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const menu = await readyPage(menuContext);
  await menu.screenshot({ path: join(directory, "main_menu.png") });
  await menuContext.close();

  const practiceContext = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await practiceContext.addInitScript(() => {
    localStorage.setItem(
      "plaque_trouble_save",
      JSON.stringify({
        version: 1,
        settings: { music: false, effects: false, completedTutorials: ["move", "fire", "split"] },
        unlockedLevel: 15,
        records: [],
      }),
    );
  });
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
  await practice.screenshot({ path: join(directory, "tissue_carving.png") });
  await practiceContext.close();
  assert.deepEqual(errors, []);
  console.log(`Captured fresh menu and Stage 4 Practice tissue carving in ${directory}`);
} finally {
  await browser.close();
}
