// Rebuild first: ./build_github_pages.sh
// Run: node tests/playwright/capture_docs_screenshots.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { chromium } from "playwright";
import { build } from "esbuild";
import { REPO_ROOT } from "./repo_root.mjs";
import { captureGameplay } from "./capture_gameplay_screenshots.mjs";
import { captureRosterFixture } from "./capture_roster_fixture.mjs";

process.chdir(REPO_ROOT);
const root = resolve("dist");
const destination = resolve("docs/screenshots");
const rows = [];
const errors = [];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const order = [
  1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10, 11, 12, 13, 14, 24, 15,
];
const expected = [
  "main_menu",
  "surgeon_roster",
  "patient_recovery",
  "compact_settings",
  "art_identity_roster",
  "art_identity_recovery",
  "art_identity_game",
  "floor_basin",
  "floor_shelf",
  "floor_shoulder",
  "tissue_carving",
  "streak_feedback",
  "clear_celebration",
];
await mkdir(destination, { recursive: true });

// Refuse an old build: both ordinary UI and source-renderer fixtures must show current art.
const sourceMap = JSON.parse(await readFile("dist/main.js.map", "utf8"));
for (let i = 0; i < sourceMap.sources.length; i++) {
  assert.equal(
    await readFile(resolve(root, sourceMap.sources[i]), "utf8"),
    sourceMap.sourcesContent[i],
    "Rebuild before capturing: " + sourceMap.sources[i],
  );
}
for (const file of [
  "index.html",
  "style.css",
  ...(await readdir("src/assets"))
    .filter((name) => name.endsWith(".svg"))
    .map((name) => "assets/" + name),
]) {
  assert.deepEqual(
    await readFile("src/" + file),
    await readFile("dist/" + file),
    "Rebuild before capturing: " + file,
  );
}
const fixture = await build({
  stdin: {
    contents: `import {createRenderer} from './src/renderer'; import {createSimulation} from './src/game_state'; import {getLevel} from './src/constants'; import {loadAssets} from './src/assets'; import {SURGEON_IDS} from './src/surgeons'; globalThis.artFixture = {createRenderer,createSimulation,getLevel,SURGEON_IDS,images:await loadAssets()};`,
    resolveDir: REPO_ROOT,
  },
  bundle: true,
  format: "esm",
  write: false,
});
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://local").pathname;
  if (pathname === "/favicon.ico") return response.writeHead(204).end();
  if (pathname === "/__fixture.html") {
    response.setHeader("Content-Type", "text/html");
    return response.end(
      '<!doctype html><html><head><title>Surgeon renderer fixture</title></head><body><script type="module" src="/__fixture.js"></script></body></html>',
    );
  }
  if (pathname === "/__fixture.js") {
    response.setHeader("Content-Type", "text/javascript");
    return response.end(fixture.outputFiles[0].contents);
  }
  const path = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!path.startsWith(root + "/")) return response.writeHead(403).end();
  try {
    response.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      }[extname(path)] || "application/octet-stream",
    );
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const url = `http://127.0.0.1:${server.address().port}/`;
let browser;

async function save(name, target, provenance) {
  assert.ok(expected.includes(name), "Unexpected screenshot " + name);
  assert.ok(!rows.some((row) => row.name === name), "Duplicate screenshot " + name);
  const png = await target.screenshot({
    animations: "disabled",
    ...(typeof target.viewportSize === "function" ? { fullPage: true } : {}),
  });
  const filename = `${name}.webp`;
  execFileSync("cwebp", ["-quiet", "-q", "90", "-o", resolve(destination, filename), "--", "-"], {
    input: png,
  });
  const bytes = await readFile(resolve(destination, filename));
  // Screenshot PNG headers supply dimensions without leaving a PNG intermediate on disk.
  rows.push({
    name,
    path: filename,
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    bytes: bytes.length,
    sha256: hash(bytes),
    provenance,
  });
  console.log(`Captured ${filename}`);
}

