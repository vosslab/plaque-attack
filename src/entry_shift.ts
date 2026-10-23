import { PLAYER_SPEED } from "./constants";
import type { LogicalPoint } from "./types/player";
import type { SimulationState } from "./types/simulation";

export type EntryShiftCue = {
  readonly phase: "forecast" | "active";
  readonly laneX: LogicalPoint["x"];
  readonly remaining: number;
};

// Presentation derives this from the active-play clock; retry needs no extra state.
export function getEntryShiftCue(state: Readonly<SimulationState>): EntryShiftCue | undefined {
  const objective = state.level.objective;
  if (objective.kind !== "maintenance" || objective.entryShift === undefined) return undefined;
  const shift = objective.entryShift;
  const crossingDistance = Math.max(
    0,
    ...(state.level.flowSwitches ?? []).map((device) => Math.abs(device.laneX - shift.laneX)),
  );
  // One lane crossing plus two seconds to notice the optional opportunity.
  const lead = 2 + crossingDistance / PLAYER_SPEED;
  if (
    state.elapsed < shift.at - lead ||
    state.elapsed >= shift.at + lead ||
    state.elapsed >= objective.duration
  )
    return undefined;
  return {
    phase: state.elapsed < shift.at ? "forecast" : "active",
    laneX: shift.laneX,
    remaining: Math.max(0, shift.at - state.elapsed),
  };
}
