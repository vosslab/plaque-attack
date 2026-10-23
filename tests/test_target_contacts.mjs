import assert from "node:assert/strict";
import test from "node:test";
import { createTarget } from "../src/characters.ts";
import {
  projectileContact,
  sweptTargetPlayerContact,
  targetPairContact,
} from "../src/collision.ts";
import { ARENA_HEIGHT, FIXED_STEP, getLevel } from "../src/constants.ts";
import { createSimulation } from "../src/game_state.ts";
import { advanceTarget, synchronizeTargetMotion } from "../src/motion.ts";
import { FLUID_RESTORING_ACCELERATION } from "../src/impulse_motion.ts";
import { targetVerticalBounds } from "../src/arena_geometry.ts";
import { resolveTargetContacts } from "../src/target_contacts.ts";
import { freezeTissue, targetOverlapsTissue } from "../src/tissue.ts";
import { beginProjectileContacts } from "../src/weapons.ts";

function scene(merge = { probability: 0, budget: 0, cooldown: 0 }) {
  const base = getLevel(1);
  const state = createSimulation(
    {
      ...base,
      initialTargets: [],
      speedMultiplier: 0,
      merge,
      arena: { ...base.arena, tissue: [], pockets: [] },
    },
    "practice",
  );
  state.phase = "playing";
  state.tick = 1;
  return state;
}

function body(state, x, y = 240, size = "tiny", kind = "plaque", vx = 0, vy = 0) {
  const target = createTarget(
    { kind, size, direction: 1, position: { x, y } },
    state.nextTargetId++,
    0,
    0,
    state.level.arena.floor,
  );
  synchronizeTargetMotion(target, state.level.arena.floor, { x: vx, y: vy }, true);
  state.targets.push(target);
  return target;
}

function move(state, dt = FIXED_STEP) {
  for (const target of state.targets) advanceTarget(target, dt, state.level.arena.floor);
  const events = [];
  resolveTargetContacts(state, events, dt);
  return events;
}

function fluidEnergy(target) {
  return (
    (target.velocity.x ** 2 + target.velocity.y ** 2) / 2 +
    FLUID_RESTORING_ACCELERATION * Math.abs(target.position.y - ARENA_HEIGHT / 2)
  );
}

test("tiny, mixed-size, platelet and mixed-kind bodies bounce without a merge budget", () => {
  for (const [sizeA, sizeB, kindA, kindB] of [
    ["tiny", "tiny", "plaque", "plaque"],
    ["tiny", "large", "plaque", "plaque"],
    ["tiny", "tiny", "platelet", "platelet"],
    ["small", "tiny", "plaque", "platelet"],
  ]) {
    const state = scene();
    const a = body(state, 300, 240, sizeA, kindA, 120);
    const b = body(state, 500, 240, sizeB, kindB, -120);
    // Set the gap from the actual authored radii rather than tuning preset values.
    b.position.x = 300 + a.radius + b.radius + 2;
    b.previousPosition = { ...b.position };
    const momentum = a.radius ** 2 * a.velocity.x + b.radius ** 2 * b.velocity.x;
    assert.deepEqual(move(state), []);
    assert.ok(a.velocity.x < b.velocity.x, `${kindA}/${kindB} ${sizeA}/${sizeB} separate`);
    assert.ok(
      Math.abs(a.radius ** 2 * a.velocity.x + b.radius ** 2 * b.velocity.x - momentum) < 1e-6,
    );
    assert.equal(state.targets.length, 2);
    const reflected = a.velocity.x;
    advanceTarget(a, FIXED_STEP, state.level.arena.floor);
    assert.equal(a.velocity.x, reflected, "the next motion step retains the impulse");
  }
});

test("high-speed sweeps bounce instead of tunneling and remain deterministic under reversed insertion", () => {
  function run(reverse) {
    const state = scene();
    const a = body(state, 200, 240, "tiny", "plaque", 24000);
    const b = body(state, 600, 240, "tiny", "plaque", -24000);
    if (reverse) state.targets.reverse();
    move(state);
    assert.ok(a.position.x < b.position.x);
    assert.ok(a.velocity.x < 0 && b.velocity.x > 0);
    return state.targets.sort((left, right) => left.id - right.id);
  }
  assert.deepEqual(run(false), run(true));
});

