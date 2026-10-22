import assert from "node:assert/strict";
import test from "node:test";
import { addRecord, defaultSave, loadSave, SAVE_KEY, saveSave } from "../src/save_load.ts";

function storageFixture(context, storage) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  });
}

function record(score, levelReached, day) {
  return {
    campaign: "expanded",
    score,
    levelReached,
    outcome: "ended",
    date: `2026-01-${String(day).padStart(2, "0")}T00:00:00.000Z`,
  };
}

test("storage rejects corrupt and unsupported saves without overwriting their original bytes", (context) => {
  let stored;
  let writes = 0;
  storageFixture(context, {
    getItem(key) {
      assert.equal(key, SAVE_KEY);
      return stored;
    },
    setItem(_key, value) {
      stored = value;
      writes += 1;
    },
  });
  for (const [raw, status] of [
    ["{broken", "malformed"],
    [
      JSON.stringify({
        ...defaultSave(),
        records: [{ ...record(100, 1, 1), campaign: undefined }],
      }),
      "malformed",
    ],
    [JSON.stringify({ version: 999 }), "unsupported"],
  ]) {
    stored = raw;
    const result = loadSave();
    assert.equal(result.status, status);
    assert.deepEqual(result.save, defaultSave());
    assert.equal(saveSave(result.save, result.status), status);
    assert.equal(stored, raw);
    assert.equal(writes, 0);
  }
});

test("version one migration preserves classic results, settings and stable unlock IDs", (context) => {
  const legacyRecord = {
    score: 12000,
    levelReached: 15,
    outcome: "completed",
    date: "2026-01-01T00:00:00.000Z",
  };
  const legacy = {
    version: 1,
    settings: { music: true, effects: false, completedTutorials: ["move", "split"] },
    unlockedLevel: 8,
    records: [legacyRecord],
  };
  let stored = JSON.stringify(legacy);
  storageFixture(context, {
    getItem() {
      return stored;
    },
    setItem(_key, value) {
      stored = value;
    },
  });
  const loaded = loadSave();
  assert.deepEqual(loaded, {
    status: "available",
    save: { ...legacy, version: 2, records: [{ ...legacyRecord, campaign: "classic" }] },
  });
  assert.equal(stored, JSON.stringify(legacy), "loading alone does not rewrite storage");
  assert.equal(saveSave(loaded.save, loaded.status), "available");
  assert.deepEqual(loadSave(), loaded);
});

test("record progress uses campaign positions rather than numeric content IDs", () => {
  const before = record(500, 24, 1);
  const finale = record(500, 15, 2);
  const classic = { ...record(500, 15, 3), campaign: "classic", outcome: "completed" };
  let save = defaultSave();
  for (const entry of [before, classic, finale]) save = addRecord(save, entry);
  assert.deepEqual(save.records, [finale, before, classic]);
});

test("unavailable browser storage falls back to playable defaults and reports write failure", (context) => {
  storageFixture(context, {
    getItem() {
      throw new Error("storage denied");
    },
    setItem() {
      throw new Error("quota exceeded");
    },
  });
  assert.deepEqual(loadSave(), { save: defaultSave(), status: "unavailable" });
  assert.equal(saveSave(defaultSave(), "available"), "unavailable");
});

test("top five ranks by score, progress and earlier date and survives a settings round trip", (context) => {
  const entries = [
    record(100, 1, 1),
    record(500, 3, 4),
    record(500, 4, 3),
    record(500, 4, 2),
    record(900, 1, 6),
    record(200, 2, 5),
    record(0, 1, 7),
  ];
  let save = defaultSave();
  save.settings = { music: true, effects: false, completedTutorials: ["move", "fire"] };
  save.unlockedLevel = 7;
  for (const entry of entries) save = addRecord(save, entry);
  assert.deepEqual(save.records, [entries[4], entries[3], entries[2], entries[1], entries[5]]);
  assert.equal(entries.length, 7);
  let stored = null;
  storageFixture(context, {
    getItem() {
      return stored;
    },
    setItem(key, value) {
      assert.equal(key, SAVE_KEY);
      stored = value;
    },
  });
  assert.equal(saveSave(save, "available"), "available");
  assert.deepEqual(loadSave(), { save, status: "available" });
});
