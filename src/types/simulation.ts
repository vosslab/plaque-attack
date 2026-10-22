import type { ProjectileId, RandomSeed, TargetId } from "../brands";
import type { SimulationEvent } from "./events";
import type { DrugKind, LevelConfig, PlaqueSize, PlateletSize, TargetSpawn } from "./level";
import type { InputState, LogicalPoint, PlayerState } from "./player";

export type Velocity = { x: number; y: number };
type TargetBody = {
  id: TargetId;
  position: LogicalPoint;
  previousPosition: LogicalPoint;
  velocity: Velocity;
  radius: number;
  // Children created on tick N first participate in collision on tick N + 1.
  activeFromTick: number;
};
export type PlaqueTarget = TargetBody & { kind: "plaque"; size: PlaqueSize };
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
};

export type WaveState = {
  // Number of finite reinforcements already spawned, not number currently alive.
  spawned: number;
  nextSpawnAt: number;
  warning: SpawnWarning | undefined;
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
  survivalSecondsAwarded: number;
  score: number;
  levelStartScore: number;
  streak: number;
  levelLivesLost: number;
  completionAwarded: boolean;
  recordCommitted: boolean;
  waves: WaveState;
};

// Pure of browser I/O; the sole owner mutates state and returns this tick's events.
export type SimulationStep = (
  state: SimulationState,
  input: Readonly<InputState>,
  dt: number,
) => SimulationEvent[];