test("oblique impact on a sloped floor preserves the deflection on the next tick", () => {
  const state = scene();
  state.level.arena.floor = {
    controlPoints: [
      { x: 0, y: 540 },
      { x: 960, y: 450 },
    ],
  };
  const a = body(state, 300, 240, "tiny", "plaque", 200, 0);
  const b = body(state, 340, 255, "tiny", "plaque", -200, 0);
  move(state, 0.04);
  assert.ok(a.velocity.y < -1 && b.velocity.y > 1);
  const incoming = { ...a.velocity };
  const previous = { ...a.position };
  advanceTarget(a, 1e-5, state.level.arena.floor);
  assert.ok(Math.abs((a.position.y - previous.y) / 1e-5 - incoming.y) < 0.05);
  assert.ok(Number.isFinite(a.position.x + a.position.y + a.fluidAngularSpeed));
});

test("an impulse near an orbit turn retains finite energy through repeated wall reflections", () => {
  for (const kind of ["plaque", "platelet"]) {
    const state = scene();
    const target = body(state, 300, 240, "tiny", kind, 73, 120);
    const [top] = targetVerticalBounds(state.level.arena.floor, 300, target.radius);
    target.position.y = top + 0.00001;
    synchronizeTargetMotion(target, state.level.arena.floor, { x: 73, y: 120 }, true);
    const energy = fluidEnergy(target);
    for (let tick = 0; tick < 2400; tick++) {
      advanceTarget(target, FIXED_STEP, state.level.arena.floor);
      assert.ok(Math.abs(fluidEnergy(target) - energy) < 1e-3);
      assert.ok(target.motionSegments.length <= 4, "ordinary motion has bounded sweep work");
      const [ceiling, floor] = targetVerticalBounds(
        state.level.arena.floor,
        target.position.x,
        target.radius,
      );
      assert.ok(target.position.y >= ceiling - 1e-7 && target.position.y <= floor + 1e-7);
    }
  }
});

test("near-horizontal redirected fluid bodies leave ceiling and floor bands within seconds", () => {
  for (const kind of ["plaque", "platelet"]) {
    for (const edge of ["ceiling", "floor"]) {
      const state = scene();
      const target = body(state, 300, 240, "tiny", kind, 73);
      const [top, bottom] = targetVerticalBounds(state.level.arena.floor, 300, target.radius);
      target.position.y = edge === "ceiling" ? top + 10.9 : bottom - 10.9;
      target.velocity.y = edge === "ceiling" ? -4.29 : 4.29;
      let enteredMiddle = false;
      for (let elapsed = 0; elapsed < 3; elapsed += FIXED_STEP) {
        advanceTarget(target, FIXED_STEP, state.level.arena.floor);
        if (target.position.y >= ARENA_HEIGHT / 3 && target.position.y <= (2 * ARENA_HEIGHT) / 3) {
          enteredMiddle = true;
          break;
        }
      }
      assert.ok(enteredMiddle, `${kind} must naturally leave the ${edge} band`);
      assert.equal(target.velocity.x, 73, "vertical float does not override lateral steering");
    }
  }
});

test("sub-resolution midpoint oscillations settle with bounded work and no energy gain", () => {
  for (const kind of ["plaque", "platelet"]) {
    const state = scene();
    const target = body(state, 300, ARENA_HEIGHT / 2 + 1e-9, "tiny", kind, 73, 1e-6);
    const energy = fluidEnergy(target);
    advanceTarget(target, FIXED_STEP, state.level.arena.floor);
    assert.ok(target.motionSegments.length <= 4, "tiny oscillations cannot create unbounded legs");
    assert.equal(target.velocity.x, 73);
    assert.ok(fluidEnergy(target) <= energy);
    assert.ok(Number.isFinite(target.position.x + target.position.y + target.velocity.y));
    assert.ok(Math.abs(target.position.y - ARENA_HEIGHT / 2) < 1e-8);
  }
});

test("physical drift reflects from a curved floor without gaining energy or crossing its boundary", () => {
  const state = scene();
  const floor = {
    controlPoints: [
      { x: 0, y: 520 },
      { x: 250, y: 440 },
      { x: 650, y: 550 },
      { x: 960, y: 470 },
    ],
  };
  state.level.arena.floor = floor;
  const target = body(state, 300, 240, "tiny", "plaque", 260, 170);
  const energy = fluidEnergy(target);
  let floorReflections = 0;
  for (let tick = 0; tick < 2400; tick++) {
    const incoming = { ...target.velocity };
    advanceTarget(target, FIXED_STEP, floor);
    if (incoming.x !== target.velocity.x && incoming.y !== target.velocity.y) floorReflections++;
    assert.ok(Math.abs(fluidEnergy(target) - energy) < 1e-3);
    const [ceiling, bottom] = targetVerticalBounds(floor, target.position.x, target.radius);
    assert.ok(target.position.y >= ceiling - 1e-7 && target.position.y <= bottom + 1e-7);
    assert.ok(target.motionSegments.length <= 4);
  }
  assert.ok(floorReflections > 1, "the trajectory exercises repeated curved-floor normals");
});

