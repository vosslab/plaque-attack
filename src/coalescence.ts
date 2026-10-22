import { targetVerticalBounds } from "./arena_geometry";
import { logicalCoordinate, randomSeed, targetId } from "./brands";
import { createTarget } from "./characters";
import { sampleSegment, targetPathSegments } from "./collision";
import { ARENA_HEIGHT, ARENA_WIDTH, FIXED_STEP, TARGET_PRESETS } from "./constants";
import { sampleTargetPath, synchronizeTargetMotion } from "./motion";
import type { SimulationEvent } from "./types/events";
import type { PlaqueSize } from "./types/level";
import type { LogicalPoint } from "./types/player";
import type { SimulationState, Target, Velocity } from "./types/simulation";

type ContactEntry = { time: number; lower: Target; higher: Target; key: string };

function contactVelocity(target: Target, time: number): Velocity {
  const leg = targetPathSegments(target).find(
    (segment) => time >= segment.startTime && time <= segment.endTime,
  );
  if (leg === undefined || leg.endTime === leg.startTime) return target.velocity;
  const duration = (leg.endTime - leg.startTime) * FIXED_STEP;
  return { x: (leg.end.x - leg.start.x) / duration, y: (leg.end.y - leg.start.y) / duration };
}

// Union adjoining overlap intervals so reflection vertices preserve contact entry latches.
function contactIntervals(lower: Target, higher: Target): [number, number][] {
  const intervals: [number, number][] = [];
  for (const a of targetPathSegments(lower)) {
    for (const b of targetPathSegments(higher)) {
      const start = Math.max(a.startTime, b.startTime);
      const end = Math.min(a.endTime, b.endTime);
      if (end < start) continue;
      const a0 = sampleSegment(a, start);
      const b0 = sampleSegment(b, start);
      const a1 = sampleSegment(a, end);
      const b1 = sampleSegment(b, end);
      const x = a0.x - b0.x;
      const y = a0.y - b0.y;
      const dx = a1.x - b1.x - x;
      const dy = a1.y - b1.y - y;
      const radius = lower.radius + higher.radius;
      const c = x * x + y * y - radius * radius;
      const speed = dx * dx + dy * dy;
      if (speed === 0) {
        if (c <= 0) intervals.push([start, end]);
        continue;
      }
      const dot = x * dx + y * dy;
      const discriminant = dot * dot - speed * c;
      if (discriminant < 0) continue;
      const root = Math.sqrt(discriminant);
      const entry = Math.max(0, (-dot - root) / speed);
      const exit = Math.min(1, (-dot + root) / speed);
      if (entry <= exit)
        intervals.push([start + entry * (end - start), start + exit * (end - start)]);
    }
  }
  intervals.sort((a, b) => a[0] - b[0]);
  const joined: [number, number][] = [];
  for (const interval of intervals) {
    const last = joined[joined.length - 1];
    if (last !== undefined && interval[0] <= last[1] + 1e-10)
      last[1] = Math.max(last[1], interval[1]);
    else joined.push([...interval]);
  }
  return joined;
}

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

export function resolveCoalescence(state: SimulationState, events: SimulationEvent[]): void {
  if (state.phase !== "playing") return;
  const rule = state.level.merge;
  const active = state.targets
    .filter((target) => target.activeFromTick <= state.tick)
    .sort((a, b) => a.id - b.id);
  const entries: ContactEntry[] = [];
  const touching = new Set<string>();
  if (rule.probability > 0 && state.merge.remainingBudget > 0) {
    for (let first = 0; first < active.length; first += 1) {
      const lower = active[first];
      if (lower === undefined || lower.kind !== "plaque" || lower.size === "large") continue;
      for (const higher of active.slice(first + 1)) {
        if (higher.kind !== "plaque" || higher.size !== lower.size) continue;
        const key = `${lower.id}:${higher.id}`;
        for (const [start, end] of contactIntervals(lower, higher)) {
          if (end >= 1 - 1e-10) touching.add(key);
          if (start > 1e-10 || !state.merge.contacts.has(key))
            entries.push({ time: start, lower, higher, key });
        }
      }
    }
  }
  entries.sort((a, b) => a.time - b.time || a.lower.id - b.lower.id || a.higher.id - b.higher.id);
  const consumed = new Set<number>();
  for (const entry of entries) {
    const { lower, higher, key, time } = entry;
    if (state.merge.remainingBudget <= 0) break;
    if (
      consumed.has(lower.id) ||
      consumed.has(higher.id) ||
      lower.mergeCooldownUntil > state.elapsed ||
      higher.mergeCooldownUntil > state.elapsed
    )
      continue;
    lower.mergeCooldownUntil = higher.mergeCooldownUntil = state.elapsed + rule.cooldown;
    state.merge.lastAttemptTicks.set(key, state.tick);
    state.seed = randomSeed((Math.imul(state.seed, 1664525) + 1013904223) >>> 0);
    if (state.seed / 0x100000000 >= rule.probability) continue;
    const size = largerSize(lower.size);
    if (size === undefined) continue;
    const a = sampleTargetPath(targetPathSegments(lower), time);
    const b = sampleTargetPath(targetPathSegments(higher), time);
    if (a === undefined || b === undefined) continue;
    const position = freeMergePosition(
      state,
      { x: logicalCoordinate((a.x + b.x) / 2), y: logicalCoordinate((a.y + b.y) / 2) },
      TARGET_PRESETS[size].radius,
    );
    // The seeded attempt and cooldown are spent even if placement is impossible; only a
    // committed two-to-one replacement consumes the finite stage budget.
    if (position === undefined) continue;
    const lowerVelocity = contactVelocity(lower, time);
    const higherVelocity = contactVelocity(higher, time);
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
    consumed.add(lower.id);
    consumed.add(higher.id);
    state.targets.push(merged);
    state.merge.remainingBudget -= 1;
    events.push({
      type: "targets_merged",
      parentIds: [lower.id, higher.id],
      targetId: merged.id,
      size,
      position: { ...merged.position },
    });
  }
  state.targets = state.targets.filter((target) => !consumed.has(target.id));
  const ids = new Set(state.targets.map((target) => Number(target.id)));
  const survivingPair = (key: string): boolean => key.split(":").every((id) => ids.has(Number(id)));
  state.merge.contacts = new Set([...touching].filter(survivingPair));
  for (const key of state.merge.lastAttemptTicks.keys()) {
    if (!survivingPair(key)) state.merge.lastAttemptTicks.delete(key);
  }
}
