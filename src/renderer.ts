import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  FIXED_STEP,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  TARGET_PRESETS,
  WEAPON_CONFIGS,
} from "./constants";
import type { SimulationEvent } from "./types/events";
import type { ArenaRenderer, AssetImages, CelebrationPresentation } from "./types/runtime";
import type { SimulationState } from "./types/simulation";
import type { SurgeonId } from "./types/surgeon";
import { DEFAULT_SURGEON_ID, getSurgeon } from "./surgeons";
import { floorY, playerSupportY } from "./arena_geometry";
import { sampleTargetPath } from "./motion";
import { streakMilestone } from "./scoring";
import { drawMembrane } from "./artery_art";
import { celebrationMotion, idleBodyAngle } from "./surgeon_motion";

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type HitEffect = {
  kind: "plaque" | "platelet";
  x: number;
  y: number;
  radius: number;
  life: number;
};
const PARTICLE_LIMIT = 160;
const HIT_EFFECT_LIMIT = 32;
const HIT_EFFECT_DURATION = 0.48;
const POINT_LABEL_LIMIT = 12;
const POINT_LABEL_DURATION = 0.85;
const STREAK_CALLOUT_DURATION = 1.6;
type PointLabel = { x: number; y: number; points: number; life: number };
type StreakCallout = { streak: number; multiplier: 2 | 3; life: number };
const VICTORY_POSE_DELAY = 0.3;
const VICTORY_ZOOM_DURATION = 0.35;
type ArenaEffect = {
  kind: "tissue_eroded" | "pocket_breached" | "pocket_released" | "targets_merged";
  x: number;
  y: number;
  life: number;
  radius: number;
};

