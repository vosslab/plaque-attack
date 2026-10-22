import { logicalCoordinate } from "./brands";
import type {
  ArenaLayout,
  FloorProfile,
  LevelId,
  MergeRule,
  PocketDefinition,
  TissuePatch,
} from "./types/level";

import type { LogicalPoint } from "./types/player";

function point(x: number, y: number): Readonly<LogicalPoint> {
  return Object.freeze({ x: logicalCoordinate(x), y: logicalCoordinate(y) });
}

// Smoothstep's maximum derivative is 1.5 times the control-point rise/run.
// These profiles therefore stay at or below 0.20, including the 32px wave.
const FLAT: FloorProfile = Object.freeze({
  controlPoints: Object.freeze([point(0, 540), point(960, 540)]),
});
const GENTLE: FloorProfile = Object.freeze({
  controlPoints: Object.freeze([
    point(0, 540),
    point(240, 524),
    point(480, 540),
    point(720, 524),
    point(960, 540),
  ]),
});
const WAVE: FloorProfile = Object.freeze({
  controlPoints: Object.freeze([
    point(0, 540),
    point(240, 508),
    point(480, 540),
    point(720, 508),
    point(960, 540),
  ]),
});
const SLOPE: FloorProfile = Object.freeze({
  controlPoints: Object.freeze([point(0, 540), point(480, 492), point(960, 540)]),
});

// Rows describe actual occupied 12px cells, including the rounded shoulders and
// hollow arch. Stable row/column IDs also identify each shot's horizontal notch.
function patch(
  id: string,
  x: number,
  y: number,
  rows: readonly string[],
  pocketId: string | undefined = undefined,
): TissuePatch {
  const cells = rows.flatMap((row, rowIndex) =>
    Array.from(row).flatMap((occupied, columnIndex) =>
      occupied === "#"
        ? [
            Object.freeze({
              id: `${id}:${rowIndex}:${columnIndex}`,
              position: point(x + columnIndex * 12, y + rowIndex * 12),
            }),
          ]
        : [],
    ),
  );
  return Object.freeze({ id, cells: Object.freeze(cells), pocketId });
}

const PAIRED = Object.freeze([
  patch("paired-left", 222, 342, [".######.", "########", "########", ".######."]),
  patch("paired-right", 642, 342, [".######.", "########", "########", ".######."]),
]);
const OFFSET = Object.freeze([
  patch("offset-left", 204, 330, [".######.", "########", "########", ".######."]),
  patch("offset-right", 660, 354, ["..######.", ".########", "#########", ".#######."]),
]);
const ARCH = Object.freeze([
  patch("arch", 180, 330, [
    "...############...",
    ".################.",
    "##################",
    "#####........#####",
    ".####........####.",
    ".###..........###.",
  ]),
]);

// The optional encounter is spatially separate from every cover silhouette.
// Its two 32px-diameter contents fit in the hollow interior without touching it.
const POCKET_ID = "membrane-pocket";
const POCKET_SHELL = patch(
  "membrane-shell",
  36,
  330,
  [".########.", "##......##", "#........#", "#........#", "#........#", ".########."],
  POCKET_ID,
);
const SHELL_REFERENCES = Object.freeze(
  POCKET_SHELL.cells.map((cell) => Object.freeze({ patchId: POCKET_SHELL.id, cellId: cell.id })),
);
const OPTIONAL_POCKET: PocketDefinition = Object.freeze({
  id: POCKET_ID,
  shellCells: SHELL_REFERENCES,
  breachCells: Object.freeze(
    SHELL_REFERENCES.filter(
      (reference) =>
        reference.cellId === "membrane-shell:5:4" || reference.cellId === "membrane-shell:5:5",
    ),
  ),
  // Above the shell: at least 36px from every cell, and far above the surgeon.
  releasePosition: point(96, 294),
  contents: Object.freeze([
    Object.freeze({ kind: "platelet", size: "tiny", position: point(72, 372), direction: 1 }),
    Object.freeze({ kind: "platelet", size: "tiny", position: point(120, 372), direction: -1 }),
  ]),
});

function layout(
  floor: FloorProfile,
  tissue: readonly TissuePatch[] = [],
  pocket = false,
): ArenaLayout {
  return Object.freeze({
    floor,
    tissue: Object.freeze(pocket ? [...tissue, POCKET_SHELL] : [...tissue]),
    pockets: Object.freeze(pocket ? [OPTIONAL_POCKET] : []),
  });
}

// All layouts preserve the continuous x=420..540 firing lane. Cells end at
// y=402: 38px above even the highest possible muzzle (492 - 60 + 8).
// Keys are persistent level IDs, rather than campaign ordinals.
export const ARENA_LAYOUTS: Readonly<Record<LevelId, ArenaLayout>> = Object.freeze({
  1: layout(FLAT), // Stage 1
  16: layout(FLAT), // Stage 2
  2: layout(FLAT), // Stage 3
  3: layout(FLAT, PAIRED), // Stage 4: first tissue
  4: layout(GENTLE), // Stage 5: first raised floor, merging disabled
  5: layout(GENTLE, OFFSET), // Stage 6: first merging, original four large plaques
  6: layout(FLAT), // Stage 7: aspirin introduction
  17: layout(GENTLE, PAIRED), // Stage 8
  7: layout(FLAT, ARCH, true), // Stage 9: first optional pocket
  18: layout(WAVE), // Stage 10
  19: layout(GENTLE, OFFSET, true), // Stage 11
  20: layout(WAVE, PAIRED), // Stage 12
  8: layout(FLAT), // Stage 13: clopidogrel introduction
  21: layout(GENTLE, ARCH), // Stage 14
  9: layout(FLAT), // Stage 15: dual tool introduction
  22: layout(WAVE, OFFSET, true), // Stage 16
  23: layout(SLOPE, PAIRED), // Stage 17
  10: layout(FLAT), // Stage 18: maintenance introduction
  11: layout(GENTLE, PAIRED), // Stage 19
  12: layout(WAVE, [], true), // Stage 20
  13: layout(SLOPE, OFFSET), // Stage 21
  14: layout(GENTLE, ARCH, true), // Stage 22
  24: layout(WAVE, PAIRED), // Stage 23
  15: layout(SLOPE, OFFSET, true), // Stage 24
});

const MERGING_OFF: MergeRule = Object.freeze({ probability: 0, cooldown: 0, budget: 0 });
const LIPID_MERGING: MergeRule = Object.freeze({ probability: 0.18, cooldown: 1.5, budget: 1 });

export const MERGE_RULES: Readonly<Record<LevelId, MergeRule>> = Object.freeze({
  1: MERGING_OFF,
  16: MERGING_OFF,
  2: MERGING_OFF,
  3: MERGING_OFF,
  4: MERGING_OFF,
  5: LIPID_MERGING,
  6: MERGING_OFF,
  17: MERGING_OFF,
  7: MERGING_OFF,
  18: MERGING_OFF,
  19: MERGING_OFF,
  20: MERGING_OFF,
  8: MERGING_OFF,
  21: MERGING_OFF,
  9: MERGING_OFF,
  22: MERGING_OFF,
  23: MERGING_OFF,
  10: MERGING_OFF,
  11: MERGING_OFF,
  12: MERGING_OFF,
  13: MERGING_OFF,
  14: MERGING_OFF,
  24: MERGING_OFF,
  15: MERGING_OFF,
});
