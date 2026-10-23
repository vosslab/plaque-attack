import { FLAT_FLOOR, floorSlope, targetVerticalBounds } from "./arena_geometry";
import { logicalCoordinate } from "./brands";
import { ARENA_WIDTH, STICKY_PAUSE_DURATION } from "./constants";
import type { FloorProfile } from "./types/level";
import type { LogicalPoint } from "./types/player";
import type { Target, TargetMotionSegment, Velocity } from "./types/simulation";

const PLAQUE_ORBIT_SHAPE = 0.9;
const PLAQUE_ORBIT_ANGLE = Math.asin(PLAQUE_ORBIT_SHAPE);

// Normalized depth and phase derivative share the same kind-selected orbit contract.
export function orbitPosition(kind: Target["kind"], phase: number): number {
  if (kind === "platelet") return (1 - Math.cos(phase)) / 2;
  return (1 - Math.asin(PLAQUE_ORBIT_SHAPE * Math.cos(phase)) / PLAQUE_ORBIT_ANGLE) / 2;
}

export function orbitSlope(kind: Target["kind"], phase: number): number {
  if (kind === "platelet") return Math.sin(phase) / 2;
  const cosine = PLAQUE_ORBIT_SHAPE * Math.cos(phase);
  return (
    (PLAQUE_ORBIT_SHAPE * Math.sin(phase)) /
    (2 * PLAQUE_ORBIT_ANGLE * Math.sqrt(1 - cosine * cosine))
  );
}

// The descending half-orbit is monotonic; callers choose the travel direction separately.
export function orbitPhase(kind: Target["kind"], normalizedY: number): number {
  const depth = Math.max(0, Math.min(1, normalizedY));
  const cosine =
    kind === "platelet"
      ? 1 - 2 * depth
      : Math.sin((1 - 2 * depth) * PLAQUE_ORBIT_ANGLE) / PLAQUE_ORBIT_SHAPE;
  return Math.acos(Math.max(-1, Math.min(1, cosine)));
}

function orbitY(target: Target, floor: FloorProfile, x: number, phase: number): number {
  const [top, bottom] = targetVerticalBounds(floor, x, target.radius);
  if (target.kind === "plaque") return top + (bottom - top) * orbitPosition(target.kind, phase);
  return (top + bottom) / 2 - ((bottom - top) / 2) * Math.cos(phase);
}

export function targetVerticalVelocity(target: Target, floor: FloorProfile): number {
  const [top, bottom] = targetVerticalBounds(floor, target.position.x, target.radius);
  if (target.kind === "plaque")
    return (
      (bottom - top) * orbitSlope(target.kind, target.fluidPhase) * target.fluidAngularSpeed +
      floorSlope(floor, target.position.x) *
        target.velocity.x *
        orbitPosition(target.kind, target.fluidPhase)
    );
  return (
    ((bottom - top) / 2) * target.fluidAngularSpeed * Math.sin(target.fluidPhase) +
    (floorSlope(floor, target.position.x) * target.velocity.x * (1 - Math.cos(target.fluidPhase))) /
      2
  );
}

// Used after a collision has projected the center to free space and reflected its velocity.
// Reconstruct the local orbit so subsequent ticks depart continuously from that position.
export function synchronizeTargetMotion(
  target: Target,
  floor: FloorProfile,
  velocity: Readonly<Velocity>,
): void {
  target.position.x = logicalCoordinate(
    Math.max(target.radius, Math.min(ARENA_WIDTH - target.radius, target.position.x)),
  );
  const [top, bottom] = targetVerticalBounds(floor, target.position.x, target.radius);
  target.position.y = logicalCoordinate(Math.max(top, Math.min(bottom, target.position.y)));
  const cosine = Math.max(-1, Math.min(1, (top + bottom - 2 * target.position.y) / (bottom - top)));
  const depth = (target.position.y - top) / (bottom - top);
  const phase = target.kind === "platelet" ? Math.acos(cosine) : orbitPhase(target.kind, depth);
  const drift =
    target.kind === "platelet"
      ? (floorSlope(floor, target.position.x) * velocity.x * (1 - cosine)) / 2
      : floorSlope(floor, target.position.x) * velocity.x * depth;
  const direction = Math.sign(velocity.y - drift) || Math.sign(target.fluidAngularSpeed) || 1;
  target.fluidPhase = phase;
  target.fluidAngularSpeed = Math.abs(target.fluidAngularSpeed) * direction;
  target.velocity.x = velocity.x;
  target.velocity.y = targetVerticalVelocity(target, floor);
}

