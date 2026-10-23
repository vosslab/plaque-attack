import { logicalCoordinate, randomSeed, targetId } from "./brands";
import { createRemixState } from "./remix_mechanics";
import { playerSupportY } from "./arena_geometry";
import type { RandomSeed } from "./brands";
import { createTarget } from "./characters";
import { ARENA_WIDTH, getLevel, nextLevelId, READY_DURATION, STARTING_LIVES } from "./constants";
import type { LevelConfig } from "./types/level";
import type { RunMode, SimulationState } from "./types/simulation";

export function createSimulation(
  level: LevelConfig,
  mode: RunMode,
  score: number = 0,
  lives: number = STARTING_LIVES,
  seed: RandomSeed = randomSeed(1),
): SimulationState {
  const firstWave =
    level.objective.kind === "clear"
      ? (level.objective.reinforcements[0]?.at ?? Infinity)
      : level.objective.spawnInterval;
  const initialTargets =
    level.objective.kind === "clear" && level.objective.phases !== undefined
      ? level.objective.phases[0].targets
      : level.initialTargets;
  const state: SimulationState = {
    remix: createRemixState(level, seed),
    mode,
    phase: "ready",
    resumePhase: "ready",
    level,
    player: {
      position: {
        x: logicalCoordinate(ARENA_WIDTH / 2),
        y: logicalCoordinate(playerSupportY(level.arena.floor, ARENA_WIDTH / 2)),
      },
      lives,
      contactInvulnerabilityRemaining: 0,
    },
    targets: initialTargets.map((spawn, index) =>
      createTarget(spawn, targetId(index + 1), level.speedMultiplier, 0, level.arena.floor),
    ),
    projectiles: [],
    tick: 0,
    seed,
    nextTargetId: initialTargets.length + 1,
    nextProjectileId: 1,
    readyRemaining: READY_DURATION,
    elapsed: 0,
    fireCooldown: 0,
    nextDrug: "aspirin",
    overloadElapsed: 0,
    survivalSecondsAwarded: 0,
    score,
    levelStartScore: score,
    streak: 0,
    levelLivesLost: 0,
    completionAwarded: false,
    recordCommitted: false,
    waves: { spawned: 0, nextSpawnAt: firstWave, warning: undefined },
    arena: {
      tissue: level.arena.tissue.map((patch) => ({
        id: patch.id,
        pocketId: patch.pocketId,
        cells: patch.cells.map((cell) => ({
          id: cell.id,
          position: { ...cell.position },
          occupied: true,
        })),
      })),
      pockets: level.arena.pockets.map((pocket) => ({
        id: pocket.id,
        status: "sealed",
        warningRemaining: 0,
        nextContentIndex: 0,
      })),
      pendingInsertions: [],
      tissueContacts: [],
    },
    merge: {
      remainingBudget: level.merge.budget,
      contacts: new Set(),
      lastAttemptTicks: new Map(),
    },
  };
  return state;
}

export function pauseSimulation(state: SimulationState): boolean {
  if (state.phase !== "playing" && state.phase !== "ready") return false;
  state.resumePhase = state.phase;
  state.phase = "paused";
  return true;
}

export function resumeSimulation(state: SimulationState): boolean {
  if (state.phase !== "paused") return false;
  state.phase = state.resumePhase;
  return true;
}

// A fresh object resets every per-level clock while preserving campaign lives and score.
export function advanceLevel(state: Readonly<SimulationState>): SimulationState | undefined {
  if (state.mode !== "campaign" || state.phase !== "level_complete") return undefined;
  const next = nextLevelId(state.level.id);
  if (next === undefined) return undefined;
  const result = createSimulation(
    getLevel(next),
    state.mode,
    state.score,
    state.player.lives,
    state.seed,
  );
  result.remix.retry.retryCount = state.remix.retry.retryCount;
  return result;
}

export function retryLevel(state: Readonly<SimulationState>): SimulationState {
  const result = createSimulation(
    state.level,
    state.mode,
    state.levelStartScore,
    STARTING_LIVES,
    state.remix.retry.entrySeed,
  );
  result.readyRemaining = 1;
  result.remix.retry.retryCount = state.remix.retry.retryCount + 1;
  return result;
}
