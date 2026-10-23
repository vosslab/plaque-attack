import { activateFlow, projectileSwitchContact } from "./remix_mechanics";
import type { FlowSwitchDefinition } from "./types/level";
import { logicalCoordinate, projectileId, targetId } from "./brands";
import { createTarget, nextPlaqueSize } from "./characters";
import {
  MAX_TARGETS,
  DUAL_ACTIVE_LIMIT,
  DUAL_FIRE_INTERVAL,
  PLAYER_HEIGHT,
  STENT_CEILING_LINGER,
  WEAPON_CONFIGS,
} from "./constants";
import { projectileContact, targetPathSegments } from "./collision";
import { sampleTargetPath } from "./motion";
import { freezeTissue, projectileTissueContact, queueProjectileErosion } from "./tissue";
import { awardHit } from "./scoring";
import type { SimulationEvent } from "./types/events";
import type { Projectile, SimulationState, Target, TissueTick } from "./types/simulation";

export function fireWeapon(state: SimulationState, events: SimulationEvent[]): void {
  if (state.fireCooldown > 1e-9) return;
  const mode = state.level.weapon;
  const kind = mode === "dual" ? state.nextDrug : mode;
  const config = WEAPON_CONFIGS[kind];
  const count =
    mode === "dual"
      ? state.projectiles.length
      : state.projectiles.filter((shot) => shot.kind === kind).length;
  if (count >= (mode === "dual" ? DUAL_ACTIVE_LIMIT : config.activeLimit)) return;
  const position = {
    x: state.player.position.x,
    y: logicalCoordinate(state.player.position.y - PLAYER_HEIGHT + 8),
  };
  const body = {
    id: projectileId(state.nextProjectileId++),
    position,
    previousPosition: { ...position },
    origin: { ...position },
    age: 0,
  };
  const projectile: Projectile =
    kind === "stent" ? { ...body, kind, ceilingTime: 0 } : { ...body, kind, hitTargetIds: [] };
  state.projectiles.push(projectile);
  state.fireCooldown = mode === "dual" ? DUAL_FIRE_INTERVAL : config.interval;
  if (mode === "dual") state.nextDrug = kind === "aspirin" ? "clopidogrel" : "aspirin";
  events.push({ type: "shot", projectileId: projectile.id, kind, position: { ...position } });
}

// Clip travel to its actual remaining range/lifetime; collision never extends past expiry.
function advanceProjectile(projectile: Projectile, dt: number): { active: number; growth: number } {
  const config = WEAPON_CONFIGS[projectile.kind];
  projectile.previousPosition = { ...projectile.position };
  const oldY = projectile.position.y;
  const remainingRange = config.range - (projectile.origin.y - oldY);
  const boundaryTime =
    projectile.kind === "stent"
      ? oldY / config.speed + STENT_CEILING_LINGER - projectile.ceilingTime
      : Math.min(oldY, remainingRange) / config.speed;
  const activeTime = Math.max(0, Math.min(dt, config.lifetime - projectile.age, boundaryTime));
  const growthTime = Math.min(activeTime, oldY / config.speed);
  projectile.position.y = logicalCoordinate(
    Math.max(0, projectile.origin.y - config.range, oldY - config.speed * activeTime),
  );
  if (projectile.kind === "stent" && projectile.position.y === 0) {
    projectile.ceilingTime += Math.max(0, activeTime - growthTime);
  }
  projectile.age += dt;
  return { active: activeTime / dt, growth: growthTime / dt };
}

export function projectileExpired(projectile: Projectile): boolean {
  const config = WEAPON_CONFIGS[projectile.kind];
  if (projectile.age + 1e-9 >= config.lifetime) return true;
  if (projectile.kind === "stent") return projectile.ceilingTime + 1e-9 >= STENT_CEILING_LINGER;
  return (
    projectile.position.y <= 0 ||
    projectile.origin.y - projectile.position.y + 1e-9 >= config.range ||
    projectile.hitTargetIds.length >= config.targetLimit
  );
}

function splitTarget(state: SimulationState, target: Target): void {
  if (target.kind !== "plaque") return;
  const size = nextPlaqueSize(target.size);
  if (size === undefined) return;
  for (const direction of [-1, 1] as const) {
    const child = createTarget(
      { kind: "plaque", size, direction, position: { ...target.position } },
      targetId(state.nextTargetId++),
      state.level.speedMultiplier,
      state.tick + 1,
      state.level.arena.floor,
    );
    child.mergeCooldownUntil = target.mergeCooldownUntil;
    if (state.targets.length < MAX_TARGETS) state.targets.push(child);
    else state.arena.pendingInsertions.push({ kind: "split", sourceId: target.id, target: child });
  }
}