// Linear sampling consumes the exact same bounded travel legs as every sweep consumer.
export function sampleTargetPath(
  segments: readonly TargetMotionSegment[],
  time: number,
): LogicalPoint | undefined {
  const segment = segments.find((leg) => time >= leg.startTime && time <= leg.endTime);
  if (segment === undefined) return undefined;
  const span = segment.endTime - segment.startTime;
  const fraction = span === 0 ? 0 : (time - segment.startTime) / span;
  return {
    x: logicalCoordinate(segment.start.x + (segment.end.x - segment.start.x) * fraction),
    y: logicalCoordinate(segment.start.y + (segment.end.y - segment.start.y) * fraction),
  };
}

// Steady lateral drift and a gentle analytic orbit, with wall turns recorded as separate legs.
export function advanceTarget(target: Target, dt: number, floor: FloorProfile = FLAT_FLOOR): void {
  target.previousPosition = { ...target.position };
  target.motionSegments = [];
  if (!Number.isFinite(dt) || dt <= 0) return;
  const sticky =
    target.kind === "plaque" && target.behavior?.kind === "sticky" ? target.behavior : undefined;
  const initialPhase = target.fluidPhase;
  let movingElapsed = 0;
  let elapsed = 0;
  while (elapsed < dt) {
    if (sticky !== undefined && sticky.pauseRemaining > 0) {
      const duration = Math.min(dt - elapsed, sticky.pauseRemaining);
      const end = Math.min(dt, elapsed + duration);
      target.motionSegments.push({
        startTime: elapsed / dt,
        endTime: end / dt,
        start: { ...target.position },
        end: { ...target.position },
      });
      sticky.pauseRemaining = Math.max(0, sticky.pauseRemaining - duration);
      target.velocity.x = 0;
      target.velocity.y = 0;
      elapsed = end;
      if (sticky.pauseRemaining <= 1e-9) {
        sticky.pauseRemaining = 0;
        target.velocity.x = sticky.resumeVelocityX;
      }
      continue;
    }
    const velocityX = target.velocity.x;
    const wall = velocityX >= 0 ? ARENA_WIDTH - target.radius : target.radius;
    const wallTime = velocityX === 0 ? Infinity : (wall - target.position.x) / velocityX;
    if (wallTime <= 0) {
      target.velocity.x = -velocityX;
      if (sticky !== undefined && velocityX !== 0) {
        sticky.resumeVelocityX = -velocityX;
        sticky.pauseRemaining = STICKY_PAUSE_DURATION;
      }
      continue;
    }
    // Short linear legs bound the curvature error, even for callers using a long time step.
    const duration = Math.min(dt - elapsed, wallTime, 1 / 120);
    const start = { ...target.position };
    const nextElapsed = Math.min(dt, elapsed + duration);
    const nextMovingElapsed = sticky === undefined ? nextElapsed : movingElapsed + duration;
    const x =
      duration === wallTime
        ? wall
        : Math.max(
            target.radius,
            Math.min(ARENA_WIDTH - target.radius, start.x + velocityX * duration),
          );
    target.position = {
      x: logicalCoordinate(x),
      y: logicalCoordinate(
        orbitY(target, floor, x, initialPhase + target.fluidAngularSpeed * nextMovingElapsed),
      ),
    };
    target.motionSegments.push({
      startTime: elapsed / dt,
      endTime: nextElapsed / dt,
      start,
      end: { ...target.position },
    });
    movingElapsed = nextMovingElapsed;
    elapsed = nextElapsed;
    if (duration === wallTime) {
      target.velocity.x = -velocityX;
      if (sticky !== undefined) {
        sticky.resumeVelocityX = -velocityX;
        sticky.pauseRemaining = STICKY_PAUSE_DURATION;
        target.velocity.x = 0;
      }
    }
  }
  target.fluidPhase = (initialPhase + target.fluidAngularSpeed * movingElapsed) % (2 * Math.PI);
  target.velocity.y =
    sticky !== undefined && sticky.pauseRemaining > 0 ? 0 : targetVerticalVelocity(target, floor);
}
