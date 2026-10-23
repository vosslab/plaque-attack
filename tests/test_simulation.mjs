import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, projectileId, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import {
  FIXED_STEP,
  getLevel,
  nextLevelId,
  OVERLOAD_DURATION,
  SPAWN_WARNING_DURATION,
  SURVIVAL_POINTS_PER_SECOND,
  DUAL_ACTIVE_LIMIT,
} from "../src/constants.ts";
import {
  advanceLevel,
  createSimulation,
  pauseSimulation,
  resumeSimulation,
  retryLevel,
} from "../src/game_state.ts";
import { STEADY_FLOW_DURATION, steadyFlowMaximum } from "../src/steady_flow.ts";
import { stepSimulation } from "../src/simulation.ts";
import { synchronizeTargetMotion } from "../src/motion.ts";

const idle = { left: false, right: false, fire: false };

function steadyAttempt() {
  const level = getLevel(11);
  const state = playing(11, "practice", {
    initialTargets: [],
    arena: { ...level.arena, tissue: [], pockets: [], supportPockets: [] },
    flowSwitches: [],
  });
  state.elapsed = state.level.objective.duration / 2;
  state.waves.nextSpawnAt = Infinity;
  return state;
}

function runSeconds(state, seconds) {
  const events = [];
  for (let tick = 0; tick < Math.round(seconds / FIXED_STEP); tick++)
    events.push(...stepSimulation(state, idle, FIXED_STEP));
  return events;
}

test("steady maintenance rewards continuous control and preserves full-duration scoring exactly once", () => {
  const early = steadyAttempt();
  const full = steadyAttempt();
  early.elapsed -= FIXED_STEP;
  stepSimulation(early, idle, FIXED_STEP);
  assert.equal(early.steadyFlowSeconds, 0, "pre-midpoint time cannot count");
  const events = runSeconds(early, STEADY_FLOW_DURATION);
  assert.equal(early.phase, "level_complete");
  const completion = events.find((event) => event.type === "level_complete");
  assert.ok(completion.masteryPoints > 0);
  assert.equal(early.survivalSecondsAwarded, Math.floor(early.elapsed + 1e-9));
  full.elapsed = full.level.objective.duration;
  const timedEvents = stepSimulation(full, idle, FIXED_STEP);
  assert.equal(full.phase, "level_complete");
  assert.equal(timedEvents.find((event) => event.type === "level_complete").masteryPoints, 0);
  assert.equal(early.score, full.score);
  assert.deepEqual(stepSimulation(early, idle, FIXED_STEP), []);
  assert.equal(events.filter((event) => event.type === "level_complete").length, 1);
});

test("steady control resets above its threshold or on damage; paused time freezes and retry is fresh", () => {
  const state = steadyAttempt();
  runSeconds(state, 1);
  const bank = state.steadyFlowSeconds;
  pauseSimulation(state);
  assert.deepEqual(stepSimulation(state, idle, 20), []);
  assert.equal(state.steadyFlowSeconds, bank);
  resumeSimulation(state);
  state.targets = Array.from({ length: steadyFlowMaximum(state.level) + 1 }, () => target(state));
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.steadyFlowSeconds, 0);
  state.targets = [];
  runSeconds(state, 1);
  state.targets = [
    target(state, "platelet", "tiny", state.player.position.x, state.player.position.y),
  ];
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.ok(events.some((event) => event.type === "damage"));
  assert.equal(state.steadyFlowSeconds, 0);
  state.waves.shiftedArrivalSpawned = true;
  const retry = retryLevel(state);
  assert.equal(retry.steadyFlowSeconds, 0);
  assert.equal(retry.waves.shiftedArrivalSpawned, false);
  assert.equal(retry.elapsed, 0);
});

test("a full steady meter honors warnings and pending releases, then shuts unannounced entries", () => {
  const state = steadyAttempt();
  state.steadyFlowSeconds = STEADY_FLOW_DURATION - FIXED_STEP;
  state.waves.warning = { target: state.level.objective.entries[0], remaining: 0.1 };
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.steadyFlowSeconds, STEADY_FLOW_DURATION);
  assert.equal(state.phase, "playing");
  const events = runSeconds(state, 0.1);
  assert.equal(events.filter((event) => event.type === "spawn").length, 1);
  assert.equal(state.phase, "level_complete");

  const pending = steadyAttempt();
  pending.steadyFlowSeconds = STEADY_FLOW_DURATION;
  pending.arena.pockets = [
    { id: "waiting", status: "pending", warningRemaining: 10, nextContentIndex: 0 },
  ];
  pending.waves.nextSpawnAt = pending.elapsed;
  stepSimulation(pending, idle, FIXED_STEP);
  assert.equal(pending.phase, "playing");
  assert.equal(pending.waves.warning, undefined, "full meter closes unannounced arrivals");
  pending.targets = Array.from({ length: steadyFlowMaximum(pending.level) + 1 }, () =>
    target(pending),
  );
  stepSimulation(pending, idle, FIXED_STEP);
  assert.equal(pending.steadyFlowSeconds, 0);
  stepSimulation(pending, idle, FIXED_STEP);
  assert.ok(pending.waves.warning, "broken control reopens the stream");
  pending.targets = [];
  pending.waves.warning = undefined;
  pending.steadyFlowSeconds = STEADY_FLOW_DURATION;
  pending.arena.pockets = [];
  stepSimulation(pending, idle, FIXED_STEP);
  assert.equal(pending.phase, "level_complete");
});

