import { logicalCoordinate, targetId } from "./brands";
import { createTarget } from "./characters";
import type { Box } from "./collision";
import {
  distanceToBox,
  sampleSegment,
  sweepCircleBox,
  targetPathSegments,
  targetPathVelocity,
} from "./collision";
import {
  MAX_TARGETS,
  PLAYER_HITBOX_HEIGHT,
  PLAYER_HITBOX_WIDTH,
  WEAPON_CONFIGS,
} from "./constants";
import { rewriteTargetPath, stopTargetPath } from "./motion";
import type { SimulationEvent } from "./types/events";
import type { LogicalPoint } from "./types/player";
import type {
  FrozenTissueCell,
  TissueTick,
  Projectile,
  SimulationState,
  Target,
  Velocity,
} from "./types/simulation";

const CELL_SIZE = 12;
const SEPARATION = 1e-5;
const cellKey = (cell: FrozenTissueCell): string => JSON.stringify([cell.patchId, cell.cellId]);
const cellBox = (cell: FrozenTissueCell): Box => ({
  left: cell.position.x,
  right: cell.position.x + CELL_SIZE,
  top: cell.position.y,
  bottom: cell.position.y + CELL_SIZE,
});

export function freezeTissue(state: SimulationState): TissueTick {
  return {
    cells: state.arena.tissue
      .flatMap((patch) =>
        patch.cells
          .filter((cell) => cell.occupied)
          .map((cell) => ({ patchId: patch.id, cellId: cell.id, position: { ...cell.position } })),
      )
      .sort((a, b) => a.patchId.localeCompare(b.patchId) || a.cellId.localeCompare(b.cellId)),
    erosion: new Map(),
  };
}

export function queueProjectileErosion(tick: TissueTick, cell: FrozenTissueCell): void {
  for (const candidate of tick.cells) {
    if (
      candidate.patchId === cell.patchId &&
      candidate.position.y === cell.position.y &&
      Math.abs(candidate.position.x - cell.position.x) <= CELL_SIZE
    ) {
      const key = cellKey(candidate);
      if (!tick.erosion.has(key)) tick.erosion.set(key, { cell: candidate, cause: "projectile" });
    }
  }
}

function queueTargetErosion(
  state: SimulationState,
  tick: TissueTick,
  cell: FrozenTissueCell,
  normal: Velocity,
): void {
  const horizontal = Math.abs(normal.x) >= Math.abs(normal.y);
  // The neighboring cell lies farther into the solid, opposite its outward contact normal.
  const x = cell.position.x - (horizontal ? Math.sign(normal.x) * CELL_SIZE : 0);
  const y = cell.position.y - (horizontal ? 0 : Math.sign(normal.y) * CELL_SIZE);
  for (const candidate of tick.cells) {
    if (
      candidate.patchId !== cell.patchId ||
      !(
        candidate.cellId === cell.cellId ||
        (candidate.position.x === x && candidate.position.y === y)
      )
    )
      continue;
    // The player owns the seam opportunity. Targets reflect from its cells without
    // carving away a future projectile trigger (including the neighboring cell).
    if (
      state.level.clearancePulse?.seamCells.some(
        (seam) => seam.patchId === candidate.patchId && seam.cellId === candidate.cellId,
      )
    )
      continue;
    const key = cellKey(candidate);
    if (!tick.erosion.has(key)) tick.erosion.set(key, { cell: candidate, cause: "target" });
  }
}

export function projectileTissueContact(
  projectile: Projectile,
  active: number,
  growth: number,
  tick: TissueTick,
): { cell: FrozenTissueCell; time: number } | undefined {
  if (active <= 0) return undefined;
  const half = WEAPON_CONFIGS[projectile.kind].width / 2;
  let best: { cell: FrozenTissueCell; time: number } | undefined;
  for (const cell of tick.cells) {
    const box = cellBox(cell);
    if (
      projectile.previousPosition.x + half < box.left ||
      projectile.previousPosition.x - half > box.right
    )
      continue;
    let time: number | undefined;
    if (projectile.kind === "stent") {
      if (projectile.origin.y < box.top || projectile.position.y > box.bottom) continue;
      if (projectile.previousPosition.y <= box.bottom) time = 0;
      else if (projectile.position.y < projectile.previousPosition.y)
        time =
          (growth * (projectile.previousPosition.y - box.bottom)) /
          (projectile.previousPosition.y - projectile.position.y);
    } else {
      if (projectile.previousPosition.y >= box.top && projectile.previousPosition.y <= box.bottom)
        time = 0;
      else if (projectile.previousPosition.y > box.bottom && projectile.position.y <= box.bottom)
        time =
          (active * (projectile.previousPosition.y - box.bottom)) /
          (projectile.previousPosition.y - projectile.position.y);
    }
    if (time !== undefined && time <= active && (best === undefined || time < best.time))
      best = { cell, time };
  }
  return best;
}

