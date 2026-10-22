import { logicalCoordinate } from "./brands";
import type { TargetId } from "./brands";
import { ARENA_HEIGHT, ARENA_WIDTH, GRAVITY, TARGET_PRESETS } from "./constants";
import type { PlaqueSize, TargetSpawn } from "./types/level";
import type { Target } from "./types/simulation";

export function bounceVelocity(size: PlaqueSize, bounceMultiplier: number = 1): number {
  const preset = TARGET_PRESETS[size];
  // A floor bounce cannot rise farther than the space between floor and ceiling contacts.
  const rise = Math.min(preset.bounceRise * bounceMultiplier, ARENA_HEIGHT - 2 * preset.radius);
  return -Math.sqrt(2 * GRAVITY * rise);
}

// Copy coordinates so mutating an entity cannot mutate the canonical level configuration.
export function createTarget(
  spawn: TargetSpawn,
  id: TargetId,
  speedMultiplier: number,
  activeFromTick: number = 0,
  bounceMultiplier: number = 1,
): Target {
  const preset = TARGET_PRESETS[spawn.size];
  const position = {
    x: logicalCoordinate(
      Math.max(preset.radius, Math.min(ARENA_WIDTH - preset.radius, spawn.position.x)),
    ),
    y: logicalCoordinate(
      Math.max(preset.radius, Math.min(ARENA_HEIGHT - preset.radius, spawn.position.y)),
    ),
  };
  const body = {
    id,
    position,
    previousPosition: { ...position },
    radius: preset.radius,
    activeFromTick,
    velocity: {
      x: spawn.direction * preset.horizontalSpeed * speedMultiplier,
      y: bounceVelocity(spawn.size, bounceMultiplier),
    },
  };
  if (spawn.kind === "plaque") return { ...body, kind: "plaque", size: spawn.size };
  return { ...body, kind: "platelet", size: spawn.size };
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
