import { logicalCoordinate } from "./brands";
import { floorMinimumY } from "./floor_geometry";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./player_dimensions";
import type {
  FinalePhase,
  FlowSwitchDefinition,
  LevelConfig,
  PlateletSize,
  SupportPocketDefinition,
  TargetSpawn,
  TissuePatch,
} from "./types/level";

function platelet(
  x: number,
  y: number,
  direction: -1 | 1,
  size: PlateletSize = "small",
): TargetSpawn {
  return {
    kind: "platelet",
    size,
    position: { x: logicalCoordinate(x), y: logicalCoordinate(y) },
    direction,
  };
}

function current(x: number, laneX = x): FlowSwitchDefinition {
  return {
    id: `current-${x}`,
    position: { x: logicalCoordinate(x), y: logicalCoordinate(300) },
    laneX: logicalCoordinate(laneX),
  };
}

function withoutHazardPocket(level: LevelConfig): LevelConfig["arena"] {
  return {
    ...level.arena,
    tissue: level.arena.tissue.filter((patch) => patch.pocketId === undefined),
    pockets: [],
  };
}

function supportArena(level: LevelConfig, centerX = 132): LevelConfig["arena"] {
  const arena = withoutHazardPocket(level);
  const id = "support-shell";
  // Keep the cache above the surgeon's whole head on sloping floors. The separate
  // low flank avoids the regular shelter and leaves the capsule visible from entry.
  const y =
    floorMinimumY(arena.floor, centerX - 30 - PLAYER_WIDTH, centerX + 42 + PLAYER_WIDTH) -
    PLAYER_HEIGHT -
    66;
  const cells = Array.from({ length: 5 }, (_, index) => ({
    id: `${id}:${index}`,
    position: { x: logicalCoordinate(centerX - 30 + index * 12), y: logicalCoordinate(y) },
  }));
  const shell: TissuePatch = { id, pocketId: undefined, cells };
  const references = cells.map((cell) => ({ patchId: id, cellId: cell.id }));
  const support: SupportPocketDefinition = {
    id: "contact-aid",
    shellCells: references,
    breachCells: references,
    releasePosition: { x: logicalCoordinate(centerX), y: logicalCoordinate(y + 22) },
  };
  return { ...arena, tissue: [...arena.tissue, shell], supportPockets: [support] };
}

function finale(
  level: LevelConfig,
  phases: readonly [FinalePhase, ...FinalePhase[]],
  restoration: "artery_opening" | "restored_flow" | "restored_lining" | "patient_recovery",
): LevelConfig {
  return {
    ...level,
    initialTargets: [],
    objective: { kind: "clear", reinforcements: [], phases, restoration },
  };
}

