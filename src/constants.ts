import { logicalCoordinate } from "./brands";
import type {
  LevelConfig,
  LevelId,
  PlaqueSize,
  ProjectileKind,
  ScheduledSpawn,
  TargetPreset,
  TargetSpawn,
  WeaponConfig,
} from "./types/level";

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 540;
export const GRAVITY = 900;
export const FIXED_STEP = 1 / 60;
export const MAX_FRAME_TIME = 0.1;
export const PLAYER_SPEED = 300;
export const PLAYER_WIDTH = 44;
export const PLAYER_HEIGHT = 60;
export const PLAYER_HITBOX_WIDTH = 28;
export const PLAYER_HITBOX_HEIGHT = 46;
export const STARTING_LIVES = 3;
export const CONTACT_INVULNERABILITY = 2;
export const READY_DURATION = 3;
export const OVERLOAD_DURATION = 5;
export const SPAWN_WARNING_DURATION = 0.75;
export const MAX_TARGETS = 32;
export const STENT_CEILING_LINGER = 0.25;
export const DUAL_FIRE_INTERVAL = 0.35;
export const DUAL_ACTIVE_LIMIT = 5;
export const LEVEL_COMPLETION_POINTS = 1000;
export const NO_DAMAGE_POINTS = 500;
export const SURVIVAL_POINTS_PER_SECOND = 10;

export const TARGET_PRESETS = {
  large: { radius: 58, horizontalSpeed: 105, bounceRise: 310, points: 100 },
  medium: { radius: 40, horizontalSpeed: 135, bounceRise: 230, points: 150 },
  small: { radius: 26, horizontalSpeed: 170, bounceRise: 150, points: 200 },
  tiny: { radius: 16, horizontalSpeed: 210, bounceRise: 90, points: 250 },
} as const satisfies Record<PlaqueSize, TargetPreset>;

export const WEAPON_CONFIGS = {
  stent: {
    speed: 900,
    interval: 0.35,
    activeLimit: 1,
    width: 8,
    range: ARENA_HEIGHT,
    lifetime: 1,
    targetLimit: 1,
  },
  aspirin: {
    speed: 700,
    interval: 0.22,
    activeLimit: 3,
    width: 12,
    range: 340,
    lifetime: 340 / 700,
    targetLimit: 1,
  },
  clopidogrel: {
    speed: 320,
    interval: 0.75,
    activeLimit: 2,
    width: 14,
    range: ARENA_HEIGHT,
    lifetime: 1.5,
    targetLimit: 3,
  },
} as const satisfies Record<ProjectileKind, WeaponConfig>;

// All authored entries are above the player's body and remain inside the logical arena.
function plaque(size: PlaqueSize, x: number, direction: -1 | 1): TargetSpawn {
  return {
    kind: "plaque",
    size,
    position: { x: logicalCoordinate(x), y: logicalCoordinate(120) },
    direction,
  };
}

function platelets(count: number, size: "small" | "tiny"): TargetSpawn[] {
  return Array.from({ length: count }, (_, index): TargetSpawn => ({
    kind: "platelet",
    size,
    position: {
      x: logicalCoordinate(((index + 1) * ARENA_WIDTH) / (count + 1)),
      y: logicalCoordinate(100 + (index % 2) * 65),
    },
    direction: index % 2 === 0 ? 1 : -1,
  }));
}

const SPAWN_ENTRIES: readonly TargetSpawn[] = platelets(4, "tiny");

function reinforcements(count: number, interval: number): ScheduledSpawn[] {
  return Array.from({ length: count }, (_, index): ScheduledSpawn => {
    const target = SPAWN_ENTRIES[index % SPAWN_ENTRIES.length];
    if (target === undefined) throw new Error("No configured platelet entry");
    return { at: (index + 1) * interval, target };
  });
}

