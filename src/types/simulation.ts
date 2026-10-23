import type { ProjectileId, RandomSeed, TargetId } from "../brands";
import type { SimulationEvent } from "./events";
import type { DrugKind, LevelConfig, PlaqueSize, PlateletSize, TargetSpawn } from "./level";
import type { InputState, LogicalPoint, PlayerState } from "./player";

export type Velocity = { x: number; y: number };
export type TargetMotionSegment = {
  // Normalized times within one tick, ordered in [0, 1].
  startTime: number;
  endTime: number;
  start: LogicalPoint;
  end: LogicalPoint;
};
type TargetBody = {
  id: TargetId;
  position: LogicalPoint;
  previousPosition: LogicalPoint;
  // Piecewise swept path, including reflections; empty before the first motion step.
  motionSegments: TargetMotionSegment[];
  velocity: Velocity;
  // Vertical fluid orbit is deterministic and continuous from the spawn position.
  fluidPhase: number;
  fluidAngularSpeed: number;
  // Physical impulses replace the authored orbit with persistent reflected fluid drift.
  motionKind?: "impulse";
  radius: number;
  // Children created on tick N first participate in collision on tick N + 1.
  activeFromTick: number;
  // Active-play elapsed seconds; inherited by split descendants.
  mergeCooldownUntil: number;
};
export type PlaqueBehaviorState =
  | {
      kind: "sticky";
      // Active-play seconds; zero means free motion. Restore the inward velocity on release.
      pauseRemaining: number;
      resumeVelocityX: number;
      resumeVelocityY?: number;
    }
  | { kind: "heavy" }
  | { kind: "unstable"; splitRemaining: number };

export type PlaqueTarget = TargetBody & {
  kind: "plaque";
  size: PlaqueSize;
  behavior?: PlaqueBehaviorState;
};
export type PlateletTarget = TargetBody & { kind: "platelet"; size: PlateletSize };
// Only active hazards belong here. Removed/inactive visual remnants are renderer effects.
export type Target = PlaqueTarget | PlateletTarget;

type ProjectileBody = {
  id: ProjectileId;
  position: LogicalPoint;
  previousPosition: LogicalPoint;
  origin: LogicalPoint;
  age: number;
};
export type StentProjectile = ProjectileBody & {
  kind: "stent";
  ceilingTime: number;
};
export type DrugProjectile = ProjectileBody & {
  kind: DrugKind;
  hitTargetIds: TargetId[];
};
export type Projectile = StentProjectile | DrugProjectile;

export type RunMode = "campaign" | "practice";
export type ActivePhase = "ready" | "playing";
export type SimulationPhase =
  ActivePhase | "paused" | "level_complete" | "game_over" | "campaign_complete";

export type SpawnWarning = {
  target: TargetSpawn;
  remaining: number;
  selectedAfterShift?: boolean;
};

export type WaveState = {
  // Number of finite reinforcements already spawned, not number currently alive.
  spawned: number;
  nextSpawnAt: number;
  warning: SpawnWarning | undefined;
  shiftedArrivalSpawned: boolean;
};

export type RuntimeTissueCell = {
  id: string;
  position: LogicalPoint;
  occupied: boolean;
};

export type FrozenTissueCell = {
  readonly patchId: string;
  readonly cellId: string;
  readonly position: Readonly<LogicalPoint>;
};

export type TissueErosionRequest = {
  readonly cell: FrozenTissueCell;
  readonly cause: "projectile" | "target";
};

// Occupancy is an immutable snapshot from tick start; repeated erosion requests
// are deduplicated by cell key and committed once after the tick's interactions.
export type TissueTick = {
  readonly cells: readonly FrozenTissueCell[];
  readonly erosion: Map<string, TissueErosionRequest>;
};

export type RuntimeTissuePatch = {
  id: string;
  pocketId: string | undefined;
  cells: RuntimeTissueCell[];
};

export type RuntimePocket = {
  id: string;
  status: "sealed" | "pending" | "released";
  warningRemaining: number;
  // Next authored content index; advances only when its insertion is committed.
  nextContentIndex: number;
};

export type PendingTargetInsertion =
  | { kind: "pocket"; pocketId: string; contentIndex: number; target: TargetSpawn }
  | { kind: "split"; sourceId: TargetId; target: Target };

export type TissueContactLatch = {
  targetId: TargetId;
  patchId: string;
  touching: boolean;
  // Active-play elapsed seconds; erosion needs both re-entry and cooldown.
  lastErosionAt: number;
};

export type ArenaState = {
  tissue: RuntimeTissuePatch[];
  pockets: RuntimePocket[];
  pendingInsertions: PendingTargetInsertion[];
  tissueContacts: TissueContactLatch[];
};

export type MergeState = {
  remainingBudget: number;
  // Previous tick's touching pairs, keyed `${lowerTargetId}:${higherTargetId}`.
  contacts: Set<string>;
  // Attempt history uses the same sorted keys; prune entries when either ID is removed.
  // Per-target mergeCooldownUntil is the authoritative cooldown clock.
  lastAttemptTicks: Map<string, number>;
};

// One current and its cooldown are shared by every switch in the stage.
export type FlowState =
  | { kind: "ready" }
  | { kind: "active"; switchId: string; remaining: number }
  | { kind: "cooldown"; remaining: number };

export type RuntimeSupportPocket = {
  id: string;
  status: "sealed" | "released" | "collected";
  capsulePosition: LogicalPoint | undefined;
};

export type RuntimeClearancePulse = {
  activated: boolean;
};

export type FinaleState = {
  phaseIndex: number;
  transitionRemaining: number;
};

export type StageRetryState = {
  // Capture before any stage RNG advances; levelStartScore owns the score checkpoint.
  entrySeed: RandomSeed;
  // A run total, carried across stage advances; practice never commits a campaign record.
  retryCount: number;
};

export type RemixState = {
  flow: FlowState;
  supportPockets: RuntimeSupportPocket[];
  clearancePulse?: RuntimeClearancePulse;
  contactShield: boolean;
  finale: FinaleState | undefined;
  retry: StageRetryState;
};

export type SimulationState = {
  mode: RunMode;
  phase: SimulationPhase;
  resumePhase: ActivePhase;
  level: LevelConfig;
  player: PlayerState;
  targets: Target[];
  projectiles: Projectile[];
  tick: number;
  seed: RandomSeed;
  nextTargetId: number;
  nextProjectileId: number;
  readyRemaining: number;
  elapsed: number;
  fireCooldown: number;
  nextDrug: DrugKind;
  overloadElapsed: number;
  steadyFlowSeconds: number;
  survivalSecondsAwarded: number;
  score: number;
  levelStartScore: number;
  streak: number;
  levelLivesLost: number;
  completionAwarded: boolean;
  recordCommitted: boolean;
  waves: WaveState;
  arena: ArenaState;
  merge: MergeState;
  remix: RemixState;
};

// Pure of browser I/O; the sole owner mutates state and returns this tick's events.
export type SimulationStep = (
  state: SimulationState,
  input: Readonly<InputState>,
  dt: number,
) => SimulationEvent[];
