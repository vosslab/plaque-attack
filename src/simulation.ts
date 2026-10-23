import { absorbContact, advanceFlow, advanceSupport, steerCurrent } from "./remix_mechanics";
import { logicalCoordinate } from "./brands";
import { playerSupportY } from "./arena_geometry";
import { sweptTargetPlayerContact } from "./collision";
import { resolveCoalescence } from "./coalescence";
import {
  ARENA_WIDTH,
  CONTACT_INVULNERABILITY,
  OVERLOAD_DURATION,
  PLAYER_SPEED,
  PLAYER_WIDTH,
} from "./constants";
import { advanceTarget } from "./motion";
import { advanceUnstable, resolveClearancePulse } from "./lipid_behaviors";
import { awardSurvival, completeLevel, endRun } from "./scoring";
import { canBankSteadyFlow, STEADY_FLOW_DURATION } from "./steady_flow";
import type { SimulationEvent } from "./types/events";
import type { SimulationState, SimulationStep } from "./types/simulation";
import {
  advancePocketReleases,
  commitTissueErosion,
  freezeTissue,
  hasPendingTargets,
  resolveTargetTissue,
} from "./tissue";
import { advanceFinale, advanceWaves, clearObjectiveSatisfied } from "./waves";
import { fireWeapon, resolveProjectileHits } from "./weapons";

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
  const steadyAtStart = canBankSteadyFlow(state);
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
  state.player.position.y = logicalCoordinate(
    playerSupportY(state.level.arena.floor, state.player.position.x),
  );
  state.fireCooldown = Math.max(0, state.fireCooldown - dt);
  state.player.contactInvulnerabilityRemaining = Math.max(
    0,
    state.player.contactInvulnerabilityRemaining - dt,
  );
  if (input.fire) fireWeapon(state, events);
  advanceFlow(state, dt);
  steerCurrent(state, dt);
  const tissue = freezeTissue(state);
  for (const target of state.targets) advanceTarget(target, dt, state.level.arena.floor);
  resolveTargetTissue(state, dt, tissue);
  resolveProjectileHits(state, dt, events, tissue);
  advanceUnstable(state, dt, events);
  resolveCoalescence(state, events);
  const contact =
    state.player.contactInvulnerabilityRemaining <= 1e-9 &&
    state.targets.some(
      (target) =>
        target.activeFromTick <= state.tick && sweptTargetPlayerContact(target, state.player),
    );
  const contactDamage = contact && !absorbContact(state, events);
  if (contactDamage) damage(state, "contact", events);
  commitTissueErosion(state, tissue, events);
  resolveClearancePulse(state, tissue, events);
  advanceSupport(state, dt, tissue, events);
  state.elapsed += dt;
  advanceWaves(state, dt, events);
  advancePocketReleases(state, dt, events);
  advanceOverload(state, dt, contactDamage, previouslyOverloaded, events);
  advanceFinale(state, dt, events);
  if (state.level.objective.kind === "maintenance") {
    state.steadyFlowSeconds =
      canBankSteadyFlow(state) && !events.some((event) => event.type === "damage")
        ? Math.min(STEADY_FLOW_DURATION, state.steadyFlowSeconds + (steadyAtStart ? dt : 0))
        : 0;
    if (state.steadyFlowSeconds + 1e-9 >= STEADY_FLOW_DURATION)
      state.steadyFlowSeconds = STEADY_FLOW_DURATION;
  }
  awardSurvival(state, events);
  if (state.player.lives <= 0) {
    state.phase = "game_over";
    endRun(state, "ended", events);
  } else if (
    clearObjectiveSatisfied(state) ||
    (state.level.objective.kind === "maintenance" &&
      (state.elapsed + 1e-9 >= state.level.objective.duration ||
        (state.steadyFlowSeconds >= STEADY_FLOW_DURATION && state.waves.warning === undefined)) &&
      !hasPendingTargets(state) &&
      state.targets.length <= state.level.objective.safeMaximum)
  ) {
    completeLevel(state, events);
  }
  return events;
};
