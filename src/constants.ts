import { ARENA_LAYOUTS, MERGE_RULES } from "./arena_layouts";
import { logicalCoordinate } from "./brands";
import type {
  ArenaLayout,
  LevelConfig,
  MergeRule,
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
// Radians per second at normal campaign speed; shared by every lipid size.
export const FLUID_ANGULAR_SPEED = 0.6;
// Keep circulating bodies suspended off the walls while retaining player contact.
export const FLUID_WALL_INSET = 24;
export const FIXED_STEP = 1 / 60;
export const MAX_FRAME_TIME = 0.1;
export const PLAYER_SPEED = 300;
export { PLAYER_WIDTH, PLAYER_HEIGHT } from "./player_dimensions";
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
  large: { radius: 58, horizontalSpeed: 72, points: 100 },
  medium: { radius: 40, horizontalSpeed: 84, points: 150 },
  small: { radius: 26, horizontalSpeed: 94, points: 200 },
  tiny: { radius: 16, horizontalSpeed: 104, points: 250 },
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
function plaque(size: PlaqueSize, x: number, direction: -1 | 1, y = 120): TargetSpawn {
  return {
    kind: "plaque",
    size,
    position: { x: logicalCoordinate(x), y: logicalCoordinate(y) },
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

function entries(xs: readonly number[]): TargetSpawn[] {
  return xs.map((x, index): TargetSpawn => ({
    kind: "platelet",
    size: "tiny",
    position: { x: logicalCoordinate(x), y: logicalCoordinate(index % 2 === 0 ? 100 : 165) },
    direction: x < ARENA_WIDTH / 2 ? 1 : x > ARENA_WIDTH / 2 ? -1 : index % 2 === 0 ? 1 : -1,
  }));
}

function mixedPlatelets(small: number, tiny: number): TargetSpawn[] {
  let remainingSmall = small;
  let remainingTiny = tiny;
  return platelets(small + tiny, "small").map((target, index): TargetSpawn => {
    const useTiny = remainingTiny > 0 && (index % 2 === 1 || remainingSmall === 0);
    if (useTiny) remainingTiny -= 1;
    else remainingSmall -= 1;
    return target.kind === "platelet" ? { ...target, size: useTiny ? "tiny" : "small" } : target;
  });
}

function reinforcements(
  count: number,
  interval: number,
  entries: readonly TargetSpawn[],
): ScheduledSpawn[] {
  return Array.from({ length: count }, (_, index): ScheduledSpawn => {
    const target = entries[index % entries.length];
    if (target === undefined) throw new Error("No configured platelet entry");
    return { at: (index + 1) * interval, target };
  });
}

// Explicit flat defaults for isolated configurations and baseline comparisons.
export const DEFAULT_ARENA: ArenaLayout = {
  floor: {
    controlPoints: [
      { x: logicalCoordinate(0), y: logicalCoordinate(ARENA_HEIGHT) },
      { x: logicalCoordinate(ARENA_WIDTH), y: logicalCoordinate(ARENA_HEIGHT) },
    ],
  },
  tissue: [],
  pockets: [],
};

export const DISABLED_MERGE_RULE: MergeRule = { probability: 0, cooldown: 0, budget: 0 };

export const LEVELS: Readonly<Record<LevelId, LevelConfig>> = {
  1: {
    id: 1,
    act: 1,
    chapter: 1,
    scene: "scene-endothelium",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "First blockage",
    weapon: "stent",
    speedMultiplier: 0.55,
    arena: ARENA_LAYOUTS[1],
    merge: MERGE_RULES[1],
    briefing:
      "Move, fire upward, and split every plaque fragment. Arcade model: real stents hold arteries open.",
    initialTargets: [plaque("medium", 480, 1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: "Atherosclerosis involves plaque buildup in artery walls.",
  },
  16: {
    id: 16,
    act: 1,
    chapter: 1,
    scene: "scene-fatty-streak",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Little trouble",
    weapon: "stent",
    speedMultiplier: 0.6,
    arena: ARENA_LAYOUTS[16],
    merge: MERGE_RULES[16],
    briefing: "Clear one medium family and a small fragment drifting on crossing currents.",
    initialTargets: [plaque("medium", 350, 1), plaque("small", 650, -1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  2: {
    id: 2,
    act: 1,
    chapter: 1,
    scene: "scene-fatty-streak",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Crossing currents",
    weapon: "stent",
    speedMultiplier: 0.65,
    arena: ARENA_LAYOUTS[2],
    merge: MERGE_RULES[2],
    briefing: "Track one large family as its fragments drift through the bloodstream.",
    initialTargets: [plaque("large", 480, 1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  3: {
    id: 3,
    act: 1,
    chapter: 1,
    scene: "scene-fibrous-cap",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Three-way squeeze",
    weapon: "stent",
    speedMultiplier: 0.75,
    arena: ARENA_LAYOUTS[3],
    merge: MERGE_RULES[3],
    briefing: "Track a large family, a medium family, and a small fragment crossing the arena.",
    initialTargets: [plaque("large", 200, 1), plaque("medium", 480, -1), plaque("small", 760, -1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: "A coronary stent helps hold a narrowed artery open.",
  },
  4: {
    id: 4,
    act: 1,
    chapter: 1,
    scene: "scene-fibrous-cap",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Lesion junction",
    weapon: "stent",
    speedMultiplier: 0.85,
    arena: ARENA_LAYOUTS[4],
    merge: MERGE_RULES[4],
    briefing: "Manage three splitting families. Smaller fragments move faster.",
    initialTargets: [plaque("large", 200, 1), plaque("medium", 480, -1), plaque("large", 760, 1)],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  5: {
    id: 5,
    act: 1,
    chapter: 1,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Plaque crescendo",
    weapon: "stent",
    speedMultiplier: 1.0,
    arena: ARENA_LAYOUTS[5],
    merge: MERGE_RULES[5],
    briefing: "Keep moving through four families with staggered starting heights.",
    initialTargets: [
      plaque("large", 150, 1, 100),
      plaque("large", 370, -1, 150),
      plaque("large", 590, 1, 100),
      plaque("large", 810, -1, 150),
    ],
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  6: {
    id: 6,
    act: 2,
    chapter: 2,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Aspirin arcade",
    weapon: "aspirin",
    speedMultiplier: 0.85,
    arena: ARENA_LAYOUTS[6],
    merge: MERGE_RULES[6],
    briefing:
      "New target: platelet activation. Antiplatelet drugs help prevent clot formation. Inactivate all four hazards.",
    initialTargets: platelets(4, "small"),
    objective: { kind: "clear", reinforcements: [] },
    fact: "Aspirin reduces platelet activity and helps prevent blood clots.",
  },
  17: {
    id: 17,
    act: 2,
    chapter: 2,
    scene: "scene-platelet-adhesion",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Pocket-sized panic",
    weapon: "aspirin",
    speedMultiplier: 0.9,
    arena: ARENA_LAYOUTS[17],
    merge: MERGE_RULES[17],
    briefing: "Alternate your attention between small and tiny hazards. Inactivate all six.",
    initialTargets: mixedPlatelets(3, 3),
    objective: { kind: "clear", reinforcements: [] },
    fact: undefined,
  },
  7: {
    id: 7,
    act: 2,
    chapter: 2,
    scene: "scene-platelet-adhesion",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Platelet parade",
    weapon: "aspirin",
    speedMultiplier: 0.9,
    arena: ARENA_LAYOUTS[7],
    merge: MERGE_RULES[7],
    briefing: "Watch alternating outer entries. Inactivate all 12 hazards.",
    initialTargets: platelets(4, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(8, 3, entries([160, 800])) },
    fact: undefined,
  },
  18: {
    id: 18,
    act: 2,
    chapter: 2,
    scene: "scene-platelet-adhesion",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Side-to-side",
    weapon: "aspirin",
    speedMultiplier: 0.95,
    arena: ARENA_LAYOUTS[18],
    merge: MERGE_RULES[18],
    briefing:
      "Cross the low central basin between raised flanks. Read the left-left-right-right parade and clear 14 hazards.",
    initialTargets: platelets(4, "small"),
    objective: {
      kind: "clear",
      reinforcements: reinforcements(10, 2.7, entries([160, 160, 800, 800])),
    },
    fact: undefined,
  },
  19: {
    id: 19,
    act: 2,
    chapter: 2,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Center stage",
    weapon: "aspirin",
    speedMultiplier: 1,
    arena: ARENA_LAYOUTS[19],
    merge: MERGE_RULES[19],
    briefing: "Return to the center between outer entries. Inactivate all 16 hazards.",
    initialTargets: platelets(4, "small"),
    objective: {
      kind: "clear",
      reinforcements: reinforcements(12, 2.4, entries([480, 160, 480, 800])),
    },
    fact: undefined,
  },
  20: {
    id: 20,
    act: 2,
    chapter: 2,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Aspirin encore",
    weapon: "aspirin",
    speedMultiplier: 1.05,
    arena: ARENA_LAYOUTS[20],
    merge: MERGE_RULES[20],
    briefing: "Track the four-position fan and inactivate all 20 hazards.",
    initialTargets: platelets(4, "small"),
    objective: {
      kind: "clear",
      reinforcements: reinforcements(16, 2.1, entries([160, 640, 320, 800])),
    },
    fact: undefined,
  },
  8: {
    id: 8,
    act: 2,
    chapter: 3,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Slow shot, big chance",
    weapon: "clopidogrel",
    speedMultiplier: 0.85,
    arena: ARENA_LAYOUTS[8],
    merge: MERGE_RULES[8],
    briefing: "Line up persistent shots. Each can inactivate three distinct hazards. Clear all 12.",
    initialTargets: platelets(6, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(6, 4, entries([480])) },
    fact: "Clopidogrel blocks the platelet P2Y12 receptor, reducing platelet activation.",
  },
  21: {
    id: 21,
    act: 2,
    chapter: 3,
    scene: "scene-platelet-adhesion",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Three in a line",
    weapon: "clopidogrel",
    speedMultiplier: 0.9,
    arena: ARENA_LAYOUTS[21],
    merge: MERGE_RULES[21],
    briefing:
      "Work the broad central shelf or its lower flanks. Use persistent shots to clear 16 hazards.",
    initialTargets: platelets(6, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(10, 3, entries([320, 640])) },
    fact: undefined,
  },
  9: {
    id: 9,
    act: 2,
    chapter: 3,
    scene: "scene-platelet-adhesion",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Better together",
    weapon: "dual",
    speedMultiplier: 0.9,
    arena: ARENA_LAYOUTS[9],
    merge: MERGE_RULES[9],
    briefing: "Shots alternate automatically. Find the rhythm and inactivate all 18 hazards.",
    initialTargets: platelets(6, "small"),
    objective: { kind: "clear", reinforcements: reinforcements(12, 2.5, entries([160, 800])) },
    fact: undefined,
  },
  22: {
    id: 22,
    act: 2,
    chapter: 3,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Crossfire chorus",
    weapon: "dual",
    speedMultiplier: 1,
    arena: ARENA_LAYOUTS[22],
    merge: MERGE_RULES[22],
    briefing: "Read opposing entries followed by an outer fan. Inactivate all 20 hazards.",
    initialTargets: mixedPlatelets(4, 4),
    objective: {
      kind: "clear",
      reinforcements: reinforcements(12, 2.3, entries([320, 640, 160, 800])),
    },
    fact: undefined,
  },
  23: {
    id: 23,
    act: 2,
    chapter: 3,
    scene: "scene-platelet-adhesion",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Tiny target tango",
    weapon: "dual",
    speedMultiplier: 1.05,
    arena: ARENA_LAYOUTS[23],
    merge: MERGE_RULES[23],
    briefing:
      "Cross the off-center tissue shoulder as tiny targets change columns. Inactivate all 26 hazards.",
    initialTargets: mixedPlatelets(4, 6),
    objective: {
      kind: "clear",
      reinforcements: reinforcements(16, 2, entries([160, 480, 800, 320, 640])),
    },
    fact: undefined,
  },
  10: {
    id: 10,
    act: 2,
    chapter: 3,
    scene: "scene-healed-flow",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Find your flow",
    weapon: "dual",
    speedMultiplier: 1,
    arena: ARENA_LAYOUTS[10],
    merge: MERGE_RULES[10],
    briefing:
      "Keep eight or fewer hazards for 40 seconds. Recover from overload within five seconds.",
    initialTargets: platelets(4, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 40,
      safeMaximum: 8,
      spawnInterval: 3,
      entryOrder: "cycle",
      entries: entries([160, 800]),
    },
    fact: undefined,
  },
  11: {
    id: 11,
    act: 3,
    chapter: 4,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Recovery groove",
    weapon: "dual",
    speedMultiplier: 1,
    arena: ARENA_LAYOUTS[11],
    merge: MERGE_RULES[11],
    briefing: "Sustain the outer left-right rhythm for 40 seconds with eight or fewer hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 40,
      safeMaximum: 8,
      spawnInterval: 2.8,
      entryOrder: "cycle",
      entries: entries([160, 800]),
    },
    fact: "Long-term cardiovascular care can combine medicines with lifestyle changes.",
  },
  12: {
    id: 12,
    act: 3,
    chapter: 4,
    scene: "scene-healed-flow",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Rehab rhythm",
    weapon: "dual",
    speedMultiplier: 1.02,
    arena: ARENA_LAYOUTS[12],
    merge: MERGE_RULES[12],
    briefing: "Follow the left-left-right-right rhythm for 45 seconds with seven or fewer hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 45,
      safeMaximum: 7,
      spawnInterval: 2.5,
      entryOrder: "cycle",
      entries: entries([160, 160, 800, 800]),
    },
    fact: undefined,
  },
  13: {
    id: 13,
    act: 3,
    chapter: 4,
    scene: "scene-stented-lumen",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Centerline shuffle",
    weapon: "dual",
    speedMultiplier: 1.04,
    arena: ARENA_LAYOUTS[13],
    merge: MERGE_RULES[13],
    briefing: "Return through the center for 45 seconds with six or fewer hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 45,
      safeMaximum: 6,
      spawnInterval: 2.2,
      entryOrder: "cycle",
      entries: entries([480, 160, 480, 800]),
    },
    fact: undefined,
  },
  14: {
    id: 14,
    act: 3,
    chapter: 4,
    scene: "scene-healed-flow",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Keep the beat",
    weapon: "dual",
    speedMultiplier: 1.06,
    arena: ARENA_LAYOUTS[14],
    merge: MERGE_RULES[14],
    briefing:
      "Keep five or fewer hazards for 50 seconds through a left-center-right-center rhythm.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 50,
      safeMaximum: 5,
      spawnInterval: 1.9,
      entryOrder: "cycle",
      entries: entries([160, 480, 800, 480]),
    },
    fact: undefined,
  },
  24: {
    id: 24,
    act: 3,
    chapter: 4,
    scene: "scene-healed-flow",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Last-lap lipids",
    weapon: "dual",
    speedMultiplier: 1.08,
    arena: ARENA_LAYOUTS[24],
    merge: MERGE_RULES[24],
    briefing:
      "Follow the traveling sweep across the basin for 50 seconds with five or fewer hazards. Wall plaque remains scenery.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 50,
      safeMaximum: 5,
      spawnInterval: 1.7,
      entryOrder: "cycle",
      entries: entries([160, 320, 640, 800]),
    },
    fact: undefined,
  },
  15: {
    id: 15,
    act: 3,
    chapter: 4,
    scene: "scene-healed-flow",
    lipidVariants: [
      "lipid-amber",
      "lipid-pear",
      "lipid-ruffled",
      "lipid-lobed",
      "lipid-dimpled",
      "lipid-swirl",
    ],
    name: "Flow state finale",
    weapon: "dual",
    speedMultiplier: 1.1,
    arena: ARENA_LAYOUTS[15],
    merge: MERGE_RULES[15],
    briefing:
      "Move between the central shelf and lower flanks. Complete 60 seconds with four or fewer hazards.",
    initialTargets: platelets(3, "tiny"),
    objective: {
      kind: "maintenance",
      duration: 60,
      safeMaximum: 4,
      spawnInterval: 1.5,
      entryOrder: "cycle",
      entries: entries([160, 640, 800, 320]),
    },
    fact: undefined,
  },
};

export const LEVEL_IDS: readonly LevelId[] = [
  1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10, 11, 12, 13, 14, 24, 15,
];

export function getLevel(id: LevelId): LevelConfig {
  return LEVELS[id];
}

export function nextLevelId(id: LevelId): LevelId | undefined {
  return LEVEL_IDS[LEVEL_IDS.indexOf(id) + 1];
}

// Stable IDs identify content; positions own progression and displayed stage numbers.
export function campaignPosition(id: LevelId): number {
  return LEVEL_IDS.indexOf(id) + 1;
}

export function isLevelUnlocked(id: LevelId, unlockedLevel: LevelId): boolean {
  return campaignPosition(id) <= campaignPosition(unlockedLevel);
}
