import { logicalCoordinate, targetId } from "./brands";
import { createTarget } from "./characters";
import { MAX_TARGETS, TARGET_PRESETS } from "./constants";
import { synchronizeTargetMotion } from "./motion";
import type { PlateletTarget, SimulationState } from "./types/simulation";

export const ASPIRIN_BURST_RADIUS = 54;

// An aggregate disperses into active hazards; only later shots can inactivate them.
export function dispersePlatelet(state: SimulationState, parent: PlateletTarget): void {
  const offset = parent.radius - TARGET_PRESETS.tiny.radius;
  // Each single starts wholly inside the parent's cleared circle, along its drawn lobes.
  // A steeper third path separates the fan while retaining the local cleanup reward.
  for (const [x, y, lateral, upward] of [
    [-0.85, -0.5, -1.5, -0.8],
    [0.85, -0.5, 1.5, -0.8],
    [0, 1, 1.6, -1.6],
  ] as const) {
    const child = createTarget(
      {
        kind: "platelet",
        size: "tiny",
        direction: lateral < 0 ? -1 : 1,
        position: {
          x: logicalCoordinate(parent.position.x + x * offset),
          y: logicalCoordinate(parent.position.y + y * offset),
        },
      },
      targetId(state.nextTargetId++),
      state.level.speedMultiplier,
      state.tick + 1,
      state.level.arena.floor,
    );
    const horizontalSpeed = Math.abs(child.velocity.x);
    synchronizeTargetMotion(
      child,
      state.level.arena.floor,
      {
        x: lateral * horizontalSpeed,
        y: horizontalSpeed * upward,
      },
      true,
    );
    child.mergeCooldownUntil = parent.mergeCooldownUntil;
    if (state.targets.length < MAX_TARGETS) state.targets.push(child);
    else state.arena.pendingInsertions.push({ kind: "split", sourceId: parent.id, target: child });
  }
}
