import { ARENA_WIDTH, STICKY_PAUSE_DURATION, UNSTABLE_SPLIT_DURATION } from "./constants";
import type { PlaqueTarget } from "./types/simulation";

/** State cues follow active gameplay time, including when decorative motion is disabled. */
export function drawLipidBehavior(
  ctx: CanvasRenderingContext2D,
  target: Readonly<PlaqueTarget>,
  x: number,
  y: number,
): void {
  const behavior = target.behavior;
  if (behavior === undefined) return;
  const radius = target.radius;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const outline = (color: string, width = 3): void => {
    ctx.strokeStyle = "#272136";
    ctx.lineWidth = width + 3;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  const badge = (text: string, color: string): void => {
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const width = ctx.measureText(text).width + 12;
    const badgeX = Math.max(width / 2 + 4 - x, Math.min(ARENA_WIDTH - width / 2 - 4 - x, 0));
    const badgeY = Math.max(13 - y, -radius - 19);
    ctx.fillStyle = "#272136";
    ctx.beginPath();
    ctx.roundRect(badgeX - width / 2, badgeY - 11, width, 22, 5);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(text, badgeX, badgeY);
  };
  const countdown = (fraction: number, color: string): void => {
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      radius + 8,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, fraction)),
    );
    outline(color, 4);
  };
  switch (behavior.kind) {
    case "sticky": {
      // Soft padded scallops and tack marks identify the body before it reaches a wall.
      ctx.beginPath();
      for (let step = 0; step <= 96; step += 1) {
        const angle = (step / 96) * Math.PI * 2;
        const edge = radius + 2 + Math.sin(angle * 12) * 2;
        const px = Math.cos(angle) * edge;
        const py = Math.sin(angle) * edge;
        if (step === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      outline("#ffe8b9", 3);
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * radius * 0.55, -5);
        ctx.lineTo(side * radius * 0.55, 6);
        outline("#ffe8b9", 3);
      }
      if (behavior.pauseRemaining > 0) {
        const wallX = x < ARENA_WIDTH / 2 ? -x : ARENA_WIDTH - x;
        ctx.beginPath();
        ctx.moveTo(Math.sign(wallX) * radius, -7);
        ctx.lineTo(wallX, -12);
        ctx.moveTo(Math.sign(wallX) * radius, 7);
        ctx.lineTo(wallX, 12);
        outline("#ffe8b9", 3);
        countdown(behavior.pauseRemaining / STICKY_PAUSE_DURATION, "#ffe8b9");
        badge(`HELD ${behavior.pauseRemaining.toFixed(1)}s`, "#ffe8b9");
      }
      break;
    }
    case "heavy":
      // Broad bands plus a weight mark carry the identity without relying on hue.
      for (const offset of [-0.28, 0.3]) {
        ctx.beginPath();
        ctx.ellipse(0, radius * offset, radius * 0.85, radius * 0.27, 0, 0, Math.PI);
        outline("#e6d8b6", 5);
      }
      ctx.beginPath();
      ctx.moveTo(-9, -radius * 0.65);
      ctx.lineTo(9, -radius * 0.65);
      ctx.lineTo(13, -radius * 0.12);
      ctx.lineTo(-13, -radius * 0.12);
      ctx.closePath();
      ctx.fillStyle = "#272136";
      ctx.fill();
      outline("#e6d8b6", 2);
      break;
    case "unstable":
      ctx.beginPath();
      ctx.moveTo(-radius * 0.5, -radius * 0.7);
      ctx.lineTo(2, -radius * 0.24);
      ctx.lineTo(-radius * 0.2, radius * 0.03);
      ctx.lineTo(radius * 0.48, radius * 0.58);
      ctx.moveTo(2, -radius * 0.24);
      ctx.lineTo(radius * 0.55, -radius * 0.44);
      outline("#fff1d4", 3);
      countdown(behavior.splitRemaining / UNSTABLE_SPLIT_DURATION, "#fff1d4");
      badge(`SPLIT ${Math.max(0, behavior.splitRemaining).toFixed(1)}s`, "#fff1d4");
      break;
  }
  ctx.restore();
}
