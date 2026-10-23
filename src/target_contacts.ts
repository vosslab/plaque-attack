import { logicalCoordinate } from "./brands";
import {
  sampleSegment,
  targetPairContact,
  targetPathSegments,
  targetPathVelocity,
} from "./collision";
import { attemptCoalescence, finishCoalescenceContacts } from "./coalescence";
import { FIXED_STEP } from "./constants";
import { rewriteTargetPath, stopTargetPath } from "./motion";
import {
  applyTargetTissueContact,
  finishTargetTissueContacts,
  firstTargetTissueContact,
  freezeTissue,
} from "./tissue";
import type { TargetTissueContact } from "./tissue";
import type { SimulationEvent } from "./types/events";
import type { LogicalPoint } from "./types/player";
import type { SimulationState, Target, TissueTick } from "./types/simulation";
import type { ProjectileContactSession } from "./weapons";

type PairContact = { lower: Target; higher: Target; time: number };

// Contact times are normalized fractions of one tick. Independent geometry
// roots within 1e-10 share a contact instant; preserve the declared tie priority
// instead of letting floating-point cancellation choose the response order.
const CONTACT_TIME_EPSILON = 1e-10;

function compareContactTimes(left: number, right: number): number {
  if (left === right || Math.abs(left - right) <= CONTACT_TIME_EPSILON) return 0;
  return left < right ? -1 : 1;
}

function positionAt(target: Target, time: number): LogicalPoint {
  const leg = targetPathSegments(target).find(
    (item) => time >= item.startTime && time <= item.endTime,
  );
  return leg === undefined ? { ...target.position } : sampleSegment(leg, time);
}

function bouncePair(
  state: SimulationState,
  contact: PairContact,
  dt: number,
  events: SimulationEvent[],
): void {
  const { lower, higher, time } = contact;
  const a = positionAt(lower, time),
    b = positionAt(higher, time);
  const av = targetPathVelocity(lower, time, dt),
    bv = targetPathVelocity(higher, time, dt);
  if (attemptCoalescence(state, lower, higher, [a, b], [av, bv], events)) return;
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  if (distance <= 1e-12) return;
  const nx = (b.x - a.x) / distance,
    ny = (b.y - a.y) / distance;
  const approach = (av.x - bv.x) * nx + (av.y - bv.y) * ny;
  if (approach <= 0) return;
  // Disk area supplies mass: small lipids visibly ricochet off larger bodies.
  const aMass = lower.radius * lower.radius,
    bMass = higher.radius * higher.radius;
  const impulse = (2 * approach) / (1 / aMass + 1 / bMass);
  const aVelocity = { x: av.x - (impulse * nx) / aMass, y: av.y - (impulse * ny) / aMass };
  const bVelocity = { x: bv.x + (impulse * nx) / bMass, y: bv.y + (impulse * ny) / bMass };
  const separation = 1e-5;
  rewriteTargetPath(
    lower,
    time,
    { x: logicalCoordinate(a.x - nx * separation), y: logicalCoordinate(a.y - ny * separation) },
    aVelocity,
    dt,
    state.level.arena.floor,
  );
  rewriteTargetPath(
    higher,
    time,
    { x: logicalCoordinate(b.x + nx * separation), y: logicalCoordinate(b.y + ny * separation) },
    bVelocity,
    dt,
    state.level.arena.floor,
  );
}

// One chronological owner accepts target, tissue, and projectile contacts. Every
// response rebuilds affected futures before the next sweep or downstream player check.
export function resolveTargetContacts(
  state: SimulationState,
  events: SimulationEvent[],
  dt: number = FIXED_STEP,
  tissue: TissueTick = freezeTissue(state),
  projectiles?: ProjectileContactSession,
): void {
  if (state.phase !== "playing" || !Number.isFinite(dt) || dt <= 0) return;
  const touched = new Set<string>();
  let after = 0;
  let physicalContacts = 0;
  const maximumContacts = Math.max(12, state.targets.length * 12);
  let stopped = false;
  for (;;) {
    const active = state.targets
      .filter((target) => target.activeFromTick <= state.tick)
      .sort((a, b) => a.id - b.id);
    let pair: PairContact | undefined;
    let solid: TargetTissueContact | undefined;
    if (!stopped)
      for (let index = 0; index < active.length; index++) {
        const lower = active[index];
        if (lower === undefined) continue;
        const hit = firstTargetTissueContact(lower, tissue, after);
        if (
          hit !== undefined &&
          (solid === undefined || compareContactTimes(hit.time, solid.time) < 0)
        )
          solid = hit;
        for (const higher of active.slice(index + 1)) {
          const time = targetPairContact(lower, higher, after);
          if (
            time !== undefined &&
            (pair === undefined || compareContactTimes(time, pair.time) < 0)
          )
            pair = { lower, higher, time };
        }
      }
    const shot = projectiles?.next(after);
    if (
      shot !== undefined &&
      compareContactTimes(shot.time, solid?.time ?? Infinity) <= 0 &&
      compareContactTimes(shot.time, pair?.time ?? Infinity) <= 0
    ) {
      after = shot.time;
      shot.commit();
      continue;
    }
    if (solid === undefined && pair === undefined) break;
    if (++physicalContacts > maximumContacts) {
      // Dense repeated contacts spend the remaining tick at their accepted positions.
      // Never expose an unprocessed future to projectile or player collision tests.
      for (const target of active)
        stopTargetPath(
          target,
          after,
          state.level.arena.floor,
          targetPathVelocity(target, after, dt),
        );
      stopped = true;
      continue;
    }
    if (solid !== undefined && compareContactTimes(solid.time, pair?.time ?? Infinity) <= 0) {
      after = solid.time;
      touched.add(JSON.stringify([solid.target.id, solid.cell.patchId]));
      applyTargetTissueContact(state, dt, tissue, solid);
    } else if (pair !== undefined) {
      after = pair.time;
      bouncePair(state, pair, dt, events);
    }
  }
  projectiles?.finish();
  finishTargetTissueContacts(state, touched);
  finishCoalescenceContacts(state);
}
