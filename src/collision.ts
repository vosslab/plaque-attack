import { logicalCoordinate } from "./brands";
import { PLAYER_HITBOX_HEIGHT, PLAYER_HITBOX_WIDTH, WEAPON_CONFIGS } from "./constants";
import type { PlayerState, LogicalPoint } from "./types/player";
import type { Projectile, Target, TargetMotionSegment, Velocity } from "./types/simulation";

const EPSILON = 1e-9;

export function targetPathSegments(target: Target): readonly TargetMotionSegment[] {
  return target.motionSegments.length > 0
    ? target.motionSegments
    : [{ startTime: 0, endTime: 1, start: target.previousPosition, end: target.position }];
}

export function sampleSegment(segment: TargetMotionSegment, time: number): LogicalPoint {
  const span = segment.endTime - segment.startTime;
  const fraction = span === 0 ? 0 : (time - segment.startTime) / span;
  return {
    x: logicalCoordinate(segment.start.x + (segment.end.x - segment.start.x) * fraction),
    y: logicalCoordinate(segment.start.y + (segment.end.y - segment.start.y) * fraction),
  };
}

function circleEntry(x: number, y: number, dx: number, dy: number, radius: number): number[] {
  const c = x * x + y * y - radius * radius;
  if (c <= 0) return [0];
  const a = dx * dx + dy * dy;
  if (a === 0) return [];
  const b = 2 * (x * dx + y * dy);
  const discriminant = b * b - 4 * a * c;
  return discriminant < 0 ? [] : [(-b - Math.sqrt(discriminant)) / (2 * a)];
}

export function distanceToBox(
  x: number,
  y: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): number {
  const dx = Math.max(left - x, 0, x - right);
  const dy = Math.max(top - y, 0, y - bottom);
  return dx * dx + dy * dy;
}

export type Box = { left: number; right: number; top: number; bottom: number };
export type CircleBoxContact = { time: number; normal: Velocity };

// Rounded rectangle Minkowski boundary: faces plus circular corners, not an expanded-box proxy.
export function sweepCircleBox(
  start: Readonly<LogicalPoint>,
  end: Readonly<LogicalPoint>,
  radius: number,
  box: Box,
): CircleBoxContact | undefined {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const candidates = [0, 1];
  if (dx !== 0)
    candidates.push((box.left - radius - start.x) / dx, (box.right + radius - start.x) / dx);
  if (dy !== 0)
    candidates.push((box.top - radius - start.y) / dy, (box.bottom + radius - start.y) / dy);
  for (const x of [box.left, box.right])
    for (const y of [box.top, box.bottom])
      candidates.push(...circleEntry(start.x - x, start.y - y, dx, dy, radius));
  candidates.sort((a, b) => a - b);
  for (const time of candidates) {
    if (time < -EPSILON || time > 1 + EPSILON) continue;
    const t = Math.max(0, Math.min(1, time));
    const x = start.x + dx * t;
    const y = start.y + dy * t;
    if (distanceToBox(x, y, box.left, box.right, box.top, box.bottom) > radius * radius + EPSILON)
      continue;
    let nx = x - Math.max(box.left, Math.min(box.right, x));
    let ny = y - Math.max(box.top, Math.min(box.bottom, y));
    const length = Math.hypot(nx, ny);
    if (length > EPSILON) {
      nx /= length;
      ny /= length;
    } else {
      const faces = [
        { distance: Math.abs(x - box.left), x: -1, y: 0 },
        { distance: Math.abs(x - box.right), x: 1, y: 0 },
        { distance: Math.abs(y - box.top), x: 0, y: -1 },
        { distance: Math.abs(y - box.bottom), x: 0, y: 1 },
      ].sort((a, b) => a.distance - b.distance);
      const face = faces[0];
      if (face === undefined) return undefined;
      nx = face.x;
      ny = face.y;
    }
    // A touching circle moving away is not entering this solid.
    if (
      t === 0 &&
      distanceToBox(x, y, box.left, box.right, box.top, box.bottom) >= radius * radius - EPSILON &&
      dx * nx + dy * ny >= 0
    )
      continue;
    return { time: t, normal: { x: nx, y: ny } };
  }
  return undefined;
}

