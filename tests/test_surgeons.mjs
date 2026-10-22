import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SURGEON_ID,
  getSurgeon,
  isSurgeonId,
  SURGEON_IDS,
  SURGEONS,
} from "../src/surgeons.ts";

test("the cosmetic roster has six stable identities and one asset per identity", () => {
  assert.deepEqual(SURGEON_IDS, ["maya", "jules", "imani", "leo", "samira", "alex"]);
  assert.equal(SURGEON_IDS.length, 6);
  assert.equal(isSurgeonId(DEFAULT_SURGEON_ID), true);
  for (const id of SURGEON_IDS) {
    const surgeon = getSurgeon(id);
    assert.equal(surgeon.id, id);
    assert.equal(surgeon.portraitAssetId, `surgeon-${id}`);
    assert.match(surgeon.name, /^Dr\. /);
    assert.equal(isSurgeonId(id), true);
    assert.equal(SURGEONS[id], surgeon);
  }
});

test("only canonical roster IDs pass the save-boundary guard", () => {
  for (const value of [undefined, null, "surgeon", "Maya", "maya ", 1, {}])
    assert.equal(isSurgeonId(value), false);
});
