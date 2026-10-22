/** Static material shared by the geometry-owned floor and decorative outer wall. */
export function drawMembrane(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  right: number,
  bottom: number,
): void {
  const depth = ctx.createLinearGradient(0, top, 0, bottom);
  depth.addColorStop(0, "#ad798b");
  depth.addColorStop(0.35, "#925e77");
  depth.addColorStop(1, "#63445f");
  ctx.fillStyle = depth;
  ctx.fillRect(left, top, right - left, bottom - top);
  // Broad overlapping lobules have irregular spacing, shoulders and recessed seams.
  // Fixed trigonometric variation is material, never simulation randomness or a clock.
  for (let row = 0, y = top - 12; y < bottom + 28; row += 1, y += 32) {
    for (let x = left - 54 + (row % 2) * 29; x < right + 48;) {
      const variation = Math.sin(x * 0.073 + row * 2.7);
      const width = 48 + (variation + 1) * 12;
      const cy = y + Math.cos(x * 0.041 + row) * 8;
      const height = 13 + Math.sin(x * 0.13 + row) * 4;
      ctx.beginPath();
      ctx.moveTo(x - width / 2, cy);
      ctx.bezierCurveTo(x - width * 0.6, cy - height, x - 8, cy - height * 1.3, x + 8, cy - height);
      ctx.bezierCurveTo(
        x + width * 0.6,
        cy - height,
        x + width * 0.66,
        cy + height * 0.4,
        x + width / 2,
        cy + height * 0.6,
      );
      ctx.bezierCurveTo(x + 6, cy + height * 1.4, x - width * 0.4, cy + height, x - width / 2, cy);
      ctx.fillStyle = variation > 0 ? "#ad7b8d" : "#99677f";
      ctx.fill();
      ctx.strokeStyle = "#70465f";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Broken light catches the upper shoulder instead of outlining every cell.
      ctx.beginPath();
      ctx.moveTo(x - width * 0.37, cy - height * 0.35);
      ctx.quadraticCurveTo(x - 7, cy - height * 1.15, x + width * 0.28, cy - height * 0.65);
      ctx.strokeStyle = "#d0a0aa";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 6, cy + 2);
      ctx.bezierCurveTo(x - 1, cy - 2, x + 11, cy - 2, x + 14, cy + 2);
      ctx.strokeStyle = "#76516e";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      x += width - 4;
    }
  }
  // Long, quiet collagen strands bind lobules into one layered membrane.
  ctx.lineWidth = 0.85;
  for (let y = top - 4, index = 0; y < bottom + 10; y += 13, index += 1) {
    ctx.strokeStyle = index % 3 === 0 ? "#e1b6bd" : "#c18d9f";
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(left, y);
    for (let x = left; x < right; x += 140) {
      const bend = Math.sin(x * 0.017 + index * 1.9) * 9;
      ctx.bezierCurveTo(
        x + 38,
        y + bend,
        x + 92,
        y - bend,
        Math.min(right, x + 140),
        y + Math.sin(index + x) * 3,
      );
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
