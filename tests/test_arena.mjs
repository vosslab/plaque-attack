import assert from "node:assert/strict";
import test from "node:test";
import { playerSupportY } from "../src/arena_geometry.ts";
import { createTarget } from "../src/characters.ts";
import { projectileContact, sweptTargetPlayerContact } from "../src/collision.ts";
import { resolveCoalescence } from "../src/coalescence.ts";
import {
  ARENA_WIDTH,
  FIXED_STEP,
  getLevel,
  LEVEL_IDS,
  MAX_TARGETS,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  WEAPON_CONFIGS,
} from "../src/constants.ts";
import { advanceLevel, createSimulation, pauseSimulation } from "../src/game_state.ts";
import { advanceTarget, synchronizeTargetMotion } from "../src/motion.ts";
import { stepSimulation } from "../src/simulation.ts";
import {
  advancePocketReleases,
  freezeTissue,
  hasPendingTargets,
  resolveTargetTissue,
  targetOverlapsTissue,
} from "../src/tissue.ts";
import { clearObjectiveSatisfied } from "../src/waves.ts";
import { resolveProjectileHits } from "../src/weapons.ts";

const idle = { left: false, right: false, fire: false };
const point = (x, y) => ({ x, y });

// Synthetic arena fixtures isolate contracts from authored layouts and probability tuning.
function playing(overrides = {}) {
  const base = getLevel(1);
  const state = createSimulation(
    {
      ...base,
      speedMultiplier: 0,
      initialTargets: [],
      merge: { probability: 0, cooldown: 0, budget: 0 },
      ...overrides,
    },
    "practice",
  );
  state.phase = "playing";
  return state;
}

function target(state, x = 104, y = 260, size = "tiny", kind = "plaque") {
  return createTarget(
    { kind, size, direction: 1, position: point(x, y) },
    state.nextTargetId++,
    state.level.speedMultiplier,
    0,
    state.level.arena.floor,
  );
}

function shot(state, kind = "stent", x = 104, y = 400) {
  return {
    id: state.nextProjectileId++,
    kind,
    position: point(x, y),
    previousPosition: point(x, y),
    origin: point(x, y),
    age: 0,
    ...(kind === "stent" ? { ceilingTime: 0 } : { hitTargetIds: [] }),
  };
}

function wall(state) {
  state.arena.tissue = [
    {
      id: "wall",
      pocketId: undefined,
      cells: [0, 1, 2, 3, 4].map((index) => ({
        id: `c${index}`,
        position: point(76 + index * 12, 300),
        occupied: true,
      })),
    },
  ];
}

test("all shot kinds consume both same-tick shots at tissue; only the next tick uses the hole", () => {
  for (const kind of ["stent", "aspirin", "clopidogrel"]) {
    const state = playing();
    wall(state);
    const behind = target(state, 104, 260, "tiny", kind === "stent" ? "plaque" : "platelet");
    state.targets = [behind];
    state.projectiles = [shot(state, kind), shot(state, kind)];
    const events = stepSimulation(state, idle, 0.4);
    assert.deepEqual(state.targets, [behind], kind);
    assert.equal(state.projectiles.length, 0, kind);
    assert.equal(state.score, 0);
    assert.equal(state.streak, 0);
    const removed = events
      .filter((event) => event.type === "tissue_eroded")
      .flatMap((e) => e.cellIds);
    assert.ok(removed.length > 0);
    assert.equal(new Set(removed).size, removed.length, "commit emits each removal once");
    state.projectiles = [shot(state, kind)];
    assert.equal(
      stepSimulation(state, idle, 0.4).filter((event) => event.type === "target_hit").length,
      1,
      kind,
    );
    assert.equal(state.targets.length, 0);
  }
});

