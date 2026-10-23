import { ARENA_WIDTH, PLAYER_WIDTH } from "./constants";
import type { TargetId } from "./brands";
import type { SimulationState } from "./types/simulation";

/** Shared visibility contract for the canvas cue and its DOM instruction. */
export function hasOpeningGuide(state: Readonly<SimulationState>): boolean {
  return state.level.id === 1 && state.phase === "playing" && state.targets.length > 0;
}

/** Approximate movement hint only; selection and projection never change simulation state. */
export function openingInterceptGuide(
  state: Readonly<SimulationState>,
  selectedId?: TargetId,
): { targetId: TargetId; x: number } | undefined {
  if (!hasOpeningGuide(state)) return undefined;
  let target = state.targets.find((candidate) => candidate.id === selectedId);
  if (target === undefined) {
    target = state.targets.reduce<(typeof state.targets)[number] | undefined>(
      (nearest, candidate) =>
        nearest === undefined ||
        Math.abs(candidate.position.x - state.player.position.x) <
          Math.abs(nearest.position.x - state.player.position.x)
          ? candidate
          : nearest,
      undefined,
    );
  }
  if (target === undefined) return undefined;
  return {
    targetId: target.id,
    x: Math.max(
      PLAYER_WIDTH / 2,
      Math.min(ARENA_WIDTH - PLAYER_WIDTH / 2, target.position.x + 0.8 * target.velocity.x),
    ),
  };
}
