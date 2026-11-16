import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, projectileId, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import { FIXED_STEP, getLevel, TARGET_PRESETS } from "../src/constants.ts";
import { createSimulation, pauseSimulation, resumeSimulation } from "../src/game_state.ts";
import { hitMultiplier, streakMilestone } from "../src/scoring.ts";
import { stepSimulation } from "../src/simulation.ts";

const idle = { left: false, right: false, fire: false };

function collision(state, x = 100, y = 200) {
  const position = { x: logicalCoordinate(x), y: logicalCoordinate(y) };
  const target = createTarget(
    { kind: "platelet", size: "tiny", position, direction: 1 },
    targetId(state.nextTargetId++),
    0,
  );
  target.velocity = { x: 0, y: 0 };
  state.targets = [target];
  state.projectiles = [
    {
      id: projectileId(state.nextProjectileId++),
      kind: "aspirin",
      position: { ...position },
      previousPosition: { ...position },
      origin: { ...position },
      age: 0,
      hitTargetIds: [],
    },
  ];
  return stepSimulation(state, idle, FIXED_STEP).find((event) => event.type === "target_hit");
}

test("hit events carry their own awarded streak and points; misses and pause preserve it, damage and new attempts reset", () => {
  const state = createSimulation(getLevel(10), "practice");
  state.phase = "playing";
  state.waves.nextSpawnAt = Infinity;
  const milestones = [];
  let firstHit;
  for (let count = 1; count <= 11; count += 1) {
    const before = state.score;
    const hit = collision(state);
    assert.ok(hit);
    firstHit ??= hit;
    assert.equal(hit.streak, count);
    assert.equal(hit.points, TARGET_PRESETS.tiny.points * hitMultiplier(count));
    assert.equal(state.score - before, hit.points);
    if (streakMilestone(hit.streak) !== undefined) milestones.push(hit.streak);
    assert.equal(pauseSimulation(state), true);
    assert.deepEqual(stepSimulation(state, { ...idle, fire: true }, FIXED_STEP), []);
    assert.equal(state.streak, count);
    assert.equal(resumeSimulation(state), true);
    stepSimulation(state, { ...idle, fire: true }, FIXED_STEP);
    assert.equal(state.streak, count, "a shot with no target hit keeps the hit streak");
  }
  assert.deepEqual(milestones, [5, 10], "later hits do not repeat the milestone reward");
  assert.equal(firstHit.streak, 1, "previous events remain immutable snapshots of their hits");
  // Contact with a real remaining hazard goes through the normal damage owner.
  collision(state, state.player.position.x, state.player.position.y - 15);
  state.projectiles = [];
  const hazard = createTarget(
    {
      kind: "platelet",
      size: "tiny",
      position: { ...state.player.position },
      direction: 1,
    },
    targetId(state.nextTargetId++),
    0,
  );
  hazard.velocity = { x: 0, y: 0 };
  state.targets = [hazard];
  const damage = stepSimulation(state, idle, FIXED_STEP).find((event) => event.type === "damage");
  assert.ok(damage);
  assert.equal(state.streak, 0);
  const nextHit = collision(state);
  assert.equal(nextHit.streak, 1);
  assert.equal(nextHit.points, TARGET_PRESETS.tiny.points);
  assert.equal(createSimulation(state.level, state.mode).streak, 0);
});
