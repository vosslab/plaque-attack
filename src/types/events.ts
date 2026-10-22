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

export type SimulationEvent =
  | ShotEvent
  | TargetHitEvent
  | DamageEvent
  | LevelCompleteEvent
  | RunEndEvent
  | SpawnEvent
  | OverloadEvent
  | SurvivalEvent;
