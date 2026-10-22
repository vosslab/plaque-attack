import { FLAT_FLOOR, floorSlope, targetVerticalBounds } from "./arena_geometry";
import { logicalCoordinate } from "./brands";
import { ARENA_WIDTH } from "./constants";
import type { FloorProfile } from "./types/level";
import type { LogicalPoint } from "./types/player";
import type { Target, TargetMotionSegment, Velocity } from "./types/simulation";

function orbitY(target: Target, floor: FloorProfile, x: number, phase: number): number {
  const [top, bottom] = targetVerticalBounds(floor, x, target.radius);
  return (top + bottom) / 2 - ((bottom - top) / 2) * Math.cos(phase);
}

export function targetVerticalVelocity(target: Target, floor: FloorProfile): number {
  const [top, bottom] = targetVerticalBounds(floor, target.position.x, target.radius);
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
  const phase = Math.acos(cosine);
  const drift = (floorSlope(floor, target.position.x) * velocity.x * (1 - cosine)) / 2;
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
  const initialPhase = target.fluidPhase;
  let elapsed = 0;
  while (elapsed < dt) {
    const velocityX = target.velocity.x;
    const wall = velocityX >= 0 ? ARENA_WIDTH - target.radius : target.radius;
    const wallTime = velocityX === 0 ? Infinity : (wall - target.position.x) / velocityX;
    if (wallTime <= 0) {
      target.velocity.x = -velocityX;
      continue;
    }
    // Short linear legs bound the curvature error, even for callers using a long time step.
    const duration = Math.min(dt - elapsed, wallTime, 1 / 120);
    const start = { ...target.position };
    const nextElapsed = Math.min(dt, elapsed + duration);
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
        orbitY(target, floor, x, initialPhase + target.fluidAngularSpeed * nextElapsed),
      ),
    };
    target.motionSegments.push({
      startTime: elapsed / dt,
      endTime: nextElapsed / dt,
      start,
      end: { ...target.position },
    });
    elapsed = nextElapsed;
    if (duration === wallTime) target.velocity.x = -velocityX;
  }
  target.fluidPhase = (initialPhase + target.fluidAngularSpeed * dt) % (2 * Math.PI);
  target.velocity.y = targetVerticalVelocity(target, floor);
}
