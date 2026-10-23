import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate } from "../src/brands.ts";
import {
  ARENA_WIDTH,
  HEAVY_SPEED_FACTOR,
  LEVELS,
  TARGET_PRESETS,
  WEAPON_CONFIGS,
} from "../src/constants.ts";
import {
  arenaMetrics,
  fluidMetrics,
  measureLevel,
  removalTree,
  targetMetrics,
} from "../src/difficulty.ts";

function spawn(kind, size) {
  return {
    kind,
    size,
    direction: 1,
    position: { x: logicalCoordinate(400), y: logicalCoordinate(100) },
  };
}

test("plaque removal workload includes every binary split descendant; platelets remain single hits", () => {
  assert.deepEqual(removalTree(spawn("plaque", "large")), [
    { size: "large", count: 1 },
    { size: "medium", count: 2 },
    { size: "small", count: 4 },
    { size: "tiny", count: 8 },
  ]);
  assert.deepEqual(removalTree(spawn("platelet", "small")), [{ size: "small", count: 1 }]);
  const large = targetMetrics([spawn("plaque", "large")], LEVELS[1]);
  assert.equal(large.workload, 15);
  assert.equal(large.leafCeiling, 8);
});

test("heavy authored medium plaque measures its one-hit three-tiny payoff", () => {
  const heavy = spawn("plaque", "medium");
  heavy.behavior = "heavy";
  assert.deepEqual(removalTree(heavy), [
    { size: "medium", count: 1, speedFactor: HEAVY_SPEED_FACTOR },
    { size: "tiny", count: 3 },
  ]);
  const measured = targetMetrics([heavy], LEVELS[1]);
  assert.equal(measured.workload, 4);
  assert.equal(measured.leafCeiling, 3);
  const expectedMovement =
    (LEVELS[1].speedMultiplier *
      ((HEAVY_SPEED_FACTOR * TARGET_PRESETS.medium.horizontalSpeed) /
        (2 * TARGET_PRESETS.medium.radius) +
        (3 * TARGET_PRESETS.tiny.horizontalSpeed) / (2 * TARGET_PRESETS.tiny.radius))) /
    4;
  assert.ok(Math.abs(measured.movement - expectedMovement) < 1e-12);
  assert.equal(targetMetrics([spawn("plaque", "medium")], LEVELS[1]).workload, 7);
});

test("movement and precision weight hits throughout the tree and alternate both dual tools", () => {
  const level = { ...LEVELS[1], weapon: "dual", speedMultiplier: 0.7 };
  const measured = targetMetrics([spawn("plaque", "small")], level);
  const expectedMovement =
    (0.7 *
      (TARGET_PRESETS.small.horizontalSpeed / (2 * TARGET_PRESETS.small.radius) +
        (2 * TARGET_PRESETS.tiny.horizontalSpeed) / (2 * TARGET_PRESETS.tiny.radius))) /
    3;
  assert.ok(Math.abs(measured.movement - expectedMovement) < 1e-12);
  for (const alignment of measured.alignment) {
    const width = WEAPON_CONFIGS[alignment.tool].width;
    const expected =
      (ARENA_WIDTH / (2 * TARGET_PRESETS.small.radius + width) +
        (2 * ARENA_WIDTH) / (2 * TARGET_PRESETS.tiny.radius + width)) /
      3;
    assert.ok(Math.abs(alignment.demand - expected) < 1e-12);
  }
  assert.equal(measured.alignmentMode, "alternating");
  assert.equal(
    measured.meanAlignment,
    measured.alignment.reduce((sum, entry) => sum + entry.demand, 0) / 2,
  );
});

test("fluid exposure samples a full cycle and agrees with the separate analytic estimate", () => {
  const slower = fluidMetrics({ ...LEVELS[1], speedMultiplier: 0.5 }, "tiny");
  const faster = fluidMetrics({ ...LEVELS[1], speedMultiplier: 1 }, "tiny");
  assert.equal(slower.periodSeconds, 2 * faster.periodSeconds);
  for (const metric of [slower, faster]) {
    assert.ok(metric.analyticVerticalOverlapEstimate > 0);
    assert.ok(metric.analyticVerticalOverlapEstimate < 1);
    assert.ok(metric.sampled.seconds >= metric.periodSeconds);
    assert.ok(
      Math.abs(metric.sampled.verticalOverlapFraction - metric.analyticVerticalOverlapEstimate) <=
        2 / metric.sampled.steps,
    );
    assert.ok(metric.sampled.meanSpeedDiametersPerSecond > 0);
  }
  assert.equal(slower.analyticVerticalOverlapEstimate, faster.analyticVerticalOverlapEstimate);
});

