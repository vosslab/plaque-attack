import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import { ARENA_WIDTH, getLevel, PLAYER_WIDTH } from "../src/constants.ts";
import { createSimulation } from "../src/game_state.ts";
import { hasOpeningGuide, openingInterceptGuide } from "../src/opening_guide.ts";

function playing() {
  const state = createSimulation(getLevel(1), "practice");
  state.phase = "playing";
  return state;
}

function target(id, x, vx = 0) {
  const entity = createTarget(
    {
      kind: "plaque",
      size: "small",
      position: { x: logicalCoordinate(x), y: logicalCoordinate(200) },
      direction: 1,
    },
    targetId(id),
    0,
  );
  entity.velocity.x = vx;
  return entity;
}

test("opening guide applies only to stage-one playing with a live target", () => {
  const state = playing();
  assert.equal(hasOpeningGuide(state), true);
  assert.ok(openingInterceptGuide(state));
  for (const phase of ["ready", "paused", "level_complete", "game_over", "campaign_complete"]) {
    state.phase = phase;
    assert.equal(hasOpeningGuide(state), false);
    assert.equal(openingInterceptGuide(state), undefined);
  }
  state.phase = "playing";
  state.level = getLevel(16);
  assert.equal(openingInterceptGuide(state), undefined);
  state.level = getLevel(1);
  state.targets = [];
  assert.equal(hasOpeningGuide(state), false);
  assert.equal(openingInterceptGuide(state), undefined);
});

test("guide chooses nearest, retains a live selection, and replaces a removed target", () => {
  const state = playing();
  const x = state.player.position.x;
  const far = target(1, x - 150);
  const near = target(2, x + 40);
  state.targets = [far, near];
  const selected = openingInterceptGuide(state);
  assert.equal(selected.targetId, near.id);
  far.position.x = logicalCoordinate(x);
  assert.equal(openingInterceptGuide(state, selected.targetId).targetId, near.id);
  state.targets = [far];
  assert.equal(openingInterceptGuide(state, selected.targetId).targetId, far.id);
});

test("projection stays within player-center limits and never mutates simulation state", () => {
  const state = playing();
  for (const [x, vx, expected] of [
    [0, -10000, PLAYER_WIDTH / 2],
    [ARENA_WIDTH, 10000, ARENA_WIDTH - PLAYER_WIDTH / 2],
  ]) {
    state.targets = [target(1, x, vx)];
    const before = structuredClone(state);
    const cue = openingInterceptGuide(state);
    assert.equal(cue.x, expected);
    assert.deepEqual(state, before);
  }
});
