import { randomSeed, targetId } from "./brands";
import { createTarget } from "./characters";
import { MAX_TARGETS, SPAWN_WARNING_DURATION } from "./constants";
import type { SimulationEvent } from "./types/events";
import type { TargetSpawn } from "./types/level";
import type { SimulationState } from "./types/simulation";

function nextEntry(state: SimulationState): TargetSpawn | undefined {
  const objective = state.level.objective;
  if (objective.kind === "clear") return objective.reinforcements[state.waves.spawned]?.target;
  state.seed = randomSeed((Math.imul(state.seed, 1664525) + 1013904223) >>> 0);
  return objective.entries[state.seed % objective.entries.length];
}

export function advanceWaves(state: SimulationState, dt: number, events: SimulationEvent[]): void {
  const objective = state.level.objective;
  if (objective.kind === "maintenance" && state.elapsed + 1e-9 >= objective.duration) {
    state.waves.warning = undefined;
    state.waves.nextSpawnAt = Infinity;
    return;
  }
  const warning = state.waves.warning;
  if (warning !== undefined) {
    warning.remaining = Math.max(0, warning.remaining - dt);
    if (warning.remaining > 1e-9 || state.targets.length >= MAX_TARGETS) return;
    const target = createTarget(
      warning.target,
      targetId(state.nextTargetId++),
      state.level.speedMultiplier,
      state.tick + 1,
    );
    state.targets.push(target);
    state.waves.spawned += 1;
    state.waves.warning = undefined;
    state.waves.nextSpawnAt =
      objective.kind === "clear"
        ? Math.max(
            objective.reinforcements[state.waves.spawned]?.at ?? Infinity,
            state.elapsed + SPAWN_WARNING_DURATION,
          )
        : Math.max(
            state.waves.nextSpawnAt + objective.spawnInterval,
            state.elapsed + objective.spawnInterval,
          );
    events.push({ type: "spawn", targetId: target.id, position: { ...target.position } });
    return;
  }
  const emptyFiniteWave = objective.kind === "clear" && state.targets.length === 0;
  if (!emptyFiniteWave && state.elapsed + 1e-9 < state.waves.nextSpawnAt - SPAWN_WARNING_DURATION)
    return;
  const target = nextEntry(state);
  if (target !== undefined) {
    state.waves.warning = { target, remaining: SPAWN_WARNING_DURATION };
  }
}

export function clearObjectiveSatisfied(state: SimulationState): boolean {
  return (
    state.level.objective.kind === "clear" &&
    state.targets.length === 0 &&
    state.waves.spawned === state.level.objective.reinforcements.length &&
    state.waves.warning === undefined
  );
}
