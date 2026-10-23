import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import { FLAT_FLOOR, floorSlope, targetVerticalBounds } from "../src/arena_geometry.ts";
import { ARENA_HEIGHT, ARENA_WIDTH, FIXED_STEP, FLUID_WALL_INSET } from "../src/constants.ts";
import {
  advanceTarget,
  orbitPhase,
  orbitPosition,
  orbitSlope,
  synchronizeTargetMotion,
  targetVerticalVelocity,
} from "../src/motion.ts";

function target(size = "tiny", y = ARENA_HEIGHT / 2) {
  return createTarget(
    {
      kind: "plaque",
      size,
      position: { x: logicalCoordinate(200), y: logicalCoordinate(y) },
      direction: 1,
    },
    targetId(1),
    1,
  );
}

test("fluid circulation turns gently above the floor instead of rebounding under gravity", () => {
  const entity = target();
  entity.fluidPhase = Math.PI - entity.fluidAngularSpeed * FIXED_STEP;
  advanceTarget(entity, FIXED_STEP);
  assert.ok(Math.abs(entity.position.y - (ARENA_HEIGHT - entity.radius - FLUID_WALL_INSET)) < 1e-9);
  assert.ok(Math.abs(entity.velocity.y) < 1e-9, "vertical speed reaches zero at the turn");
  const lowerTurn = entity.position.y;
  advanceTarget(entity, FIXED_STEP);
  assert.ok(entity.position.y < lowerTurn);
  assert.ok(entity.velocity.y < 0);
  assert.ok(lowerTurn - entity.position.y < entity.radius / 10, "turn is continuous");
});

test("every lipid size follows a broad suspended orbit and remains contained for multiple cycles", () => {
  const angularSpeed = target("large").fluidAngularSpeed;
  for (const size of ["large", "medium", "small", "tiny"]) {
    const entity = target(size);
    const period = (2 * Math.PI) / entity.fluidAngularSpeed;
    let minimum = entity.position.y;
    let maximum = entity.position.y;
    for (let time = 0; time < 3 * period; time += FIXED_STEP) {
      const previous = { ...entity.position };
      advanceTarget(entity, FIXED_STEP);
      assert.deepEqual(entity.previousPosition, previous);
      assert.ok(
        entity.position.x >= entity.radius && entity.position.x <= ARENA_WIDTH - entity.radius,
      );
      assert.ok(
        entity.position.y >= entity.radius + FLUID_WALL_INSET &&
          entity.position.y <= ARENA_HEIGHT - entity.radius - FLUID_WALL_INSET,
      );
      minimum = Math.min(minimum, entity.position.y);
      maximum = Math.max(maximum, entity.position.y);
    }
    assert.ok(minimum < ARENA_HEIGHT / 4, `${size} must leave the lower firing area`);
    assert.ok(maximum > (3 * ARENA_HEIGHT) / 4, `${size} must visit the lower firing area`);
    assert.equal(entity.fluidAngularSpeed, angularSpeed, "size does not change the fluid cycle");
  }
});

test("fluid phase preserves spawn height and elapsed-time continuity", () => {
  const direct = target("tiny", 410);
  const partitioned = structuredClone(direct);
  const start = { ...direct.position };
  advanceTarget(direct, 0);
  assert.ok(Math.abs(direct.position.y - start.y) < 1e-9);
  advanceTarget(direct, 0.4);
  for (let step = 0; step < 24; step += 1) advanceTarget(partitioned, FIXED_STEP);
  assert.ok(Math.abs(direct.position.y - partitioned.position.y) < 1e-9);
  assert.ok(Math.abs(direct.velocity.y - partitioned.velocity.y) < 1e-9);
});

const wavyFloor = {
  controlPoints: [
    { x: 0, y: 540 },
    { x: 400, y: 480 },
    { x: ARENA_WIDTH, y: 540 },
  ],
};

test("both orbits invert arbitrary heights and their derivatives match finite differences", () => {
  for (const kind of ["plaque", "platelet"]) {
    for (const depth of [0, 0.001, 0.13, 0.5, 0.89, 0.999, 1]) {
      const phase = orbitPhase(kind, depth);
      assert.ok(Math.abs(orbitPosition(kind, phase) - depth) < 1e-12);
      for (const direction of [-1, 1]) {
        const p = phase * direction;
        const h = 1e-5;
        const numerical = (orbitPosition(kind, p + h) - orbitPosition(kind, p - h)) / (2 * h);
        assert.ok(Math.abs(orbitSlope(kind, p) - numerical) < 1e-8);
      }
    }
    assert.equal(orbitPhase(kind, -Number.EPSILON), 0);
    assert.equal(orbitPhase(kind, 1 + Number.EPSILON), Math.PI);
    assert.ok(Math.abs(orbitSlope(kind, 0)) < 1e-12);
    assert.ok(Math.abs(orbitSlope(kind, Math.PI)) < 1e-12);
  }
});

test("spawn and collision rephasing preserve height and phase direction on local floors", () => {
  for (const kind of ["plaque", "platelet"]) {
    for (const floor of [FLAT_FLOOR, wavyFloor]) {
      for (const depth of [0.01, 0.25, 0.73, 0.99]) {
        for (const direction of [-1, 1]) {
          const [top, bottom] = targetVerticalBounds(floor, 200, target().radius);
          const y = top + (bottom - top) * depth;
          const entity = createTarget(
            { kind, size: "tiny", direction, position: { x: 200, y } },
            targetId(direction === 1 ? 1 : 2),
            1,
            0,
            floor,
          );
          const initial = { ...entity.position };
          const tinyStep = structuredClone(entity);
          advanceTarget(tinyStep, 1e-5, floor);
          assert.ok(Math.abs((tinyStep.position.y - y) / 1e-5 - entity.velocity.y) < 1e-3);
          const drift = floorSlope(floor, entity.position.x) * entity.velocity.x * depth;
          // Near floor drift, world-space direction alone cannot select the phase direction.
          const requested = drift + direction * 0.01;
          synchronizeTargetMotion(entity, floor, { x: entity.velocity.x, y: requested });
          assert.deepEqual(entity.position, initial);
          assert.equal(Math.sign(entity.velocity.y - drift), direction);
          const left = structuredClone(entity);
          const right = structuredClone(entity);
          advanceTarget(left, 1e-5, floor);
          right.fluidAngularSpeed *= -1;
          advanceTarget(right, 1e-5, floor);
          const numericalVelocity = (left.position.y - right.position.y) / 2e-5;
          // The reversed phase only reverses phase travel, so include the common floor drift.
          assert.ok(
            Math.abs(numericalVelocity + drift - targetVerticalVelocity(entity, floor)) < 1e-3,
          );
          const partitioned = structuredClone(entity);
          advanceTarget(entity, 0.4, floor);
          for (let step = 0; step < 24; step += 1) advanceTarget(partitioned, FIXED_STEP, floor);
          assert.ok(Math.abs(entity.position.y - partitioned.position.y) < 1e-9);
          assert.ok(Math.abs(entity.velocity.y - partitioned.velocity.y) < 1e-9);
        }
      }
    }
  }
});