/** Canvas owns visual effects only. The runtime calls render once per animation frame. */
export function createRenderer(
  canvas: HTMLCanvasElement,
  images: AssetImages,
  reducedMotion: boolean,
): ArenaRenderer {
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Canvas 2D is unavailable. Try another browser.");
  const ctx = context;
  let particles: Particle[] = [];
  let hitEffects: HitEffect[] = [];
  let arenaEffects: ArenaEffect[] = [];
  let pointLabels: PointLabel[] = [];
  let streakCallout: StreakCallout | undefined;
  let pendingEvents: SimulationEvent[] = [];
  let lastSimulation: Readonly<SimulationState> | undefined;
  let lastCelebrationElapsed: number | undefined;
  let lastTick = 0;
  let lastLevel = 0;
  let lastPlayerX: number | undefined;
  let moving = false;
  let firingRemaining = 0;
  let damageRemaining = 0;
  let destroyed = false;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function consumeEvents(events: readonly SimulationEvent[]): void {
    // A fresh attempt is identified at render time; drain after its old effects are cleared.
    pendingEvents.push(...events);
  }

  function applyEvents(events: readonly SimulationEvent[]): void {
    for (const event of events) {
      if (event.type === "shot") firingRemaining = 0.16;
      if (event.type === "damage") {
        damageRemaining = 0.3;
        streakCallout = undefined;
      }
      if (
        event.type === "tissue_eroded" ||
        event.type === "pocket_breached" ||
        event.type === "pocket_released" ||
        event.type === "targets_merged"
      ) {
        if (arenaEffects.length >= HIT_EFFECT_LIMIT) arenaEffects.shift();
        arenaEffects.push({
          kind: event.type,
          ...event.position,
          life: 0.6,
          radius:
            event.type === "targets_merged"
              ? TARGET_PRESETS[event.size].radius
              : event.type === "tissue_eroded"
                ? 7
                : 20,
        });
      }
      if (event.type === "target_hit") {
        if (pointLabels.length >= POINT_LABEL_LIMIT) pointLabels.shift();
        pointLabels.push({
          x: event.position.x,
          y: event.position.y - TARGET_PRESETS[event.size].radius - 12,
          points: event.points,
          life: POINT_LABEL_DURATION,
        });
        const milestone = streakMilestone(event.streak);
        if (milestone !== undefined)
          streakCallout = {
            streak: event.streak,
            multiplier: milestone,
            life: STREAK_CALLOUT_DURATION,
          };
        if (hitEffects.length >= HIT_EFFECT_LIMIT) hitEffects.shift();
        hitEffects.push({
          kind: event.targetKind,
          x: event.position.x,
          y: event.position.y,
          radius: TARGET_PRESETS[event.size].radius,
          life: HIT_EFFECT_DURATION,
        });
      }
      if (reducedMotion || (event.type !== "target_hit" && event.type !== "damage")) continue;
      const color =
        event.type === "damage" ? "#fff5e8" : event.targetKind === "plaque" ? "#ffce55" : "#d4afff";
      const count = event.type === "damage" ? 12 : 8;
      for (let index = 0; index < count && particles.length < PARTICLE_LIMIT; index += 1) {
        const angle = (index / count) * Math.PI * 2;
        particles.push({
          x: event.position.x,
          y: event.position.y,
          vx: Math.cos(angle) * 90,
          vy: Math.sin(angle) * 90 - 25,
          life: 0.42,
          color,
        });
      }
    }
  }

  function drawFloor(
    state: Readonly<SimulationState>,
    left: number,
    right: number,
    bottom: number,
  ): void {
    const floor = state.level.arena.floor;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, floorY(floor, left));
    ctx.lineTo(0, floorY(floor, 0));
    for (let x = 2; x <= ARENA_WIDTH; x += 2) ctx.lineTo(x, floorY(floor, x));
    ctx.lineTo(right, floorY(floor, right));
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();
    // Every lobule and fiber stays inside the actual solid floor silhouette.
    ctx.clip();
    const top = Math.min(...floor.controlPoints.map((point) => point.y));
    // Keep material coordinates fixed while the camera moves across the floor.
    drawMembrane(ctx, 0, top, ARENA_WIDTH, ARENA_HEIGHT);
    if (bottom > ARENA_HEIGHT) drawMembrane(ctx, 0, ARENA_HEIGHT, ARENA_WIDTH, ARENA_HEIGHT * 2);
    if (left < 0) drawMembrane(ctx, -ARENA_WIDTH, top, 0, ARENA_HEIGHT * 2);
    if (right > ARENA_WIDTH) drawMembrane(ctx, ARENA_WIDTH, top, ARENA_WIDTH * 2, ARENA_HEIGHT * 2);
    // Trace the exact collision surface, clipped inward so this highlight never
    // suggests an extra ledge above the walkable geometry.
    ctx.strokeStyle = "#efc2c2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left, floorY(floor, left));
    ctx.lineTo(0, floorY(floor, 0));
    for (let x = 2; x <= ARENA_WIDTH; x += 2) ctx.lineTo(x, floorY(floor, x));
    ctx.lineTo(right, floorY(floor, right));
    ctx.stroke();
    ctx.restore();
  }

  function drawTissue(state: Readonly<SimulationState>): void {
    for (const patch of state.arena.tissue) {
      const cells = patch.cells.filter((cell) => cell.occupied);
      ctx.save();
      // The union clip is occupancy itself: removed cells reveal the original scene.
      ctx.beginPath();
      for (const cell of cells) ctx.rect(cell.position.x, cell.position.y, 12, 12);
      ctx.fillStyle = patch.pocketId === undefined ? "#b48292" : "#a78aa9";
      ctx.fill();
      ctx.clip();
      for (const cell of cells) {
        const { x, y } = cell.position;
        const variation = Math.sin(x * 0.39 + y * 0.71);
        ctx.fillStyle = variation > 0 ? "#c99aa5" : "#c08e9d";
        ctx.strokeStyle = "#e0b7bd";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.ellipse(x + 6, y + 6, 8.5, 6.7, variation * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (Math.cos(x * 0.27 + y) > -0.35) {
          ctx.fillStyle = "#805c78";
          ctx.beginPath();
          ctx.ellipse(x + 6 + variation, y + 6, 2.5, 1.6, variation, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // One exposed contour, rather than a rectangular outline around every cell.
      const occupied = new Set(cells.map((cell) => `${cell.position.x}:${cell.position.y}`));
      ctx.strokeStyle = patch.pocketId === undefined ? "#ebc2c4" : "#dfc6e7";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (const cell of cells) {
        const { x, y } = cell.position;
        if (!occupied.has(`${x}:${y - 12}`)) {
          ctx.moveTo(x, y + 0.7);
          ctx.lineTo(x + 12, y + 0.7);
        }
        if (!occupied.has(`${x}:${y + 12}`)) {
          ctx.moveTo(x, y + 11.3);
          ctx.lineTo(x + 12, y + 11.3);
        }
        if (!occupied.has(`${x - 12}:${y}`)) {
          ctx.moveTo(x + 0.7, y);
          ctx.lineTo(x + 0.7, y + 12);
        }
        if (!occupied.has(`${x + 12}:${y}`)) {
          ctx.moveTo(x + 11.3, y);
          ctx.lineTo(x + 11.3, y + 12);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawPockets(state: Readonly<SimulationState>): void {
    for (const pocket of state.arena.pockets) {
      if (pocket.status === "released") continue;
      const definition = state.level.arena.pockets.find((item) => item.id === pocket.id);
      if (definition === undefined) continue;
      ctx.save();
      if (pocket.status === "sealed") {
        ctx.globalAlpha = 0.65;
        for (const content of definition.contents) {
          const radius = TARGET_PRESETS[content.size].radius;
          const appearance =
            content.kind === "platelet" ? "platelet" : state.level.lipidVariants[0];
          ctx.drawImage(
            images[appearance],
            content.position.x - radius,
            content.position.y - radius,
            radius * 2,
            radius * 2,
          );
        }
      }
      const { x, y } = definition.releasePosition;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff0d9";
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      if (pocket.status === "pending") {
        ctx.strokeStyle = "#ffd39a";
        ctx.lineWidth = 2;
        const pulse = reducedMotion ? 0 : Math.sin(state.elapsed * 10) * 3;
        ctx.beginPath();
        ctx.arc(x, y, 27 + pulse, 0, Math.PI * 2);
        ctx.moveTo(x, y - 46);
        ctx.lineTo(x, y - 30);
        ctx.moveTo(x - 5, y - 36);
        ctx.lineTo(x, y - 30);
        ctx.lineTo(x + 5, y - 36);
        ctx.stroke();
        const caption =
          pocket.warningRemaining > 0
            ? `RELEASING ${pocket.warningRemaining.toFixed(1)} s`
            : "RELEASING / WAITING FOR SPACE";
        const halfWidth = ctx.measureText(caption).width / 2;
        const captionX = Math.max(halfWidth + 8, Math.min(ARENA_WIDTH - halfWidth - 8, x));
        ctx.fillText(caption, captionX, Math.max(18, y - 56));
      } else {
        const first = definition.contents[0];
        if (first !== undefined) ctx.fillText("OPTIONAL", first.position.x, first.position.y + 32);
      }
      ctx.restore();
    }
  }

  function drawSurgeon(
    state: Readonly<SimulationState>,
    surgeonId: SurgeonId | undefined,
    celebration: Readonly<CelebrationPresentation> | undefined,
  ): void {
    const selected = getSurgeon(surgeonId ?? DEFAULT_SURGEON_ID);
    const surgeon = images[selected.portraitAssetId];
    const { x, y } = state.player.position;
    const victory = celebration !== undefined && celebration.elapsed >= VICTORY_POSE_DELAY;
    // Let the camera arrive before the surgeon performs the full gesture.
    const poseElapsed = victory
      ? Math.max(0, celebration.elapsed - VICTORY_POSE_DELAY - VICTORY_ZOOM_DURATION)
      : 0;
    const { hop, tilt } = celebrationMotion(selected.id, poseElapsed, reducedMotion);
    // Pivot at the feet and reserve the rotated sprite's full width at either wall.
    const halfWidth =
      (PLAYER_WIDTH / 2) * Math.cos(tilt) + PLAYER_HEIGHT * Math.abs(Math.sin(tilt));
    const poseX = Math.max(halfWidth, Math.min(ARENA_WIDTH - halfWidth, x));
    const poseY = Math.min(y, playerSupportY(state.level.arena.floor, poseX, halfWidth * 2));
    const running =
      moving && (state.phase === "playing" || state.phase === "paused") && !reducedMotion;
    const stride = running ? Math.sin(state.elapsed * 22) : 0;
    const recoil = firingRemaining > 0 ? 2 : 0;
    ctx.save();
    ctx.translate(x, y - PLAYER_HEIGHT);
    ctx.fillStyle = "#180f24";
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(0, PLAYER_HEIGHT - 2, 26, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.translate(0, recoil);
    if (victory) {
      ctx.translate(
        poseX - x,
        PLAYER_HEIGHT + poseY - y - hop - (Math.abs(Math.sin(tilt)) * PLAYER_WIDTH) / 2,
      );
      ctx.rotate(tilt);
      ctx.drawImage(
        images[`surgeon-${selected.id}-victory`],
        -PLAYER_WIDTH / 2,
        -PLAYER_HEIGHT,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
      );
      ctx.restore();
      return;
    }
    ctx.rotate(stride * 0.035);
    if (state.player.contactInvulnerabilityRemaining > 0) {
      const pulse = reducedMotion ? 0.5 : (Math.sin(state.elapsed * Math.PI * 2) + 1) / 2;
      ctx.save();
      ctx.strokeStyle = "#caffee";
      ctx.globalAlpha = 0.6 + pulse * 0.35;
      ctx.lineWidth = 2 + pulse;
      ctx.beginPath();
      ctx.ellipse(
        0,
        PLAYER_HEIGHT / 2,
        PLAYER_WIDTH / 2 + 7,
        PLAYER_HEIGHT / 2 + 6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
    }
    // Source regions preserve the original editable sprite while articulating the two legs.
    // Idle pivots the intact upper figure at the existing leg seam. This preserves
    // scarves/hair and the feet; the applicator moves less than two logical pixels.
    const bodyPivot = (PLAYER_HEIGHT * 100) / 128;
    ctx.save();
    ctx.translate(0, bodyPivot);
    ctx.rotate(moving ? 0 : idleBodyAngle(selected.id, state.elapsed, reducedMotion));
    ctx.translate(0, -bodyPivot);
    ctx.drawImage(
      surgeon,
      0,
      0,
      96,
      100,
      -PLAYER_WIDTH / 2,
      0,
      PLAYER_WIDTH,
      (PLAYER_HEIGHT * 100) / 128,
    );
    ctx.restore();
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 5, (PLAYER_HEIGHT * 100) / 128);
      ctx.rotate(stride * side * 0.28);
      const sourceX = side < 0 ? 0 : 48;
      ctx.drawImage(
        surgeon,
        sourceX,
        100,
        48,
        28,
        side < 0 ? -PLAYER_WIDTH / 2 + 5 : -5,
        0,
        PLAYER_WIDTH / 2,
        (PLAYER_HEIGHT * 28) / 128,
      );
      ctx.restore();
    }
    if (firingRemaining > 0) {
      ctx.strokeStyle = "#edfcff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 2);
      ctx.lineTo(14, -8);
      ctx.moveTo(7, 0);
      ctx.lineTo(3, -5);
      ctx.moveTo(21, 0);
      ctx.lineTo(25, -5);
      ctx.stroke();
    }
    if (damageRemaining > 0) {
      ctx.strokeStyle = "#fff5e8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 27, 32, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(
    state: Readonly<SimulationState>,
    interpolation: number,
    surgeonId?: SurgeonId,
    celebration?: Readonly<CelebrationPresentation>,
  ): void {
    if (destroyed) return;
    resize();
    const newLevel =
      state !== lastSimulation || state.level.id !== lastLevel || state.tick < lastTick;
    if (newLevel) {
      particles = [];
      hitEffects = [];
      arenaEffects = [];
      pointLabels = [];
      streakCallout = undefined;
      lastPlayerX = undefined;
      firingRemaining = 0;
      damageRemaining = 0;
      moving = false;
      lastCelebrationElapsed = undefined;
    }
    const simulationDt = newLevel
      ? 0
      : Math.max(0, Math.min(0.1, (state.tick - lastTick) * FIXED_STEP));
    const celebrationElapsed =
      celebration === undefined
        ? undefined
        : Math.max(0, Math.min(celebration.duration, celebration.elapsed));
    const dt =
      celebrationElapsed === undefined
        ? simulationDt
        : lastCelebrationElapsed === undefined
          ? simulationDt + celebrationElapsed
          : Math.max(0, celebrationElapsed - lastCelebrationElapsed);
    if (lastPlayerX !== undefined && state.tick !== lastTick)
      moving = Math.abs(state.player.position.x - lastPlayerX) > 0.1;
    lastPlayerX = state.player.position.x;
    lastTick = state.tick;
    lastLevel = state.level.id;
    lastSimulation = state;
    lastCelebrationElapsed = celebrationElapsed;
    firingRemaining = Math.max(0, firingRemaining - dt);
    damageRemaining = Math.max(0, damageRemaining - dt);
    // Only renderer-owned effects advance on the celebration clock. Gameplay stays frozen.
    for (const effect of hitEffects) effect.life -= dt;
    for (const effect of arenaEffects) effect.life -= dt;
    for (const label of pointLabels) label.life -= dt;
    if (streakCallout !== undefined) {
      streakCallout.life -= dt;
      if (streakCallout.life <= 0) streakCallout = undefined;
    }
    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    applyEvents(pendingEvents);
    pendingEvents = [];
    // Keep the physics world uniform inside the taller canvas. At 16:10 this
    // exposes 30 logical pixels of artery wall above and below the 960x540 world.
    const scale = Math.min(canvas.width / ARENA_WIDTH, canvas.height / ARENA_HEIGHT);
    const offsetX = (canvas.width - ARENA_WIDTH * scale) / 2;
    const offsetY = (canvas.height - ARENA_HEIGHT * scale) / 2;
    const zoomProgress = Math.max(
      0,
      Math.min(1, ((celebrationElapsed ?? 0) - VICTORY_POSE_DELAY) / VICTORY_ZOOM_DURATION),
    );
    const cameraProgress = reducedMotion
      ? zoomProgress > 0
        ? 1
        : 0
      : zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
    const cameraScale = scale * (1 + cameraProgress * 2.6);
    const cameraX = ARENA_WIDTH / 2 + (state.player.position.x - ARENA_WIDTH / 2) * cameraProgress;
    const cameraY =
      ARENA_HEIGHT / 2 +
      (state.player.position.y - PLAYER_HEIGHT / 2 - 6 - ARENA_HEIGHT / 2) * cameraProgress;
    const cameraOffsetX = canvas.width / 2 - cameraX * cameraScale;
    const cameraOffsetY = canvas.height / 2 - cameraY * cameraScale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#844f68";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(cameraScale, 0, 0, cameraScale, cameraOffsetX, cameraOffsetY);
    // Static material is clipped to the decorative frame outside the physics world.
    const left = Math.min(0, -cameraOffsetX / cameraScale);
    const top = Math.min(0, -cameraOffsetY / cameraScale);
    const right = Math.max(ARENA_WIDTH, (canvas.width - cameraOffsetX) / cameraScale);
    const bottom = Math.max(ARENA_HEIGHT, (canvas.height - cameraOffsetY) / cameraScale);
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, -top);
    ctx.rect(left, ARENA_HEIGHT, right - left, bottom - ARENA_HEIGHT);
    ctx.rect(left, 0, -left, ARENA_HEIGHT);
    ctx.rect(ARENA_WIDTH, 0, right - ARENA_WIDTH, ARENA_HEIGHT);
    ctx.clip();
    if (top < 0) drawMembrane(ctx, left, top, right, 0);
    if (bottom > ARENA_HEIGHT) drawMembrane(ctx, left, ARENA_HEIGHT, right, bottom);
    if (left < 0) drawMembrane(ctx, left, 0, 0, ARENA_HEIGHT);
    if (right > ARENA_WIDTH) drawMembrane(ctx, ARENA_WIDTH, 0, right, ARENA_HEIGHT);
    ctx.restore();
    // A close-up can look past either arena edge. Reflect only scene decoration;
    // the floor continues at its boundary height and collision geometry stays fixed.
    if (cameraProgress > 0) {
      for (const boundary of [0, ARENA_WIDTH * 2]) {
        if ((boundary === 0 && left >= 0) || (boundary !== 0 && right <= ARENA_WIDTH)) continue;
        ctx.save();
        // Overlap by one device pixel so fractional camera transforms leave no seam.
        ctx.translate(boundary + (boundary === 0 ? 1 : -1) / cameraScale, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(images[state.level.scene], 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
        ctx.drawImage(images[state.level.scene], 0, 480, ARENA_WIDTH, 1, 0, 480, ARENA_WIDTH, 60);
        ctx.restore();
      }
    }
    ctx.drawImage(images[state.level.scene], 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    // Scene art retains its editable decorative lower wall. Extend the adjacent clean
    // lumen color beneath it so only the geometry-owned floor describes solid ground.
    ctx.drawImage(images[state.level.scene], 0, 480, ARENA_WIDTH, 1, 0, 480, ARENA_WIDTH, 60);
    drawFloor(
      state,
      cameraProgress > 0 ? left : 0,
      cameraProgress > 0 ? right : ARENA_WIDTH,
      cameraProgress > 0 ? bottom : ARENA_HEIGHT,
    );
    drawPockets(state);
    drawTissue(state);
    const sceneHasImplant =
      state.level.scene === "scene-stented-lumen" || state.level.scene === "scene-healed-flow";
    if (state.level.act >= 2 && !sceneHasImplant) {
      // The installed implant follows the upper artery wall behind every gameplay object.
      // Reuse the rounded metal rings horizontally so implants and shots share a material.
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(220, 8, 520, 28, 8);
      ctx.clip();
      ctx.globalAlpha = 0.48;
      ctx.translate(220, 36);
      ctx.rotate(-Math.PI / 2);
      // Crop the icon's end padding so adjacent ring sections form one implant.
      for (let offset = 0; offset < 520; offset += 104)
        ctx.drawImage(images.stent, 0, 3, 32, 116, 0, offset, 28, 104);
      ctx.restore();
    }
    const alpha = state.phase === "playing" ? Math.max(0, Math.min(1, interpolation)) : 1;
    for (const projectile of state.projectiles) {
      const x =
        projectile.previousPosition.x +
        (projectile.position.x - projectile.previousPosition.x) * alpha;
      const y =
        projectile.previousPosition.y +
        (projectile.position.y - projectile.previousPosition.y) * alpha;
      if (projectile.kind === "stent") {
        // Tile the mesh to keep rounded crowns legible along a long trail.
        const length = Math.max(12, projectile.origin.y - y);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 5, y, 10, length);
        ctx.clip();
        for (let offset = 0; offset < length; offset += 40)
          ctx.drawImage(images.stent, x - 5, y + offset, 10, 40);
        ctx.restore();
        ctx.fillStyle = "#eeffff";
        ctx.fillRect(x - 4, y, 8, 3);
      } else {
        if (projectile.kind === "clopidogrel" && !reducedMotion) {
          // A short wake persists through flight; age bounds it to the distance actually traveled.
          const length = Math.min(64, projectile.age * WEAPON_CONFIGS.clopidogrel.speed);
          ctx.save();
          ctx.strokeStyle = "#d4afff";
          ctx.lineWidth = 2;
          for (let offset = 10; offset < length; offset += 10) {
            ctx.globalAlpha = (1 - offset / 70) * 0.45;
            ctx.beginPath();
            ctx.ellipse(x, y + offset, 3 + offset / 13, 2, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.drawImage(images[projectile.kind], x - 9, y - 9, 18, 18);
      }
    }
    for (const target of state.targets) {
      const { x, y } =
        sampleTargetPath(target.motionSegments, state.phase === "playing" ? alpha : 1) ??
        target.position;
      ctx.save();
      ctx.translate(x, y);
      if (!reducedMotion) ctx.rotate(Math.sin(state.elapsed * 1.2 + target.id) * 0.1);
      // Identity fixes each appearance for its lifetime without consuming simulation randomness.
      // Consecutive split children can introduce new silhouettes from the same level palette.
      const palette = state.level.lipidVariants;
      const appearance =
        target.kind === "plaque"
          ? (palette[(target.id - 1) % palette.length] ?? palette[0])
          : "platelet";
      ctx.drawImage(
        images[appearance],
        -target.radius,
        -target.radius,
        target.radius * 2,
        target.radius * 2,
      );
      ctx.restore();
    }
    for (const effect of hitEffects) {
      const progress = Math.min(1, 1 - effect.life / HIT_EFFECT_DURATION);
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.globalAlpha = Math.max(0, (1 - progress) * 0.7);
      if (effect.kind === "platelet") {
        // Inactive remnants live only here and never participate in collision.
        const radius = effect.radius * (reducedMotion ? 1 : 1 - progress * 0.2);
        ctx.drawImage(images.platelet, -radius, -radius, radius * 2, radius * 2);
        ctx.strokeStyle = "#e5d9f3";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.4, 0);
        ctx.lineTo(-radius * 0.1, radius * 0.3);
        ctx.lineTo(radius * 0.5, -radius * 0.35);
        ctx.stroke();
      } else {
        const radius = effect.radius * (reducedMotion ? 1 : 0.55 + progress * 0.65);
        ctx.strokeStyle = "#ffce55";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        if (!reducedMotion) {
          // Expansion describes the impact without delaying the simulation's split.
          ctx.beginPath();
          ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
          ctx.clip();
          for (let offset = -radius; offset < radius; offset += 18)
            ctx.drawImage(images.stent, offset - 6, -radius, 12, radius * 2);
        }
      }
      ctx.restore();
    }
    hitEffects = hitEffects.filter((effect): boolean => effect.life > 0);
    for (const effect of arenaEffects) {
      const progress = Math.max(0, Math.min(1, 1 - effect.life / 0.6));
      ctx.save();
      ctx.globalAlpha = (1 - progress) * 0.85;
      ctx.strokeStyle =
        effect.kind === "targets_merged"
          ? "#ffe4a3"
          : effect.kind === "tissue_eroded"
            ? "#f1c8d0"
            : "#dec6ff";
      ctx.lineWidth = 2;
      const radius = effect.radius;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius + (reducedMotion ? 0 : progress * 18), 0, Math.PI * 2);
      ctx.stroke();
      if (effect.kind === "targets_merged") {
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillStyle = "#ffe4a3";
        ctx.textAlign = "center";
        ctx.fillText("MERGED", effect.x, effect.y - radius - 9);
      }
      ctx.restore();
    }
    arenaEffects = arenaEffects.filter((effect) => effect.life > 0);
    const warning = state.waves.warning;
    if (warning !== undefined) {
      const { x, y } = warning.target.position;
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#ffcf83";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.55;
      const appearance =
        warning.target.kind === "plaque"
          ? (state.level.lipidVariants[
              (state.nextTargetId - 1) % state.level.lipidVariants.length
            ] ?? state.level.lipidVariants[0])
          : "platelet";
      ctx.drawImage(images[appearance], x - 23, y - 23, 46, 46);
      ctx.globalAlpha = 1;
      // A fixed arrow remains legible with reduced motion and at the upper wall.
      ctx.beginPath();
      ctx.moveTo(x, y + 27);
      ctx.lineTo(x, y + 41);
      ctx.moveTo(x - 6, y + 35);
      ctx.lineTo(x, y + 41);
      ctx.lineTo(x + 6, y + 35);
      ctx.stroke();
      ctx.fillStyle = "#fff5e8";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("INCOMING", x, y + 59);
      ctx.restore();
    }
    drawSurgeon(state, surgeonId, celebration);
    for (const particle of particles) {
      ctx.globalAlpha = Math.max(0, particle.life / 0.42);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    }
    particles = particles.filter(
      (particle): boolean =>
        particle.life > 0 &&
        particle.x >= 0 &&
        particle.x <= ARENA_WIDTH &&
        particle.y >= 0 &&
        particle.y <= ARENA_HEIGHT,
    );
    ctx.globalAlpha = 1;
    pointLabels = pointLabels.filter((label) => label.life > 0);
    for (const label of pointLabels) {
      const progress = Math.min(1, 1 - label.life / POINT_LABEL_DURATION);
      const text = `+${label.points}`;
      ctx.save();
      ctx.font = "800 15px system-ui, sans-serif";
      const halfWidth = ctx.measureText(text).width / 2 + 7;
      const x = Math.max(halfWidth + 4, Math.min(ARENA_WIDTH - halfWidth - 4, label.x));
      const y = Math.max(
        18,
        Math.min(ARENA_HEIGHT - 18, label.y - (reducedMotion ? 0 : progress * 18)),
      );
      ctx.globalAlpha = Math.min(1, label.life / 0.25);
      ctx.fillStyle = "#211e34";
      ctx.fillRect(x - halfWidth, y - 11, halfWidth * 2, 22);
      ctx.fillStyle = "#ffdf8e";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      ctx.restore();
    }
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    if (streakCallout !== undefined) {
      // The 16:10 canvas provides decorative wall above the playable world.
      // Keep this stationary and separate from incoming warnings and the surgeon.
      const wallHeight = offsetY / scale;
      const y = wallHeight >= 24 ? -wallHeight / 2 : 16;
      const text = `${streakCallout.streak}-HIT STREAK / x${streakCallout.multiplier} POINTS`;
      ctx.save();
      ctx.font = "800 16px system-ui, sans-serif";
      const width = ctx.measureText(text).width + 24;
      ctx.globalAlpha = Math.min(1, streakCallout.life / 0.3);
      ctx.fillStyle = "#211e34";
      ctx.fillRect((ARENA_WIDTH - width) / 2, y - 12, width, 24);
      ctx.fillStyle = "#ffdf8e";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, ARENA_WIDTH / 2, y);
      ctx.restore();
    }
    if (state.overloadElapsed > 0) {
      ctx.strokeStyle = "#ffbf69";
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, ARENA_WIDTH - 6, ARENA_HEIGHT - 6);
    }
    if (state.phase === "ready") {
      ctx.fillStyle = "#171526bb";
      ctx.fillRect(350, 180, 260, 150);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff5e8";
      ctx.font = "bold 19px system-ui, sans-serif";
      ctx.fillText("GET READY", 480, 218);
      ctx.font = "900 72px system-ui, sans-serif";
      ctx.fillText(String(Math.max(1, Math.ceil(state.readyRemaining))), 480, 293);
    }
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    render,
    consumeEvents,
    resize,
    destroy: (): void => {
      destroyed = true;
      particles = [];
      hitEffects = [];
      arenaEffects = [];
      pointLabels = [];
      streakCallout = undefined;
      pendingEvents = [];
      observer.disconnect();
    },
  };
}
