import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, projectileId, randomSeed, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import {
  DEFAULT_ARENA,
  FIXED_STEP,
  getLevel,
  OVERLOAD_DURATION,
  TARGET_PRESETS,
} from "../src/constants.ts";
import { targetVerticalBounds } from "../src/arena_geometry.ts";
import { advanceLevel, createSimulation, pauseSimulation, retryLevel } from "../src/game_state.ts";
import { activateFlow, advanceFlow, advanceSupport, steerCurrent } from "../src/remix_mechanics.ts";
import { advanceTarget } from "../src/motion.ts";
import { stepSimulation } from "../src/simulation.ts";
import { freezeTissue, queueProjectileErosion, commitTissueErosion } from "../src/tissue.ts";
import { advanceFinale, clearObjectiveSatisfied } from "../src/waves.ts";
import { resolveProjectileHits } from "../src/weapons.ts";

const idle = { left: false, right: false, fire: false };
function playing(id = 17, overrides = {}) {
  const state = createSimulation({ ...getLevel(id), ...overrides }, "campaign");
  state.phase = "playing";
  return state;
}
function shot(state, kind, x = 480, y = 400) {
  const position = { x: logicalCoordinate(x), y: logicalCoordinate(y) };
  const body = {
    id: projectileId(state.nextProjectileId++),
    position,
    previousPosition: { ...position },
    origin: { ...position },
    age: 0,
  };
  return kind === "stent" ? { ...body, kind, ceilingTime: 0 } : { ...body, kind, hitTargetIds: [] };
}
function fixedTarget(state, kind, x, y) {
  const entity = createTarget(
    {
      kind,
      size: "tiny",
      position: { x: logicalCoordinate(x), y: logicalCoordinate(y) },
      direction: 1,
    },
    targetId(state.nextTargetId++),
    0,
    0,
    state.level.arena.floor,
  );
  return entity;
}

test("flow clocks pause and current steers continuously within speed and floor bounds", () => {
  const state = playing();
  activateFlow(state, state.level.flowSwitches[0], []);
  pauseSimulation(state);
  const snapshot = structuredClone(state);
  stepSimulation(state, idle, 2);
  assert.deepEqual(state, snapshot);
  state.phase = "playing";
  const target = state.targets[0];
  target.velocity.x = -TARGET_PRESETS[target.size].horizontalSpeed * state.level.speedMultiplier;
  const before = target.velocity.x;
  steerCurrent(state, FIXED_STEP);
  assert.ok(target.velocity.x > before && target.velocity.x < 0, "current turns gradually");
  for (let tick = 0; tick < 600; tick++) {
    steerCurrent(state, FIXED_STEP);
    advanceTarget(target, FIXED_STEP, state.level.arena.floor);
    const [top, bottom] = targetVerticalBounds(
      state.level.arena.floor,
      target.position.x,
      target.radius,
    );
    assert.ok(target.position.y >= top - 1e-9 && target.position.y <= bottom + 1e-9);
    assert.ok(
      Math.abs(target.velocity.x) <=
        TARGET_PRESETS[target.size].horizontalSpeed * state.level.speedMultiplier,
    );
  }
  advanceFlow(state, 4);
  assert.equal(state.remix.flow.kind, "cooldown");
  advanceFlow(state, 6);
  assert.equal(state.remix.flow.kind, "ready");
});

test("current expiry restores ordinary drift for every size without changing direction", () => {
  const state = playing();
  const definition = state.level.flowSwitches[0];
  const cases = [
    { velocity: -0.25, offset: 32, direction: -1 },
    { velocity: 0.25, offset: -32, direction: 1 },
    { velocity: 0, offset: 32, direction: 1 },
    { velocity: 0, offset: -32, direction: -1 },
    { velocity: 0, offset: 0, direction: 1 },
    { velocity: 0, offset: 0, direction: -1 },
  ];
  state.targets = Object.keys(TARGET_PRESETS).flatMap((size, sizeIndex) =>
    cases.map(({ velocity, offset }, index) => {
      const target = createTarget(
        {
          kind: size === "large" || size === "medium" ? "plaque" : "platelet",
          size,
          position: { x: logicalCoordinate(definition.laneX - offset), y: logicalCoordinate(200) },
          direction: 1,
        },
        targetId(sizeIndex * cases.length + index),
        0,
      );
      target.velocity.x = velocity;
      return target;
    }),
  );
  activateFlow(state, definition, []);
  state.remix.flow.remaining = 0.5;
  pauseSimulation(state);
  const paused = structuredClone(state);
  stepSimulation(state, idle, 2);
  assert.deepEqual(state, paused, "pausing freezes even a current about to expire");
  state.phase = "playing";
  const before = structuredClone(state.targets);
  advanceFlow(state, 0.25);
  assert.deepEqual(state.targets, before, "ordinary drift resumes only at expiry");
  advanceFlow(state, 0.25);
  assert.equal(state.remix.flow.kind, "cooldown");
  state.targets.forEach((target, index) => {
    const expectedDirection = cases[index % cases.length].direction;
    assert.equal(
      target.velocity.x,
      expectedDirection * TARGET_PRESETS[target.size].horizontalSpeed * state.level.speedMultiplier,
    );
    assert.equal(target.velocity.y, before[index].velocity.y);
    assert.deepEqual(target.position, before[index].position);
    assert.deepEqual(target.previousPosition, before[index].previousPosition);
  });
  const restored = structuredClone(state.targets);
  advanceFlow(state, 1);
  assert.deepEqual(state.targets, restored, "cooldown does not restore speed again");
});