test("loss wins over a nearly earned steady finish", () => {
  const state = steadyAttempt();
  state.steadyFlowSeconds = STEADY_FLOW_DURATION - FIXED_STEP;
  state.player.lives = 1;
  state.targets = [
    target(state, "platelet", "tiny", state.player.position.x, state.player.position.y),
  ];
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.phase, "game_over");
  assert.equal(state.steadyFlowSeconds, 0);
  assert.equal(
    events.some((event) => event.type === "level_complete"),
    false,
  );
});

test("deferred insertions join the arena before a steady finish and can break control", () => {
  const state = steadyAttempt();
  state.steadyFlowSeconds = STEADY_FLOW_DURATION;
  state.targets = Array.from({ length: steadyFlowMaximum(state.level) }, () => target(state));
  const deferred = target(state);
  state.arena.pendingInsertions = [{ kind: "split", sourceId: deferred.id, target: deferred }];
  stepSimulation(state, idle, FIXED_STEP);
  assert.ok(state.targets.includes(deferred));
  assert.equal(state.arena.pendingInsertions.length, 0);
  assert.equal(state.steadyFlowSeconds, 0);
  assert.equal(state.phase, "playing");
});

function playing(id = 1, mode = "campaign", overrides = {}) {
  const state = createSimulation({ ...getLevel(id), ...overrides }, mode);
  state.phase = "playing";
  return state;
}

function target(state, kind = "platelet", size = "tiny", x = 100, y = 200) {
  const entity = createTarget(
    { kind, size, position: { x: logicalCoordinate(x), y: logicalCoordinate(y) }, direction: 1 },
    targetId(state.nextTargetId++),
    0,
  );
  entity.velocity.y = 0;
  return entity;
}