export function touchesPlayer(target: Target, player: PlayerState): boolean {
  const half = PLAYER_HITBOX_WIDTH / 2;
  return (
    distanceToBox(
      target.position.x,
      target.position.y,
      player.position.x - half,
      player.position.x + half,
      player.position.y - PLAYER_HITBOX_HEIGHT,
      player.position.y,
    ) <=
    target.radius * target.radius
  );
}

export function sweptTargetPlayerContact(target: Target, player: PlayerState): boolean {
  const half = PLAYER_HITBOX_WIDTH / 2;
  const box = {
    left: player.position.x - half,
    right: player.position.x + half,
    top: player.position.y - PLAYER_HITBOX_HEIGHT,
    bottom: player.position.y,
  };
  return (
    touchesPlayer(target, player) ||
    targetPathSegments(target).some(
      (leg) =>
        touchesPlayer({ ...target, position: leg.start }, player) ||
        sweepCircleBox(leg.start, leg.end, target.radius, box) !== undefined,
    )
  );
}

function stentLegContact(
  projectile: Projectile,
  target: Target,
  segment: TargetMotionSegment,
  start: number,
  end: number,
  top: number,
  finalTop: number,
): number | undefined {
  const half = WEAPON_CONFIGS.stent.width / 2;
  const left = projectile.origin.x - half;
  const right = projectile.origin.x + half;
  const bottom = projectile.origin.y;
  const a = sampleSegment(segment, start);
  const b = sampleSegment(segment, end);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const topDelta = finalTop - top;
  const candidates = [0, 1];
  if (dx !== 0)
    candidates.push((left - target.radius - a.x) / dx, (right + target.radius - a.x) / dx);
  if (dy !== 0) candidates.push((bottom + target.radius - a.y) / dy);
  if (dy !== topDelta) candidates.push((top - target.radius - a.y) / (dy - topDelta));
  for (const side of [left, right]) {
    candidates.push(...circleEntry(a.x - side, a.y - top, dx, dy - topDelta, target.radius));
    candidates.push(...circleEntry(a.x - side, a.y - bottom, dx, dy, target.radius));
  }
  candidates.sort((a, b) => a - b);
  for (const time of candidates) {
    if (time < -EPSILON || time > 1 + EPSILON) continue;
    const t = Math.max(0, Math.min(1, time));
    if (
      distanceToBox(a.x + dx * t, a.y + dy * t, left, right, top + topDelta * t, bottom) <=
      target.radius * target.radius + EPSILON
    )
      return start + t * (end - start);
  }
  return undefined;
}

export function projectileContact(
  projectile: Projectile,
  target: Target,
  activeFraction: number = 1,
  growthFraction: number = activeFraction,
): number | undefined {
  if (activeFraction <= 0) return undefined;
  if (
    projectile.kind === "stent"
      ? target.kind !== "plaque"
      : target.kind !== "platelet" || projectile.hitTargetIds.includes(target.id)
  )
    return undefined;
  for (const segment of targetPathSegments(target)) {
    const start = Math.max(0, segment.startTime);
    const end = Math.min(activeFraction, segment.endTime);
    if (end < start) continue;
    if (projectile.kind === "stent") {
      const cuts = [start, end];
      if (growthFraction > start && growthFraction < end) cuts.splice(1, 0, growthFraction);
      const topAt = (time: number): number =>
        projectile.previousPosition.y +
        (projectile.position.y - projectile.previousPosition.y) *
          (growthFraction <= 0 ? 1 : Math.min(1, time / growthFraction));
      for (let i = 1; i < cuts.length; i++) {
        const a = cuts[i - 1],
          b = cuts[i];
        if (a === undefined || b === undefined) continue;
        const hit = stentLegContact(projectile, target, segment, a, b, topAt(a), topAt(b));
        if (hit !== undefined) return hit;
      }
    } else {
      const a = sampleSegment(segment, start),
        b = sampleSegment(segment, end);
      const shotY = (time: number): number =>
        projectile.previousPosition.y +
        ((projectile.position.y - projectile.previousPosition.y) * time) / activeFraction;
      const hit = circleEntry(
        a.x - projectile.previousPosition.x,
        a.y - shotY(start),
        b.x - a.x,
        b.y - a.y - (shotY(end) - shotY(start)),
        target.radius + WEAPON_CONFIGS[projectile.kind].width / 2,
      ).find((time) => time >= 0 && time <= 1);
      if (hit !== undefined) return start + hit * (end - start);
    }
  }
  return undefined;
}