function arena(tissue = [], pockets = []) {
  return { ...LEVELS[1].arena, tissue, pockets };
}

function cell(id, x, y = 330) {
  return { id, position: { x: logicalCoordinate(x), y: logicalCoordinate(y) } };
}

test("tissue reports union-column lane gaps and bounded productive full-removal shots", () => {
  const level = {
    ...LEVELS[1],
    arena: arena([
      {
        id: "a",
        pocketId: undefined,
        cells: [cell("a1", 100), cell("a2", 112), cell("a3", 100, 342)],
      },
      { id: "b", pocketId: undefined, cells: [cell("b1", 106, 366), cell("b2", 300)] },
    ]),
  };
  const metric = arenaMetrics(level);
  assert.equal(metric.tissueOccupiedCells, 5);
  assert.deepEqual(metric.fullTissueRemovalShotBounds, { min: 2, max: 5 });
  assert.deepEqual(metric.openFiringLaneWidths, [100, 176, ARENA_WIDTH - 312]);
  assert.equal(metric.widestOpenFiringLane, ARENA_WIDTH - 312);
  assert.deepEqual(arenaMetrics({ ...level, arena: arena() }).fullTissueRemovalShotBounds, {
    min: 0,
    max: 0,
  });
});

test("floor relief and maximum slope measure the smooth curve, rather than control-point rise/run", () => {
  const level = {
    ...LEVELS[1],
    arena: {
      ...arena(),
      floor: {
        controlPoints: [
          { x: logicalCoordinate(0), y: logicalCoordinate(540) },
          { x: logicalCoordinate(400), y: logicalCoordinate(500) },
          { x: logicalCoordinate(960), y: logicalCoordinate(540) },
        ],
      },
    },
  };
  const metric = arenaMetrics(level);
  assert.equal(metric.floorRelief, 40);
  assert.ok(Math.abs(metric.maximumFloorSlope - 0.15) < 1e-12);
  const fluid = fluidMetrics(level, "tiny");
  assert.equal(fluid.analyticVerticalOverlapEstimate, undefined);
  assert.ok(fluid.sampled.verticalOverlapFraction > 0);
});

test("raised flat-floor sampling agrees with its local analytic overlap", () => {
  const level = {
    ...LEVELS[1],
    arena: {
      ...arena(),
      floor: {
        controlPoints: [
          { x: logicalCoordinate(0), y: logicalCoordinate(492) },
          { x: logicalCoordinate(960), y: logicalCoordinate(492) },
        ],
      },
    },
  };
  const fluid = fluidMetrics(level, "tiny");
  assert.ok(
    Math.abs(fluid.sampled.verticalOverlapFraction - fluid.analyticVerticalOverlapEstimate) <=
      2 / fluid.sampled.steps,
  );
});

test("optional pocket descendants stay separate; merge work is budget-bounded and leaf mass conserved", () => {
  const pocket = {
    id: "p",
    shellCells: [],
    breachCells: [],
    releasePosition: { x: logicalCoordinate(100), y: logicalCoordinate(200) },
    contents: [spawn("plaque", "small")],
  };
  const level = {
    ...LEVELS[1],
    initialTargets: [spawn("plaque", "medium")],
    objective: { kind: "clear", reinforcements: [{ at: 1, target: spawn("plaque", "tiny") }] },
    arena: arena([], [pocket]),
    merge: { probability: 0.5, cooldown: 1, budget: 3 },
  };
  const metric = measureLevel(level);
  assert.equal(metric.finiteAndInitial.workload, 8);
  assert.equal(metric.mechanics.optionalPocketTargets.workload, 3);
  assert.equal(metric.mechanics.optionalPocketTargets.leafCeiling, 2);
  assert.equal(metric.mechanics.mandatoryRemovalHitBound, 11);
  assert.equal(metric.mechanics.allPocketsOpenedRemovalHitBound, 14);
  assert.equal(metric.mechanics.maximumPlaqueLeafCapacity, 7);
  assert.equal(metric.mechanics.allAuthoredLeafCapacity, 7);
  const disabled = measureLevel({ ...level, merge: { ...level.merge, probability: 0 } });
  assert.equal(disabled.mechanics.mergeExtraHitBound, 0);
  assert.equal(
    disabled.mechanics.maximumPlaqueLeafCapacity,
    metric.mechanics.maximumPlaqueLeafCapacity,
  );
  const maintenance = measureLevel({
    ...level,
    objective: {
      kind: "maintenance",
      duration: 1,
      spawnInterval: 1,
      safeMaximum: 8,
      entryOrder: "cycle",
      entries: [spawn("plaque", "tiny")],
    },
  });
  assert.equal(maintenance.mechanics.mandatoryRemovalHitBound, undefined);
  assert.equal(maintenance.mechanics.maximumPlaqueLeafCapacity, undefined);
  assert.equal(Object.hasOwn(maintenance.pattern, "entryShift"), false);
  const entryShift = {
    at: 0.5,
    entries: [spawn("plaque", "tiny")],
    laneX: logicalCoordinate(640),
  };
  const shifted = measureLevel({
    ...level,
    objective: {
      kind: "maintenance",
      duration: 1,
      spawnInterval: 1,
      safeMaximum: 8,
      entryOrder: "cycle",
      entries: [spawn("plaque", "tiny")],
      entryShift,
    },
  });
  assert.deepEqual(shifted.pattern.entryShift, entryShift);
});

