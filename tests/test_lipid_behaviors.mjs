import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, projectileId, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import { resolveCoalescence } from "../src/coalescence.ts";
import { FIXED_STEP, getLevel, MAX_TARGETS } from "../src/constants.ts";
import { createSimulation, pauseSimulation, retryLevel } from "../src/game_state.ts";
import { advanceTarget } from "../src/motion.ts";
import { resolveClearancePulse, splitTarget } from "../src/lipid_behaviors.ts";
import { steerCurrent } from "../src/remix_mechanics.ts";
import { stepSimulation } from "../src/simulation.ts";
import { advancePocketReleases, freezeTissue } from "../src/tissue.ts";

const idle = { left: false, right: false, fire: false };
const point = (x, y) => ({ x: logicalCoordinate(x), y: logicalCoordinate(y) });
function body(behavior, size = "medium", id = 1) {
  return createTarget(
    { kind: "plaque", size, direction: -1, position: point(100, 200), behavior },
    targetId(id),
    1,
  );
}
function playing(overrides = {}) {
  const state = createSimulation({ ...getLevel(1), ...overrides }, "practice");
  state.phase = "playing";
  return state;
}
function shot(x, y) {
  const position = point(x, y);
  return {
    kind: "stent",
    id: projectileId(1),
    position,
    previousPosition: { ...position },
    origin: { ...position },
    age: 0,
    ceilingTime: 0,
  };
}

test("sticky whole-body hold preserves stationary sweeps and releases inward despite current", () => {
  const target = body("sticky");
  target.position.x = logicalCoordinate(target.radius + 1);
  const toWall = 1 / Math.abs(target.velocity.x);
  advanceTarget(target, toWall + 0.01);
  assert.ok(target.behavior.pauseRemaining > 0);
  const held = { ...target.position };
  const phase = target.fluidPhase;
  const state = playing({ flowSwitches: [{ id: "flow", position: point(200, 200), laneX: 900 }] });
  state.targets = [target];
  state.remix.flow = { kind: "active", switchId: "flow", remaining: 2 };
  steerCurrent(state, FIXED_STEP);
  assert.equal(target.velocity.x, 0);
  advanceTarget(target, 0.1);
  assert.deepEqual(target.position, held);
  assert.equal(target.fluidPhase, phase);
  assert.ok(
    target.motionSegments.every((leg) => leg.start.x === leg.end.x && leg.start.y === leg.end.y),
  );
  const remaining = target.behavior.pauseRemaining;
  advanceTarget(target, remaining + 0.1);
  assert.ok(target.position.x > held.x);
  assert.ok(target.velocity.x > 0);
  assert.equal(target.motionSegments[0].startTime, 0);
  assert.equal(target.motionSegments.at(-1).endTime, 1);
  for (let index = 1; index < target.motionSegments.length; index++) {
    assert.deepEqual(target.motionSegments[index - 1].end, target.motionSegments[index].start);
    assert.equal(target.motionSegments[index - 1].endTime, target.motionSegments[index].startTime);
  }
});

test("heavy shatters once into ordinary tiny children with distinct motion and capacity-safe insertion", () => {
  const state = playing();
  const parent = body("heavy");
  state.targets = Array.from({ length: MAX_TARGETS }, (_, index) =>
    body(undefined, "tiny", index + 10),
  );
  splitTarget(state, parent);
  assert.equal(state.targets.length, MAX_TARGETS);
  const children = state.arena.pendingInsertions.map((insertion) => insertion.target);
  assert.ok(children.length > 1);
  assert.ok(
    children.every(
      (child) =>
        child.size === "tiny" &&
        child.behavior === undefined &&
        child.activeFromTick === state.tick + 1,
    ),
  );
  assert.equal(
    new Set(
      children.map(
        (child) => `${Math.sign(child.velocity.x)},${Math.sign(child.fluidAngularSpeed)}`,
      ),
    ).size,
    children.length,
  );
});

