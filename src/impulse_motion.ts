import { floorNormal, floorSlope, targetVerticalBounds } from "./arena_geometry";
import { logicalCoordinate } from "./brands";
import { ARENA_WIDTH, STICKY_PAUSE_DURATION } from "./constants";
import type { FloorProfile } from "./types/level";
import type { Target, Velocity } from "./types/simulation";

// Split at floor knots and stationary gaps: each interval then has a monotonic
// circle-center/floor gap, so a sign change cannot hide an earlier crossing.
function floorContactTime(target: Target, floor: FloorProfile, duration: number): number {
  const { x, y } = target.position;
  const { x: vx, y: vy } = target.velocity;
  const cuts = [0, duration];
  const addX = (value: number): void => {
    if (vx === 0) return;
    const time = (value - x) / vx;
    if (time > 0 && time < duration) cuts.push(time);
  };
  for (const point of floor.controlPoints) addX(point.x);
  for (let index = 1; index < floor.controlPoints.length; index++) {
    const left = floor.controlPoints[index - 1],
      right = floor.controlPoints[index];
    if (left === undefined || right === undefined || vx === 0 || right.y === left.y) continue;
    const ratio = (vy * (right.x - left.x)) / (6 * (right.y - left.y) * vx);
    const discriminant = 1 - 4 * ratio;
    if (discriminant < 0) continue;
    for (const phase of [(1 - Math.sqrt(discriminant)) / 2, (1 + Math.sqrt(discriminant)) / 2])
      if (phase >= 0 && phase <= 1) addX(left.x + (right.x - left.x) * phase);
  }
  cuts.sort((a, b) => a - b);
  const gap = (time: number): number =>
    targetVerticalBounds(floor, x + vx * time, target.radius)[1] - y - vy * time;
  if (gap(0) <= 1e-9 && floorSlope(floor, x) * vx - vy < -1e-9) return 0;
  for (let index = 1; index < cuts.length; index++) {
    const lowerCut = cuts[index - 1],
      upperCut = cuts[index];
    if (lowerCut === undefined || upperCut === undefined || gap(upperCut) >= -1e-9) continue;
    let low: number = lowerCut,
      high: number = upperCut;
    // Bisection stays on the accepted free side of the floor boundary.
    for (let iteration = 0; iteration < 40; iteration++) {
      const middle = (low + high) / 2;
      if (gap(middle) >= 0) low = middle;
      else high = middle;
    }
    return low;
  }
  return Infinity;
}

function reflect(velocity: Velocity, normal: Velocity): void {
  const dot = velocity.x * normal.x + velocity.y * normal.y;
  if (dot >= 0) return;
  velocity.x -= 2 * dot * normal.x;
  velocity.y -= 2 * dot * normal.y;
}

// After a physical impulse, velocity is the state. Reflection preserves speed;
// no inverse orbit slope can turn a finite impact into unbounded stored energy.
export function advanceImpulseTarget(target: Target, dt: number, floor: FloorProfile): void {
  const sticky =
    target.kind === "plaque" && target.behavior?.kind === "sticky" ? target.behavior : undefined;
  let elapsed = 0;
  while (elapsed < dt) {
    const start = { ...target.position };
    const paused = sticky !== undefined && sticky.pauseRemaining > 0;
    let duration: number;
    if (paused && sticky !== undefined) {
      duration = Math.min(dt - elapsed, sticky.pauseRemaining);
      sticky.pauseRemaining = Math.max(0, sticky.pauseRemaining - duration);
      target.velocity = { x: 0, y: 0 };
    } else {
      const velocity = target.velocity;
      const wall = velocity.x >= 0 ? ARENA_WIDTH - target.radius : target.radius;
      const wallTime = velocity.x === 0 ? Infinity : Math.max(0, (wall - start.x) / velocity.x);
      const top = targetVerticalBounds(floor, start.x, target.radius)[0];
      const topTime = velocity.y < 0 ? Math.max(0, (top - start.y) / velocity.y) : Infinity;
      const horizon = Math.min(dt - elapsed, 1 / 120, wallTime, topTime);
      const floorTime = floorContactTime(target, floor, horizon);
      duration = Math.min(horizon, floorTime);
      target.position = {
        x: logicalCoordinate(start.x + velocity.x * duration),
        y: logicalCoordinate(start.y + velocity.y * duration),
      };
      if (duration === floorTime) {
        const normal = floorNormal(floor, target.position.x);
        reflect(velocity, normal);
        target.position.x = logicalCoordinate(target.position.x + normal.x * 1e-7);
        target.position.y = logicalCoordinate(target.position.y + normal.y * 1e-7);
      }
      if (duration === topTime) velocity.y = Math.abs(velocity.y);
      if (duration === wallTime) {
        target.position.x = logicalCoordinate(wall);
        velocity.x = -velocity.x;
        if (sticky !== undefined) {
          sticky.resumeVelocityX = velocity.x;
          sticky.resumeVelocityY = velocity.y;
          sticky.pauseRemaining = STICKY_PAUSE_DURATION;
          target.velocity = { x: 0, y: 0 };
        }
      }
    }
    const nextElapsed = Math.min(dt, elapsed + duration);
    if (nextElapsed > elapsed)
      target.motionSegments.push({
        startTime: elapsed / dt,
        endTime: nextElapsed / dt,
        start,
        end: { ...target.position },
      });
    elapsed = nextElapsed;
    if (paused && sticky !== undefined && sticky.pauseRemaining === 0) {
      target.velocity.x = sticky.resumeVelocityX;
      target.velocity.y = sticky.resumeVelocityY ?? 0;
    }
  }
}
