// Capture the built app through normal controls, using a fresh browser profile.
// Start the preview first, then run:
// PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers node tools/capture_readme.mjs http://localhost:8728/
// Inspect /tmp/plaque_attack_capture/*.png before copying them to docs/screenshots/.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";

const url = process.argv[2] ?? "http://localhost:8728/";
const directory = "/tmp/plaque_attack_capture";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1536, height: 960 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(directory, "main_menu.png") });
  await page.locator("#play_campaign").click();
  await page.locator("#start_level").click();
  // The countdown is drawn on Canvas; the HUD timer proves play has started.
  await page.locator("#hud_time").filter({ hasText: "00:01" }).waitFor();
  await page.keyboard.down("Space");
  await page.locator("#hud_score").filter({ hasText: /[1-9]/ }).waitFor();
  // Let the two new fragments separate enough to read clearly in a still image.
  await page.waitForTimeout(300);
  assert.equal(await page.locator("#hud_objective").textContent(), "Plaque fragments: 2");
  await page.screenshot({ path: join(directory, "plaque_split.png") });
  await page.keyboard.up("Space");
  assert.deepEqual(errors, []);
  console.log(`Captured menu and a real plaque split in ${directory}`);
} finally {
  await browser.close();
}
