import { DEFAULT_ARENA, FLUID_WALL_INSET, PLAYER_WIDTH } from "./constants";
import type { FloorProfile } from "./types/level";
import type { Velocity } from "./types/simulation";

export const FLAT_FLOOR: FloorProfile = DEFAULT_ARENA.floor;

export function floorY(floor: FloorProfile, x: number): number {
  const points = floor.controlPoints;
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) throw new Error("Floor requires control points");
  if (x <= first.x) return first.y;
  for (let index = 1; index < points.length; index += 1) {
    const left = points[index - 1];
    const right = points[index];
    if (left === undefined || right === undefined || x > right.x) continue;
    const t = (x - left.x) / (right.x - left.x);
    return left.y + (right.y - left.y) * t * t * (3 - 2 * t);
  }
  return last.y;
}

export function floorSlope(floor: FloorProfile, x: number): number {
  for (let index = 1; index < floor.controlPoints.length; index += 1) {
    const left = floor.controlPoints[index - 1];
    const right = floor.controlPoints[index];
    if (left === undefined || right === undefined || x <= left.x || x >= right.x) continue;
    const t = (x - left.x) / (right.x - left.x);
    return ((right.y - left.y) * 6 * t * (1 - t)) / (right.x - left.x);
  }
  return 0;
}

// Outward from the solid floor into the arena (screen y increases downward).
export function floorNormal(floor: FloorProfile, x: number): Velocity {
  const slope = floorSlope(floor, x);
  const length = Math.hypot(slope, 1);
  return { x: slope / length, y: -1 / length };
}

export function floorTangent(floor: FloorProfile, x: number): Velocity {
  const slope = floorSlope(floor, x);
  const length = Math.hypot(slope, 1);
  return { x: 1 / length, y: slope / length };
}

export function playerSupportY(
  floor: FloorProfile,
  x: number,
  width: number = PLAYER_WIDTH,
): number {
  const left = x - width / 2;
  const right = x + width / 2;
  let support = Math.min(floorY(floor, left), floorY(floor, right));
  // Each smoothstep span is monotonic, so endpoints and enclosed knots give the exact minimum.
  for (const point of floor.controlPoints) {
    if (point.x > left && point.x < right) support = Math.min(support, point.y);
  }
  return support;
}

export function targetVerticalBounds(
  floor: FloorProfile,
  x: number,
  radius: number,
): readonly [number, number] {
  return [radius + FLUID_WALL_INSET, floorY(floor, x) - radius - FLUID_WALL_INSET];
}