test("each allowed merge conserves leaf mass and adds exactly one removal hit", () => {
  for (const [childSize, parentSize] of [
    ["tiny", "small"],
    ["small", "medium"],
    ["medium", "large"],
  ]) {
    const parents = targetMetrics(
      [spawn("plaque", childSize), spawn("plaque", childSize)],
      LEVELS[1],
    );
    const merged = targetMetrics([spawn("plaque", parentSize)], LEVELS[1]);
    assert.equal(merged.workload - parents.workload, 1);
    assert.equal(merged.leafCeiling, parents.leafCeiling);
  }
});

test("phased workload includes later groups while density uses one phase and support stays cover", () => {
  const phases = [
    { name: "Opening", targets: [spawn("plaque", "tiny")] },
    { name: "Second family", targets: [spawn("plaque", "medium")] },
    { name: "Crossing", targets: [spawn("platelet", "small"), spawn("platelet", "tiny")] },
  ];
  const shell = { id: "support-shell", pocketId: undefined, cells: [cell("shell", 100)] };
  const reference = { patchId: shell.id, cellId: shell.cells[0].id };
  const level = {
    ...LEVELS[1],
    initialTargets: [],
    objective: { kind: "clear", reinforcements: [], phases },
    arena: {
      ...arena([shell]),
      supportPockets: [
        {
          id: "support",
          shellCells: [reference],
          breachCells: [reference],
          releasePosition: { x: logicalCoordinate(100), y: logicalCoordinate(200) },
        },
      ],
    },
    merge: { probability: 0, cooldown: 1, budget: 0 },
  };
  const metric = measureLevel(level);
  const groups = phases.map((phase) => targetMetrics(phase.targets, level));
  assert.equal(metric.initialTargetCount, phases[0].targets.length);
  assert.deepEqual(metric.initial, groups[0]);
  assert.equal(
    metric.finiteAndInitial.workload,
    groups.reduce((sum, group) => sum + group.workload, 0),
  );
  assert.equal(metric.mechanics.mandatoryRemovalHitBound, metric.finiteAndInitial.workload);
  assert.equal(metric.nominalWorkload, metric.finiteAndInitial.workload);
  assert.equal(metric.axes.workload, metric.finiteAndInitial.workload);
  assert.equal(
    metric.maximumPhaseLeafCeiling,
    Math.max(...groups.map((group) => group.leafCeiling)),
  );
  assert.equal(metric.axes.leafCeiling, metric.maximumPhaseLeafCeiling);
  assert.ok(metric.finiteAndInitial.leafCeiling > metric.maximumPhaseLeafCeiling);
  assert.equal(metric.mechanics.allAuthoredLeafCapacity, metric.finiteAndInitial.leafCeiling);
  assert.equal(metric.mechanics.maximumPlaqueLeafCapacity, groups[1].leafCeiling);
  assert.deepEqual(metric.pattern.entries, phases);
  assert.match(metric.pattern.order, /clear-gated phases/);
  assert.equal(metric.arrivalRate, 0);
  assert.equal(metric.mechanics.optionalPocketTargets.workload, 0);
  assert.equal(metric.mechanics.arena.tissueOccupiedCells, shell.cells.length);
  assert.deepEqual(metric.mechanics.arena.fullTissueRemovalShotBounds, { min: 1, max: 1 });
});