function overlapsCells(
  cells: readonly FrozenTissueCell[],
  point: Readonly<LogicalPoint>,
  radius: number,
): boolean {
  return cells.some((cell) => {
    const b = cellBox(cell);
    return (
      distanceToBox(point.x, point.y, b.left, b.right, b.top, b.bottom) < radius * radius - 1e-8
    );
  });
}

export function targetOverlapsTissue(
  state: SimulationState,
  point: Readonly<LogicalPoint>,
  radius: number,
): boolean {
  return overlapsCells(freezeTissue(state).cells, point, radius);
}

// Deterministic projection checks the entire frozen union, not only the first touched cell.
function projectFree(
  cells: readonly FrozenTissueCell[],
  point: LogicalPoint,
  radius: number,
): LogicalPoint | undefined {
  if (!overlapsCells(cells, point, radius)) return { ...point };
  const candidates: LogicalPoint[] = [];
  for (const cell of cells) {
    const b = cellBox(cell);
    for (const x of [b.left - radius - SEPARATION, b.right + radius + SEPARATION])
      candidates.push({ x: logicalCoordinate(x), y: point.y });
    for (const y of [b.top - radius - SEPARATION, b.bottom + radius + SEPARATION])
      candidates.push({ x: point.x, y: logicalCoordinate(y) });
    for (const x of [b.left - radius - SEPARATION, b.right + radius + SEPARATION])
      for (const y of [b.top - radius - SEPARATION, b.bottom + radius + SEPARATION])
        candidates.push({ x: logicalCoordinate(x), y: logicalCoordinate(y) });
  }
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y) ||
      a.x - b.x ||
      a.y - b.y,
  );
  return candidates.find((candidate) => !overlapsCells(cells, candidate, radius));
}

export type TargetTissueContact = {
  target: Target;
  cell: FrozenTissueCell;
  time: number;
  normal: Velocity;
};

export function firstTargetTissueContact(
  target: Target,
  tick: TissueTick,
  after: number,
): TargetTissueContact | undefined {
  let first: TargetTissueContact | undefined;
  for (const leg of targetPathSegments(target)) {
    const startTime = Math.max(after, leg.startTime);
    if (leg.endTime <= startTime) continue;
    const start = sampleSegment(leg, startTime);
    for (const cell of tick.cells) {
      const hit = sweepCircleBox(start, leg.end, target.radius, cellBox(cell));
      if (hit === undefined) continue;
      const time = startTime + (leg.endTime - startTime) * hit.time;
      if (first === undefined || time < first.time)
        first = { target, cell, time, normal: hit.normal };
    }
  }
  return first;
}

export function applyTargetTissueContact(
  state: SimulationState,
  dt: number,
  tick: TissueTick,
  hit: TargetTissueContact,
): void {
  const { target, cell, time, normal } = hit;
  const leg = targetPathSegments(target).find(
    (item) => time >= item.startTime && time <= item.endTime,
  );
  if (leg === undefined) return;
  const contact = sampleSegment(leg, time);
  const incoming = targetPathVelocity(target, time, dt);
  let latch = state.arena.tissueContacts.find(
    (item) => item.targetId === target.id && item.patchId === cell.patchId,
  );
  if (latch === undefined) {
    latch = {
      targetId: target.id,
      patchId: cell.patchId,
      touching: false,
      lastErosionAt: -Infinity,
    };
    state.arena.tissueContacts.push(latch);
  }
  if (!latch.touching && state.elapsed - latch.lastErosionAt >= 0.3) {
    queueTargetErosion(state, tick, cell, normal);
    latch.lastErosionAt = state.elapsed;
  }
  latch.touching = true;
  const position = projectFree(
    tick.cells,
    {
      x: logicalCoordinate(contact.x + normal.x * SEPARATION),
      y: logicalCoordinate(contact.y + normal.y * SEPARATION),
    },
    target.radius,
  );
  if (position === undefined) {
    stopTargetPath(target, leg.startTime, state.level.arena.floor);
    return;
  }
  const dot = incoming.x * normal.x + incoming.y * normal.y;
  const velocity = {
    x: incoming.x - 2 * Math.min(0, dot) * normal.x,
    y: incoming.y - 2 * Math.min(0, dot) * normal.y,
  };
  rewriteTargetPath(target, time, position, velocity, dt, state.level.arena.floor);
}

export function finishTargetTissueContacts(
  state: SimulationState,
  touched: ReadonlySet<string>,
): void {
  const living = new Set(state.targets.map((target) => target.id));
  state.arena.tissueContacts = state.arena.tissueContacts.filter((latch) =>
    living.has(latch.targetId),
  );
  for (const latch of state.arena.tissueContacts)
    latch.touching = touched.has(JSON.stringify([latch.targetId, latch.patchId]));
}