test("all tools activate a ready switch and cooling switches pass shots onward", () => {
  for (const kind of ["stent", "aspirin", "clopidogrel"]) {
    const state = playing(17, { arena: DEFAULT_ARENA });
    state.targets = [];
    state.projectiles = [shot(state, kind)];
    const events = [];
    resolveProjectileHits(state, 0.3, events);
    assert.equal(events.filter((event) => event.type === "flow_activated").length, 1);
    assert.equal(state.projectiles.length, 0);
    state.projectiles = [shot(state, kind)];
    resolveProjectileHits(state, 0.3, []);
    assert.equal(state.projectiles.length, 1);
    state.remix.flow = { kind: "cooldown", remaining: 1 };
    state.projectiles = [shot(state, kind)];
    resolveProjectileHits(state, 0.3, []);
    assert.equal(state.projectiles.length, 1);
  }
});

test("earlier target and tissue contacts block switch activation in the shared solver", () => {
  for (const blocker of ["target", "tissue"]) {
    const arena = {
      ...DEFAULT_ARENA,
      tissue:
        blocker === "tissue"
          ? [
              {
                id: "block",
                pocketId: undefined,
                cells: [
                  {
                    id: "cell",
                    position: { x: logicalCoordinate(474), y: logicalCoordinate(350) },
                  },
                ],
              },
            ]
          : [],
    };
    const state = playing(17, { arena });
    state.targets = blocker === "target" ? [fixedTarget(state, "platelet", 480, 355)] : [];
    state.projectiles = [shot(state, "aspirin")];
    resolveProjectileHits(state, 0.3, []);
    assert.equal(state.remix.flow.kind, "ready");
    assert.equal(state.projectiles.length, 0);
  }
});

test("carving releases optional aid, descent and walking collect one nonstacking shield", () => {
  const state = playing(4);
  const tissue = freezeTissue(state);
  const cell = tissue.cells.find((cell) => cell.patchId === "support-shell");
  queueProjectileErosion(tissue, cell);
  commitTissueErosion(state, tissue, []);
  const events = [];
  advanceSupport(state, FIXED_STEP, tissue, events);
  assert.equal(events[0].type, "support_released");
  assert.equal(state.remix.supportPockets[0].status, "released");
  assert.equal(state.remix.contactShield, false);
  advanceSupport(state, 10, freezeTissue(state), events);
  const capsule = state.remix.supportPockets[0].capsulePosition;
  assert.ok(capsule.y < state.player.position.y);
  state.player.position.x = capsule.x;
  advanceSupport(state, FIXED_STEP, freezeTissue(state), events);
  assert.equal(state.remix.contactShield, true);
  assert.equal(state.remix.supportPockets[0].status, "collected");
  assert.equal(state.score, 0);
  const count = events.length;
  advanceSupport(state, 10, freezeTissue(state), events);
  assert.equal(events.length, count);
});