test("solid wins an exact contact tie, and piercing shots stop after a front target at tissue", () => {
  const tie = playing();
  wall(tie);
  tie.arena.tissue[0].cells = [{ id: "tie", position: point(100, 300), occupied: true }];
  tie.targets = [target(tie, 104, 296)];
  tie.projectiles = [shot(tie)];
  const events = [];
  // Resolver-level fixture intentionally overlaps a target and solid to make times identical.
  resolveProjectileHits(tie, 0.2, events, freezeTissue(tie));
  assert.equal(
    events.some((event) => event.type === "target_hit"),
    false,
  );
  assert.equal(tie.targets.length, 1);
  assert.equal(tie.projectiles.length, 0);

  const state = playing();
  wall(state);
  const rear = target(state, 106, 260, "tiny", "platelet");
  state.targets = [target(state, 106, 360, "tiny", "platelet"), rear];
  state.projectiles = [shot(state, "clopidogrel", 106)];
  const hits = stepSimulation(state, idle, 0.45).filter((event) => event.type === "target_hit");
  assert.equal(hits.length, 1);
  assert.deepEqual(state.targets, [rear]);
  assert.equal(state.projectiles.length, 0);
});

test("hazard reflection rephases motion and does not expose its erosion to same-tick shots", () => {
  const state = playing();
  wall(state);
  const hazard = target(state, 106, 260);
  hazard.fluidAngularSpeed = 4;
  synchronizeTargetMotion(hazard, state.level.arena.floor, { x: 0, y: 100 });
  state.targets = [hazard];
  state.projectiles = [shot(state)];
  const events = stepSimulation(state, idle, 0.1);
  assert.ok(events.some((event) => event.type === "tissue_eroded"));
  assert.equal(state.projectiles.length, 0);
  assert.equal(
    events.some((event) => event.type === "target_hit"),
    false,
  );
  assert.equal(state.targets.length, 1);
  assert.equal(targetOverlapsTissue(state, hazard.position, hazard.radius), false);
  assert.ok(hazard.velocity.y < 0);
  const before = hazard.position.y;
  advanceTarget(hazard, 0.01, state.level.arena.floor);
  assert.ok(hazard.position.y < before, "next orbit step continues away from tissue");
});

test("generated wall-turn legs reach projectile, player and merge consumers", () => {
  for (const kind of ["plaque", "platelet"]) {
    const state = playing();
    const hazard = target(state, ARENA_WIDTH - 104, 200, "tiny", kind);
    hazard.velocity.x = 400;
    advanceTarget(hazard, 0.5, state.level.arena.floor);
    const wallX = ARENA_WIDTH - hazard.radius;
    assert.ok(hazard.motionSegments.length > 2);
    assert.ok(hazard.motionSegments.some((leg) => leg.end.x === wallX));
    assert.ok(
      hazard.motionSegments.every((leg) => (leg.endTime - leg.startTime) * 0.5 <= 1 / 120 + 1e-12),
    );
    assert.equal(hazard.velocity.x, -400);
    const compatibleShot = kind === "plaque" ? "stent" : "aspirin";
    assert.notEqual(projectileContact(shot(state, compatibleShot, wallX, 200), hazard), undefined);
    assert.equal(sweptTargetPlayerContact(hazard, { position: point(wallX, 246) }), true);
    const merging = mergeState();
    merging.targets = [{ ...hazard, kind: "plaque" }, target(merging, wallX, 200)];
    merging.targets[0].id = merging.nextTargetId++;
    assert.equal(mergeEvents(merging).length, 1);
  }
});

test("collision consumers follow reflected legs instead of their false chord", () => {
  const state = playing();
  const hazard = target(state, 300, 200, "tiny", "platelet");
  hazard.previousPosition = point(100, 200);
  hazard.motionSegments = [
    { startTime: 0, endTime: 0.5, start: point(100, 200), end: point(200, 100) },
    { startTime: 0.5, endTime: 1, start: point(200, 100), end: point(300, 200) },
  ];
  assert.notEqual(projectileContact(shot(state, "aspirin", 200, 100), hazard), undefined);
  assert.equal(projectileContact(shot(state, "aspirin", 200, 200), hazard), undefined);
  assert.equal(sweptTargetPlayerContact(hazard, { position: point(200, 146) }), true);
  assert.equal(sweptTargetPlayerContact(hazard, { position: point(200, 246) }), false);
  for (const [x, y, expected] of [
    [150, 150, 1],
    [200, 200, 0],
  ]) {
    const merging = mergeState();
    merging.targets = [{ ...structuredClone(hazard), kind: "plaque" }, target(merging, x, y)];
    merging.targets[0].id = merging.nextTargetId++;
    assert.equal(mergeEvents(merging).length, expected);
  }
  hazard.previousPosition = point(100, 200);
  hazard.position = point(200, 200);
  hazard.motionSegments = [
    { startTime: 0, endTime: 1, start: point(100, 200), end: point(200, 200) },
  ];
  const expired = shot(state, "aspirin", 180, 200);
  assert.equal(projectileContact(expired, hazard, 0.2, 0.2), undefined);
  assert.notEqual(projectileContact(expired, hazard, 1, 1), undefined);
});