test("physical drift catches a floor rise even when both sweep endpoints are clear", () => {
  const state = scene();
  const floor = {
    controlPoints: [
      { x: 0, y: 500 },
      { x: 300, y: 500 },
      { x: 301, y: 200 },
      { x: 302, y: 500 },
      { x: 960, y: 500 },
    ],
  };
  state.level.arena.floor = floor;
  const target = body(state, 299, 300, "tiny", "plaque", 600, 0);
  const energy = fluidEnergy(target);
  advanceTarget(target, 1 / 120, floor);
  assert.ok(target.velocity.x < 0, "the interior rise reflects the body before its far endpoint");
  assert.ok(Math.abs(fluidEnergy(target) - energy) < 1e-3);
});

test("a sticky impulse holds the whole body and restores both velocity components", () => {
  const state = scene();
  const target = body(state, 900, 240, "tiny", "plaque", 200, 80);
  target.behavior = { kind: "sticky", pauseRemaining: 0, resumeVelocityX: 200 };
  advanceTarget(target, 0.3, state.level.arena.floor);
  assert.deepEqual(target.velocity, { x: 0, y: 0 });
  const heldAt = { ...target.position };
  advanceTarget(target, 0.1, state.level.arena.floor);
  assert.deepEqual(target.position, heldAt);
  const resumedEnergy =
    (target.behavior.resumeVelocityX ** 2 + target.behavior.resumeVelocityY ** 2) / 2 +
    FLUID_RESTORING_ACCELERATION * Math.abs(heldAt.y - ARENA_HEIGHT / 2);
  advanceTarget(target, 0.7, state.level.arena.floor);
  assert.equal(target.velocity.x, -200);
  assert.ok(target.velocity.y > 0);
  assert.ok(Math.abs(fluidEnergy(target) - resumedEnergy) < 1e-6);
  assert.ok(target.position.x < heldAt.x && target.position.y > heldAt.y);
});

test("overlapping newborns separate without merging and later natural contact becomes eligible", () => {
  const state = scene({ probability: 1, budget: 1, cooldown: 0 });
  const a = body(state, 300, 240, "tiny", "plaque", -100);
  const b = body(state, 300, 240, "tiny", "plaque", 100);
  a.activeFromTick = b.activeFromTick = state.tick + 1;
  const seed = state.seed;
  assert.deepEqual(move(state), []);
  state.tick++;
  assert.deepEqual(move(state, 0.2), []);
  assert.equal(state.seed, seed);
  assert.ok(b.position.x - a.position.x > a.radius + b.radius);
  a.velocity.x = 100;
  b.velocity.x = -100;
  const events = move(state, 0.1);
  assert.equal(events.filter((event) => event.type === "targets_merged").length, 1);
  assert.equal(state.targets.length, 1);
  assert.equal(state.targets[0].activeFromTick, state.tick + 1);
});

test("a shot at time 0.1 removes its parent before a proposed time 0.8 merge", () => {
  const state = scene({ probability: 1, budget: 1, cooldown: 0 });
  // At the restoring midpoint these zero-vertical-speed fixtures stay linear.
  const y = ARENA_HEIGHT / 2;
  const a = body(state, 300, y);
  const b = body(state, 348, y, "tiny", "plaque", -200);
  const shot = {
    id: 1,
    kind: "stent",
    position: { x: 300, y: y + 25 },
    previousPosition: { x: 300, y: y + 25 },
    origin: { x: 300, y: y + 25 },
    age: 0,
    ceilingTime: 0,
  };
  state.projectiles = [shot];
  for (const target of state.targets) advanceTarget(target, 0.1, state.level.arena.floor);
  const events = [],
    tissue = freezeTissue(state);
  const session = beginProjectileContacts(state, 0.1, events, tissue);
  assert.ok(Math.abs(session.next(0).time - 0.1) < 1e-9);
  resolveTargetContacts(state, events, 0.1, tissue, session);
  assert.equal(events.filter((event) => event.type === "target_hit").length, 1);
  assert.equal(
    events.some((event) => event.type === "targets_merged"),
    false,
  );
  assert.deepEqual(
    state.targets.map((target) => target.id),
    [b.id],
  );
  assert.ok(!state.targets.includes(a));
});

