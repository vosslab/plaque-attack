import assert from "node:assert/strict";
import test from "node:test";
import { logicalCoordinate, targetId } from "../src/brands.ts";
import { createTarget } from "../src/characters.ts";
import { ARENA_HEIGHT, ARENA_WIDTH, FIXED_STEP, FLUID_WALL_INSET } from "../src/constants.ts";
import { advanceTarget } from "../src/motion.ts";

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