async function montage(name, panels, provenance) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  try {
    const page = await context.newPage();
    await page.setContent(
      '<body style="margin:0;background:#111322;color:#fff4df;font:18px sans-serif"><main style="display:flex;align-items:start;gap:16px;padding:20px"></main></body>',
    );
    await page.evaluate(
      (panels) => {
        for (const { label, data } of panels) {
          const figure = document.createElement("figure");
          figure.style.cssText = "margin:0;flex:1;min-width:0";
          const caption = document.createElement("figcaption");
          caption.textContent = label;
          caption.style.cssText = "font-weight:bold;margin-bottom:12px";
          const image = new Image();
          image.src = data;
          image.style.cssText = "display:block;width:100%;height:auto";
          figure.append(caption, image);
          document.querySelector("main").append(figure);
        }
      },
      panels.map((panel) => ({
        label: panel.label,
        data: "data:image/png;base64," + panel.png.toString("base64"),
      })),
    );
    if (name === "clear_celebration") {
      await page.locator("main").evaluate((main) => {
        main.style.display = "grid";
        main.style.gridTemplateColumns = "1fr 1fr";
        main.lastElementChild.style.gridColumn = "1 / -1";
      });
    }
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
    await save(name, page.locator("main"), provenance);
  } finally {
    await context.close();
  }
}

async function ready(page) {
  await page.locator("#start_level:enabled").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
}

async function captureInterface() {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  try {
    const page = await context.newPage();
    await page.goto(url);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await ready(page);
    await save("main_menu", page, "Current production menu; empty device progress.");
    await page.getByRole("button", { name: "Choose surgeon", exact: true }).click();
    let dialog = page.getByRole("dialog", { name: "Choose your surgeon", exact: true });
    assert.equal(await dialog.locator("button[aria-pressed]").count(), 6);
    await page.evaluate(() =>
      Promise.all([...document.querySelectorAll("dialog img")].map((image) => image.decode())),
    );
    await save(
      "surgeon_roster",
      dialog,
      "Actual chooser opened from menu; six cosmetic surgeons; default Maya selected.",
    );
    await dialog.getByRole("button", { name: "Done", exact: true }).click();
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Settings", exact: true });
    await save(
      "compact_settings",
      dialog,
      "Actual Settings dialog; fixed heading and Done, scrollable contents.",
    );
    await dialog.getByRole("button", { name: "Done", exact: true }).click();
    const panels = [];
    for (const count of [8, 0, 12, 24]) {
      await page.evaluate(
        ({ order, count }) =>
          localStorage.setItem(
            "plaque_trouble_save",
            JSON.stringify({
              version: 3,
              settings: { music: false, effects: false, completedTutorials: [], surgeonId: "maya" },
              unlockedLevel: 15,
              records: [],
              completedLevelIds: order.slice(0, count),
            }),
          ),
        { order, count },
      );
      await page.reload();
      await ready(page);
      await page.getByRole("button", { name: "Patient recovery", exact: true }).click();
      dialog = page.getByRole("dialog", { name: "Patient recovery", exact: true });
      await page.waitForFunction(() => {
        const art = document.querySelector(".recovery_map_illustration");
        const patient = document.querySelector(".recovery_patient_overlay");
        return art?.complete && art.naturalWidth > 0 && patient?.getBBox().width > 0;
      });
      if (count === 8)
        await save(
          "patient_recovery",
          dialog,
          "Actual recovery UI with staged demonstration save: eight of 24 routes restored; not earned gameplay.",
        );
      else
        panels.push({
          label: `Demonstration: ${count}/24 routes`,
          png: await page.locator(".recovery_map_art").screenshot(),
        });
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
    }
    await montage(
      "art_identity_recovery",
      panels,
      "Current recovery UI artwork at staged 0/12/24 route saves; same patient, decoded heart and overlays. Progress is not earned.",
    );
  } finally {
    await context.close();
  }
}

try {
  browser = await chromium.launch();
  await captureInterface();
  await captureGameplay({ browser, url, save, montage });
  await captureRosterFixture({ browser, url, save });
  assert.deepEqual(errors, []);
  assert.deepEqual(rows.map((row) => row.name).sort(), [...expected].sort());
  // Conversion replaces the managed PNG corpus only after every new capture succeeds.
  for (const name of expected) {
    try {
      await unlink(resolve(destination, name + ".png"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const buildHashes = {};
  for (const file of ["main.js", "index.html", "style.css"])
    buildHashes[file] = hash(await readFile("dist/" + file));
  await writeFile(
    resolve(destination, "manifest.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        command: "node tests/playwright/capture_docs_screenshots.mjs",
        browser: browser.version(),
        format: "WebP",
        quality: 90,
        buildHashes,
        errors,
        screenshots: rows,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`PASS: ${rows.length} current WebP screenshots; no retained PNG intermediates.`);
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
