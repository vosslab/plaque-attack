// Isolate the production renderer's draw calls, keeping native sprite size and articulation.
import assert from "node:assert/strict";

export async function captureRosterFixture({ browser, url, save }) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  try {
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(new URL("__fixture.html", url).href);
    await page.waitForFunction(() => globalThis.artFixture);
    await page.evaluate(() => {
      const { createRenderer, createSimulation, getLevel, images, SURGEON_IDS } =
        globalThis.artFixture;
      document.body.style.cssText =
        "background:#f4f0e8;color:#222;margin:20px;font:15px sans-serif";
      const heading = document.createElement("h1");
      heading.textContent = "Six surgeons - actual 44x60 gameplay size";
      heading.style.cssText = "font-size:28px;margin:0 0 8px";
      const note = document.createElement("p");
      note.textContent =
        "Production renderer; staged idle, walk and victory poses. Identical gameplay abilities.";
      note.style.margin = "0 0 14px";
      const table = document.createElement("main");
      table.style.cssText = "display:grid;grid-template-columns:repeat(6,1fr);gap:10px";
      document.body.append(heading, note, table);
      for (const mode of ["idle", "walk", "victory", "grayscale", "silhouette"]) {
        for (const id of SURGEON_IDS) {
          const cell = document.createElement("div");
          cell.style.cssText = "text-align:center;background:#e0d8cf;padding:8px";
          const label = document.createElement("div");
          label.textContent = `${id} / ${mode}`;
          cell.append(label);
          table.append(cell);
          const canvas = document.createElement("canvas");
          canvas.style.cssText = "width:960px;height:600px;position:absolute;left:-10000px";
          document.body.append(canvas);
          const isolated = document.createElement("canvas");
          isolated.width = 960;
          isolated.height = 600;
          const mirror = isolated.getContext("2d");
          const nativeDraw = CanvasRenderingContext2D.prototype.drawImage;
          let renderer;
          try {
            CanvasRenderingContext2D.prototype.drawImage = function (...args) {
              if (
                this.canvas === canvas &&
                args[0] instanceof HTMLImageElement &&
                /surgeon_/.test(args[0].src)
              ) {
                mirror.setTransform(this.getTransform());
                mirror.globalAlpha = this.globalAlpha;
                nativeDraw.apply(mirror, args);
              }
              return nativeDraw.apply(this, args);
            };
            renderer = createRenderer(canvas, images, false);
            const state = createSimulation(getLevel(1), "practice");
            state.phase = "playing";
            state.elapsed = 0.4;
            state.tick = 48;
            renderer.render(state, 0, id);
            if (mode === "walk") {
              state.player.position.x += 1;
              state.elapsed = 0.45;
              state.tick = 54;
            }
            mirror.setTransform(1, 0, 0, 1, 0, 0);
            mirror.clearRect(0, 0, 960, 600);
            renderer.render(
              state,
              0,
              id,
              // At 300 ms the production victory sprite appears before the camera zoom starts.
              mode === "victory" ? { elapsed: 0.3, duration: 2.2 } : undefined,
            );
          } finally {
            CanvasRenderingContext2D.prototype.drawImage = nativeDraw;
            renderer?.destroy();
            canvas.remove();
          }
          const crop = document.createElement("canvas");
          crop.width = 80;
          crop.height = 100;
          crop.getContext("2d").drawImage(isolated, 440, 480, 80, 100, 0, 0, 80, 100);
          crop.style.cssText = "width:80px;height:100px";
          if (mode === "grayscale") crop.style.filter = "grayscale(1)";
          if (mode === "silhouette") crop.style.filter = "brightness(0)";
          cell.append(crop);
        }
      }
    });
    await save(
      "art_identity_roster",
      page,
      "Current source production renderer: six native 44x60 figures in staged idle/walk/victory, grayscale and silhouette rows; not earned gameplay.",
    );
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
