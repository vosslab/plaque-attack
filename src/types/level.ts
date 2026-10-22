import type { LogicalPoint } from "./player";

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type Act = 1 | 2 | 3;
export type PlaqueSize = "large" | "medium" | "small" | "tiny";
export type PlateletSize = "small" | "tiny";
export type DrugKind = "aspirin" | "clopidogrel";
export type ProjectileKind = "stent" | DrugKind;
export type WeaponMode = ProjectileKind | "dual";
export type HorizontalDirection = -1 | 1;

export type TargetSpawn =
  | { kind: "plaque"; size: PlaqueSize; position: LogicalPoint; direction: HorizontalDirection }
  | {
      kind: "platelet";
      size: PlateletSize;
      position: LogicalPoint;
      direction: HorizontalDirection;
    };

export type ScheduledSpawn = {
  // Seconds of active play; ready and paused time do not advance this schedule.
  at: number;
  target: TargetSpawn;
};

export type ClearObjective = {
  kind: "clear";
  reinforcements: readonly ScheduledSpawn[];
};

export type MaintenanceObjective = {
  kind: "maintenance";
  duration: number;
  safeMaximum: number;
  spawnInterval: number;
  // Entry choices are selected by the simulation seed, never by the renderer.
  entries: readonly TargetSpawn[];
};

export type LevelObjective = ClearObjective | MaintenanceObjective;
export type LevelConfig = {
  id: LevelId;
  act: Act;
  name: string;
  briefing: string;
  weapon: WeaponMode;
  speedMultiplier: number;
  initialTargets: readonly TargetSpawn[];
  objective: LevelObjective;
  fact: string | undefined;
};

export type TargetPreset = {
  radius: number;
  horizontalSpeed: number;
  bounceRise: number;
  points: number;
};

export type WeaponConfig = {
  speed: number;
  interval: number;
  activeLimit: number;
  width: number;
  range: number;
  lifetime: number;
  targetLimit: number;
};
