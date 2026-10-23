import { logicalCoordinate } from "./brands";
import { FLAT_FLOOR, targetVerticalBounds } from "./arena_geometry";
import { orbitPhase, targetVerticalVelocity } from "./motion";
import { HEAVY_SPEED_FACTOR, UNSTABLE_SPLIT_DURATION } from "./lipid_behaviors";
import type { TargetId } from "./brands";
import { ARENA_WIDTH, FLUID_ANGULAR_SPEED, TARGET_PRESETS } from "./constants";
import type { FloorProfile, PlaqueSize, TargetSpawn } from "./types/level";
import type { Target } from "./types/simulation";

// Copy coordinates so mutating an entity cannot mutate the canonical level configuration.
export function createTarget(
  spawn: TargetSpawn,
  id: TargetId,
  speedMultiplier: number,
  activeFromTick: number = 0,
  floor: FloorProfile = FLAT_FLOOR,
): Target {
  const preset = TARGET_PRESETS[spawn.size];
  const x = Math.max(preset.radius, Math.min(ARENA_WIDTH - preset.radius, spawn.position.x));
  const [top, bottom] = targetVerticalBounds(floor, x, preset.radius);
  const position = {
    x: logicalCoordinate(x),
    y: logicalCoordinate(Math.max(top, Math.min(bottom, spawn.position.y))),
  };
  const amplitude = (bottom - top) / 2;
  const phase =
    (spawn.kind === "platelet"
      ? Math.acos(Math.max(-1, Math.min(1, ((top + bottom) / 2 - position.y) / amplitude)))
      : orbitPhase(spawn.kind, (position.y - top) / (bottom - top))) * (id % 2 === 0 ? -1 : 1);
  const motionMultiplier =
    speedMultiplier *
    (spawn.kind === "plaque" && spawn.behavior === "heavy" ? HEAVY_SPEED_FACTOR : 1);
  const angularSpeed = FLUID_ANGULAR_SPEED * motionMultiplier;
  const body = {
    id,
    position,
    previousPosition: { ...position },
    motionSegments: [],
    radius: preset.radius,
    activeFromTick,
    mergeCooldownUntil: 0,
    fluidPhase: phase,
    fluidAngularSpeed: angularSpeed,
    velocity: {
      x: spawn.direction * preset.horizontalSpeed * motionMultiplier,
      y: 0,
    },
  };
  const target: Target =
    spawn.kind === "plaque"
      ? { ...body, kind: "plaque", size: spawn.size }
      : { ...body, kind: "platelet", size: spawn.size };
  if (target.kind === "plaque" && spawn.kind === "plaque") {
    switch (spawn.behavior) {
      case "sticky":
        target.behavior = { kind: "sticky", pauseRemaining: 0, resumeVelocityX: target.velocity.x };
        break;
      case "heavy":
        target.behavior = { kind: "heavy" };
        break;
      case "unstable":
        target.behavior = { kind: "unstable", splitRemaining: UNSTABLE_SPLIT_DURATION };
        break;
    }
  }
  target.velocity.y = targetVerticalVelocity(target, floor);
  return target;
}

export function nextPlaqueSize(size: PlaqueSize): PlaqueSize | undefined {
  switch (size) {
    case "large":
      return "medium";
    case "medium":
      return "small";
    case "small":
      return "tiny";
    case "tiny":
      return undefined;
  }
}