// Resolve the global earliest contact, then recompute eligibility after every removal.
// This keeps a piercing shot and intersecting shots deterministic without double scoring.
export function resolveProjectileHits(
  state: SimulationState,
  dt: number,
  events: SimulationEvent[],
  tissue: TissueTick = freezeTissue(state),
): void {
  const consumed = new Set<Projectile>();
  const sweeps = new Map(state.projectiles.map((shot) => [shot, advanceProjectile(shot, dt)]));
  let minimumTime = 0;
  for (;;) {
    let best: { projectile: Projectile; target: Target; time: number } | undefined;
    let flowContact:
      { projectile: Projectile; definition: FlowSwitchDefinition; time: number } | undefined;
    let solid:
      { projectile: Projectile; cell: TissueTick["cells"][number]; time: number } | undefined;
    for (const projectile of state.projectiles) {
      if (consumed.has(projectile)) continue;
      const shotSweep = sweeps.get(projectile);
      if (shotSweep !== undefined) {
        const hit = projectileTissueContact(projectile, shotSweep.active, shotSweep.growth, tissue);
        if (
          hit !== undefined &&
          hit.time >= minimumTime &&
          (solid === undefined ||
            hit.time < solid.time ||
            (hit.time === solid.time &&
              (hit.cell.patchId.localeCompare(solid.cell.patchId) ||
                hit.cell.cellId.localeCompare(solid.cell.cellId) ||
                projectile.id - solid.projectile.id) < 0))
        )
          solid = { projectile, ...hit };
      }
      if (shotSweep !== undefined && state.remix.flow.kind === "ready") {
        for (const definition of state.level.flowSwitches ?? []) {
          const time = projectileSwitchContact(
            projectile,
            definition,
            shotSweep.active,
            shotSweep.growth,
          );
          if (
            time !== undefined &&
            time >= minimumTime &&
            (flowContact === undefined ||
              time < flowContact.time ||
              (time === flowContact.time && projectile.id < flowContact.projectile.id))
          ) {
            flowContact = { projectile, definition, time };
          }
        }
      }
      for (const target of state.targets) {
        if (target.activeFromTick > state.tick) continue;
        const sweep = sweeps.get(projectile);
        if (sweep === undefined || sweep.active <= 0) continue;
        const time = projectileContact(projectile, target, sweep.active, sweep.growth);
        if (time === undefined || time < minimumTime) continue;
        if (
          best === undefined ||
          time < best.time ||
          (time === best.time &&
            (target.id < best.target.id ||
              (target.id === best.target.id && projectile.id < best.projectile.id)))
        ) {
          best = { projectile, target, time };
        }
      }
    }
    if (
      solid !== undefined &&
      (best === undefined || solid.time <= best.time) &&
      (flowContact === undefined || solid.time <= flowContact.time)
    ) {
      minimumTime = solid.time;
      queueProjectileErosion(tissue, solid.cell);
      consumed.add(solid.projectile);
      continue;
    }
    if (flowContact !== undefined && (best === undefined || flowContact.time < best.time)) {
      minimumTime = flowContact.time;
      consumed.add(flowContact.projectile);
      activateFlow(state, flowContact.definition, events);
      continue;
    }
    if (best === undefined) break;
    const { projectile, target, time } = best;
    minimumTime = time;
    state.targets = state.targets.filter((candidate) => candidate.id !== target.id);
    // Splits originate at the swept contact, rather than the target's end-of-tick position.
    target.position = sampleTargetPath(targetPathSegments(target), time) ?? { ...target.position };
    const points = awardHit(state, target);
    const split = target.kind === "plaque" && nextPlaqueSize(target.size) !== undefined;
    events.push({
      type: "target_hit",
      targetId: target.id,
      projectileId: projectile.id,
      targetKind: target.kind,
      size: target.size,
      position: { ...target.position },
      points,
      streak: state.streak,
      split,
    });
    splitTarget(state, target);
    if (projectile.kind === "stent") consumed.add(projectile);
    else {
      projectile.hitTargetIds.push(target.id);
      if (projectile.hitTargetIds.length >= WEAPON_CONFIGS[projectile.kind].targetLimit) {
        consumed.add(projectile);
      }
    }
  }
  state.projectiles = state.projectiles.filter(
    (shot) => !consumed.has(shot) && !projectileExpired(shot),
  );
}
