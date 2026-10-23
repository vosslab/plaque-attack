/// <reference types="node" />
import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { cwd } from "node:process";
import type { SimulationState } from "../../src/types/simulation";

// Selector contract: src/index.html:131-165 owns the HUD; src/ui.ts:updateHud
// owns countdown presentation. This isolated renderer fixture uses the production
// DOM and module, not the running simulation. Actual-control clears are a separate
// integration journey. Repair presentation if accepted success retains a second.
declare global {
  interface Window {
    renderHudFixture: (phase: SimulationState["phase"], elapsed: number, clear?: boolean) => void;
  }
}

let fixture = "";
test.beforeAll(async () => {
  const result = await build({
    stdin: {
      contents: `
        import { createSimulation } from './src/game_state';
        import { getLevel } from './src/constants';
        import { updateHud } from './src/ui';
        document.getElementById('main_menu').hidden = true;
        document.getElementById('gameplay').hidden = false;
        window.renderHudFixture = (phase, elapsed, clear = false) => {
          const state = createSimulation(getLevel(clear ? 1 : 24), 'practice');
          state.phase = phase;
          state.elapsed = elapsed;
          updateHud(state);
        };
      `,
      resolveDir: cwd(),
      loader: "js",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
  });
  const output = result.outputFiles?.[0];
  if (output === undefined) throw new Error("HUD fixture bundle is missing");
  fixture = output.text;
});

test("maintenance success displays zero while active and lost attempts retain remaining time", async ({
  page,
}) => {
  await page.route("**/main.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: fixture }),
  );
  await page.goto("/");
  const clock = page.locator("#hud_time");
  // The observed final fixed tick is accepted by the simulation just below 50s.
  // A still-playing state at that same value must retain ordinary positive ceil.
  const boundary = 49.999999999998444;
  for (const phase of ["playing", "paused", "game_over"] as const) {
    await page.evaluate(({ phase, boundary }) => window.renderHudFixture(phase, boundary), {
      phase,
      boundary,
    });
    await expect(clock).toHaveText("00:01");
  }
  for (const phase of ["level_complete", "campaign_complete"] as const) {
    await page.evaluate(({ phase, boundary }) => window.renderHudFixture(phase, boundary), {
      phase,
      boundary,
    });
    await expect(clock).toHaveText("00:00");
    await page.evaluate((phase) => window.renderHudFixture(phase, 50), phase);
    await expect(page.locator("#hud_warning")).not.toContainText("return to safe maximum");
  }
  await page.evaluate(() => window.renderHudFixture("playing", 50));
  await expect(clock).toHaveText("00:00");
  await expect(page.locator("#hud_warning")).toContainText("finish pending releases");
  await page.evaluate(() => window.renderHudFixture("level_complete", 12.25, true));
  await expect(page.locator("#hud_time_label")).toHaveText("Elapsed");
  await expect(clock).toHaveText("00:13");
});
