import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, projectileId, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import { DEFAULT_ARENA, FIXED_STEP, getLevel, MAX_TARGETS } from "../src/constants.ts";
import { createSimulation } from "../src/game_state.ts";
import { advanceTarget } from "../src/motion.ts";
import { resolveProjectileHits } from "../src/weapons.ts";

const point = (x, y) => ({ x: logicalCoordinate(x), y: logicalCoordinate(y) });
function playing() {
  const state = createSimulation({ ...getLevel(1), arena: DEFAULT_ARENA }, "practice");
  state.phase = "playing";
  state.targets = [];
  return state;
}
function platelet(state, size = "tiny", x = 100, y = 200) {
  return createTarget(
    { kind: "platelet", size, direction: 1, position: point(x, y) },
    targetId(state.nextTargetId++),
    0,
  );
}
function shot(state, kind = "aspirin", x = 100, y = 200) {
  const position = point(x, y);
  return {
    kind,
    id: projectileId(state.nextProjectileId++),
    position,
    previousPosition: { ...position },
    origin: { ...position },
    age: 0,
    hitTargetIds: [],
  };
}

test("aspirin disperses an unscored aggregate into three separating next-tick hazards", () => {
  const state = playing();
  state.score = 700;
  state.streak = 3;
  const parent = platelet(state, "small");
  state.targets = [parent];
  state.projectiles = [shot(state), shot(state)];
  const events = [];
  resolveProjectileHits(state, FIXED_STEP, events);
  assert.equal(state.score, 700);
  assert.equal(state.streak, 3);
  assert.equal(state.targets.length, 3);
  assert.ok(
    state.targets.every(
      (target) =>
        target.kind === "platelet" &&
        target.size === "tiny" &&
        target.activeFromTick === state.tick + 1,
    ),
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "target_hit");
  assert.equal(events[0].split, true);
  assert.equal(events[0].points, 0);
  assert.ok(
    state.targets.every(
      (target) =>
        Math.hypot(target.position.x - parent.position.x, target.position.y - parent.position.y) +
          target.radius <=
        parent.radius,
    ),
    "birth positions stay inside the parent's free circle beside walls and tissue",
  );
  assert.ok(
    state.targets.every(
      (target) =>
        Number.isFinite(target.velocity.x) &&
        Number.isFinite(target.velocity.y) &&
        target.velocity.x !== 0 &&
        target.velocity.y < 0,
    ),
    "each child starts obliquely upward, away from the follow-up firing column",
  );
  assert.equal(
    new Set(state.targets.map((target) => target.velocity.y / target.velocity.x)).size,
    3,
    "three distinct directions create a visible fan",
  );
  for (const child of state.targets) advanceTarget(child, 0.5, state.level.arena.floor);
  assert.equal(
    new Set(state.targets.map((target) => `${target.position.x}:${target.position.y}`)).size,
    3,
  );
  assert.ok(
    Math.max(...state.targets.map((target) => target.position.x)) -
      Math.min(...state.targets.map((target) => target.position.x)) >
      parent.radius,
  );
});

test("aspirin tiny burst clears a local group once and preserves other sizes, kinds and newborns", () => {
  const state = playing();
  const group = [
    platelet(state),
    platelet(state, "tiny", 125),
    platelet(state, "tiny", 75),
    platelet(state, "tiny", 110),
  ];
  const aggregate = platelet(state, "small");
  const newborn = platelet(state);
  newborn.activeFromTick = state.tick + 1;
  const distant = platelet(state, "tiny", 400);
  const plaque = createTarget(
    { kind: "plaque", size: "tiny", direction: 1, position: point(100, 200) },
    targetId(state.nextTargetId++),
    0,
  );
  state.targets = [...group, aggregate, newborn, distant, plaque];
  state.projectiles = [shot(state)];
  const events = [];
  resolveProjectileHits(state, FIXED_STEP, events);
  assert.deepEqual(
    state.targets.map((target) => target.id),
    [aggregate.id, newborn.id, distant.id, plaque.id],
  );
  const hits = events.filter((event) => event.type === "target_hit");
  assert.equal(hits.length, group.length);
  assert.equal(new Set(hits.map((event) => event.targetId)).size, group.length);
  assert.ok(hits.every((event) => !event.split));
  assert.equal(
    state.score,
    hits.reduce((total, event) => total + event.points, 0),
  );
  assert.equal(state.streak, group.length);
  assert.deepEqual(
    events.find((event) => event.type === "aspirin_burst").removedTargetIds,
    group.map((target) => target.id),
  );
});

