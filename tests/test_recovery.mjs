import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_IDS } from "../src/constants.ts";
import { defaultSave, markLevelCompleted, validateSave } from "../src/save_load.ts";

function baseV2(unlockedLevel, records = []) {
  const save = defaultSave();
  return { ...save, version: 2, unlockedLevel, records };
}

function record(levelReached, outcome = "ended") {
  return {
    campaign: "expanded",
    score: 1200,
    levelReached,
    outcome,
    date: "2026-10-22T00:00:00.000Z",
  };
}

test("a campaign clear is stable-ID based and idempotent", () => {
  const first = markLevelCompleted(defaultSave(), 16);
  const repeated = markLevelCompleted(first, 16);
  assert.deepEqual(first.completedLevelIds, [16]);
  assert.strictEqual(repeated, first);
  assert.deepEqual(markLevelCompleted(first, 2).completedLevelIds, [16, 2]);
});

test("v3 accepts only unique known restoration IDs and canonicalizes their display order", () => {
  const save = { ...defaultSave(), completedLevelIds: [2, 16, 1] };
  assert.deepEqual(validateSave(save)?.completedLevelIds, [1, 16, 2]);
  assert.equal(validateSave({ ...save, completedLevelIds: [1, 1] }), undefined);
  assert.equal(validateSave({ ...save, completedLevelIds: [99] }), undefined);
});

test("v1 restores only the historical classic prefix while its completed finale restores all classic routes", () => {
  const partial = { ...baseV2(1), version: 1, unlockedLevel: 4, records: [] };
  assert.deepEqual(validateSave(partial)?.completedLevelIds, [1, 2, 3]);
  const finale = {
    ...partial,
    unlockedLevel: 15,
    records: [
      { score: 9000, levelReached: 15, outcome: "completed", date: "2026-10-22T00:00:00.000Z" },
    ],
  };
  assert.deepEqual(
    validateSave(finale)?.completedLevelIds,
    Array.from({ length: 15 }, (_, index) => index + 1),
  );
});

test("ambiguous v2 unlocks never invent inserted-stage recovery, while expanded records prove prior routes", () => {
  assert.deepEqual(validateSave(baseV2(16))?.completedLevelIds, [1]);
  assert.deepEqual(validateSave(baseV2(2))?.completedLevelIds, [1]);
  assert.deepEqual(
    validateSave(baseV2(15))?.completedLevelIds,
    Array.from({ length: 14 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    validateSave(baseV2(3, [record(17)]))?.completedLevelIds,
    [1, 16, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    validateSave(baseV2(1, [record(15, "completed")]))?.completedLevelIds,
    LEVEL_IDS,
  );
});

test("a v2 classic finale restores the historic routes without claiming new inserted stages", () => {
  const classicFinale = {
    campaign: "classic",
    score: 1200,
    levelReached: 15,
    outcome: "completed",
    date: "2026-10-22T00:00:00.000Z",
  };
  assert.deepEqual(
    validateSave(baseV2(15, [classicFinale]))?.completedLevelIds,
    Array.from({ length: 15 }, (_, index) => index + 1),
  );
});
