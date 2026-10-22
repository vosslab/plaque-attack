import type { FloorProfile } from "./types/level";

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

export function floorMinimumY(floor: FloorProfile, left: number, right: number): number {
  let minimum = Math.min(floorY(floor, left), floorY(floor, right));
  // Smoothstep spans are monotonic, so endpoints and enclosed knots are exact.
  for (const point of floor.controlPoints) {
    if (point.x > left && point.x < right) minimum = Math.min(minimum, point.y);
  }
  return minimum;
}