test("an existing tiny hit cannot clean up fragments dispersed earlier in the same tick", () => {
  const state = playing();
  const parent = platelet(state, "small");
  const existing = platelet(state);
  state.targets = [parent, existing];
  state.projectiles = [shot(state), shot(state)];
  const events = [];
  resolveProjectileHits(state, FIXED_STEP, events);
  assert.equal(state.targets.length, 3);
  assert.ok(state.targets.every((target) => target.activeFromTick === state.tick + 1));
  assert.deepEqual(events.find((event) => event.type === "aspirin_burst").removedTargetIds, [
    existing.id,
  ]);
  assert.equal(state.streak, 1);
  state.tick += 1;
  state.projectiles = [shot(state)];
  resolveProjectileHits(state, FIXED_STEP, []);
  assert.equal(state.targets.length, 0, "a later shot can clear the now-active fan");
  assert.equal(state.streak, 4);
});

test("intersecting aspirin shots award each removed identity only once", () => {
  const state = playing();
  state.targets = [platelet(state), platelet(state, "tiny", 125)];
  state.projectiles = [shot(state), shot(state)];
  const events = [];
  resolveProjectileHits(state, FIXED_STEP, events);
  assert.equal(state.targets.length, 0);
  assert.equal(state.streak, 2);
  assert.equal(events.filter((event) => event.type === "target_hit").length, 2);
  assert.equal(events.filter((event) => event.type === "aspirin_burst").length, 1);
});

test("aspirin burst uses neighbor positions at impact rather than their later path endpoints", () => {
  const state = playing();
  const direct = platelet(state);
  const departing = platelet(state, "tiny", 400);
  const arriving = platelet(state, "tiny", 125);
  departing.previousPosition = point(125, 200);
  arriving.previousPosition = point(400, 200);
  for (const target of [departing, arriving]) {
    target.motionSegments = [
      { startTime: 0, endTime: 1, start: target.previousPosition, end: target.position },
    ];
  }
  state.targets = [direct, departing, arriving];
  state.projectiles = [shot(state)];
  const events = [];
  resolveProjectileHits(state, FIXED_STEP, events);
  assert.deepEqual(
    state.targets.map((target) => target.id),
    [arriving.id],
  );
  assert.deepEqual(events.find((event) => event.type === "aspirin_burst").removedTargetIds, [
    direct.id,
    departing.id,
  ]);
});

test("clopidogrel removes three direct identities including aggregates and leaves off-line neighbors", () => {
  const state = playing();
  const line = [
    platelet(state, "small", 100, 300),
    platelet(state, "tiny", 100, 240),
    platelet(state, "tiny", 100, 180),
    platelet(state, "tiny", 100, 120),
  ];
  const neighbor = platelet(state, "tiny", 150, 300);
  state.targets = [...line, neighbor];
  const projectile = shot(state, "clopidogrel", 100, 320);
  state.projectiles = [projectile];
  const events = [];
  resolveProjectileHits(state, 0.6, events);
  assert.deepEqual(
    projectile.hitTargetIds,
    line.slice(0, 3).map((target) => target.id),
  );
  assert.deepEqual(
    state.targets.map((target) => target.id),
    [line[3].id, neighbor.id],
  );
  assert.equal(state.projectiles.length, 0);
  assert.equal(events.filter((event) => event.type === "target_hit").length, 3);
  assert.ok(events.every((event) => event.type === "target_hit" && !event.split));
});

test("aspirin fan preserves all children when target capacity defers their insertion", () => {
  const state = playing();
  const parent = platelet(state, "small");
  state.targets = [
    parent,
    ...Array.from({ length: MAX_TARGETS - 1 }, () => platelet(state, "tiny", 800)),
  ];
  state.projectiles = [shot(state)];
  resolveProjectileHits(state, FIXED_STEP, []);
  assert.equal(state.targets.length, MAX_TARGETS);
  assert.equal(state.arena.pendingInsertions.length, 2);
  const children = [
    ...state.targets.filter((target) => target.activeFromTick > state.tick),
    ...state.arena.pendingInsertions.map((insertion) => insertion.target),
  ];
  assert.equal(children.length, 3);
  assert.ok(children.every((target) => target.kind === "platelet" && target.size === "tiny"));
});
