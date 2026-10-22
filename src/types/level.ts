import type { LogicalPoint } from "./player";

export type LevelId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;
export type Act = 1 | 2 | 3;
export type Chapter = 1 | 2 | 3 | 4;
export type SceneId =
  | "scene-endothelium"
  | "scene-fatty-streak"
  | "scene-fibrous-cap"
  | "scene-stented-lumen"
  | "scene-platelet-adhesion"
  | "scene-healed-flow";
export type LipidVariant =
  "lipid-amber" | "lipid-pear" | "lipid-ruffled" | "lipid-lobed" | "lipid-dimpled" | "lipid-swirl";
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

// Logical-pixel control points are sampled with smoothstep by arena_geometry.ts.
export type FloorProfile = {
  readonly controlPoints: readonly Readonly<LogicalPoint>[];
};

// Every authored tissue cell occupies a 12x12 square from this upper-left corner.
export type TissueCell = {
  readonly id: string;
  readonly position: Readonly<LogicalPoint>;
};

export type TissuePatch = {
  readonly id: string;
  readonly cells: readonly TissueCell[];
  readonly pocketId: string | undefined;
};

export type TissueCellReference = {
  readonly patchId: string;
  readonly cellId: string;
};

export type PocketDefinition = {
  readonly id: string;
  readonly shellCells: readonly TissueCellReference[];
  readonly breachCells: readonly TissueCellReference[];
  readonly releasePosition: Readonly<LogicalPoint>;
  readonly contents: readonly (Readonly<TargetSpawn> & {
    readonly position: Readonly<LogicalPoint>;
  })[];
};

export type ArenaLayout = {
  readonly floor: FloorProfile;
  readonly tissue: readonly TissuePatch[];
  readonly pockets: readonly PocketDefinition[];
};

export type MergeRule = {
  // Fraction in [0, 1], seconds, and finite nonnegative integer respectively.
  readonly probability: number;
  readonly cooldown: number;
  readonly budget: number;
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
  // Entry choice belongs to simulation; cycle makes authored rhythms repeatable.
  entryOrder: "seeded" | "cycle";
  entries: readonly TargetSpawn[];
};

export type LevelObjective = ClearObjective | MaintenanceObjective;
export type LevelConfig = {
  id: LevelId;
  act: Act;
  chapter: Chapter;
  scene: SceneId;
  lipidVariants: readonly [LipidVariant, ...LipidVariant[]];
  name: string;
  briefing: string;
  weapon: WeaponMode;
  speedMultiplier: number;
  arena: ArenaLayout;
  merge: MergeRule;
  initialTargets: readonly TargetSpawn[];
  objective: LevelObjective;
  fact: string | undefined;
};

export type TargetPreset = {
  radius: number;
  horizontalSpeed: number;
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
