import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate } from "../src/brands.ts";
import { FIXED_STEP, getLevel, LEVEL_IDS } from "../src/constants.ts";
import { createSimulation } from "../src/game_state.ts";
import { stepSimulation } from "../src/simulation.ts";

// Finale data must have a single source for its finite target groups. This catches
// accidental maintenance/legacy-spawn regressions without fixing tunable counts.
test("all four campaign finales initialize from phases and select their restoration", () => {
  for (const [id, restoration] of [
    [5, "artery_opening"],
    [20, "restored_flow"],
    [10, "restored_lining"],
    [15, "patient_recovery"],
  ]) {
    const level = getLevel(id);
    assert.equal(level.objective.kind, "clear");
    assert.equal(level.objective.restoration, restoration);
    assert.deepEqual(level.initialTargets, []);
    assert.deepEqual(level.objective.reinforcements, []);
    assert.ok(level.objective.phases.length > 1);
    assert.ok(level.objective.phases.every((phase) => phase.name && phase.targets.length));
    const state = createSimulation(level, "campaign");
    assert.equal(state.remix.finale.phaseIndex, 0);
    assert.equal(state.targets.length, level.objective.phases[0].targets.length);
  }
});

test("the opening introduces early weapons against compatible target kinds", () => {
  const opening = LEVEL_IDS.slice(0, 3).map((id) => getLevel(id));
  assert.deepEqual(
    opening.map((level) => [level.id, level.weapon, level.act]),
    [
      [1, "stent", 1],
      [16, "aspirin", 2],
      [2, "clopidogrel", 2],
    ],
  );
  assert.ok(opening[0].initialTargets.every((target) => target.kind === "plaque"));
  assert.ok(
    opening
      .slice(1)
      .every((level) => level.initialTargets.every((target) => target.kind === "platelet")),
  );

  const controlledProjectileProbe = (id, position) => {
    const state = createSimulation(getLevel(id), "campaign");
    const events = [];
    state.phase = "playing";
    // This probe moves the player directly and uses extra lives to isolate the
    // projectile and collision behavior. It is not a player-control or clearability test.
    state.player.lives = 99;
    for (let tick = 0; tick < 1500; tick += 1) {
      state.player.position.x =
        id === 16 && state.targets[0] !== undefined ? state.targets[0].position.x : position;
      events.push(...stepSimulation(state, { left: false, right: false, fire: true }, FIXED_STEP));
    }
    return events;
  };

  const aspirinEvents = controlledProjectileProbe(16, logicalCoordinate(480));
  const clopidogrelEvents = controlledProjectileProbe(2, logicalCoordinate(516));
  for (const [events, weapon] of [
    [aspirinEvents, "aspirin"],
    [clopidogrelEvents, "clopidogrel"],
  ]) {
    assert.ok(events.some((event) => event.type === "shot" && event.kind === weapon));
    assert.ok(
      events
        .filter((event) => event.type === "target_hit")
        .every((event) => event.targetKind === "platelet"),
      `${weapon} encounters only compatible platelet hazards`,
    );
  }
  const firstPersistentShot = clopidogrelEvents.find(
    (event) => event.type === "shot" && event.kind === "clopidogrel",
  );
  assert.ok(firstPersistentShot);
  assert.equal(
    clopidogrelEvents.filter(
      (event) =>
        event.type === "target_hit" && event.projectileId === firstPersistentShot.projectileId,
    ).length,
    3,
    "the early column demonstrates one persistent shot reaching three platelet hazards",
  );
});
