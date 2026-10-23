import type { SimulationEvent } from "./types/events";

export const HIT_EFFECT_DURATION = 0.48;

export type HitEffect = {
  kind: "plaque" | "platelet";
  split: boolean;
  x: number;
  y: number;
  radius: number;
  life: number;
};

/** Retain the simulation's outcome; visual effects never infer it from target size. */
export function createHitEffect(
  event: Extract<SimulationEvent, { type: "target_hit" }>,
  radius: number,
): HitEffect {
  return {
    kind: event.targetKind,
    split: event.split,
    x: event.position.x,
    y: event.position.y,
    radius,
    life: HIT_EFFECT_DURATION,
  };
}

/** Open shell pieces mean fragmentation; a closed, compact glint means removal. */
export function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  effect: Readonly<HitEffect>,
  reducedMotion: boolean,
): void {
  const progress = Math.max(0, Math.min(1, 1 - effect.life / HIT_EFFECT_DURATION));
  const motion = reducedMotion ? 0 : progress;
  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.globalAlpha = (1 - progress) * 0.8;
  ctx.strokeStyle = effect.kind === "plaque" ? "#ffce55" : "#d4afff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (effect.split) {
    const radius = Math.min(36, effect.radius * 0.9);
    const separation = 8 + motion * 10;
    // Symbolic broken shell, not a prediction of the number or paths of children.
    ctx.arc(-separation, 0, radius, Math.PI * 0.65, Math.PI * 1.35);
    ctx.moveTo(separation + radius * Math.cos(-Math.PI * 0.35), radius * Math.sin(-Math.PI * 0.35));
    ctx.arc(separation, 0, radius, -Math.PI * 0.35, Math.PI * 0.35);
  } else {
    const radius = Math.min(10, effect.radius * 0.65) * (1 - motion * 0.65);
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius, 0);
    ctx.closePath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
  }
  ctx.stroke();
  ctx.restore();
}
