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
import type { ArenaRenderer, AssetImages } from "./types/runtime";
import type { SimulationState } from "./types/simulation";

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
    for (const event of events) {
      if (event.type === "shot") firingRemaining = 0.16;
      if (event.type === "damage") damageRemaining = 0.3;
      if (event.type === "target_hit") {
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

  function drawSurgeon(state: Readonly<SimulationState>): void {
    const { x, y } = state.player.position;
    const victory = state.phase === "level_complete" || state.phase === "campaign_complete";
    const running = moving && state.phase === "playing" && !reducedMotion;
    const stride = running ? Math.sin(state.elapsed * 22) : 0;
    const recoil = firingRemaining > 0 ? 2 : 0;
    const breathing =
      !reducedMotion && state.phase === "playing" ? Math.sin(state.elapsed * 3) * 0.4 : 0;
    ctx.save();
    ctx.translate(x, y - PLAYER_HEIGHT);
    ctx.fillStyle = "#180f24";
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(0, PLAYER_HEIGHT - 2, 26, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.translate(0, recoil + breathing - (victory ? 5 : 0));
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
    ctx.drawImage(
      images.surgeon,
      0,
      0,
      96,
      100,
      -PLAYER_WIDTH / 2,
      0,
      PLAYER_WIDTH,
      (PLAYER_HEIGHT * 100) / 128,
    );
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 5, (PLAYER_HEIGHT * 100) / 128);
      ctx.rotate(stride * side * 0.28);
      const sourceX = side < 0 ? 0 : 48;
      ctx.drawImage(
        images.surgeon,
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
    if (victory) {
      ctx.strokeStyle = "#caffee";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-13, 33);
      ctx.lineTo(-26, 15);
      ctx.stroke();
      ctx.drawImage(images.surgeon, 10, 78, 17, 19, -31, 5, 12, 13);
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

  function render(state: Readonly<SimulationState>, interpolation: number): void {
    if (destroyed) return;
    resize();
    const newLevel = state.level.id !== lastLevel || state.tick < lastTick;
    if (newLevel) {
      particles = [];
      hitEffects = [];
      lastPlayerX = undefined;
      firingRemaining = 0;
      damageRemaining = 0;
    }
    const dt = newLevel ? 0 : Math.max(0, Math.min(0.1, (state.tick - lastTick) * FIXED_STEP));
    if (lastPlayerX !== undefined && state.tick !== lastTick)
      moving = Math.abs(state.player.position.x - lastPlayerX) > 0.1;
    lastPlayerX = state.player.position.x;
    lastTick = state.tick;
    lastLevel = state.level.id;
    firingRemaining = Math.max(0, firingRemaining - dt);
    damageRemaining = Math.max(0, damageRemaining - dt);
    ctx.setTransform(canvas.width / ARENA_WIDTH, 0, 0, canvas.height / ARENA_HEIGHT, 0, 0);
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    ctx.drawImage(images.artery, 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    if (state.level.act >= 2) {
      // The installed implant follows the upper artery wall behind every gameplay object.
      // Its horizontal mesh is distinct from the bright vertical fired stent trail.
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(220, 8, 520, 28, 8);
      ctx.clip();
      ctx.strokeStyle = "#d7edf4";
      ctx.globalAlpha = 0.48;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 192; x < 768; x += 28) {
        ctx.moveTo(x, 8);
        ctx.lineTo(x + 28, 36);
        ctx.moveTo(x, 36);
        ctx.lineTo(x + 28, 8);
      }
      ctx.moveTo(220, 9);
      ctx.lineTo(740, 9);
      ctx.moveTo(220, 35);
      ctx.lineTo(740, 35);
      ctx.stroke();
      ctx.restore();
    }
    const alpha = Math.max(0, Math.min(1, interpolation));
    for (const projectile of state.projectiles) {
      const x =
        projectile.previousPosition.x +
        (projectile.position.x - projectile.previousPosition.x) * alpha;
      const y =
        projectile.previousPosition.y +
        (projectile.position.y - projectile.previousPosition.y) * alpha;
      if (projectile.kind === "stent") {
        // Mesh is tiled rather than stretched, keeping diagonal struts legible on a long trail.
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
      const x = target.previousPosition.x + (target.position.x - target.previousPosition.x) * alpha;
      const y = target.previousPosition.y + (target.position.y - target.previousPosition.y) * alpha;
      ctx.save();
      ctx.translate(x, y);
      if (!reducedMotion) ctx.rotate(Math.sin(state.elapsed * 1.2 + target.id) * 0.1);
      ctx.drawImage(
        images[target.kind],
        -target.radius,
        -target.radius,
        target.radius * 2,
        target.radius * 2,
      );
      ctx.restore();
    }
    for (const effect of hitEffects) {
      effect.life -= dt;
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
      ctx.drawImage(images[warning.target.kind], x - 23, y - 23, 46, 46);
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
    drawSurgeon(state);
    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
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
      observer.disconnect();
    },
  };
}
