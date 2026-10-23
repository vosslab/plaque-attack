import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate } from "../src/brands.ts";
import { getLevel } from "../src/constants.ts";
import { createSimulation, retryLevel } from "../src/game_state.ts";
import {
  activateFlow,
  advanceFlow,
  getEffectiveCurrent,
  getRestoredCurrent,
  steerCurrent,
} from "../src/remix_mechanics.ts";
import { advanceFinale } from "../src/waves.ts";

function encounter() {
  const spawn = {
    kind: "platelet",
    size: "tiny",
    position: { x: logicalCoordinate(480), y: logicalCoordinate(200) },
    direction: 1,
  };
  const state = createSimulation(
    {
      ...getLevel(5),
      initialTargets: [],
      objective: {
        kind: "clear",
        reinforcements: [],
        phases: [
          { name: "Opening", targets: [spawn] },
          { name: "Following wave", targets: [spawn] },
        ],
      },
      flowSwitches: [
        { id: "restored", position: spawn.position, laneX: logicalCoordinate(300) },
        { id: "diversion", position: spawn.position, laneX: logicalCoordinate(700) },
      ],
      restoredCurrent: { afterPhase: 1, switchId: "restored" },
    },
    "campaign",
  );
  state.phase = "playing";
  return state;
}

function clearOpening(state) {
  state.targets = [];
  state.arena.pockets = [];
  advanceFinale(state, 1, []);
}

test("clearing the opening earns current during transition and steers the following wave", () => {
  const state = encounter();
  assert.equal(getRestoredCurrent(state), undefined);
  assert.equal(getEffectiveCurrent(state), undefined);
  const target = state.targets[0];
  target.velocity.x = 0;
  steerCurrent(state, 0.1);
  assert.equal(target.velocity.x, 0, "uncleared opening has no baseline force");
  clearOpening(state);
  assert.equal(state.remix.finale.phaseIndex, 0);
  assert.ok(state.remix.finale.transitionRemaining > 0);
  assert.equal(getRestoredCurrent(state), state.level.flowSwitches[0]);
  advanceFinale(state, state.remix.finale.transitionRemaining, []);
  assert.equal(state.remix.finale.phaseIndex, 1);
  assert.equal(getEffectiveCurrent(state), state.level.flowSwitches[0]);
  state.targets[0].velocity.x = 0;
  steerCurrent(state, 0.1);
  assert.ok(state.targets[0].velocity.x < 0, "earned lane gathers the new wave leftward");
});

test("manual diversion overrides earned current then resumes baseline throughout cooldown", () => {
  const state = encounter();
  clearOpening(state);
  advanceFinale(state, state.remix.finale.transitionRemaining, []);
  const target = state.targets[0];
  target.velocity.x = 0;
  activateFlow(state, state.level.flowSwitches[1], []);
  assert.equal(getEffectiveCurrent(state), state.level.flowSwitches[1]);
  steerCurrent(state, 0.1);
  assert.ok(target.velocity.x > 0, "manual diversion steers toward the other lane");
  const divertedVelocity = target.velocity.x;
  advanceFlow(state, 3.9);
  assert.equal(state.remix.flow.kind, "active");
  advanceFlow(state, 0.1);
  assert.equal(state.remix.flow.kind, "cooldown");
  assert.equal(state.remix.flow.remaining, 6);
  assert.equal(target.velocity.x, divertedVelocity, "expiry preserves gradual current steering");
  assert.equal(getEffectiveCurrent(state), state.level.flowSwitches[0]);
  steerCurrent(state, 0.1);
  assert.ok(target.velocity.x < divertedVelocity, "baseline turns the target back gradually");
  advanceFlow(state, 5.9);
  assert.equal(state.remix.flow.kind, "cooldown");
  assert.equal(getEffectiveCurrent(state), state.level.flowSwitches[0]);
  advanceFlow(state, 0.1);
  assert.equal(state.remix.flow.kind, "ready");
  assert.equal(getEffectiveCurrent(state), state.level.flowSwitches[0]);
});

test("retry discards earned current and manual diversion with the encounter checkpoint", () => {
  const state = encounter();
  clearOpening(state);
  activateFlow(state, state.level.flowSwitches[1], []);
  state.phase = "game_over";
  assert.equal(getRestoredCurrent(state), state.level.flowSwitches[0]);
  const retried = retryLevel(state);
  assert.equal(retried.remix.finale.phaseIndex, 0);
  assert.equal(retried.remix.finale.transitionRemaining, 0);
  assert.equal(retried.remix.flow.kind, "ready");
  assert.equal(getRestoredCurrent(retried), undefined);
  assert.equal(getEffectiveCurrent(retried), undefined);
});

test("ordinary stages have no baseline before or after their temporary manual current", () => {
  const state = createSimulation(getLevel(17), "campaign");
  assert.equal(state.level.restoredCurrent, undefined);
  assert.equal(getEffectiveCurrent(state), undefined);
  activateFlow(state, state.level.flowSwitches[0], []);
  assert.equal(getEffectiveCurrent(state), state.level.flowSwitches[0]);
  advanceFlow(state, 4);
  assert.equal(state.remix.flow.kind, "cooldown");
  assert.equal(getEffectiveCurrent(state), undefined);
  const velocity = state.targets[0].velocity.x;
  steerCurrent(state, 0.1);
  assert.equal(state.targets[0].velocity.x, velocity);
});
