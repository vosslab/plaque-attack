import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate } from "../src/brands.ts";
import { FIXED_STEP, getLevel, SPAWN_WARNING_DURATION } from "../src/constants.ts";
import { getEntryShiftCue } from "../src/entry_shift.ts";
import { createSimulation, retryLevel } from "../src/game_state.ts";
import { advanceWaves } from "../src/waves.ts";
import { stepSimulation } from "../src/simulation.ts";
import { canBankSteadyFlow } from "../src/steady_flow.ts";

test("steady flow waits for an actual postshift-selected arrival, then starts its full interval", () => {
  const state = shiftedState("cycle");
  state.level = { ...state.level, objective: { ...state.level.objective, duration: 20 } };
  state.targets = [];
  state.phase = "playing";
  state.elapsed = 10 - SPAWN_WARNING_DURATION / 2;
  state.waves.nextSpawnAt = state.elapsed;
  advanceWaves(state, 0, []);
  assert.equal(state.waves.warning.selectedAfterShift, false);
  state.elapsed = 10;
  advanceWaves(state, SPAWN_WARNING_DURATION, []);
  assert.equal(state.waves.shiftedArrivalSpawned, false);
  assert.equal(
    canBankSteadyFlow(state),
    false,
    "an old warning arriving after the shift is insufficient",
  );
  state.elapsed = state.waves.nextSpawnAt;
  advanceWaves(state, 0, []);
  assert.equal(state.waves.warning.selectedAfterShift, true);
  assert.equal(canBankSteadyFlow(state), false, "announcing the new stream is insufficient");
  state.targets = [];
  const input = { left: false, right: false, fire: false };
  stepSimulation(state, input, SPAWN_WARNING_DURATION);
  assert.equal(state.waves.shiftedArrivalSpawned, true);
  assert.equal(state.steadyFlowSeconds, 0, "the tick preceding the actual spawn cannot count");
  stepSimulation(state, input, FIXED_STEP);
  assert.equal(state.steadyFlowSeconds, FIXED_STEP);
});

function shiftedState(entryOrder) {
  const level = getLevel(11);
  const entries = level.objective.entries.slice(0, 1);
  const shifted = level.objective.entries.slice(-1);
  return createSimulation(
    {
      ...level,
      objective: {
        ...level.objective,
        entryOrder,
        entries,
        entryShift: { at: 10, entries: shifted, laneX: logicalCoordinate(640) },
      },
    },
    "practice",
  );
}

test("entry shift preserves a pending warning, then selects the new entries", () => {
  for (const order of ["cycle", "seeded"]) {
    const state = shiftedState(order);
    const { entryShift, entries } = state.level.objective;
    state.elapsed = entryShift.at - SPAWN_WARNING_DURATION / 2;
    state.waves.nextSpawnAt = state.elapsed;
    const events = [];
    advanceWaves(state, 0, events);
    const warning = state.waves.warning;
    assert.equal(warning.target, entries[0]);

    state.elapsed = entryShift.at + SPAWN_WARNING_DURATION;
    advanceWaves(state, SPAWN_WARNING_DURATION, events);
    const spawned = state.targets.at(-1);
    assert.deepEqual(spawned.position, warning.target.position);
    assert.equal(events.filter((event) => event.type === "spawn").length, 1);
    assert.equal(state.waves.spawned, 1);
    assert.equal(state.waves.warning, undefined);

    state.elapsed = state.waves.nextSpawnAt;
    advanceWaves(state, 0, events);
    assert.equal(state.waves.warning.target, entryShift.entries[0]);
    assert.equal(state.waves.warning.remaining, SPAWN_WARNING_DURATION);
  }
});

test("an optional future shift leaves the prior entry rhythm and seed unchanged", () => {
  for (const order of ["cycle", "seeded"]) {
    const shifted = shiftedState(order);
    const { entryShift: _shift, ...objective } = shifted.level.objective;
    const original = createSimulation({ ...shifted.level, objective }, "practice");
    for (const state of [original, shifted]) {
      state.elapsed = 2;
      state.waves.nextSpawnAt = 2;
      advanceWaves(state, 0, []);
      state.elapsed += SPAWN_WARNING_DURATION;
      advanceWaves(state, SPAWN_WARNING_DURATION, []);
    }
    assert.deepEqual(shifted.targets, original.targets);
    assert.deepEqual(shifted.waves, original.waves);
    assert.equal(shifted.seed, original.seed);
    assert.deepEqual(shifted.remix, original.remix);
    assert.equal(shifted.score, original.score);
    assert.equal(shifted.player.lives, original.player.lives);
  }
});

test("cue is clock-derived, optional, and resets through ordinary retry", () => {
  const state = shiftedState("cycle");
  const { at, laneX } = state.level.objective.entryShift;
  assert.equal(getEntryShiftCue(state), undefined);
  state.elapsed = at - 0.1;
  assert.equal(getEntryShiftCue(state).phase, "forecast");
  assert.equal(getEntryShiftCue(state).laneX, laneX);
  assert.ok(getEntryShiftCue(state).remaining > 0);
  state.elapsed = at;
  assert.deepEqual(getEntryShiftCue(state), { phase: "active", laneX, remaining: 0 });
  state.elapsed = state.level.objective.duration;
  assert.equal(getEntryShiftCue(state), undefined);
  const retry = retryLevel(state);
  assert.equal(retry.elapsed, 0);
  assert.equal(getEntryShiftCue(retry), undefined);
  retry.elapsed = at - 0.1;
  assert.equal(getEntryShiftCue(retry).phase, "forecast");
  assert.equal(getEntryShiftCue(createSimulation(getLevel(11), "practice")), undefined);
  assert.equal(getEntryShiftCue(createSimulation(getLevel(1), "practice")), undefined);
});