function shot(state, kind, x = 100, y = 200) {
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

function hits(events) {
  return events.filter((event) => event.type === "target_hit");
}

test("a large plaque family needs fifteen separate hits and eight final removals", () => {
  const state = playing();
  state.targets = [target(state, "plaque", "large")];
  const allHits = [];
  while (state.targets.length > 0) {
    assert.ok(allHits.length < 15, "fragmentation must terminate");
    // Separate the family so each shot deliberately selects one descendant.
    state.targets.forEach((entity, index) => {
      entity.position = { x: logicalCoordinate(100 + index * 100), y: logicalCoordinate(200) };
      entity.velocity = { x: 0, y: 0 };
      entity.fluidAngularSpeed = 0;
      synchronizeTargetMotion(entity, state.level.arena.floor, entity.velocity);
    });
    state.projectiles = [shot(state, "stent")];
    const before = state.targets.length;
    const events = stepSimulation(state, idle, FIXED_STEP);
    const successful = hits(events);
    assert.equal(successful.length, 1, "the consumed stent cannot hit its children");
    const hit = successful[0];
    assert.equal(state.targets.length, before + (hit.split ? 1 : -1));
    if (hit.split) {
      const children = state.targets.filter((entity) => entity.activeFromTick > state.tick);
      assert.equal(children.length, 2);
      assert.equal(children[0].velocity.x, -children[1].velocity.x);
    }
    allHits.push(hit);
  }
  assert.equal(allHits.length, 15);
  assert.equal(allHits.filter((event) => !event.split).length, 8);
  assert.equal(new Set(allHits.map((event) => event.targetId)).size, 15);
  assert.equal(state.phase, "level_complete");
});

test("split children begin at the swept contact and continue smoothly on their first active tick", () => {
  const state = playing();
  const parent = target(state, "plaque", "large", 100, 200);
  parent.velocity.x = 2000;
  state.targets = [parent];
  const stent = shot(state, "stent", 250, 400);
  stent.position.y = logicalCoordinate(100);
  state.projectiles = [stent];
  const events = stepSimulation(state, idle, 0.1);
  const hit = hits(events)[0];
  assert.ok(hit?.split);
  assert.ok(hit.position.x > 100 && hit.position.x < 300, "contact precedes the tick endpoint");
  assert.equal(state.targets.length, 2);
  for (const child of state.targets) {
    assert.deepEqual(child.position, hit.position);
    assert.deepEqual(child.previousPosition, hit.position);
    assert.equal(child.activeFromTick, state.tick + 1);
  }
  const positions = state.targets.map((child) => ({ ...child.position }));
  stepSimulation(state, idle, FIXED_STEP);
  state.targets.forEach((child, index) => {
    assert.deepEqual(child.previousPosition, positions[index]);
    assert.ok(
      Math.abs(child.position.y - positions[index].y) < 5,
      "newborn orbit has no vertical teleport",
    );
  });
});

test("incompatible shots leave targets and score intact; intersecting shots award a target once", () => {
  for (const [kind, targetKind] of [
    ["aspirin", "plaque"],
    ["clopidogrel", "plaque"],
    ["stent", "platelet"],
  ]) {
    const state = playing();
    state.targets = [target(state, targetKind)];
    state.projectiles = [shot(state, kind)];
    assert.equal(hits(stepSimulation(state, idle, FIXED_STEP)).length, 0);
    assert.equal(state.targets.length, 1);
    assert.equal(state.score, 0);
  }
  const state = playing(6);
  state.targets = [target(state), target(state, "platelet", "tiny", 800)];
  state.projectiles = [shot(state, "aspirin"), shot(state, "aspirin")];
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(hits(events).length, 1);
  assert.equal(state.streak, 1);
  assert.equal(state.score, hits(events)[0].points);
});

test("a piercing drug shot inactivates at most three distinct targets", () => {
  const state = playing(8);
  state.targets = Array.from({ length: 4 }, () => target(state));
  state.projectiles = [shot(state, "clopidogrel")];
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(hits(events).length, 3);
  assert.equal(new Set(hits(events).map((event) => event.targetId)).size, 3);
  assert.equal(state.targets.length, 1);
  assert.equal(state.projectiles.length, 0);
  assert.equal(hits(stepSimulation(state, idle, FIXED_STEP)).length, 0);
});

test("a projectile removal prevents contact damage; simultaneous overload and contact cost one life", () => {
  const state = playing(11);
  const maximum = state.level.objective.safeMaximum;
  state.targets = [target(state, "platelet", "tiny", state.player.position.x, 510)];
  state.projectiles = [shot(state, "aspirin", state.player.position.x, 510)];
  assert.equal(
    stepSimulation(state, idle, FIXED_STEP).some((event) => event.type === "damage"),
    false,
  );
  state.targets = Array.from({ length: maximum + 1 }, () =>
    target(state, "platelet", "tiny", state.player.position.x, 510),
  );
  state.overloadElapsed = OVERLOAD_DURATION - FIXED_STEP;
  const lives = state.player.lives;
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(events.filter((event) => event.type === "damage").length, 1);
  assert.equal(state.player.lives, lives - 1);
  assert.equal(state.overloadElapsed, 0);
  state.player.lives = 1;
  state.player.contactInvulnerabilityRemaining = 0;
  state.elapsed = state.level.objective.duration - FIXED_STEP;
  assert.equal(
    stepSimulation(state, idle, FIXED_STEP).some((event) => event.type === "level_complete"),
    false,
  );
  assert.equal(state.phase, "game_over");
});

test("pause freezes every simulation clock and entity, including ready and pending arrivals", () => {
  for (const phase of ["ready", "playing"]) {
    const state = playing(11);
    state.phase = phase;
    state.fireCooldown = 0.5;
    state.player.contactInvulnerabilityRemaining = 1;
    state.overloadElapsed = 1;
    state.waves.warning = {
      target: state.level.objective.entries[0],
      remaining: SPAWN_WARNING_DURATION,
    };
    state.projectiles = [shot(state, "aspirin")];
    assert.equal(pauseSimulation(state), true);
    const frozen = structuredClone(state);
    assert.deepEqual(
      stepSimulation(state, { left: false, right: true, fire: true }, FIXED_STEP),
      [],
    );
    assert.deepEqual(state, frozen);
    assert.equal(resumeSimulation(state), true);
    assert.equal(state.phase, phase);
  }
});

test("an empty finite wave waits for its telegraphed pending target", () => {
  const state = playing(7);
  state.targets = [];
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.phase, "playing");
  assert.equal(
    events.some((event) => event.type === "level_complete"),
    false,
  );
  assert.ok(state.waves.warning);
  assert.equal(state.targets.length, 0);
  for (let time = 0; time < SPAWN_WARNING_DURATION - FIXED_STEP / 2; time += FIXED_STEP) {
    stepSimulation(state, idle, FIXED_STEP);
  }
  assert.equal(state.targets.length, 1);
  assert.equal(state.waves.spawned, 1);
});

