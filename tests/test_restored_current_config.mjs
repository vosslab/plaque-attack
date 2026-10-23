import assert from "node:assert/strict";
import test from "node:test";
import { LEVELS } from "../src/constants.ts";

test("authored restored currents use reachable finale phases and configured switches", () => {
  const configuredLevels = Object.values(LEVELS).filter((level) => level.restoredCurrent);

  assert.ok(configuredLevels.length > 0);
  for (const level of configuredLevels) {
    const restoredCurrent = level.restoredCurrent;
    assert.ok(restoredCurrent);
    assert.equal(level.objective.kind, "clear");
    assert.ok(level.objective.phases.length > 1);
    assert.ok(Number.isInteger(restoredCurrent.afterPhase));
    assert.ok(restoredCurrent.afterPhase >= 1);
    assert.ok(restoredCurrent.afterPhase < level.objective.phases.length);
    assert.ok(level.flowSwitches?.some((definition) => definition.id === restoredCurrent.switchId));
  }
});