test("a mathematically simultaneous shot wins a pair merge despite rounded contact roots", () => {
  const state = scene({ probability: 1, budget: 1, cooldown: 0 });
  const y = ARENA_HEIGHT / 2;
  const a = body(state, 300, y);
  const b = body(state, 334, y, "tiny", "plaque", -200);
  state.projectiles = [
    {
      id: 1,
      kind: "stent",
      position: { x: 300, y: y + 25 },
      previousPosition: { x: 300, y: y + 25 },
      origin: { x: 300, y: y + 25 },
      age: 0,
      ceilingTime: 0,
    },
  ];
  for (const target of state.targets) advanceTarget(target, 0.1, state.level.arena.floor);
  const events = [],
    tissue = freezeTissue(state);
  const session = beginProjectileContacts(state, 0.1, events, tissue);
  // Both geometries first touch at normalized tick time 0.1. Their independent
  // roots round differently, so raw ordering incorrectly lets the merge win.
  const pairTime = targetPairContact(a, b),
    shotTime = session.next(0).time;
  assert.ok(Math.abs(pairTime - 0.1) < 1e-12);
  assert.ok(Math.abs(shotTime - 0.1) < 1e-12);
  resolveTargetContacts(state, events, 0.1, tissue, session);
  assert.equal(events.filter((event) => event.type === "target_hit").length, 1);
  assert.equal(
    events.some((event) => event.type === "targets_merged"),
    false,
  );
  assert.deepEqual(
    state.targets.map((target) => target.id),
    [b.id],
  );
});

test("projectile and player consumers discard the straight path after a pair bounce", () => {
  const state = scene();
  const a = body(state, 300, 275, "tiny", "plaque", 600);
  const b = body(state, 360, 275, "tiny", "plaque", -600);
  state.player.position = { x: 400, y: 300 };
  for (const target of state.targets) advanceTarget(target, 0.2, state.level.arena.floor);
  assert.ok(sweptTargetPlayerContact(a, state.player));
  const shot = {
    id: 1,
    kind: "stent",
    previousPosition: { x: 400, y: 330 },
    position: { x: 400, y: 150 },
    origin: { x: 400, y: 330 },
    age: 0,
    ceilingTime: 0,
  };
  assert.notEqual(projectileContact(shot, a), undefined);
  state.projectiles = [{ ...shot, position: { ...shot.previousPosition } }];
  const events = [],
    tissue = freezeTissue(state);
  resolveTargetContacts(
    state,
    events,
    0.2,
    tissue,
    beginProjectileContacts(state, 0.2, events, tissue),
  );
  assert.deepEqual(
    events.filter((event) => event.type === "target_hit").map((event) => event.targetId),
    [b.id],
  );
  assert.ok(state.targets.includes(a), "the redirected body survives its discarded shot path");
  assert.equal(sweptTargetPlayerContact(a, state.player), false);
  assert.equal(projectileContact(shot, a), undefined);
  assert.equal(a.motionSegments.at(-1).end.x, a.position.x);
});

test("a pair bounce followed by tissue uses the regenerated path and stays outside solids", () => {
  const state = scene();
  const a = body(state, 300, 275, "tiny", "plaque", 200);
  body(state, 350, 275, "tiny", "plaque", -200);
  state.arena.tissue = [
    {
      id: "wall",
      pocketId: undefined,
      cells: [{ id: "cell", position: { x: 270, y: 269 }, occupied: true }],
    },
  ];
  move(state, 0.2);
  assert.ok(a.velocity.x > 0, "body reflects from the tissue after its pair bounce");
  assert.ok(state.arena.tissueContacts.some((latch) => latch.targetId === a.id));
  assert.equal(targetOverlapsTissue(state, a.position, a.radius), false);
  assert.ok(a.motionSegments.every((leg) => Number.isFinite(leg.start.x + leg.end.y)));
});

test("a rapid tissue corridor spends a bounded tick at the last accepted free position", () => {
  const state = scene();
  const target = body(state, 306, 275, "tiny", "plaque", 10000);
  state.arena.tissue = [
    {
      id: "corridor",
      pocketId: undefined,
      cells: [270, 330].map((x, index) => ({
        id: `cell${index}`,
        position: { x, y: 269 },
        occupied: true,
      })),
    },
  ];
  move(state, 0.1);
  const last = target.motionSegments.at(-1);
  assert.deepEqual(last.start, last.end);
  assert.equal(last.endTime, 1);
  assert.ok(last.startTime < 1, "collision work is bounded rather than replaying every ricochet");
  assert.ok(Math.abs(target.velocity.x) > 0, "the accepted velocity resumes on the next tick");
  assert.equal(targetOverlapsTissue(state, target.position, target.radius), false);
  const stoppedAt = { ...target.position };
  advanceTarget(target, FIXED_STEP, state.level.arena.floor);
  assert.notDeepEqual(
    target.position,
    stoppedAt,
    "the per-tick limit does not freeze a body forever",
  );
});
