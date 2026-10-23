import { logicalCoordinate, targetId } from "./brands";
import { playerSupportY } from "./arena_geometry";
import { createTarget } from "./characters";
import { HEAVY_SPEED_FACTOR } from "./lipid_behaviors";
import { distanceToBox, projectileContact } from "./collision";
import {
  CONTACT_INVULNERABILITY,
  PLAYER_HITBOX_HEIGHT,
  PLAYER_HITBOX_WIDTH,
  TARGET_PRESETS,
} from "./constants";
import type { SimulationEvent } from "./types/events";
import type { FlowSwitchDefinition } from "./types/level";
import type { Projectile, RemixState, SimulationState, TissueTick } from "./types/simulation";
import type { RandomSeed } from "./brands";

export const FLOW_SWITCH_RADIUS = 24;
export const FLOW_ACTIVE_DURATION = 4;
export const FLOW_COOLDOWN_DURATION = 6;
export const FINALE_TRANSITION_DURATION = 0.75;

export function createRemixState(state: SimulationState["level"], seed: RandomSeed): RemixState {
  return {
    ...(state.clearancePulse === undefined ? {} : { clearancePulse: { activated: false } }),
    flow: { kind: "ready" },
    supportPockets: (state.arena.supportPockets ?? []).map((pocket) => ({
      id: pocket.id,
      status: "sealed",
      capsulePosition: undefined,
    })),
    contactShield: false,
    finale:
      state.objective.kind === "clear" && state.objective.phases !== undefined
        ? { phaseIndex: 0, transitionRemaining: 0 }
        : undefined,
    retry: { entrySeed: seed, retryCount: 0 },
  };
}

// Reuse the weapon solver's swept circle/beam geometry for the fixed switch body.
export function projectileSwitchContact(
  projectile: Projectile,
  definition: FlowSwitchDefinition,
  active: number,
  growth: number,
): number | undefined {
  const target = createTarget(
    {
      kind: projectile.kind === "stent" ? "plaque" : "platelet",
      size: "tiny",
      position: { ...definition.position },
      direction: 1,
    },
    targetId(0),
    0,
  );
  target.position = { ...definition.position };
  target.previousPosition = { ...definition.position };
  target.radius = FLOW_SWITCH_RADIUS;
  return projectileContact(projectile, target, active, growth);
}

export function activateFlow(
  state: SimulationState,
  definition: FlowSwitchDefinition,
  events: SimulationEvent[],
): void {
  state.remix.flow = { kind: "active", switchId: definition.id, remaining: FLOW_ACTIVE_DURATION };
  events.push({
    type: "flow_activated",
    switchId: definition.id,
    position: { ...definition.position },
    laneX: definition.laneX,
  });
}

export function advanceFlow(state: SimulationState, dt: number): void {
  const flow = state.remix.flow;
  if (flow.kind === "ready") return;
  const remaining = flow.remaining - dt;
  if (remaining > 1e-9) flow.remaining = remaining;
  else if (flow.kind === "active") {
    restoreOrdinaryDrift(state, flow.switchId);
    const cooldown = FLOW_COOLDOWN_DURATION + remaining;
    state.remix.flow =
      cooldown > 1e-9 ? { kind: "cooldown", remaining: cooldown } : { kind: "ready" };
  } else state.remix.flow = { kind: "ready" };
}

function restoreOrdinaryDrift(state: SimulationState, switchId: string): void {
  const definition = state.level.flowSwitches?.find((item) => item.id === switchId);
  for (const target of state.targets) {
    if (
      target.kind === "plaque" &&
      target.behavior?.kind === "sticky" &&
      target.behavior.pauseRemaining > 0
    )
      continue;
    const laneOffset = (definition?.laneX ?? target.position.x) - target.position.x;
    const direction =
      Math.sign(target.velocity.x) || Math.sign(laneOffset) || (target.id % 2 === 0 ? 1 : -1);
    target.velocity.x =
      direction *
      TARGET_PRESETS[target.size].horizontalSpeed *
      state.level.speedMultiplier *
      (target.kind === "plaque" && target.behavior?.kind === "heavy" ? HEAVY_SPEED_FACTOR : 1);
  }
}

export function steerCurrent(state: SimulationState, dt: number): void {
  const flow = state.remix.flow;
  if (flow.kind !== "active") return;
  const definition = state.level.flowSwitches?.find((item) => item.id === flow.switchId);
  if (definition === undefined) return;
  for (const target of state.targets) {
    if (
      target.kind === "plaque" &&
      target.behavior?.kind === "sticky" &&
      target.behavior.pauseRemaining > 0
    )
      continue;
    const maximum =
      TARGET_PRESETS[target.size].horizontalSpeed *
      state.level.speedMultiplier *
      (target.kind === "plaque" && target.behavior?.kind === "heavy" ? HEAVY_SPEED_FACTOR : 1);
    const desired = Math.max(
      -maximum,
      Math.min(maximum, (definition.laneX - target.position.x) * 1.4),
    );
    const change = maximum * 2 * dt;
    target.velocity.x = Math.max(
      -maximum,
      Math.min(
        maximum,
        target.velocity.x + Math.max(-change, Math.min(change, desired - target.velocity.x)),
      ),
    );
  }
}

export function advanceSupport(
  state: SimulationState,
  dt: number,
  tissue: TissueTick,
  events: SimulationEvent[],
): void {
  for (const pocket of state.remix.supportPockets) {
    const definition = state.level.arena.supportPockets?.find((item) => item.id === pocket.id);
    if (definition === undefined || pocket.status === "collected") continue;
    if (pocket.status === "sealed") {
      if (
        !definition.breachCells.some((ref) =>
          tissue.erosion.has(JSON.stringify([ref.patchId, ref.cellId])),
        )
      )
        continue;
      pocket.status = "released";
      pocket.capsulePosition = { ...definition.releasePosition };
      events.push({
        type: "support_released",
        pocketId: pocket.id,
        position: { ...definition.releasePosition },
      });
    }
    const position = pocket.capsulePosition;
    if (position === undefined) continue;
    position.y = logicalCoordinate(
      Math.min(playerSupportY(state.level.arena.floor, position.x) - 10, position.y + 42 * dt),
    );
    const player = state.player.position;
    if (
      distanceToBox(
        position.x,
        position.y,
        player.x - PLAYER_HITBOX_WIDTH / 2,
        player.x + PLAYER_HITBOX_WIDTH / 2,
        player.y - PLAYER_HITBOX_HEIGHT,
        player.y,
      ) > 100
    )
      continue;
    pocket.status = "collected";
    pocket.capsulePosition = undefined;
    state.remix.contactShield = true;
    events.push({ type: "shield_collected", position: { ...position } });
  }
}

export function absorbContact(state: SimulationState, events: SimulationEvent[]): boolean {
  if (!state.remix.contactShield) return false;
  state.remix.contactShield = false;
  state.player.contactInvulnerabilityRemaining = CONTACT_INVULNERABILITY;
  events.push({ type: "shield_absorbed", position: { ...state.player.position } });
  return true;
}