test("hazard erosion needs separation and elapsed cooldown, not persistent overlap", () => {
  const state = playing();
  wall(state);
  const hazard = target(state, 106, 340);
  state.targets = [hazard];
  function contact(at, entering) {
    state.elapsed = at;
    hazard.previousPosition = point(106, entering ? 340 : 380);
    hazard.position = point(106, entering ? 300 : 390);
    hazard.motionSegments = [
      { startTime: 0, endTime: 1, start: hazard.previousPosition, end: hazard.position },
    ];
    const tissue = freezeTissue(state);
    resolveTargetTissue(state, 0.1, tissue);
    return tissue.erosion.size;
  }
  assert.ok(contact(0, true) > 0);
  assert.equal(contact(1, true), 0);
  contact(1.01, false);
  assert.ok(contact(1.02, true) > 0);
  contact(1.03, false);
  assert.equal(contact(1.04, true), 0);
  contact(2, false);
  assert.ok(contact(2.01, true) > 0);
});

function pocketState() {
  const state = playing();
  wall(state);
  const definition = {
    id: "pocket",
    shellCells: [{ patchId: "wall", cellId: "c2" }],
    breachCells: [{ patchId: "wall", cellId: "c2" }],
    releasePosition: point(500, 200),
    contents: [-1, 1].map((direction) => ({
      kind: "platelet",
      size: "tiny",
      direction,
      position: point(500, 200),
    })),
  };
  state.level = { ...state.level, arena: { ...state.level.arena, pockets: [definition] } };
  state.arena.pockets = [
    { id: "pocket", status: "sealed", warningRemaining: 0, nextContentIndex: 0 },
  ];
  return state;
}

test("sealed pockets are optional; breaches warn once and committed releases wait safely for capacity", () => {
  const state = pocketState();
  assert.equal(clearObjectiveSatisfied(state), true);
  const sealed = structuredClone(state);
  stepSimulation(sealed, idle, FIXED_STEP);
  assert.equal(sealed.phase, "level_complete");
  state.projectiles = [shot(state)];
  const breach = stepSimulation(state, idle, 0.2);
  assert.equal(breach.filter((event) => event.type === "pocket_breached").length, 1);
  assert.equal(state.phase, "playing");
  assert.equal(hasPendingTargets(state), true);
  assert.equal(clearObjectiveSatisfied(state), false);
  assert.ok(state.arena.pockets[0].warningRemaining > 0);
  assert.equal(state.targets.length, 0, "breach tick cannot consume its warning");
  state.targets = Array.from({ length: MAX_TARGETS }, () => target(state, 800, 100));
  const full = stepSimulation(state, idle, 1);
  assert.equal(
    full.some((event) => event.type === "pocket_breached"),
    false,
  );
  assert.equal(state.arena.pendingInsertions.length, 2);
  state.targets = [];
  state.player.position = point(500, 220);
  advancePocketReleases(state, 1, []);
  assert.equal(state.arena.pendingInsertions.length, 2);
  state.player.position = point(100, 540);
  const released = stepSimulation(state, idle, FIXED_STEP);
  assert.equal(released.filter((event) => event.type === "pocket_released").length, 2);
  assert.equal(state.targets.length, 2);
  assert.ok(state.targets.every((entity) => entity.activeFromTick === state.tick + 1));
  assert.equal(hasPendingTargets(state), false);
  assert.equal(state.arena.pockets[0].status, "released");
  assert.equal(
    stepSimulation(state, idle, 1).some((e) => e.type === "pocket_released"),
    false,
  );
});