// Standalone tissue callers use the same response and path contract as the world scheduler.
export function resolveTargetTissue(state: SimulationState, dt: number, tick: TissueTick): void {
  const touched = new Set<string>();
  for (const target of state.targets) {
    if (target.activeFromTick > state.tick) continue;
    let after = 0;
    let iterations = 0;
    for (;;) {
      const hit = firstTargetTissueContact(target, tick, after);
      if (hit === undefined) break;
      if (++iterations > 12) {
        stopTargetPath(target, after, state.level.arena.floor);
        break;
      }
      touched.add(JSON.stringify([target.id, hit.cell.patchId]));
      applyTargetTissueContact(state, dt, tick, hit);
      after = hit.time;
    }
  }
  finishTargetTissueContacts(state, touched);
}

export function commitTissueErosion(
  state: SimulationState,
  tick: TissueTick,
  events: SimulationEvent[],
): void {
  for (const patch of state.arena.tissue) {
    for (const cause of ["projectile", "target"] as const) {
      const removed = patch.cells.filter(
        (cell) =>
          cell.occupied &&
          tick.erosion.get(cellKey({ patchId: patch.id, cellId: cell.id, position: cell.position }))
            ?.cause === cause,
      );
      if (removed.length === 0) continue;
      for (const cell of removed) cell.occupied = false;
      const first = removed[0];
      if (first !== undefined)
        events.push({
          type: "tissue_eroded",
          patchId: patch.id,
          cellIds: removed.map((cell) => cell.id),
          position: { ...first.position },
          cause,
        });
    }
  }
  for (const pocket of state.arena.pockets) {
    if (pocket.status !== "sealed") continue;
    const definition = state.level.arena.pockets.find((item) => item.id === pocket.id);
    if (
      definition === undefined ||
      !definition.breachCells.some((ref) =>
        tick.erosion.has(JSON.stringify([ref.patchId, ref.cellId])),
      )
    )
      continue;
    pocket.status = "pending";
    pocket.warningRemaining = 0.75;
    definition.contents.forEach((content, contentIndex) =>
      state.arena.pendingInsertions.push({
        kind: "pocket",
        pocketId: pocket.id,
        contentIndex,
        target: { ...content, position: { ...definition.releasePosition } },
      }),
    );
    events.push({
      type: "pocket_breached",
      pocketId: pocket.id,
      position: { ...definition.releasePosition },
    });
  }
}

export function hasPendingTargets(state: SimulationState): boolean {
  return (
    state.arena.pendingInsertions.length > 0 ||
    state.arena.pockets.some((pocket) => pocket.status === "pending")
  );
}

export function advancePocketReleases(
  state: SimulationState,
  dt: number,
  events: SimulationEvent[],
): void {
  for (const pocket of state.arena.pockets)
    if (
      pocket.status === "pending" &&
      !events.some((event) => event.type === "pocket_breached" && event.pocketId === pocket.id)
    )
      pocket.warningRemaining = Math.max(0, pocket.warningRemaining - dt);
  for (const insertion of [...state.arena.pendingInsertions]) {
    if (state.targets.length >= MAX_TARGETS) break;
    if (insertion.kind === "split") {
      insertion.target.activeFromTick = state.tick + 1;
      state.targets.push(insertion.target);
      state.arena.pendingInsertions = state.arena.pendingInsertions.filter(
        (item) => item !== insertion,
      );
      continue;
    }
    const pocket = state.arena.pockets.find((item) => item.id === insertion.pocketId);
    if (
      pocket === undefined ||
      pocket.warningRemaining > 1e-9 ||
      insertion.contentIndex !== pocket.nextContentIndex
    )
      continue;
    const target = createTarget(
      insertion.target,
      targetId(state.nextTargetId),
      state.level.speedMultiplier,
      state.tick + 1,
      state.level.arena.floor,
    );
    const p = state.player.position;
    const half = PLAYER_HITBOX_WIDTH / 2;
    if (
      targetOverlapsTissue(state, target.position, target.radius) ||
      distanceToBox(
        target.position.x,
        target.position.y,
        p.x - half,
        p.x + half,
        p.y - PLAYER_HITBOX_HEIGHT,
        p.y,
      ) <
        (target.radius + 16) ** 2
    )
      continue;
    state.nextTargetId++;
    state.targets.push(target);
    pocket.nextContentIndex = insertion.contentIndex + 1;
    state.arena.pendingInsertions = state.arena.pendingInsertions.filter(
      (item) => item !== insertion,
    );
    events.push({
      type: "pocket_released",
      pocketId: pocket.id,
      targetIds: [target.id],
      position: { ...target.position },
    });
  }
  for (const pocket of state.arena.pockets) {
    if (
      pocket.status === "pending" &&
      pocket.warningRemaining <= 1e-9 &&
      !state.arena.pendingInsertions.some(
        (item) => item.kind === "pocket" && item.pocketId === pocket.id,
      )
    )
      pocket.status = "released";
  }
}