test("shot, fuse, heavy and queued fragments stay smaller through their birth overlap", () => {
  for (const [size, behavior, deferred] of [
    ["large", undefined, false],
    ["medium", undefined, false],
    ["small", undefined, false],
    ["medium", "heavy", false],
    ["medium", "unstable", false],
    ["small", undefined, true],
  ]) {
    const state = playing({ merge: { probability: 1, cooldown: 0, budget: 10 } });
    const parent = body(behavior, size, state.nextTargetId++);
    state.targets = [parent];
    if (deferred) {
      state.targets = Array.from({ length: MAX_TARGETS }, () =>
        body(undefined, "large", state.nextTargetId++),
      );
      splitTarget(state, parent);
      state.targets = [];
      advancePocketReleases(state, FIXED_STEP, []);
    } else if (behavior === "unstable") {
      parent.behavior.splitRemaining = FIXED_STEP;
      stepSimulation(state, idle, FIXED_STEP);
    } else {
      state.projectiles = [shot(100, 200)];
      const events = stepSimulation(state, idle, FIXED_STEP);
      assert.equal(events.filter((event) => event.type === "target_hit").length, 1);
    }
    const fragments = [...state.targets];
    const seed = state.seed;
    const sizes = fragments.map((child) => child.size);
    assert.deepEqual(
      sizes,
      Array(behavior === "heavy" ? 3 : 2).fill(
        behavior === "heavy" || size === "small" ? "tiny" : size === "large" ? "medium" : "small",
      ),
    );
    // Include an unrelated target at the same location: birth overlap is never entry.
    state.targets.push(body(undefined, fragments[0].size, state.nextTargetId++));
    for (let tick = 0; tick < 10; tick++) {
      const events = stepSimulation(state, idle, FIXED_STEP);
      assert.equal(
        events.some((event) => event.type === "targets_merged"),
        false,
      );
      assert.equal(state.seed, seed);
    }
    assert.deepEqual(
      fragments.map((child) => child.size),
      sizes,
    );
  }
});

test("siblings can merge on a later natural approach after separating", () => {
  const state = playing({ merge: { probability: 1, cooldown: 0, budget: 1 } });
  state.targets = [];
  splitTarget(state, body(undefined, "small", state.nextTargetId++));
  state.tick += 1;
  const [left, right] = state.targets;
  const seed = state.seed;
  resolveCoalescence(state, []);
  assert.equal(state.seed, seed);
  left.previousPosition = left.position = point(100, 200);
  right.previousPosition = right.position = point(200, 200);
  resolveCoalescence(state, []);
  right.previousPosition = { ...right.position };
  right.position = point(120, 200);
  const events = [];
  resolveCoalescence(state, events);
  assert.equal(events[0]?.type, "targets_merged");
  assert.equal(state.targets[0].size, "small");
});

test("unstable active fuse freezes on pause, expires without scoring and loses ties to shots", () => {
  const state = playing();
  const parent = body("unstable");
  parent.velocity.x = 0;
  parent.fluidAngularSpeed = 0;
  parent.behavior.splitRemaining = FIXED_STEP;
  state.targets = [parent];
  pauseSimulation(state);
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(parent.behavior.splitRemaining, FIXED_STEP);
  state.phase = "playing";
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(events.filter((event) => event.type === "unstable_split").length, 1);
  assert.equal(state.score, 0);
  assert.ok(
    state.targets.every(
      (target) => target.behavior === undefined && target.activeFromTick > state.tick,
    ),
  );
  assert.equal(
    stepSimulation(state, idle, FIXED_STEP).filter((event) => event.type === "unstable_split")
      .length,
    0,
  );
  const shotState = playing();
  const shotParent = body("unstable");
  shotParent.velocity.x = 0;
  shotParent.fluidAngularSpeed = 0;
  shotParent.behavior.splitRemaining = FIXED_STEP;
  shotState.targets = [shotParent];
  shotState.projectiles = [shot(100, 200)];
  const hitEvents = stepSimulation(shotState, idle, FIXED_STEP);
  assert.equal(hitEvents.filter((event) => event.type === "target_hit").length, 1);
  assert.equal(hitEvents.filter((event) => event.type === "unstable_split").length, 0);
});