test("split descendants queue without loss, inherit cooldown and block completion", () => {
  const state = playing();
  const parent = target(state, 104, 200, "small");
  parent.mergeCooldownUntil = 99;
  state.targets = [
    parent,
    ...Array.from({ length: MAX_TARGETS - 1 }, () => target(state, 800, 100)),
  ];
  state.projectiles = [shot(state, "stent", 104, 200)];
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.targets.length, MAX_TARGETS);
  assert.equal(state.arena.pendingInsertions.length, 1);
  assert.equal(state.arena.pendingInsertions[0].target.mergeCooldownUntil, 99);
  state.targets = [];
  assert.equal(clearObjectiveSatisfied(state), false);
  stepSimulation(state, idle, FIXED_STEP);
  assert.equal(state.targets.length, 1);
  assert.equal(state.targets[0].mergeCooldownUntil, 99);
  assert.equal(state.targets[0].activeFromTick, state.tick + 1);
  assert.equal(state.arena.pendingInsertions.length, 0);
  assert.equal(state.phase, "playing");
});

test("first three stages keep their baseline arena; floor support and firing share the feet anchor", () => {
  for (const id of LEVEL_IDS.slice(0, 3)) {
    const state = createSimulation(getLevel(id), "practice");
    assert.equal(state.arena.tissue.length, 0);
    assert.equal(state.arena.pockets.length, 0);
    assert.ok(state.level.arena.floor.controlPoints.every((p) => p.y === 540));
  }
  const state = playing({
    arena: {
      tissue: [],
      pockets: [],
      floor: { controlPoints: [point(0, 540), point(480, 500), point(960, 540)] },
    },
  });
  state.targets = [target(state, 800, 100)];
  for (let index = 0; index < 40; index += 1) {
    state.fireCooldown = 0;
    state.projectiles = [];
    const events = stepSimulation(state, { ...idle, right: true, fire: true }, FIXED_STEP);
    assert.equal(
      state.player.position.y,
      playerSupportY(state.level.arena.floor, state.player.position.x),
    );
    assert.equal(
      events.find((event) => event.type === "shot").position.y,
      state.player.position.y - PLAYER_HEIGHT + 8,
    );
  }
});

test("authored cover clears the surgeon across slopes and allows a central lane to be carved", () => {
  for (const id of LEVEL_IDS) {
    const level = getLevel(id);
    const { floor, tissue } = level.arena;
    for (const patch of tissue.filter((entry) => entry.pocketId === undefined)) {
      for (const cell of patch.cells) {
        const left = cell.position.x - PLAYER_WIDTH / 2;
        const right = cell.position.x + 12 + PLAYER_WIDTH / 2;
        for (let x = left; x <= right; x += 1) {
          assert.ok(
            cell.position.y + 12 < playerSupportY(floor, x) - PLAYER_HEIGHT,
            `Level ${id}, cell ${cell.id}: surgeon must pass safely at x=${x}`,
          );
        }
      }
    }
    // Isolate cover access from encounter hazards while using the stage's actual tool,
    // firing cooldown, projectile travel and carving behavior.
    const state = playing({
      ...level,
      speedMultiplier: 0,
      initialTargets: [],
      objective: { kind: "clear", reinforcements: [] },
    });
    const top = Math.min(
      300,
      ...tissue.flatMap((patch) => patch.cells.map((cell) => cell.position.y)),
    );
    const kind = level.weapon === "stent" ? "plaque" : "platelet";
    state.targets = [target(state, ARENA_WIDTH / 2, top - 24, "tiny", kind)];
    const shotCycle = Math.max(
      ...Object.values(WEAPON_CONFIGS).map((weapon) => weapon.interval + weapon.lifetime),
    );
    const timeout =
      (tissue.reduce((count, patch) => count + patch.cells.length, 0) +
        (level.flowSwitches?.length ?? 0) +
        2) *
      shotCycle;
    let reached = false;
    for (let elapsed = 0; elapsed < timeout && !reached; elapsed += FIXED_STEP) {
      const events = stepSimulation(state, { ...idle, fire: true }, FIXED_STEP);
      reached = events.some((event) => event.type === "target_hit");
      assert.equal(state.player.lives, 3, `Level ${id}: carving must be safe from cover`);
      assert.ok(state.player.position.x >= PLAYER_WIDTH / 2);
      assert.ok(state.player.position.x <= ARENA_WIDTH - PLAYER_WIDTH / 2);
    }
    assert.ok(reached, `Level ${id}: legal center shots must open access above cover`);
  }
});

