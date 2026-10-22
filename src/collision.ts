import { PLAYER_HITBOX_HEIGHT, PLAYER_HITBOX_WIDTH, WEAPON_CONFIGS } from "./constants";
import type { PlayerState } from "./types/player";
import type { Projectile, Target } from "./types/simulation";

const EPSILON = 1e-9;

// Earliest entry of a moving point into a circle, in normalized tick time.
function circleEntry(x: number, y: number, dx: number, dy: number, radius: number): number[] {
  const c = x * x + y * y - radius * radius;
  if (c <= 0) return [0];
  const a = dx * dx + dy * dy;
  if (a === 0) return [];
  const b = 2 * (x * dx + y * dy);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  return [(-b - Math.sqrt(discriminant)) / (2 * a)];
}

function distanceToBox(
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

// A stent is a growing rectangle anchored at its firing origin. Its upper corners move;
// testing their quadratic contacts as well as the four faces avoids wide-box false hits.
function stentContact(
  projectile: Projectile,
  target: Target,
  start: number,
  end: number,
  top: number,
  finalTop: number,
): number | undefined {
  const half = WEAPON_CONFIGS.stent.width / 2;
  const left = projectile.origin.x - half;
  const right = projectile.origin.x + half;
  const topDelta = finalTop - top;
  const bottom = projectile.origin.y;
  const targetDx = target.position.x - target.previousPosition.x;
  const targetDy = target.position.y - target.previousPosition.y;
  const x = target.previousPosition.x + targetDx * start;
  const y = target.previousPosition.y + targetDy * start;
  const dx = targetDx * (end - start);
  const dy = targetDy * (end - start);
  const candidates = [0, 1];
  if (dx !== 0) {
    candidates.push((left - target.radius - x) / dx, (right + target.radius - x) / dx);
  }
  if (dy !== 0) candidates.push((bottom + target.radius - y) / dy);
  if (dy !== topDelta) candidates.push((top - target.radius - y) / (dy - topDelta));
  for (const side of [left, right]) {
    candidates.push(...circleEntry(x - side, y - top, dx, dy - topDelta, target.radius));
    candidates.push(...circleEntry(x - side, y - bottom, dx, dy, target.radius));
  }
  candidates.sort((a, b) => a - b);
  for (const time of candidates) {
    if (time < -EPSILON || time > 1 + EPSILON) continue;
    const t = Math.max(0, Math.min(1, time));
    if (
      distanceToBox(x + dx * t, y + dy * t, left, right, top + topDelta * t, bottom) <=
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
  if (projectile.kind === "stent") {
    if (target.kind !== "plaque") return undefined;
    const growingHit = stentContact(
      projectile,
      target,
      0,
      growthFraction,
      projectile.previousPosition.y,
      projectile.position.y,
    );
    if (growingHit !== undefined || growthFraction >= activeFraction) return growingHit;
    return stentContact(
      projectile,
      target,
      growthFraction,
      activeFraction,
      projectile.position.y,
      projectile.position.y,
    );
  }
  if (target.kind !== "platelet" || projectile.hitTargetIds.includes(target.id)) return undefined;
  const x = target.previousPosition.x - projectile.previousPosition.x;
  const y = target.previousPosition.y - projectile.previousPosition.y;
  const dx = (target.position.x - target.previousPosition.x) * activeFraction;
  const dy =
    (target.position.y - target.previousPosition.y) * activeFraction -
    (projectile.position.y - projectile.previousPosition.y);
  const contact = circleEntry(
    x,
    y,
    dx,
    dy,
    target.radius + WEAPON_CONFIGS[projectile.kind].width / 2,
  ).find((time) => time >= 0 && time <= 1);
  return contact === undefined ? undefined : contact * activeFraction;
}
