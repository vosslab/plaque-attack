import { logicalCoordinate } from "./brands";
import { bounceVelocity } from "./characters";
import { touchesPlayer } from "./collision";
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  CONTACT_INVULNERABILITY,
  GRAVITY,
  OVERLOAD_DURATION,
  PLAYER_SPEED,
  PLAYER_WIDTH,
} from "./constants";
import { awardSurvival, completeLevel, endRun } from "./scoring";
import type { SimulationEvent } from "./types/events";
import type { SimulationState, SimulationStep, Target } from "./types/simulation";
import { advanceWaves, clearObjectiveSatisfied } from "./waves";
import { fireWeapon, resolveProjectileHits } from "./weapons";

function advanceTarget(target: Target, dt: number, bounceMultiplier: number): void {
  target.previousPosition = { ...target.position };
  let x = target.position.x + target.velocity.x * dt;
  let y = target.position.y + target.velocity.y * dt + (GRAVITY * dt * dt) / 2;
  target.velocity.y += GRAVITY * dt;
  if (x < target.radius) {
    x = target.radius + (target.radius - x);
    target.velocity.x = Math.abs(target.velocity.x);
  } else if (x > ARENA_WIDTH - target.radius) {
    x = 2 * (ARENA_WIDTH - target.radius) - x;
    target.velocity.x = -Math.abs(target.velocity.x);
  }
  if (y < target.radius) {
    y = target.radius + (target.radius - y);
    target.velocity.y = Math.abs(target.velocity.y);
  } else if (y > ARENA_HEIGHT - target.radius) {
    y = ARENA_HEIGHT - target.radius;
    target.velocity.y = bounceVelocity(target.size, bounceMultiplier);
  }
  target.position.x = logicalCoordinate(
    Math.max(target.radius, Math.min(ARENA_WIDTH - target.radius, x)),
  );
  target.position.y = logicalCoordinate(
    Math.max(target.radius, Math.min(ARENA_HEIGHT - target.radius, y)),
  );
}

function damage(
  state: SimulationState,
  cause: "contact" | "overload",
  events: SimulationEvent[],
): void {
  state.player.lives = Math.max(0, state.player.lives - 1);
  state.levelLivesLost += 1;
  state.streak = 0;
  if (cause === "contact") state.player.contactInvulnerabilityRemaining = CONTACT_INVULNERABILITY;
  events.push({
    type: "damage",
    cause,
    lives: state.player.lives,
    position: { ...state.player.position },
  });
}

function advanceOverload(
  state: SimulationState,
  dt: number,
  contactDamage: boolean,
  previouslyOverloaded: boolean,
  events: SimulationEvent[],
): void {
  const objective = state.level.objective;
  if (objective.kind !== "maintenance") return;
  const overloaded = state.targets.length > objective.safeMaximum;
  if (!overloaded) {
    if (previouslyOverloaded || state.overloadElapsed > 0)
      events.push({ type: "overload", active: false });
    state.overloadElapsed = 0;
    return;
  }
  if (state.overloadElapsed === 0) events.push({ type: "overload", active: true });
  state.overloadElapsed += dt;
  if (state.overloadElapsed + 1e-9 < OVERLOAD_DURATION) return;
  if (!contactDamage) damage(state, "overload", events);
  state.overloadElapsed = 0;
}

// A fixed-step, browser-independent mutation boundary. Paused and terminal phases are inert.
export const stepSimulation: SimulationStep = (state, input, dt) => {
  const events: SimulationEvent[] = [];
  if ((state.phase !== "ready" && state.phase !== "playing") || !Number.isFinite(dt) || dt <= 0)
    return events;
  if (state.player.lives <= 0) {
    state.phase = "game_over";
    endRun(state, "ended", events);
    return events;
  }
  if (state.phase === "ready") {
    state.readyRemaining = Math.max(0, state.readyRemaining - dt);
    if (state.readyRemaining < 1e-9) {
      state.readyRemaining = 0;
      state.phase = "playing";
      state.resumePhase = "playing";
    }
    return events;
  }
  state.tick += 1;
  const previouslyOverloaded =
    state.level.objective.kind === "maintenance" &&
    state.targets.length > state.level.objective.safeMaximum;
  const direction = Number(input.right) - Number(input.left);
  state.player.position.x = logicalCoordinate(
    Math.max(
      PLAYER_WIDTH / 2,
      Math.min(
        ARENA_WIDTH - PLAYER_WIDTH / 2,
        state.player.position.x + direction * PLAYER_SPEED * dt,
      ),
    ),
  );
  state.fireCooldown = Math.max(0, state.fireCooldown - dt);
  state.player.contactInvulnerabilityRemaining = Math.max(
    0,
    state.player.contactInvulnerabilityRemaining - dt,
  );
  if (input.fire) fireWeapon(state, events);
  for (const target of state.targets) advanceTarget(target, dt, state.level.bounceMultiplier);
  resolveProjectileHits(state, dt, events);
  const contact =
    state.player.contactInvulnerabilityRemaining <= 1e-9 &&
    state.targets.some(
      (target) => target.activeFromTick <= state.tick && touchesPlayer(target, state.player),
    );
  if (contact) damage(state, "contact", events);
  state.elapsed += dt;
  advanceWaves(state, dt, events);
  advanceOverload(state, dt, contact, previouslyOverloaded, events);
  awardSurvival(state, events);
  if (state.player.lives <= 0) {
    state.phase = "game_over";
    endRun(state, "ended", events);
  } else if (
    clearObjectiveSatisfied(state) ||
    (state.level.objective.kind === "maintenance" &&
      state.elapsed + 1e-9 >= state.level.objective.duration &&
      state.targets.length <= state.level.objective.safeMaximum)
  ) {
    completeLevel(state, events);
  }
  return events;
};