export const LEVELS: Readonly<Record<LevelId, LevelConfig>> = {
  1: {
    id: 1,
    act: 1,
    name: "First blockage",
    weapon: "stent",
    speedMultiplier: 0.85,
    briefing:
      "Move, fire upward, and split every plaque fragment. Arcade model: real stents hold arteries open.",
    initialTargets: [plaque("large", 480, 1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: "Atherosclerosis involves plaque buildup in artery walls.",
  },
  2: {
    id: 2,
    act: 1,
    name: "Cholesterol buildup",
    weapon: "stent",
    speedMultiplier: 0.9,
    briefing: "Track two opposing arcs and clear every plaque fragment.",
    initialTargets: [plaque("large", 270, 1), plaque("large", 690, -1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  3: {
    id: 3,
    act: 1,
    name: "Narrowing artery",
    weapon: "stent",
    speedMultiplier: 1,
    briefing: "Read the mixed bounce patterns and clear every plaque fragment.",
    initialTargets: [plaque("medium", 200, 1), plaque("large", 480, -1), plaque("medium", 760, -1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: "A coronary stent helps hold a narrowed artery open.",
  },
  4: {
    id: 4,
    act: 1,
    name: "Multiple lesions",
    weapon: "stent",
    speedMultiplier: 1,
    briefing: "Manage three splitting families. Smaller fragments move faster.",
    initialTargets: [plaque("large", 200, 1), plaque("large", 480, -1), plaque("large", 760, 1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  5: {
    id: 5,
    act: 1,
    name: "Critical stenosis",
    weapon: "stent",
    speedMultiplier: 1.05,
    briefing: "Keep moving and clear all four plaque families.",
    initialTargets: [
      plaque("large", 150, 1),
      plaque("large", 370, -1),
      plaque("large", 590, 1),
      plaque("large", 810, -1),
    ],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  6: {
    id: 6,
    act: 2,
    name: "Aspirin therapy",
    weapon: "aspirin",
    speedMultiplier: 0.9,
    briefing:
      "New target: platelet activation. Antiplatelet drugs help prevent clot formation. Inactivate all four hazards.",
    initialTargets: platelets(4, "small"),
    objective: { kind: "clear", reinforcements: [] },
    fact: "Aspirin reduces platelet activity and helps prevent blood clots.",
  },
  7: {
    id: 7,
    act: 2,
    name: "Platelet activation",
    weapon: "aspirin",
    speedMultiplier: 0.9,
    briefing: "Inactivate all 12 hazards, including eight incoming tiny clusters.",
    initialTargets: platelets(4, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(8, 3) },
    fact: undefined,
  },
  8: {
    id: 8,
    act: 2,
    name: "Clopidogrel",
    weapon: "clopidogrel",
    speedMultiplier: 0.9,
    briefing: "Line up persistent shots. Each can inactivate three distinct hazards. Clear all 12.",
    initialTargets: platelets(6, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(6, 4) },
    fact: "Clopidogrel blocks the platelet P2Y12 receptor, reducing platelet activation.",
  },
  9: {
    id: 9,
    act: 2,
    name: "Dual therapy",
    weapon: "dual",
    speedMultiplier: 0.9,
    briefing: "Shots alternate automatically. Inactivate all 18 platelet hazards.",
    initialTargets: platelets(6, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(12, 2.5) },
    fact: undefined,
  },
  10: {
    id: 10,
    act: 2,
    name: "Stabilization",
    weapon: "dual",
    speedMultiplier: 1,
    briefing:
      "Keep active hazards at eight or fewer for 45 seconds. Recover from overload within five seconds.",
    initialTargets: platelets(4, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 45,
      safeMaximum: 8,
      spawnInterval: 3,
      entries: SPAWN_ENTRIES,
    },
    fact: undefined,
  },
  11: {
    id: 11,
    act: 3,
    name: "Recovery",
    weapon: "dual",
    speedMultiplier: 1,
    briefing: "Sustain control for 60 seconds with eight or fewer active hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 60,
      safeMaximum: 8,
      spawnInterval: 3,
      entries: SPAWN_ENTRIES,
    },
    fact: "Long-term cardiovascular care can combine medicines with lifestyle changes.",
  },
  12: {
    id: 12,
    act: 3,
    name: "Cardiac rehabilitation",
    weapon: "dual",
    speedMultiplier: 1,
    briefing: "Sustain control for 75 seconds with seven or fewer active hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 75,
      safeMaximum: 7,
      spawnInterval: 2.7,
      entries: SPAWN_ENTRIES,
    },
    fact: undefined,
  },
  13: {
    id: 13,
    act: 3,
    name: "Long-term prevention",
    weapon: "dual",
    speedMultiplier: 1,
    briefing: "Sustain control for 90 seconds with six or fewer active hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 90,
      safeMaximum: 6,
      spawnInterval: 2.4,
      entries: SPAWN_ENTRIES,
    },
    fact: undefined,
  },
  14: {
    id: 14,
    act: 3,
    name: "High-risk patient",
    weapon: "dual",
    speedMultiplier: 1,
    briefing: "Sustain control for 90 seconds with five or fewer active hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 90,
      safeMaximum: 5,
      spawnInterval: 2.1,
      entries: SPAWN_ENTRIES,
    },
    fact: undefined,
  },
  15: {
    id: 15,
    act: 3,
    name: "Healthy circulation",
    weapon: "dual",
    speedMultiplier: 1,
    briefing: "Complete 120 seconds of maintenance with four or fewer active hazards.",
    initialTargets: platelets(2, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 120,
      safeMaximum: 4,
      spawnInterval: 1.8,
      entries: SPAWN_ENTRIES,
    },
    fact: undefined,
  },
};

export const LEVEL_IDS: readonly LevelId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export function getLevel(id: LevelId): LevelConfig {
  return LEVELS[id];
}

export function nextLevelId(id: LevelId): LevelId | undefined {
  const index = LEVEL_IDS.indexOf(id);
  return LEVEL_IDS[index + 1];
}
