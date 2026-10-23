import {
  LEVEL_COMPLETION_POINTS,
  NO_DAMAGE_POINTS,
  SURVIVAL_POINTS_PER_SECOND,
  TARGET_PRESETS,
} from "./constants";
import type { SimulationEvent } from "./types/events";
import type { SimulationState, Target } from "./types/simulation";
import { STEADY_FLOW_DURATION } from "./steady_flow";

export function hitMultiplier(streak: number): 1 | 2 | 3 {
  return streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
}

export function streakMilestone(streak: number): 2 | 3 | undefined {
  return streak === 10 ? 3 : streak === 5 ? 2 : undefined;
}

export function awardHit(state: SimulationState, target: Target): number {
  state.streak += 1;
  const multiplier = hitMultiplier(state.streak);
  const points = TARGET_PRESETS[target.size].points * multiplier;
  state.score += points;
  return points;
}

export function awardSurvival(state: SimulationState, events: SimulationEvent[]): void {
  if (state.level.objective.kind !== "maintenance") return;
  const seconds = Math.floor(Math.min(state.elapsed, state.level.objective.duration) + 1e-9);
  const points = Math.max(0, seconds - state.survivalSecondsAwarded) * SURVIVAL_POINTS_PER_SECOND;
  state.survivalSecondsAwarded = seconds;
  if (points === 0) return;
  state.score += points;
  events.push({ type: "survival_points", points });
}

export function masteryBonusPoints(state: Readonly<SimulationState>): number {
  const objective = state.level.objective;
  if (objective.kind !== "maintenance" || state.steadyFlowSeconds < STEADY_FLOW_DURATION) return 0;
  return (
    Math.max(0, Math.floor(objective.duration + 1e-9) - Math.floor(state.elapsed + 1e-9)) *
    SURVIVAL_POINTS_PER_SECOND
  );
}

export function completeLevel(state: SimulationState, events: SimulationEvent[]): void {
  if (state.completionAwarded) return;
  state.completionAwarded = true;
  const masteryPoints = masteryBonusPoints(state);
  const points =
    LEVEL_COMPLETION_POINTS + (state.levelLivesLost === 0 ? NO_DAMAGE_POINTS : 0) + masteryPoints;
  state.score += points;
  state.phase =
    state.mode === "campaign" && state.level.id === 15 ? "campaign_complete" : "level_complete";
  events.push({ type: "level_complete", levelId: state.level.id, points, masteryPoints });
  if (state.phase === "campaign_complete") endRun(state, "completed", events);
}

export function endRun(
  state: SimulationState,
  outcome: "completed" | "ended",
  events: SimulationEvent[],
): void {
  if (state.mode !== "campaign" || state.recordCommitted) return;
  // The application marks recordCommitted only after handling this event. Terminal
  // simulation phases are inert, so emitting the event cannot repeat on later ticks.
  events.push({ type: "run_end", outcome, score: state.score, levelId: state.level.id });
}