// Stable IDs own content; constants.ts preserves the accepted display order.
export function remixCampaign(level: LevelConfig): LevelConfig {
  switch (level.id) {
    case 3:
      return {
        ...level,
        briefing:
          "Tissue shelters you but also blocks shots. Carve a notch, or move beside cover to split the three lipid families.",
      };
    case 4:
      return {
        ...level,
        arena: supportArena(level),
        briefing:
          "Carve the small support cache on the left, then walk beneath it to collect a contact shield. Clear the lipid families.",
      };
    case 5:
      return finale(
        {
          ...level,
          name: "Lipid avalanche",
          briefing:
            "Clear the left pair, then cross for the right pair. Split all four large lipid families to open the artery.",
        },
        [
          {
            name: "Left fissure",
            targets: level.initialTargets.filter((target) => target.position.x < 480),
          },
          {
            name: "Right fissure",
            targets: level.initialTargets.filter((target) => target.position.x >= 480),
          },
        ],
        "artery_opening",
      );
    case 6:
      return level;
    case 17:
    case 21:
      return {
        ...level,
        flowSwitches: [{ ...current(480), id: "center-current" }],
        briefing:
          level.id === 17
            ? "Shoot the circular flow switch to gather hazards toward the marked center lane. Clear all six with aspirin."
            : "Shoot the flow switch to gather a center column, then use persistent clopidogrel shots to hit up to three hazards.",
      };
    case 7:
      return {
        ...level,
        briefing:
          "Carve the arch for a firing lane. The left pocket is an optional risk: breaching it releases extra hazards. Clear the finite outer parade.",
      };
    case 18:
      return {
        ...level,
        name: "Choose your current",
        flowSwitches: [current(320), current(640)],
        briefing:
          "Choose the left or right switch to gather a firing lane. Only one current runs at a time; cross the basin while both cool down.",
        objective:
          level.objective.kind === "clear"
            ? {
                ...level.objective,
                reinforcements: level.objective.reinforcements.slice(0, 6),
              }
            : level.objective,
      };
    case 19:
      return {
        ...level,
        name: "Shelter and support",
        arena: supportArena(level, 828),
        briefing:
          "Use the paired shelters, or carve a lane through them. Cross to the right cache for an optional shield before the outer entries arrive.",
        objective:
          level.objective.kind === "clear"
            ? {
                ...level.objective,
                reinforcements: level.objective.reinforcements.slice(0, 6),
              }
            : level.objective,
      };
    case 20:
      return finale(
        {
          ...level,
          name: "Switchback surge",
          flowSwitches: [current(320), current(640)],
          briefing:
            "Redirect the left stream, then reposition for the right. Carved shelter stays open for the final crossing volley. Restore the flow.",
        },
        [
          {
            name: "Redirect left",
            targets: [
              platelet(150, 100, 1),
              platelet(210, 170, 1),
              platelet(280, 110, 1),
              platelet(340, 210, 1),
            ],
          },
          {
            name: "Reposition right",
            targets: [
              platelet(810, 100, -1),
              platelet(750, 170, -1),
              platelet(680, 110, -1),
              platelet(620, 210, -1),
            ],
          },
          {
            name: "Crossing volley",
            targets: [
              platelet(170, 110, 1),
              platelet(300, 200, 1, "tiny"),
              platelet(430, 140, 1),
              platelet(530, 140, -1),
              platelet(660, 200, -1, "tiny"),
              platelet(790, 110, -1),
            ],
          },
        ],
        "restored_flow",
      );
    case 8:
      return level;
    case 9:
      return {
        ...level,
        briefing:
          "Shots alternate automatically between aspirin and persistent clopidogrel. Sweep the outer entries and find the rhythm.",
        objective:
          level.objective.kind === "clear"
            ? { ...level.objective, reinforcements: level.objective.reinforcements.slice(0, 6) }
            : level.objective,
      };
    case 22:
      return {
        ...level,
        arena: supportArena(level),
        flowSwitches: [current(480)],
        briefing:
          "Gather the opposing entries into the center, or cross the rolling floor to the left shield cache. Your alternating tools keep firing automatically.",
        objective:
          level.objective.kind === "clear"
            ? { ...level.objective, reinforcements: level.objective.reinforcements.slice(0, 4) }
            : level.objective,
      };
    case 23:
      return {
        ...level,
        flowSwitches: [current(600)],
        initialTargets: level.initialTargets.slice(0, 6),
        briefing:
          "Small and tiny targets slip above the shoulder. Carve a shelter notch, then gather them into the lower right firing lane.",
        objective:
          level.objective.kind === "clear"
            ? { ...level.objective, reinforcements: level.objective.reinforcements.slice(0, 6) }
            : level.objective,
      };
    case 10: {
      const bridgeY = floorMinimumY(level.arena.floor, 382, 578) - PLAYER_HEIGHT - 30;
      const bridge: TissuePatch = {
        id: "finale-aperture",
        pocketId: undefined,
        cells: Array.from({ length: 9 }, (_, index) => ({
          id: `aperture:${index}`,
          position: { x: logicalCoordinate(426 + index * 12), y: logicalCoordinate(bridgeY) },
        })),
      };
      return finale(
        {
          ...level,
          name: "Triple-play crescendo",
          weapon: "clopidogrel",
          arena: { ...level.arena, tissue: [...level.arena.tissue, bridge] },
          flowSwitches: [current(480)],
          briefing:
            "Carve an aperture beneath the switch. Gather the next column, pierce up to three hazards per shot, then sweep the last fragments to restore the lining.",
        },
        [
          {
            name: "Carve the aperture",
            targets: [platelet(450, 120, 1), platelet(480, 210, -1), platelet(510, 300, 1)],
          },
          {
            name: "Gather and pierce",
            targets: [
              platelet(410, 100, 1),
              platelet(410, 180, 1, "tiny"),
              platelet(410, 260, 1),
              platelet(550, 100, -1),
              platelet(550, 180, -1, "tiny"),
              platelet(550, 260, -1),
            ],
          },
          {
            name: "Lining cleanup",
            targets: [
              platelet(200, 140, 1, "tiny"),
              platelet(480, 210, -1, "tiny"),
              platelet(760, 140, -1, "tiny"),
            ],
          },
        ],
        "restored_lining",
      );
    }
    case 11:
      return {
        ...level,
        flowSwitches: [current(320), current(640)],
        briefing:
          "Maintain eight or fewer hazards for 40 seconds. Choose an outer current, then use the opposite shelter while the switches cool down.",
      };
    case 12:
      return {
        ...level,
        name: "Catch your breath",
        arena: supportArena(level),
        initialTargets: [
          platelet(200, 130, 1, "tiny"),
          platelet(320, 230, -1, "tiny"),
          platelet(440, 150, 1),
          platelet(560, 250, -1, "tiny"),
          platelet(680, 170, 1),
          platelet(800, 210, -1, "tiny"),
        ],
        objective: { kind: "clear", reinforcements: [] },
        briefing:
          "A short finite clear: six hazards and no incoming wave. Collect the left shield if you want, then enjoy the open firing lanes.",
      };
    case 13:
      return {
        ...level,
        flowSwitches: [current(480)],
        briefing:
          "Maintain six or fewer hazards for 45 seconds. Gather the center entries above the crest, or work the lower flanks beside cover.",
      };
    case 14:
      return {
        ...level,
        name: "Open-lane interlude",
        arena: withoutHazardPocket(level),
        initialTargets: [
          platelet(160, 120, 1),
          platelet(270, 220, 1, "tiny"),
          platelet(380, 150, -1, "tiny"),
          platelet(480, 260, 1),
          platelet(580, 150, 1, "tiny"),
          platelet(690, 220, -1, "tiny"),
          platelet(800, 120, -1),
        ],
        objective: { kind: "clear", reinforcements: [] },
        briefing:
          "Seven hazards, no reinforcements. Keep the arch as shelter or open a notch; take this short clear at your own pace.",
      };
    case 24:
      return {
        ...level,
        name: "Steady hands",
        arena: supportArena(level, 828),
        flowSwitches: [current(320), current(640)],
        briefing:
          "Keep five or fewer hazards for 50 seconds. Gather left first; the right stream opens halfway through. Cross to gather it, or stay and carve shelter. An optional shield waits on the right.",
        objective:
          level.objective.kind === "maintenance"
            ? {
                ...level.objective,
                entries: [platelet(160, 100, 1, "tiny"), platelet(320, 165, 1, "tiny")],
                entryShift: {
                  at: 25,
                  entries: [platelet(640, 100, -1, "tiny"), platelet(800, 165, -1, "tiny")],
                  laneX: logicalCoordinate(640),
                },
              }
            : level.objective,
      };
    case 15:
      return finale(
        {
          ...level,
          name: "Restore the rhythm",
          arena: supportArena(level, 828),
          flowSwitches: [current(320), current(640)],
          briefing:
            "Open the outer lanes, cross the streams for an optional right shield, then clear the last fan. Your carved arena and shield persist through all three groups.",
        },
        [
          {
            name: "Open the rhythm",
            targets: [
              platelet(170, 120, 1),
              platelet(300, 220, 1),
              platelet(660, 220, -1),
              platelet(790, 120, -1),
            ],
          },
          {
            name: "Cross-stream choice",
            targets: [
              platelet(170, 100, 1),
              platelet(290, 190, 1, "tiny"),
              platelet(410, 280, 1),
              platelet(550, 280, -1),
              platelet(670, 190, -1, "tiny"),
              platelet(790, 100, -1),
            ],
          },
          {
            name: "The last fan",
            targets: [
              platelet(160, 130, 1, "tiny"),
              platelet(320, 210, 1, "tiny"),
              platelet(480, 290, -1, "tiny"),
              platelet(640, 210, -1, "tiny"),
              platelet(800, 130, -1, "tiny"),
            ],
          },
        ],
        "patient_recovery",
      );
    default:
      return level;
  }
}
