import { floorSlope, playerSupportY } from "./arena_geometry";
import { logicalCoordinate, randomSeed, targetId } from "./brands";
import { createTarget, nextPlaqueSize } from "./characters";
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  DUAL_FIRE_INTERVAL,
  FIXED_STEP,
  FLUID_ANGULAR_SPEED,
  FLUID_WALL_INSET,
  LEVEL_IDS,
  LEVELS,
  MAX_TARGETS,
  OVERLOAD_DURATION,
  PLAYER_HITBOX_HEIGHT,
  TARGET_PRESETS,
  WEAPON_CONFIGS,
} from "./constants";
import { createSimulation } from "./game_state";
import { advanceTarget, orbitPhase } from "./motion";
import type {
  FinalePhase,
  LevelConfig,
  MaintenanceObjective,
  PlaqueSize,
  ProjectileKind,
  TargetSpawn,
} from "./types/level";
import { advanceWaves } from "./waves";

type TargetMetrics = {
  workload: number;
  leafCeiling: number;
  movement: number;
  alignment: { tool: ProjectileKind; demand: number }[];
  meanAlignment: number;
  alignmentMode: string;
};
type ArenaMetrics = {
  floorRelief: number;
  maximumFloorSlope: number;
  tissueOccupiedCells: number;
  fullTissueRemovalShotBounds: { min: number; max: number };
  openFiringLaneWidths: number[];
  widestOpenFiringLane: number;
};
type MechanicsMetrics = {
  arena: ArenaMetrics;
  optionalPocketTargets: TargetMetrics;
  merge: LevelConfig["merge"];
  extraHitsPerSuccessfulMerge: number;
  mergeExtraHitBound: number;
  mandatoryRemovalHitBound: number | undefined;
  allPocketsOpenedRemovalHitBound: number | undefined;
  maximumPlaqueLeafCapacity: number | undefined;
  allAuthoredLeafCapacity: number | undefined;
};
type FluidMetrics = {
  size: PlaqueSize;
  periodSeconds: number;
  analyticVerticalOverlapEstimate: number | undefined;
  analyticScope: string;
  sampled: {
    steps: number;
    seconds: number;
    verticalOverlapFraction: number;
    meanSpeedDiametersPerSecond: number;
  };
};
type ArrivalSample = {
  seed: number;
  steps: number;
  arrivals: number;
  finalLive: number;
  reachedCapacity: boolean;
  capacityDeferredSteps: number;
  capacityDeferredSeconds: number;
  warningCancelledAtExpiry: boolean;
};
type AxisVector = {
  workload: number;
  movement: number;
  leafCeiling: number;
  verticalExposure: number;
  precision: number;
  arrivals: number;
  sustainedPressure: number;
  floorRelief: number;
  maximumFloorSlope: number;
  tissueOccupiedCells: number;
  carvingShotUpperBound: number;
  blockedFiringWidth: number;
  optionalPocketWorkload: number;
  mergeExtraHitBound: number;
};
type LevelMeasurement = {
  id: LevelConfig["id"];
  chapter: LevelConfig["chapter"];
  scene: LevelConfig["scene"];
  name: string;
  tool: LevelConfig["weapon"];
  objective: "clear" | "maintenance";
  authoredTeachingReason: string;
  initialTargetCount: number;
  initial: TargetMetrics;
  finiteAndInitial: TargetMetrics | undefined;
  maximumPhaseLeafCeiling: number | undefined;
  recurring:
    | {
        distribution: string;
        workload: MeanRange | undefined;
        leafCeiling: MeanRange | undefined;
        movement: MeanRange | undefined;
        alignment: MeanRange | undefined;
      }
    | undefined;
  workloadKind: string;
  nominalWorkload: number;
  fluidMotion: FluidMetrics[];
  mechanics: MechanicsMetrics;
  arrivalRate: number;
  load:
    | { initialOccupancy: number; arrivalsPerOverloadWindow: number; safeMaximum: number }
    | undefined;
  exposure:
    | {
        duration: number;
        nominalOpportunities: number;
        schedulerOnlyNoFire: (ArrivalSample | undefined)[];
      }
    | undefined;
  pattern: {
    order: string;
    entryShift?: MaintenanceObjective["entryShift"];
    entries:
      | readonly TargetSpawn[]
      | readonly import("./types/level").ScheduledSpawn[]
      | readonly FinalePhase[];
  };
  idealThroughputCeiling: number;
  optimisticFiringWorkSeconds: number | undefined;
  axes: AxisVector;
};
type Report = {
  method: {
    fixedStep: number;
    arenaWidth: number;
    arenaHeight: number;
    fluidAngularSpeed: number;
    fluidWallInset: number;
    playerHitboxHeight: number;
    maxTargets: number;
    overloadDuration: number;
    targetPresets: typeof TARGET_PRESETS;
    weapons: typeof WEAPON_CONFIGS;
    dualFireInterval: number;
    limits: string[];
  };
  stages: (LevelMeasurement & {
    ordinal: number;
    comparableBlock: number;
    transition: string;
    ratios: Record<keyof AxisVector, number | undefined>;
    reviewFlags: string[];
  })[];
};

