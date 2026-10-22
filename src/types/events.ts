import type { ProjectileId, TargetId } from "../brands";
import type { LevelId, PlaqueSize, PlateletSize, ProjectileKind } from "./level";
import type { LogicalPoint } from "./player";

export type ShotEvent = {
  type: "shot";
  projectileId: ProjectileId;
  kind: ProjectileKind;
  position: LogicalPoint;
};
export type TargetHitEvent = {
  type: "target_hit";
  targetId: TargetId;
  projectileId: ProjectileId;
  targetKind: "plaque" | "platelet";
  size: PlaqueSize | PlateletSize;
  position: LogicalPoint;
  points: number;
  streak: number;
  split: boolean;
};
export type DamageEvent = {
  type: "damage";
  cause: "contact" | "overload";
  lives: number;
  position: LogicalPoint;
};
export type LevelCompleteEvent = {
  type: "level_complete";
  levelId: LevelId;
  points: number;
};
export type RunEndEvent = {
  type: "run_end";
  outcome: "completed" | "ended";
  score: number;
  levelId: LevelId;
};
export type SpawnEvent = {
  type: "spawn";
  targetId: TargetId;
  position: LogicalPoint;
};
export type OverloadEvent = { type: "overload"; active: boolean };
export type SurvivalEvent = { type: "survival_points"; points: number };

export type TissueErodedEvent = {
  type: "tissue_eroded";
  patchId: string;
  cellIds: string[];
  position: LogicalPoint;
  cause: "projectile" | "target";
};
export type PocketBreachedEvent = {
  type: "pocket_breached";
  pocketId: string;
  position: LogicalPoint;
};
export type PocketReleasedEvent = {
  type: "pocket_released";
  pocketId: string;
  targetIds: TargetId[];
  position: LogicalPoint;
};
export type TargetsMergedEvent = {
  type: "targets_merged";
  parentIds: readonly [TargetId, TargetId];
  targetId: TargetId;
  size: PlaqueSize;
  position: LogicalPoint;
};

export type SimulationEvent =
  | ShotEvent
  | TargetHitEvent
  | DamageEvent
  | LevelCompleteEvent
  | RunEndEvent
  | SpawnEvent
  | OverloadEvent
  | SurvivalEvent
  | TissueErodedEvent
  | PocketBreachedEvent
  | PocketReleasedEvent
  | TargetsMergedEvent;
