import {
  LEVEL_COMPLETION_POINTS,
  NO_DAMAGE_POINTS,
  SURVIVAL_POINTS_PER_SECOND,
  TARGET_PRESETS,
} from "./constants";
import type { SimulationEvent } from "./types/events";
import type { SimulationState, Target } from "./types/simulation";

export function awardHit(state: SimulationState, target: Target): number {
  state.streak += 1;
  const multiplier = state.streak >= 10 ? 3 : state.streak >= 5 ? 2 : 1;
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

export function completeLevel(state: SimulationState, events: SimulationEvent[]): void {
  if (state.completionAwarded) return;
  state.completionAwarded = true;
  const points = LEVEL_COMPLETION_POINTS + (state.levelLivesLost === 0 ? NO_DAMAGE_POINTS : 0);
  state.score += points;
  state.phase =
    state.mode === "campaign" && state.level.id === 15 ? "campaign_complete" : "level_complete";
  events.push({ type: "level_complete", levelId: state.level.id, points });
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