test("maintenance equality is safe and recovery resets continuous overload", () => {
  const state = playing(11);
  state.waves.nextSpawnAt = Infinity;
  const maximum = state.level.objective.safeMaximum;
  const safe = Array.from({ length: maximum }, () => target(state));
  state.targets = [...safe];
  state.overloadElapsed = OVERLOAD_DURATION - FIXED_STEP;
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.overloadElapsed, 0);
  state.targets.push(target(state));
  stepSimulation(state, idle, FIXED_STEP);
  assert.ok(Math.abs(state.overloadElapsed - FIXED_STEP) < 1e-9);
  state.targets = safe;
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.overloadElapsed, 0);
  state.targets.push(target(state));
  state.overloadElapsed = OVERLOAD_DURATION - FIXED_STEP;
  state.player.contactInvulnerabilityRemaining = OVERLOAD_DURATION;
  const lives = state.player.lives;
  const events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.player.lives, lives - 1, "overload ignores contact invulnerability");
  assert.equal(events.find((event) => event.type === "damage")?.cause, "overload");
});

test("maintenance expiry discards spawns, retains overload, caps survival, then completes once safe", () => {
  // Keep final-stage completion coverage with an explicit maintenance fixture.
  const state = playing(15, "campaign", { objective: getLevel(11).objective });
  const objective = state.level.objective;
  state.targets = Array.from({ length: objective.safeMaximum + 1 }, () => target(state));
  state.elapsed = objective.duration - FIXED_STEP;
  state.survivalSecondsAwarded = Math.floor(objective.duration) - 1;
  state.overloadElapsed = 1;
  state.waves.warning = { target: objective.entries[0], remaining: FIXED_STEP };
  let events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.phase, "playing");
  assert.equal(state.waves.warning, undefined);
  assert.equal(state.waves.nextSpawnAt, Infinity);
  assert.ok(state.overloadElapsed > 1);
  assert.equal(events.filter((event) => event.type === "spawn").length, 0);
  assert.equal(state.score, SURVIVAL_POINTS_PER_SECOND);
  const atExpiry = state.score;
  events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.score, atExpiry);
  assert.equal(
    events.some((event) => event.type === "survival_points"),
    false,
  );
  state.targets.pop();
  events = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.phase, "campaign_complete");
  assert.equal(events.filter((event) => event.type === "run_end").length, 1);
  const completedScore = state.score;
  assert.deepEqual(stepSimulation(state, idle, FIXED_STEP), []);
  assert.equal(state.score, completedScore);
});

test("campaign advancement carries score and lives; practice cannot advance or commit records", () => {
  for (const mode of ["campaign", "practice"]) {
    const state = playing(1, mode);
    state.targets = [];
    state.player.lives = 2;
    const events = stepSimulation(state, idle, FIXED_STEP);
    assert.equal(events.filter((event) => event.type === "level_complete").length, 1);
    const score = state.score;
    assert.deepEqual(stepSimulation(state, idle, FIXED_STEP), []);
    assert.equal(state.score, score);
    const next = advanceLevel(state);
    if (mode === "campaign") {
      assert.equal(next.level.id, nextLevelId(state.level.id));
      assert.equal(next.player.lives, 2);
      assert.equal(next.score, score);
    } else {
      assert.equal(next, undefined);
      const practiceFinal = playing(15, mode);
      practiceFinal.targets = [];
      practiceFinal.elapsed = practiceFinal.level.objective.duration;
      assert.equal(
        stepSimulation(practiceFinal, idle, FIXED_STEP).some((event) => event.type === "run_end"),
        false,
      );
      assert.equal(practiceFinal.recordCommitted, false);
    }
  }
});

test("stent active-shot limit and blocked dual fire preserve shot alternation", () => {
  const state = playing();
  state.targets = [target(state, "plaque", "large", 800)];
  state.projectiles = [shot(state, "stent")];
  const events = stepSimulation(state, { ...idle, fire: true }, FIXED_STEP);
  assert.equal(
    events.some((event) => event.type === "shot"),
    false,
  );
  const dual = playing(9);
  dual.targets = [target(dual, "platelet", "tiny", 800)];
  let first = stepSimulation(dual, { ...idle, fire: true }, FIXED_STEP);
  assert.equal(first.find((event) => event.type === "shot")?.kind, "aspirin");
  dual.fireCooldown = 0;
  dual.projectiles = [];
  first = stepSimulation(dual, { ...idle, fire: true }, FIXED_STEP);
  assert.equal(first.find((event) => event.type === "shot")?.kind, "clopidogrel");
  dual.fireCooldown = 0;
  dual.projectiles = Array.from({ length: DUAL_ACTIVE_LIMIT }, () => shot(dual, "aspirin"));
  const nextDrug = dual.nextDrug;
  assert.equal(
    stepSimulation(dual, { ...idle, fire: true }, FIXED_STEP).some(
      (event) => event.type === "shot",
    ),
    false,
  );
  assert.equal(dual.nextDrug, nextDrug);
});
