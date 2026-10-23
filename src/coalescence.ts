import { targetVerticalBounds } from "./arena_geometry";
import { logicalCoordinate, randomSeed, targetId } from "./brands";
import { createTarget } from "./characters";

import { ARENA_HEIGHT, ARENA_WIDTH, TARGET_PRESETS } from "./constants";
import { synchronizeTargetMotion } from "./motion";
import type { SimulationEvent } from "./types/events";
import type { PlaqueSize } from "./types/level";
import type { LogicalPoint } from "./types/player";
import type { SimulationState, Target, Velocity } from "./types/simulation";

function largerSize(size: PlaqueSize): PlaqueSize | undefined {
  switch (size) {
    case "tiny":
      return "small";
    case "small":
      return "medium";
    case "medium":
      return "large";
    case "large":
      return undefined;
  }
}

function freeMergePosition(
  state: SimulationState,
  center: LogicalPoint,
  radius: number,
): LogicalPoint | undefined {
  const floor = state.level.arena.floor;
  const cells = state.arena.tissue.flatMap((patch) => patch.cells.filter((cell) => cell.occupied));
  const safe = (x: number, y: number): boolean => {
    if (x < radius || x > ARENA_WIDTH - radius) return false;
    const [top, bottom] = targetVerticalBounds(floor, x, radius);
    if (y < top || y > bottom) return false;
    return cells.every((cell) => {
      const dx = x - Math.max(cell.position.x, Math.min(cell.position.x + 12, x));
      const dy = y - Math.max(cell.position.y, Math.min(cell.position.y + 12, y));
      return dx * dx + dy * dy >= radius * radius;
    });
  };
  const x = Math.max(radius, Math.min(ARENA_WIDTH - radius, center.x));
  const [top, bottom] = targetVerticalBounds(floor, x, radius);
  const y = Math.max(top, Math.min(bottom, center.y));
  if (safe(x, y)) return { x: logicalCoordinate(x), y: logicalCoordinate(y) };
  // Search outward in deterministic four-pixel shells. The first safe sampled shell is
  // nearest at this resolution; an arena-diagonal bound prevents unbounded depenetration.
  for (let distance = 4; distance <= Math.hypot(ARENA_WIDTH, ARENA_HEIGHT); distance += 4) {
    for (let angle = 0; angle < 64; angle += 1) {
      const candidateX = x + distance * Math.cos((angle * Math.PI) / 32);
      const candidateY = y + distance * Math.sin((angle * Math.PI) / 32);
      if (safe(candidateX, candidateY))
        return { x: logicalCoordinate(candidateX), y: logicalCoordinate(candidateY) };
    }
  }
  return undefined;
}

// Only the chronological contact owner calls this, at a genuine approaching entry.
export function attemptCoalescence(
  state: SimulationState,
  lower: Target,
  higher: Target,
  positions: readonly [LogicalPoint, LogicalPoint],
  velocities: readonly [Velocity, Velocity],
  events: SimulationEvent[],
): boolean {
  const rule = state.level.merge;
  if (
    lower.kind !== "plaque" ||
    higher.kind !== "plaque" ||
    lower.size !== higher.size ||
    lower.size === "large" ||
    rule.probability <= 0 ||
    state.merge.remainingBudget <= 0 ||
    lower.mergeCooldownUntil > state.elapsed ||
    higher.mergeCooldownUntil > state.elapsed
  )
    return false;
  if (
    [lower, higher].some(
      (target, index) =>
        target.kind === "plaque" &&
        target.behavior?.kind === "sticky" &&
        Math.hypot(velocities[index]?.x ?? 0, velocities[index]?.y ?? 0) < 1e-8,
    )
  )
    return false;
  const key = `${lower.id}:${higher.id}`;
  lower.mergeCooldownUntil = higher.mergeCooldownUntil = state.elapsed + rule.cooldown;
  state.merge.lastAttemptTicks.set(key, state.tick);
  state.seed = randomSeed((Math.imul(state.seed, 1664525) + 1013904223) >>> 0);
  if (state.seed / 0x100000000 >= rule.probability) return false;
  const size = largerSize(lower.size);
  if (size === undefined) return false;
  const [a, b] = positions;
  const position = freeMergePosition(
    state,
    { x: logicalCoordinate((a.x + b.x) / 2), y: logicalCoordinate((a.y + b.y) / 2) },
    TARGET_PRESETS[size].radius,
  );
  if (position === undefined) return false;
  const [lowerVelocity, higherVelocity] = velocities;
  const averageX = (lowerVelocity.x + higherVelocity.x) / 2;
  const direction =
    Math.abs(averageX) > 1e-8
      ? Math.sign(averageX)
      : Math.sign(lowerVelocity.x) || Math.sign(lower.velocity.x) || 1;
  const merged = createTarget(
    { kind: "plaque", size, position, direction: direction < 0 ? -1 : 1 },
    targetId(state.nextTargetId++),
    state.level.speedMultiplier,
    state.tick + 1,
    state.level.arena.floor,
  );
  synchronizeTargetMotion(merged, state.level.arena.floor, {
    x: direction * TARGET_PRESETS[size].horizontalSpeed * state.level.speedMultiplier,
    y: (lowerVelocity.y + higherVelocity.y) / 2,
  });
  merged.previousPosition = { ...merged.position };
  merged.mergeCooldownUntil = state.elapsed + rule.cooldown;
  state.targets = state.targets.filter(
    (target) => target.id !== lower.id && target.id !== higher.id,
  );
  state.targets.push(merged);
  state.merge.remainingBudget -= 1;
  events.push({
    type: "targets_merged",
    parentIds: [lower.id, higher.id],
    targetId: merged.id,
    size,
    position: { ...merged.position },
  });
  return true;
}

export function finishCoalescenceContacts(state: SimulationState): void {
  const ids = new Set(state.targets.map((target) => Number(target.id)));
  const survivingPair = (key: string): boolean => key.split(":").every((id) => ids.has(Number(id)));
  state.merge.contacts.clear();
  for (const key of state.merge.lastAttemptTicks.keys())
    if (!survivingPair(key)) state.merge.lastAttemptTicks.delete(key);
}
