import assert from "node:assert/strict";
import test from "node:test";
import { createHitEffect, drawHitEffect } from "../src/hit_effects.ts";
import { createRenderer } from "../src/renderer.ts";
import { createRemixRendering } from "../src/remix_rendering.ts";
import { createSimulation } from "../src/game_state.ts";
import { getLevel } from "../src/constants.ts";

function hit(split, kind = "plaque") {
  return {
    type: "target_hit",
    targetId: 1,
    targetKind: kind,
    size: "large",
    split,
    position: { x: 400, y: 200 },
    points: 100,
    streak: 1,
  };
}

function recorder() {
  const calls = [];
  const noop = () => {};
  const context = new Proxy(
    {
      measureText: () => ({ width: 10 }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
    },
    {
      get: (object, key) =>
        object[key] ??
        ((...args) => {
          calls.push([key, ...args]);
        }),
    },
  );
  return { context, calls };
}

test("aspirin burst victims do not announce piercing; direct clopidogrel hits do across frames", () => {
  const { context, calls } = recorder();
  const renderer = createRemixRendering(context, {}, true);
  const state = createSimulation(getLevel(10), "practice");
  state.phase = "playing";
  const targetHit = (targetId, projectileId) => ({
    ...hit(false, "platelet"),
    targetId,
    projectileId,
    size: "tiny",
  });
  const captions = () => calls.filter(([method]) => method === "fillText").map(([, text]) => text);

  renderer.consumeEvents([{ ...targetHit(1, 1), size: "small", split: true, points: 0 }]);
  renderer.consumeEvents([
    targetHit(2, 2),
    targetHit(3, 2),
    {
      type: "aspirin_burst",
      position: { x: 400, y: 200 },
      radius: 70,
      removedTargetIds: [2, 3],
    },
  ]);
  renderer.drawFeedback(state);
  assert.deepEqual(captions(), [], "aspirin uses its existing ring and points without a caption");

  renderer.consumeEvents([targetHit(4, 3)]);
  renderer.consumeEvents([targetHit(5, 3)]);
  renderer.drawFeedback(state);
  assert.deepEqual(captions(), ["2 THROUGH!"]);
  calls.length = 0;
  renderer.consumeEvents([targetHit(6, 3)]);
  renderer.drawFeedback(state);
  assert.deepEqual(captions(), ["2 THROUGH!", "3 THROUGH!"]);
});

test("event outcome owns open fragmentation versus compact closed removal, including static reduced motion", () => {
  for (const kind of ["plaque", "platelet"]) {
    for (const reducedMotion of [false, true]) {
      const split = createHitEffect(hit(true, kind), 40);
      const terminal = createHitEffect(hit(false, kind), 40);
      assert.equal(split.split, true);
      assert.equal(terminal.split, false, "size does not override the event outcome");
      const opening = recorder();
      const closing = recorder();
      drawHitEffect(opening.context, split, reducedMotion);
      drawHitEffect(closing.context, terminal, reducedMotion);
      assert.ok(opening.calls.some(([method]) => method === "arc"));
      assert.ok(!opening.calls.some(([method]) => method === "closePath"));
      assert.ok(closing.calls.some(([method]) => method === "closePath"));
      assert.ok(!closing.calls.some(([method]) => method === "arc"));
      const positions = (calls) =>
        calls.filter(([method]) => ["arc", "moveTo", "lineTo"].includes(method));
      for (const effect of [split, terminal]) {
        const before = recorder();
        const after = recorder();
        drawHitEffect(before.context, effect, reducedMotion);
        effect.life *= 0.5;
        drawHitEffect(after.context, effect, reducedMotion);
        if (reducedMotion) assert.deepEqual(positions(before.calls), positions(after.calls));
        else assert.notDeepEqual(positions(before.calls), positions(after.calls));
      }
    }
  }
});

test("renderer drains hit events without mutating gameplay; effects are bounded, pause, expire and reset", (t) => {
  const previousWindow = globalThis.window;
  const previousObserver = globalThis.ResizeObserver;
  globalThis.window = { devicePixelRatio: 1 };
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  t.after(() => {
    globalThis.window = previousWindow;
    globalThis.ResizeObserver = previousObserver;
  });
  const { context, calls } = recorder();
  const canvas = {
    width: 960,
    height: 600,
    getContext: () => context,
    getBoundingClientRect: () => ({ width: 960, height: 600 }),
  };
  context.canvas = canvas;
  const renderer = createRenderer(canvas, new Proxy({}, { get: () => ({}) }), true);
  t.after(() => renderer.destroy());
  const state = createSimulation(getLevel(10), "practice");
  state.phase = "playing";
  state.targets = [];
  renderer.render(state, 0);
  const shapeCount = () =>
    calls.filter(([method, , , , start, end]) => method === "arc" && end - start < Math.PI).length;
  const baseline = shapeCount();
  calls.length = 0;
  const before = structuredClone(state);
  renderer.consumeEvents(Array.from({ length: 100 }, () => hit(true)));
  renderer.render(state, 0);
  assert.deepEqual(state, before);
  const burst = shapeCount() - baseline;
  assert.ok(burst > 0 && burst < 200, "a burst has bounded split geometry");
  state.phase = "paused";
  calls.length = 0;
  renderer.render(state, 0);
  assert.equal(shapeCount() - baseline, burst);
  state.phase = "playing";
  for (let frame = 0; frame < 20; frame += 1) {
    state.tick += 6;
    calls.length = 0;
    renderer.render(state, 0);
  }
  assert.equal(shapeCount(), baseline);
  renderer.consumeEvents([hit(true)]);
  renderer.render(state, 0);
  calls.length = 0;
  const fresh = createSimulation(state.level, state.mode);
  fresh.phase = "playing";
  fresh.targets = [];
  renderer.render(fresh, 0);
  assert.equal(shapeCount(), baseline);
});