test("seam pulse scores active tiny bodies once, preserves larger/newborn bodies and resets on retry", () => {
  const definition = {
    id: "seam",
    seamCells: [{ patchId: "patch", cellId: "cell" }],
    position: point(100, 200),
    radius: 180,
  };
  const state = playing({ clearancePulse: definition });
  const tiny = body(undefined, "tiny");
  const platelet = createTarget(
    { kind: "platelet", size: "tiny", direction: 1, position: point(110, 200) },
    targetId(2),
    0,
  );
  const larger = body(undefined, "small", 3);
  const newborn = body(undefined, "tiny", 4);
  newborn.activeFromTick = state.tick + 1;
  const distant = body(undefined, "tiny", 5);
  distant.position.x = logicalCoordinate(700);
  state.targets = [tiny, platelet, larger, newborn, distant];
  const tissue = freezeTissue(state);
  tissue.erosion.set(JSON.stringify(["patch", "cell"]), {
    cell: { patchId: "patch", cellId: "cell", position: point(100, 200) },
    cause: "target",
  });
  const events = [];
  resolveClearancePulse(state, tissue, events);
  assert.deepEqual(
    state.targets.map((target) => target.id),
    [larger.id, newborn.id, distant.id],
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "clearance_pulse");
  assert.equal(events[0].removedTargetIds.length, 2);
  assert.ok(state.score > 0);
  const score = state.score;
  resolveClearancePulse(state, tissue, events);
  assert.equal(state.score, score);
  assert.equal(events.length, 1);
  assert.equal(retryLevel(state).remix.clearancePulse.activated, false);
});

test("committed projectile carving pulses after contact damage and can complete the stage", () => {
  const seam = { id: "cell", position: point(100, 100) };
  const base = getLevel(1);
  const state = playing({
    arena: { ...base.arena, tissue: [{ id: "patch", cells: [seam] }] },
    clearancePulse: {
      id: "seam",
      seamCells: [{ patchId: "patch", cellId: "cell" }],
      position: point(100, 100),
      radius: 600,
    },
  });
  const stationary = createTarget(
    {
      kind: "platelet",
      size: "tiny",
      direction: 1,
      position: point(state.player.position.x, state.player.position.y - 20),
    },
    targetId(9),
    0,
  );
  state.targets = [stationary];
  state.projectiles = [shot(100, 110)];
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.ok(events.findIndex((event) => event.type === "damage") >= 0);
  assert.ok(
    events.findIndex((event) => event.type === "damage") <
      events.findIndex((event) => event.type === "clearance_pulse"),
  );
  assert.equal(state.arena.tissue[0].cells[0].occupied, false);
  assert.equal(state.targets.length, 0);
  assert.equal(state.phase, "level_complete");
});

test("an earlier tissue reflection discards a later proposed sticky wall hold", () => {
  const base = getLevel(1);
  const state = playing({
    arena: {
      ...base.arena,
      tissue: [{ id: "edge", cells: [{ id: "cell", position: point(0, 195) }] }],
    },
  });
  const target = createTarget(
    { kind: "plaque", size: "medium", behavior: "sticky", direction: -1, position: point(53, 200) },
    targetId(1),
    1,
  );
  state.targets = [target];
  stepSimulation(state, idle, 0.2);
  assert.equal(target.behavior.pauseRemaining, 0);
  assert.ok(target.position.x > 53);
  assert.ok(target.velocity.x > 0);
  assert.ok(target.motionSegments.every((leg) => leg.start.x >= 52 && leg.end.x >= 52));
});
