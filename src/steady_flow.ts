import type { LevelConfig } from "./types/level";
import type { SimulationState } from "./types/simulation";

export const STEADY_FLOW_DURATION = 6;

export function steadyFlowMaximum(level: LevelConfig): number {
  return level.objective.kind === "maintenance" ? Math.floor(level.objective.safeMaximum / 2) : 0;
}

export function canBankSteadyFlow(state: Readonly<SimulationState>): boolean {
  const objective = state.level.objective;
  return (
    objective.kind === "maintenance" &&
    state.elapsed >= objective.duration / 2 &&
    (objective.entryShift === undefined || state.waves.shiftedArrivalSpawned) &&
    state.targets.length <= steadyFlowMaximum(state.level)
  );
}