test("shield preserves life and streak on contact while same-tick overload still damages", () => {
  for (const overload of [false, true]) {
    const state = playing(11, { arena: DEFAULT_ARENA });
    state.waves.nextSpawnAt = Infinity;
    state.remix.contactShield = true;
    state.streak = 7;
    const count = overload ? state.level.objective.safeMaximum + 1 : 1;
    state.targets = Array.from({ length: count }, () =>
      fixedTarget(state, "platelet", state.player.position.x, 500),
    );
    state.overloadElapsed = OVERLOAD_DURATION - FIXED_STEP;
    const events = stepSimulation(state, idle, FIXED_STEP);
    assert.equal(state.remix.contactShield, false);
    assert.ok(state.player.contactInvulnerabilityRemaining > 0);
    assert.equal(state.player.lives, overload ? 2 : 3);
    assert.equal(state.streak, overload ? 0 : 7);
    assert.equal(events.filter((event) => event.type === "shield_absorbed").length, 1);
    assert.deepEqual(
      events.filter((event) => event.type === "damage").map((event) => event.cause),
      overload ? ["overload"] : [],
    );
  }
});

test("finite phases wait for pending hazards, preserve arena and aid, and finish after the last group", () => {
  const state = playing(5);
  assert.equal(state.level.initialTargets.length, 0);
  const phases = state.level.objective.phases;
  assert.ok(phases.length > 1, "the finite encounter has multiple authored groups");
  const phaseTargetCounts = phases.map((phase) => phase.targets.length);
  assert.ok(
    phaseTargetCounts.every((count) => count > 0),
    "each authored group is finite and populated",
  );
  assert.equal(state.targets.length, phaseTargetCounts[0]);
  state.targets = [];
  state.remix.contactShield = true;
  state.remix.flow = { kind: "cooldown", remaining: 3 };
  const arena = state.arena;
  state.arena.pockets.push({
    id: "pending-hazard",
    status: "pending",
    warningRemaining: 1,
    nextContentIndex: 0,
  });
  advanceFinale(state, 1, []);
  assert.equal(state.remix.finale.transitionRemaining, 0);
  assert.equal(clearObjectiveSatisfied(state), false);
  state.arena.pockets = [];
  advanceFinale(state, FIXED_STEP, []);
  assert.ok(state.remix.finale.transitionRemaining > 0);
  const events = [];
  advanceFinale(state, state.remix.finale.transitionRemaining, events);
  assert.equal(state.remix.finale.phaseIndex, Math.min(1, phases.length - 1));
  assert.equal(state.targets.length, phaseTargetCounts[state.remix.finale.phaseIndex]);
  assert.equal(state.arena, arena);
  assert.equal(state.remix.contactShield, true);
  assert.equal(state.remix.flow.kind, "cooldown");
  assert.equal(events[0].type, "finale_phase_started");

  while (state.remix.finale.phaseIndex < phases.length - 1) {
    state.targets = [];
    advanceFinale(state, 1, []);
    assert.ok(state.remix.finale.transitionRemaining > 0);
    advanceFinale(state, state.remix.finale.transitionRemaining, events);
    assert.equal(state.targets.length, phaseTargetCounts[state.remix.finale.phaseIndex]);
    assert.equal(state.arena, arena);
    assert.equal(state.remix.contactShield, true);
    assert.equal(state.remix.flow.kind, "cooldown");
    assert.equal(clearObjectiveSatisfied(state), false);
  }
  state.targets = [];
  assert.equal(clearObjectiveSatisfied(state), true);
  const support = playing(4);
  support.targets = [];
  assert.equal(clearObjectiveSatisfied(support), true, "sealed optional aid never blocks clear");
  support.remix.supportPockets[0].status = "released";
  assert.equal(clearObjectiveSatisfied(support), true, "uncollected aid never blocks clear");
});

test("retry restores entry checkpoint and all local state; advance carries only the run retry count", () => {
  const state = createSimulation(getLevel(5), "campaign", 1234, 1, randomSeed(42));
  state.seed = randomSeed(999);
  state.score = 5000;
  state.remix.retry.retryCount = 2;
  state.remix.contactShield = true;
  state.remix.flow = { kind: "cooldown", remaining: 3 };
  state.targets = [];
  state.phase = "game_over";
  const retried = retryLevel(state);
  const fresh = createSimulation(getLevel(5), "campaign", 1234, 3, randomSeed(42));
  fresh.readyRemaining = 1;
  fresh.remix.retry.retryCount = 3;
  assert.deepEqual(retried, fresh);
  retried.phase = "level_complete";
  retried.seed = randomSeed(123);
  const next = advanceLevel(retried);
  assert.equal(next.remix.retry.retryCount, 3);
  assert.equal(next.remix.retry.entrySeed, retried.seed);
  assert.equal(next.levelStartScore, retried.score);
  const practice = retryLevel(createSimulation(getLevel(4), "practice", 50, 1));
  assert.equal(practice.mode, "practice");
  assert.equal(practice.remix.retry.retryCount, 1);
});
