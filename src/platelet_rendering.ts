import type { PlateletSize } from "./types/level";
import { HIT_EFFECT_DURATION, type HitEffect } from "./hit_effects";

// Three separate silhouettes joined at the centre keep the group readable at 52px.
const LOBES = [
  { x: -0.43, y: -0.26 },
  { x: 0.43, y: -0.26 },
  { x: 0, y: 0.5 },
] as const;

/** Use the accepted sprite material for both individual platelets and linked groups. */
export function drawPlatelet(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  size: PlateletSize,
  radius: number,
  x = 0,
  y = 0,
): void {
  if (size === "tiny") {
    ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (const lobe of LOBES) {
    ctx.moveTo(0, 0);
    ctx.lineTo(lobe.x * radius, lobe.y * radius);
  }
  ctx.strokeStyle = "#663794";
  ctx.lineWidth = radius * 0.34;
  ctx.stroke();
  ctx.strokeStyle = "#ebdcff";
  ctx.lineWidth = radius * 0.15;
  ctx.stroke();
  const lobeRadius = radius * 0.5;
  for (const lobe of LOBES)
    ctx.drawImage(
      image,
      lobe.x * radius - lobeRadius,
      lobe.y * radius - lobeRadius,
      lobeRadius * 2,
      lobeRadius * 2,
    );
  ctx.restore();
}

/** Opening bonds and three outward glints distinguish disaggregation from a shell break. */
export function drawPlateletDisaggregation(
  ctx: CanvasRenderingContext2D,
  effect: Readonly<HitEffect>,
  reducedMotion: boolean,
): void {
  const progress = Math.max(0, Math.min(1, 1 - effect.life / HIT_EFFECT_DURATION));
  const separation = reducedMotion ? 1.2 : 1 + progress * 1.2;
  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.globalAlpha = (1 - progress) * 0.85;
  ctx.strokeStyle = "#ebdcff";
  ctx.lineWidth = 2.5;
  for (const lobe of LOBES) {
    const x = lobe.x * effect.radius * separation;
    const y = lobe.y * effect.radius * separation;
    ctx.beginPath();
    ctx.arc(x, y, effect.radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x * 0.4, y * 0.4);
    ctx.lineTo(x * 0.64, y * 0.64);
    ctx.stroke();
  }
  ctx.restore();
}
