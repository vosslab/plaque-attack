import { targetId } from "./brands";
import { createTarget, nextPlaqueSize } from "./characters";
import { MAX_TARGETS } from "./constants";
import { synchronizeTargetMotion } from "./motion";
import { awardHit } from "./scoring";
import type { SimulationEvent } from "./types/events";
import type { SimulationState, Target, TissueTick } from "./types/simulation";

// All fragmentation shares insertion limits, next-tick activation and ordinary descendants.
export function splitTarget(state: SimulationState, target: Target): void {
  if (target.kind !== "plaque") return;
  const heavy = target.behavior?.kind === "heavy";
  const size = heavy ? "tiny" : nextPlaqueSize(target.size);
  if (size === undefined) return;
  const directions = heavy ? ([-1, 1, -1] as const) : ([-1, 1] as const);
  directions.forEach((direction, index) => {
    const child = createTarget(
      { kind: "plaque", size, direction, position: { ...target.position } },
      targetId(state.nextTargetId++),
      state.level.speedMultiplier,
      state.tick + 1,
      state.level.arena.floor,
    );
    if (heavy) {
      // Separate the three trajectories by vertical direction and lateral drift.
      synchronizeTargetMotion(child, state.level.arena.floor, {
        x: child.velocity.x,
        y: index === 2 ? Math.abs(child.velocity.y) : -Math.abs(child.velocity.y),
      });
    }
    child.mergeCooldownUntil = target.mergeCooldownUntil;
    if (state.targets.length < MAX_TARGETS) state.targets.push(child);
    else state.arena.pendingInsertions.push({ kind: "split", sourceId: target.id, target: child });
  });
}

// Shots resolve first: only a surviving active parent can expire, and it never earns hit points.
export function advanceUnstable(
  state: SimulationState,
  dt: number,
  events: SimulationEvent[],
): void {
  for (const target of [...state.targets]) {
    if (
      target.activeFromTick > state.tick ||
      target.kind !== "plaque" ||
      target.behavior?.kind !== "unstable"
    )
      continue;
    target.behavior.splitRemaining = Math.max(0, target.behavior.splitRemaining - dt);
    if (target.behavior.splitRemaining > 1e-9) continue;
    state.targets = state.targets.filter((candidate) => candidate !== target);
    splitTarget(state, target);
    events.push({
      type: "unstable_split",
      targetId: target.id,
      position: { ...target.position },
      size: target.size,
    });
  }
}

export function resolveClearancePulse(
  state: SimulationState,
  tissue: TissueTick,
  events: SimulationEvent[],
): void {
  const definition = state.level.clearancePulse;
  const runtime = state.remix.clearancePulse;
  if (definition === undefined || runtime === undefined || runtime.activated) return;
  if (
    !definition.seamCells.some((cell) =>
      tissue.erosion.has(JSON.stringify([cell.patchId, cell.cellId])),
    )
  )
    return;
  runtime.activated = true;
  const removed = state.targets.filter(
    (target) =>
      target.activeFromTick <= state.tick &&
      target.size === "tiny" &&
      Math.hypot(
        target.position.x - definition.position.x,
        target.position.y - definition.position.y,
      ) <= definition.radius,
  );
  for (const target of removed) awardHit(state, target);
  const ids = new Set(removed.map((target) => target.id));
  state.targets = state.targets.filter((target) => !ids.has(target.id));
  events.push({
    type: "clearance_pulse",
    pulseId: definition.id,
    position: { ...definition.position },
    radius: definition.radius,
    removedTargetIds: removed.map((target) => target.id),
  });
}