function mergeState(probability = 1, budget = 2) {
  const state = playing({ merge: { probability, budget, cooldown: 1.5 } });
  state.tick = 10;
  state.elapsed = 10;
  return state;
}

function mergeEvents(state) {
  const events = [];
  resolveCoalescence(state, events);
  return events;
}

function mass(state) {
  return state.targets.reduce(
    (total, entity) => total + { tiny: 1, small: 2, medium: 4, large: 8 }[entity.size],
    0,
  );
}

test("integrated merging is deterministic, conserves mass, spends finite budget and defers newborns", () => {
  function run(reverse) {
    const state = mergeState(1, 1);
    state.targets = [200, 600].flatMap((x) => {
      const left = target(state, x, 200);
      const right = target(state, x + left.radius * 2 + 1, 200);
      left.velocity.x = 120;
      right.velocity.x = -120;
      return [left, right];
    });
    const parents = state.targets.slice(0, 2).map((entity) => entity.id);
    const before = mass(state);
    if (reverse) state.targets.reverse();
    const events = stepSimulation(state, idle, FIXED_STEP);
    const merges = events.filter((event) => event.type === "targets_merged");
    assert.equal(merges.length, 1);
    assert.deepEqual(merges[0].parentIds, parents);
    assert.equal(mass(state), before);
    assert.equal(state.merge.remainingBudget, 0);
    const newborn = state.targets.find((entity) => entity.id === merges[0].targetId);
    assert.equal(newborn.activeFromTick, state.tick + 1);
    assert.ok(newborn.mergeCooldownUntil > state.elapsed);
    const seed = state.seed;
    assert.equal(mergeEvents(state).length, 0);
    assert.equal(state.seed, seed);
    return { events, seed, targets: state.targets.sort((a, b) => a.id - b.id) };
  }
  assert.deepEqual(run(false), run(true));
  for (const size of ["tiny", "small", "medium"]) {
    const state = mergeState();
    state.targets = [target(state, 400, 200, size), target(state, 420, 200, size)];
    state.targets[1].previousPosition = point(400 + state.targets[0].radius * 2 + 20, 200);
    const before = mass(state);
    assert.equal(mergeEvents(state).length, 1);
    assert.equal(mass(state), before);
    assert.equal(state.merge.contacts.size, 0, "removed parent contacts are pruned");
    assert.equal(state.merge.lastAttemptTicks.size, 0);
  }
});

test("ineligible or newborn pairs and disabled merging consume no random draws", () => {
  for (const [sizeA, sizeB, kindA, kindB, newborn] of [
    ["large", "large", "plaque", "plaque", false],
    ["small", "tiny", "plaque", "plaque", false],
    ["tiny", "tiny", "platelet", "platelet", false],
    ["tiny", "tiny", "plaque", "platelet", false],
    ["tiny", "tiny", "plaque", "plaque", true],
  ]) {
    const state = mergeState();
    state.targets = [target(state, 400, 200, sizeA, kindA), target(state, 420, 200, sizeB, kindB)];
    if (newborn) state.targets[0].activeFromTick = state.tick + 1;
    const seed = state.seed;
    assert.deepEqual(mergeEvents(state), []);
    assert.equal(state.seed, seed);
  }
  const disabled = mergeState(0);
  disabled.targets = [target(disabled, 400), target(disabled, 420)];
  const seed = disabled.seed;
  assert.deepEqual(mergeEvents(disabled), []);
  assert.equal(disabled.seed, seed);
});

test("failed merge attempts latch persistent overlap and require separated, cooled reentry", () => {
  const state = mergeState(Number.MIN_VALUE);
  const left = target(state, 400, 200);
  const right = target(state, 420, 200);
  right.previousPosition = point(500, 200);
  state.targets = [left, right];
  mergeEvents(state);
  const seed = state.seed;
  const deadline = left.mergeCooldownUntil;
  assert.ok(deadline > state.elapsed);
  state.tick += 1;
  state.elapsed = deadline + 1;
  right.previousPosition = { ...right.position };
  mergeEvents(state);
  assert.equal(state.seed, seed, "overlap never rerolls even after cooldown");
  function place(x) {
    right.previousPosition = { ...right.position };
    right.position = point(x, 200);
    right.motionSegments = [];
    mergeEvents(state);
  }
  place(500);
  state.elapsed = deadline - 0.1;
  place(420);
  assert.equal(state.seed, seed, "separation cannot bypass cooldown");
  place(500);
  state.elapsed = deadline + 1;
  place(420);
  assert.notEqual(state.seed, seed);
});