type Hit = { size: PlaqueSize; count: number };
type MeanRange = { mean: number; min: number; max: number };
const SIZES: readonly PlaqueSize[] = ["large", "medium", "small", "tiny"];

// Expand every removal, including the fast small descendants, rather than initial bodies alone.
export function removalTree(spawn: TargetSpawn): Hit[] {
  const hits: Hit[] = [];
  let size: PlaqueSize | undefined = spawn.size;
  let count = 1;
  while (size !== undefined) {
    hits.push({ size, count });
    size = spawn.kind === "plaque" ? nextPlaqueSize(size) : undefined;
    count *= 2;
  }
  return hits;
}

function summarize(values: readonly number[]): MeanRange | undefined {
  if (values.length === 0) return undefined;
  return {
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function targetMetrics(targets: readonly TargetSpawn[], level: LevelConfig): TargetMetrics {
  const hits = targets.flatMap(removalTree);
  const workload = hits.reduce((sum, hit) => sum + hit.count, 0);
  const leafCeiling = targets.reduce((sum, target) => {
    const tree = removalTree(target);
    return sum + (tree[tree.length - 1]?.count ?? 0);
  }, 0);
  const movement =
    workload === 0
      ? 0
      : hits.reduce((sum, hit) => {
          const preset = TARGET_PRESETS[hit.size];
          return (
            sum + (hit.count * preset.horizontalSpeed * level.speedMultiplier) / (2 * preset.radius)
          );
        }, 0) / workload;
  const tools: ProjectileKind[] =
    level.weapon === "dual" ? ["aspirin", "clopidogrel"] : [level.weapon];
  const alignment = tools.map((tool) => ({
    tool,
    demand:
      workload === 0
        ? 0
        : hits.reduce(
            (sum, hit) =>
              sum +
              (hit.count * ARENA_WIDTH) /
                (2 * TARGET_PRESETS[hit.size].radius + WEAPON_CONFIGS[tool].width),
            0,
          ) / workload,
  }));
  return {
    workload,
    leafCeiling,
    movement,
    alignment,
    meanAlignment: alignment.reduce((sum, item) => sum + item.demand, 0) / alignment.length,
    alignmentMode: level.weapon === "dual" ? "alternating" : "single",
  };
}

// Project every occupied cell onto x, then complement their union. Overlapping rows/patches
// block a column once. These are geometric gaps before projectile-width/player-bound trimming.
export function arenaMetrics(level: LevelConfig): ArenaMetrics {
  const points = level.arena.floor.controlPoints;
  const heights = points.map((point) => point.y);
  const slopes = points.slice(1).map((point, index) => {
    const previous = points[index];
    return previous === undefined
      ? 0
      : Math.abs(floorSlope(level.arena.floor, (previous.x + point.x) / 2));
  });
  const intervals = level.arena.tissue
    .flatMap((patch) =>
      patch.cells.map((cell) => ({
        left: Math.max(0, cell.position.x),
        right: Math.min(ARENA_WIDTH, cell.position.x + 12),
      })),
    )
    .filter((interval) => interval.right > interval.left)
    .sort((a, b) => a.left - b.left);
  let cursor = 0;
  const openFiringLaneWidths: number[] = [];
  for (const interval of intervals) {
    if (interval.left > cursor) openFiringLaneWidths.push(interval.left - cursor);
    cursor = Math.max(cursor, interval.right);
  }
  if (cursor < ARENA_WIDTH) openFiringLaneWidths.push(ARENA_WIDTH - cursor);
  const tissueOccupiedCells = level.arena.tissue.reduce(
    (count, patch) => count + patch.cells.length,
    0,
  );
  return {
    floorRelief: Math.max(...heights) - Math.min(...heights),
    maximumFloorSlope: Math.max(0, ...slopes),
    tissueOccupiedCells,
    // An impact removes 1-3 occupied cells; isolated cells and clipped notches prevent N/3
    // from being an exact shot count. Hazards may clear cells without firing at all.
    fullTissueRemovalShotBounds: {
      min: Math.ceil(tissueOccupiedCells / 3),
      max: tissueOccupiedCells,
    },
    openFiringLaneWidths,
    widestOpenFiringLane: Math.max(0, ...openFiringLaneWidths),
  };
}

function mechanicsMetrics(level: LevelConfig, mandatory: readonly TargetSpawn[]): MechanicsMetrics {
  const optional = level.arena.pockets.flatMap((pocket) => [...pocket.contents]);
  const mandatoryMetrics = targetMetrics(mandatory, level);
  const optionalPocketTargets = targetMetrics(optional, level);
  const allAuthored = [...mandatory, ...optional];
  const recurringPlaque =
    level.objective.kind === "maintenance" &&
    level.objective.entries.some((target) => target.kind === "plaque");
  const mergeExtraHitBound = level.merge.probability > 0 ? level.merge.budget : 0;
  const phases = level.objective.kind === "clear" ? level.objective.phases : undefined;
  const plaqueLeaves = (targets: readonly TargetSpawn[]): number =>
    targetMetrics(
      targets.filter((target) => target.kind === "plaque"),
      level,
    ).leafCeiling;
  return {
    arena: arenaMetrics(level),
    optionalPocketTargets,
    merge: level.merge,
    extraHitsPerSuccessfulMerge: 1,
    mergeExtraHitBound,
    mandatoryRemovalHitBound:
      level.objective.kind === "clear" ? mandatoryMetrics.workload + mergeExtraHitBound : undefined,
    allPocketsOpenedRemovalHitBound:
      level.objective.kind === "clear"
        ? mandatoryMetrics.workload + optionalPocketTargets.workload + mergeExtraHitBound
        : undefined,
    maximumPlaqueLeafCapacity: recurringPlaque
      ? undefined
      : phases === undefined
        ? plaqueLeaves(allAuthored)
        : Math.max(...phases.map((phase) => plaqueLeaves(phase.targets))) + plaqueLeaves(optional),
    allAuthoredLeafCapacity:
      level.objective.kind === "clear" ? targetMetrics(allAuthored, level).leafCeiling : undefined,
  };
}

// One orbit using the real floor-aware integrator, without tissue reflection or merges.
export function fluidMetrics(level: LevelConfig, size: PlaqueSize): FluidMetrics {
  const preset = TARGET_PRESETS[size];
  const flatHeight = level.arena.floor.controlPoints[0]?.y;
  const flat =
    flatHeight !== undefined &&
    level.arena.floor.controlPoints.every((point) => point.y === flatHeight);
  const amplitude = (flatHeight ?? ARENA_HEIGHT) / 2 - preset.radius - FLUID_WALL_INSET;
  const overlapDepth = 1 - (PLAYER_HITBOX_HEIGHT - FLUID_WALL_INSET) / (2 * amplitude);
  const periodSeconds = (2 * Math.PI) / (FLUID_ANGULAR_SPEED * level.speedMultiplier);
  const spawn: TargetSpawn = {
    kind: "plaque",
    size,
    direction: 1,
    position: { x: logicalCoordinate(ARENA_WIDTH / 2), y: logicalCoordinate(ARENA_HEIGHT / 2) },
  };
  const target = createTarget(spawn, targetId(1), level.speedMultiplier, 0, level.arena.floor);
  const steps = Math.ceil(periodSeconds / FIXED_STEP);
  let overlaps = 0;
  let totalSpeed = 0;
  for (let tick = 0; tick < steps; tick += 1) {
    advanceTarget(target, FIXED_STEP, level.arena.floor);
    if (
      target.position.y + target.radius >=
      playerSupportY(level.arena.floor, target.position.x) - PLAYER_HITBOX_HEIGHT
    )
      overlaps += 1;
    totalSpeed += Math.hypot(target.velocity.x, target.velocity.y) / (2 * preset.radius);
  }
  return {
    size,
    periodSeconds,
    analyticVerticalOverlapEstimate: flat
      ? 1 - orbitPhase("plaque", overlapDepth) / Math.PI
      : undefined,
    analyticScope: flat ? "constant-height flat floor only" : "not applicable to a varying floor",
    sampled: {
      steps,
      seconds: steps * FIXED_STEP,
      verticalOverlapFraction: overlaps / steps,
      meanSpeedDiametersPerSecond: totalSpeed / steps,
    },
  };
}

function throughput(level: LevelConfig): number {
  if (level.weapon === "dual")
    return (
      (WEAPON_CONFIGS.aspirin.targetLimit + WEAPON_CONFIGS.clopidogrel.targetLimit) /
      (2 * DUAL_FIRE_INTERVAL)
    );
  const tool = WEAPON_CONFIGS[level.weapon];
  return (level.weapon === "stent" ? 1 : tool.targetLimit) / tool.interval;
}

// Scheduler-only no-fire evidence continues to expiry even if a real player would die earlier.
function sampleArrivals(level: LevelConfig, seed: number): ArrivalSample | undefined {
  if (level.objective.kind !== "maintenance") return undefined;
  const state = createSimulation(level, "practice", 0, 3, randomSeed(seed));
  let capacityDeferredSteps = 0;
  let warningCancelledAtExpiry = false;
  const steps = Math.ceil(level.objective.duration / FIXED_STEP);
  for (let tick = 0; tick < steps; tick += 1) {
    const warning = state.waves.warning;
    state.elapsed = (tick + 1) * FIXED_STEP;
    if (
      warning !== undefined &&
      warning.remaining <= FIXED_STEP + 1e-9 &&
      state.targets.length >= MAX_TARGETS &&
      state.elapsed + 1e-9 < level.objective.duration
    )
      capacityDeferredSteps += 1;
    if (warning !== undefined && state.elapsed + 1e-9 >= level.objective.duration)
      warningCancelledAtExpiry = true;
    advanceWaves(state, FIXED_STEP, []);
  }
  return {
    seed,
    steps,
    arrivals: state.waves.spawned,
    finalLive: state.targets.length,
    reachedCapacity: state.targets.length >= MAX_TARGETS,
    capacityDeferredSteps,
    capacityDeferredSeconds: capacityDeferredSteps * FIXED_STEP,
    warningCancelledAtExpiry,
  };
}

export function measureLevel(level: LevelConfig): LevelMeasurement {
  const objective = level.objective;
  const phases = objective.kind === "clear" ? objective.phases : undefined;
  const initialTargets = phases === undefined ? level.initialTargets : phases[0].targets;
  const initial = targetMetrics(initialTargets, level);
  const finite =
    phases !== undefined
      ? phases.slice(1).flatMap((phase) => [...phase.targets])
      : objective.kind === "clear"
        ? objective.reinforcements.map((entry) => entry.target)
        : [];
  const combined = targetMetrics([...initialTargets, ...finite], level);
  const maximumPhaseLeafCeiling =
    phases === undefined
      ? undefined
      : Math.max(...phases.map((phase) => targetMetrics(phase.targets, level).leafCeiling));
  const mechanics = mechanicsMetrics(level, [...initialTargets, ...finite]);
  const entryMetrics =
    objective.kind === "maintenance"
      ? objective.entries.map((entry) => targetMetrics([entry], level))
      : [];
  const lastAt =
    objective.kind === "clear"
      ? Math.max(0, ...objective.reinforcements.map((entry) => entry.at))
      : 0;
  const arrivalRate =
    objective.kind === "maintenance"
      ? 1 / objective.spawnInterval
      : lastAt > 0
        ? finite.length / lastAt
        : 0;
  const nominalOpportunities =
    objective.kind === "maintenance" ? Math.floor(objective.duration / objective.spawnInterval) : 0;
  const recurring =
    objective.kind === "maintenance"
      ? {
          distribution:
            objective.entryOrder === "cycle"
              ? "equal over a complete entry cycle; partial cycles differ"
              : "unweighted entry-set mean; seeded short runs differ",
          workload: summarize(entryMetrics.map((entry) => entry.workload)),
          leafCeiling: summarize(entryMetrics.map((entry) => entry.leafCeiling)),
          movement: summarize(entryMetrics.map((entry) => entry.movement)),
          alignment: summarize(entryMetrics.map((entry) => entry.meanAlignment)),
        }
      : undefined;
  const fluidMotion = SIZES.map((size) => fluidMetrics(level, size));
  const idealThroughputCeiling = throughput(level);
  return {
    id: level.id,
    chapter: level.chapter,
    scene: level.scene,
    name: level.name,
    tool: level.weapon,
    objective: objective.kind,
    authoredTeachingReason: level.briefing,
    initialTargetCount: initialTargets.length,
    initial,
    finiteAndInitial: objective.kind === "clear" ? combined : undefined,
    maximumPhaseLeafCeiling,
    recurring,
    workloadKind:
      objective.kind === "clear"
        ? "exact complete removal tree"
        : "initial exact; recurring nominal only, play-dependent total",
    nominalWorkload:
      objective.kind === "maintenance"
        ? initial.workload + nominalOpportunities * (recurring?.workload?.mean ?? 0)
        : combined.workload,
    fluidMotion,
    mechanics,
    arrivalRate,
    load:
      objective.kind === "maintenance"
        ? {
            initialOccupancy: initialTargets.length / objective.safeMaximum,
            arrivalsPerOverloadWindow: (arrivalRate * OVERLOAD_DURATION) / objective.safeMaximum,
            safeMaximum: objective.safeMaximum,
          }
        : undefined,
    exposure:
      objective.kind === "maintenance"
        ? {
            duration: objective.duration,
            nominalOpportunities,
            schedulerOnlyNoFire: [1, 42, 2026].map((seed) => sampleArrivals(level, seed)),
          }
        : undefined,
    pattern:
      phases !== undefined
        ? { order: "ordered clear-gated phases; first group is initial", entries: phases }
        : objective.kind === "maintenance"
          ? {
              order: objective.entryOrder,
              entries: objective.entries,
              ...(objective.entryShift === undefined ? {} : { entryShift: objective.entryShift }),
            }
          : { order: "scheduled; empty arena may accelerate", entries: objective.reinforcements },
    idealThroughputCeiling,
    optimisticFiringWorkSeconds:
      objective.kind === "clear" ? combined.workload / idealThroughputCeiling : undefined,
    axes: {
      workload: objective.kind === "clear" ? combined.workload : initial.workload,
      movement:
        objective.kind === "clear"
          ? combined.movement
          : (recurring?.movement?.mean ?? initial.movement),
      leafCeiling:
        maximumPhaseLeafCeiling ??
        (objective.kind === "clear" ? combined.leafCeiling : initial.leafCeiling),
      verticalExposure: fluidMotion.find((item) => item.size === "tiny")!.sampled
        .verticalOverlapFraction,
      precision:
        objective.kind === "clear"
          ? combined.meanAlignment
          : (recurring?.alignment?.mean ?? initial.meanAlignment),
      arrivals: arrivalRate,
      floorRelief: mechanics.arena.floorRelief,
      maximumFloorSlope: mechanics.arena.maximumFloorSlope,
      tissueOccupiedCells: mechanics.arena.tissueOccupiedCells,
      carvingShotUpperBound: mechanics.arena.fullTissueRemovalShotBounds.max,
      blockedFiringWidth:
        ARENA_WIDTH - mechanics.arena.openFiringLaneWidths.reduce((sum, width) => sum + width, 0),
      optionalPocketWorkload: mechanics.optionalPocketTargets.workload,
      mergeExtraHitBound: mechanics.mergeExtraHitBound,
      sustainedPressure:
        objective.kind === "maintenance"
          ? (arrivalRate * OVERLOAD_DURATION) / objective.safeMaximum
          : 0,
    },
  };
}

const AXIS_KEYS: readonly (keyof AxisVector)[] = [
  "workload",
  "movement",
  "leafCeiling",
  "verticalExposure",
  "precision",
  "arrivals",
  "sustainedPressure",
  "floorRelief",
  "maximumFloorSlope",
  "tissueOccupiedCells",
  "carvingShotUpperBound",
  "blockedFiringWidth",
  "optionalPocketWorkload",
  "mergeExtraHitBound",
];
function ratios(axes: AxisVector, base: AxisVector): Record<keyof AxisVector, number | undefined> {
  const result: Record<keyof AxisVector, number | undefined> = { ...axes };
  for (const key of AXIS_KEYS) result[key] = base[key] === 0 ? undefined : axes[key] / base[key];
  return result;
}

export function difficultyReport(): Report {
  let previous: ReturnType<typeof measureLevel> | undefined;
  let baseline: ReturnType<typeof measureLevel> | undefined;
  let block = 0;
  const stages = LEVEL_IDS.map((id, index) => {
    const measured = measureLevel(LEVELS[id]);
    const introduction =
      previous === undefined ||
      previous.tool !== measured.tool ||
      previous.objective !== measured.objective ||
      previous.chapter !== measured.chapter;
    if (introduction) {
      baseline = measured;
      block += 1;
    }
    const flags: string[] = [];
    if (!introduction && previous !== undefined) {
      const previousAxes = previous.axes;
      const changes = AXIS_KEYS.map((key) => measured.axes[key] - previousAxes[key]);
      if (changes.every((change) => change <= 1e-9) && changes.some((change) => change < -1e-9))
        flags.push("All measured axes unchanged or lower; inspect teaching reason and entry motif");
      if (changes.every((change) => Math.abs(change) < 1e-9))
        flags.push(
          "No new challenge in aggregate axes; inspect entry motif rather than title/duration",
        );
    }
    const row = {
      ordinal: index + 1,
      comparableBlock: block,
      transition: introduction
        ? `Introduction/reset: ${measured.tool} ${measured.objective}`
        : "Within comparable chapter/tool/objective block",
      ...measured,
      ratios: ratios(measured.axes, baseline!.axes),
      reviewFlags: flags,
    };
    previous = measured;
    return row;
  });
  return {
    method: {
      fixedStep: FIXED_STEP,
      arenaWidth: ARENA_WIDTH,
      arenaHeight: ARENA_HEIGHT,
      fluidAngularSpeed: FLUID_ANGULAR_SPEED,
      fluidWallInset: FLUID_WALL_INSET,
      playerHitboxHeight: PLAYER_HITBOX_HEIGHT,
      maxTargets: MAX_TARGETS,
      overloadDuration: OVERLOAD_DURATION,
      targetPresets: TARGET_PRESETS,
      weapons: WEAPON_CONFIGS,
      dualFireInterval: DUAL_FIRE_INTERVAL,
      limits: [
        "Config metrics are a vector, not a global difficulty score or proof of fun.",
        "Analytic overlap is provided only for constant-height flat floors. Sampling advances the actual floor-aware motion for one fluid cycle, comparing playerSupportY at the same x. Neither measures horizontal collision probability, tissue reflection or merges.",
        "Floor relief and exact smoothstep maximum slope describe geometry. Open firing lanes are raw gaps in the union of occupied-cell x projections, before projectile-width and player-bound trimming.",
        "Full tissue removal shot bounds assume productive shots only, 1-3 occupied cells per shot, and no hazard erosion. They are not required completion work: cover may be bypassed, hazards carve it, and missed/redundant shots are unbounded.",
        "Unopened pocket removal trees are optional and separate from mandatory workload. Finite clear-stage hit bounds add at most one hit per budgeted successful merge, shared across all targets. Maintenance totals remain play-dependent.",
        "Phases own initial targets and every finite group. Total workload and allAuthoredLeafCapacity sum every group as authored potential, not simultaneous density. The leaf axis uses the maximum phase leaf ceiling; clear-gated phase arrivals have no fixed arrival rate.",
        "Maximum plaque leaf capacity sums initial, finite scheduled and optional pocket plaque leaves for unphased stages; phased stages use the maximum phase plaque leaves plus optional pocket leaves. Merges conserve leaf mass. Recurring plaque entries have no finite authored total; platelet capacity still requires runtime admission.",
        "Support pockets contain no hazard targets and add no removal work. Their shell tissue remains in occupied cover geometry and productive carving-shot bounds.",
        "Scheduler-only no-fire samples continue to expiry without damage, firing or target removal; they are not survival/completion runs.",
        "Nominal opportunities floor(duration/interval) do not reproduce warning, expiry or capacity rules. Maintenance workload and leaf totals are not guaranteed.",
        "Ideal throughput assumes perfect useful hits, ignoring travel and active caps; stent also has one live projectile. Optimistic firing work is not completion time.",
        "Ratios use each contiguous chapter/tool/objective block introduction; zero baselines are undefined. Maintenance workload/leaf ratios use initial targets, movement/precision use recurring entry means.",
        "Novelty is retained as authored briefing and actual entry data, never numeric points. Review flags require reviewer inspection.",
      ],
    },
    stages,
  };
}
