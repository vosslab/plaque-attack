import { floorNormal, floorSlope, targetVerticalBounds } from "./arena_geometry";
import { logicalCoordinate } from "./brands";
import { ARENA_HEIGHT, ARENA_WIDTH, STICKY_PAUSE_DURATION } from "./constants";
import type { FloorProfile } from "./types/level";
import type { Target, Velocity } from "./types/simulation";

// A fixed world-space well keeps redirected fluid bodies away from boundary
// skimming. Its potential is a * abs(y - middle), independent of terrain and x.
export const FLUID_RESTORING_ACCELERATION = 60;
const FLUID_MIDDLE = ARENA_HEIGHT / 2;
const MAX_SWEEP_DURATION = 1 / 120;
const SWEEP_CURVATURE_ERROR = (FLUID_RESTORING_ACCELERATION * MAX_SWEEP_DURATION ** 2) / 8;

function settleUnresolvedFloat(target: Target): void {
  const amplitude =
    Math.abs(target.position.y - FLUID_MIDDLE) +
    target.velocity.y ** 2 / (2 * FLUID_RESTORING_ACCELERATION);
  // The cusp well's tiny oscillations can otherwise cross the midpoint an
  // unbounded number of times. Settle only an entire orbit smaller than the
  // existing chord error: position changes by at most that error, energy only
  // decreases, and lateral motion remains untouched.
  if (amplitude <= SWEEP_CURVATURE_ERROR) {
    target.position.y = logicalCoordinate(FLUID_MIDDLE);
    target.velocity.y = 0;
  }
}

function quadraticRoots(a: number, b: number, c: number): number[] {
  if (a === 0) return b === 0 ? [] : [-c / b];
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  // Avoid cancelling a small root when the other root is much larger.
  const q = -(b + (Math.sign(b) || 1) * Math.sqrt(discriminant)) / 2;
  return q === 0 ? [0] : [q / a, c / q];
}

function heightTime(
  y: number,
  vy: number,
  acceleration: number,
  height: number,
  approachingTop = false,
): number {
  return Math.min(
    Infinity,
    ...quadraticRoots(acceleration / 2, vy, y - height).filter(
      (time) => time >= 0 && (approachingTop ? vy + acceleration * time < 0 : time > 1e-12),
    ),
  );
}

// Split at floor knots and stationary gaps: each interval then has a monotonic
// circle-center/floor gap. Parabolic travel against a smoothstep floor gives a
// cubic gap, whose stationary points are the roots of a quadratic.
function floorContactTime(
  target: Target,
  floor: FloorProfile,
  duration: number,
  acceleration: number,
): number {
  const { x, y } = target.position;
  const { x: vx, y: vy } = target.velocity;
  const cuts = [0, duration];
  const addX = (value: number): void => {
    if (vx === 0) return;
    const time = (value - x) / vx;
    if (time > 0 && time < duration) cuts.push(time);
  };
  for (const point of floor.controlPoints) addX(point.x);
  const addTime = (time: number): void => {
    if (time > 0 && time < duration) cuts.push(time);
  };
  // This also covers flat portions and the constant extension past end knots.
  if (acceleration !== 0) addTime(-vy / acceleration);
  for (let index = 1; index < floor.controlPoints.length; index++) {
    const left = floor.controlPoints[index - 1],
      right = floor.controlPoints[index];
    if (left === undefined || right === undefined || vx === 0 || right.y === left.y) continue;
    const width = right.x - left.x;
    const phase = (x - left.x) / width;
    const rate = vx / width;
    const factor = 6 * (right.y - left.y) * rate;
    for (const time of quadraticRoots(
      -factor * rate * rate,
      factor * rate * (1 - 2 * phase) - acceleration,
      factor * phase * (1 - phase) - vy,
    )) {
      const at = phase + rate * time;
      if (at >= 0 && at <= 1) addTime(time);
    }
  }
  cuts.sort((a, b) => a - b);
  const gap = (time: number): number =>
    targetVerticalBounds(floor, x + vx * time, target.radius)[1] -
    y -
    vy * time -
    (acceleration * time * time) / 2;
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

// After an impulse, integrate bounded restoring float exactly between boundary
// and midpoint events. Velocity stays continuous through the well's midpoint;
// reflection preserves kinetic energy. Only sub-resolution vertical settling
// dissipates energy; the fixed potential bounds all resolved motion.
export function advanceImpulseTarget(target: Target, dt: number, floor: FloorProfile): void {
  const sticky =
    target.kind === "plaque" && target.behavior?.kind === "sticky" ? target.behavior : undefined;
  let elapsed = 0;
  while (elapsed < dt) {
    const paused = sticky !== undefined && sticky.pauseRemaining > 0;
    if (!paused) settleUnresolvedFloat(target);
    const start = { ...target.position };
    let duration: number;
    if (paused && sticky !== undefined) {
      duration = Math.min(dt - elapsed, sticky.pauseRemaining);
      sticky.pauseRemaining = Math.max(0, sticky.pauseRemaining - duration);
      target.velocity = { x: 0, y: 0 };
    } else {
      const velocity = target.velocity;
      const acceleration =
        -FLUID_RESTORING_ACCELERATION *
        (Math.sign(start.y - FLUID_MIDDLE) || Math.sign(velocity.y));
      const wall = velocity.x >= 0 ? ARENA_WIDTH - target.radius : target.radius;
      const wallTime = velocity.x === 0 ? Infinity : Math.max(0, (wall - start.x) / velocity.x);
      const top = targetVerticalBounds(floor, start.x, target.radius)[0];
      const topTime = heightTime(start.y, velocity.y, acceleration, top, true);
      const middleTime = heightTime(start.y, velocity.y, acceleration, FLUID_MIDDLE);
      const horizon = Math.min(dt - elapsed, MAX_SWEEP_DURATION, wallTime, topTime, middleTime);
      const floorTime = floorContactTime(target, floor, horizon, acceleration);
      duration = Math.min(horizon, floorTime);
      target.position = {
        x: logicalCoordinate(start.x + velocity.x * duration),
        y: logicalCoordinate(start.y + velocity.y * duration + (acceleration * duration ** 2) / 2),
      };
      velocity.y += acceleration * duration;
      if (duration === middleTime) target.position.y = logicalCoordinate(FLUID_MIDDLE);
      if (duration === floorTime) {
        const normal = floorNormal(floor, target.position.x);
        reflect(velocity, normal);
        target.position.x = logicalCoordinate(target.position.x + normal.x * 1e-7);
        target.position.y = logicalCoordinate(target.position.y + normal.y * 1e-7);
      }
      if (duration === topTime) {
        target.position.y = logicalCoordinate(top);
        velocity.y = Math.abs(velocity.y);
      }
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