test("only approaching boundary entries merge, including exact tick-start contact", () => {
  for (const scenario of ["approaching", "separating", "tangent", "penetrating", "held"]) {
    const state = mergeState();
    const left = target(state, 400, 200);
    const right = target(state, 432, 200);
    if (scenario === "penetrating") right.position.x = 420;
    right.previousPosition = { ...right.position };
    right.position = point(
      right.position.x + (scenario === "separating" ? 10 : scenario === "tangent" ? 0 : -10),
      200 + (scenario === "tangent" ? 10 : 0),
    );
    if (scenario === "held")
      left.behavior = { kind: "sticky", pauseRemaining: 1, resumeVelocityX: 104 };
    state.targets = [left, right];
    const seed = state.seed;
    assert.equal(mergeEvents(state).length, Number(scenario === "approaching"), scenario);
    assert.equal(state.seed === seed, scenario !== "approaching", scenario);
  }
});

test("exact tick-end contact uses the terminal leg velocity", () => {
  const state = mergeState();
  const left = target(state, 400, 200);
  const right = target(state, 432, 200);
  // The first leg points away from the contact normal; the terminal leg reaches
  // the boundary while approaching at exactly t=1.
  right.previousPosition = point(420, 190);
  right.position = point(432, 200);
  right.motionSegments = [
    { startTime: 0, endTime: 0.5, start: point(420, 190), end: point(440, 190) },
    { startTime: 0.5, endTime: 1, start: point(440, 190), end: point(432, 200) },
  ];
  state.targets = [left, right];
  assert.equal(mergeEvents(state).length, 1);
});

test("pause freezes all new runtime state; retry and campaign advancement recreate it", () => {
  const state = pocketState();
  state.mode = "campaign";
  state.targets = [target(state, 400, 200), target(state, 420, 200)];
  state.arena.tissue[0].cells[0].occupied = false;
  state.arena.pockets[0].status = "pending";
  state.arena.pockets[0].warningRemaining = 0.4;
  state.arena.pendingInsertions = [{ kind: "split", sourceId: 99, target: target(state) }];
  state.arena.tissueContacts = [
    { targetId: state.targets[0].id, patchId: "wall", touching: true, lastErosionAt: 3 },
  ];
  state.merge.contacts.add("1:2");
  state.merge.lastAttemptTicks.set("1:2", 10);
  state.merge.remainingBudget = 0;
  assert.equal(pauseSimulation(state), true);
  const frozen = structuredClone(state);
  assert.deepEqual(stepSimulation(state, { ...idle, fire: true, right: true }, 2), []);
  assert.deepEqual(state, frozen);
  function assertFresh(fresh) {
    assert.equal(fresh.tick, 0);
    assert.equal(fresh.arena.pendingInsertions.length, 0);
    assert.equal(fresh.arena.tissueContacts.length, 0);
    assert.ok(fresh.arena.tissue.every((patch) => patch.cells.every((cell) => cell.occupied)));
    assert.ok(fresh.arena.pockets.every((pocket) => pocket.status === "sealed"));
    assert.equal(fresh.merge.contacts.size, 0);
    assert.equal(fresh.merge.lastAttemptTicks.size, 0);
    assert.equal(fresh.merge.remainingBudget, fresh.level.merge.budget);
  }
  assertFresh(createSimulation(state.level, "campaign"));
  const authored = createSimulation(getLevel(LEVEL_IDS[3]), "campaign");
  const firstCell = authored.arena.tissue[0].cells[0];
  firstCell.occupied = false;
  const retry = createSimulation(authored.level, "campaign");
  assert.equal(retry.arena.tissue[0].cells[0].occupied, true);
  assert.notEqual(retry.arena.tissue[0].cells[0], firstCell);
  assertFresh(retry);
  state.phase = "level_complete";
  assertFresh(advanceLevel(state));
});
