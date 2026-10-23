import assert from "node:assert/strict";
import test from "node:test";
import { getLevel } from "../src/constants.ts";
import { createSimulation } from "../src/game_state.ts";

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
