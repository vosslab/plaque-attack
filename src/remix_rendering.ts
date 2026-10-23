import type { ProjectileId } from "./brands";
import { floorY } from "./arena_geometry";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants";
import { getEntryShiftCue } from "./entry_shift";
import { getEffectiveCurrent, getRestoredCurrent } from "./remix_mechanics";
import type { SimulationEvent } from "./types/events";
import type { AssetImages } from "./types/runtime";
import type { SimulationState } from "./types/simulation";

type Feedback = { x: number; y: number; text: string; life: number; color: string };
type PulseEffect = { x: number; y: number; radius: number; life: number };

/** Only cleared groups earn restoration; time, damage and a failed run earn none. */
export function restorationProgress(state: Readonly<SimulationState>): number {
  const objective = state.level.objective;
  if (objective.kind !== "clear" || objective.restoration === undefined) return 0;
  if (state.phase === "level_complete" || state.phase === "campaign_complete") return 1;
  const finale = state.remix.finale;
  if (finale === undefined || objective.phases === undefined) return 0;
  return Math.min(
    1,
    (finale.phaseIndex + Number(finale.transitionRemaining > 0)) / objective.phases.length,
  );
}

/** Presentation resources follow the parent renderer's pause, celebration and retry clock. */
export function createRemixRendering(
  ctx: CanvasRenderingContext2D,
  images: AssetImages,
  reducedMotion: boolean,
): {
  clear: () => void;
  advance: (dt: number) => void;
  consumeEvents: (events: readonly SimulationEvent[]) => void;
  drawRestoration: (state: Readonly<SimulationState>) => void;
  drawDevices: (state: Readonly<SimulationState>) => void;
  drawFeedback: (state: Readonly<SimulationState>) => void;
} {
  let feedback: Feedback[] = [];
  let pulses: PulseEffect[] = [];
  let lastHitProjectile: ProjectileId | undefined;
  let consecutiveHits = 0;
  const label = (text: string, x: number, y: number, color: string): void => {
    // Coalesce repeated cell erosion in one small region instead of filling the field.
    if (feedback.some((item) => item.text === text && Math.hypot(item.x - x, item.y - y) < 60))
      return;
    if (feedback.length >= 8) feedback.shift();
    feedback.push({ text, x, y, color, life: 1.1 });
  };
  const caption = (text: string, x: number, y: number, color = "#dcfff1", fontSize = 12): void => {
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const width = ctx.measureText(text).width + 14;
    const boundedX = Math.max(width / 2 + 4, Math.min(956 - width / 2, x));
    const boundedY = Math.max(12, Math.min(526, y));
    ctx.fillStyle = "#211d32";
    ctx.fillRect(boundedX - width / 2, boundedY - 10, width, 20);
    ctx.fillStyle = color;
    ctx.fillText(text, boundedX, boundedY);
  };

  function consumeEvents(events: readonly SimulationEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case "target_hit": {
          consecutiveHits = event.projectileId === lastHitProjectile ? consecutiveHits + 1 : 1;
          lastHitProjectile = event.projectileId;
          if (consecutiveHits > 1)
            label(
              `${consecutiveHits} THROUGH!`,
              event.position.x,
              event.position.y - 35,
              "#e5d2ff",
            );
          break;
        }
        case "clearance_pulse":
          if (pulses.length >= 4) pulses.shift();
          pulses.push({ ...event.position, radius: event.radius, life: 0.8 });
          // Give the payoff priority over the ordinary erosion caption at the same seam.
          feedback = feedback.filter((item) => item.text !== "CARVED");
          label(
            `CLEARANCE / ${event.removedTargetIds.length} CLEARED`,
            event.position.x,
            event.position.y - 48,
            "#dcfff1",
          );
          break;
        case "tissue_eroded":
          if (event.cause === "projectile")
            label("CARVED", event.position.x, event.position.y - 16, "#ffe4df");
          break;
        case "flow_activated":
          label("CURRENT ON / GATHER HERE", event.laneX, 95, "#dcfff1");
          break;
        case "support_released":
          label("SUPPORT / WALK TO COLLECT", event.position.x, event.position.y - 45, "#dcfff1");
          break;
        case "shield_collected":
          label("CONTACT SHIELD READY", event.position.x, event.position.y - 55, "#dcfff1");
          break;
        case "shield_absorbed":
          label(
            "SHIELD SAVED YOU",
            event.position.x,
            event.position.y - PLAYER_HEIGHT - 22,
            "#dcfff1",
          );
          break;
        case "finale_phase_started":
          label(`${event.phaseIndex + 1}/${event.phaseCount} / ${event.name}`, 480, 64, "#fff0d9");
          break;
        default:
          break;
      }
    }
  }

  function drawRestoration(state: Readonly<SimulationState>): void {
    const objective = state.level.objective;
    const progress = restorationProgress(state);
    if (objective.kind !== "clear" || objective.restoration === undefined || progress <= 0) return;
    ctx.save();
    ctx.beginPath();
    switch (objective.restoration) {
      case "artery_opening": {
        // A narrow torn aperture becomes an open lumen as actual groups clear.
        const opening = 8 + progress * 470;
        ctx.moveTo(480 - opening, 65);
        ctx.lineTo(480 + opening, 65);
        ctx.lineTo(480 + opening * 0.72, 155);
        ctx.lineTo(480 + opening, 242);
        ctx.lineTo(480 + opening * 0.7, 350);
        ctx.lineTo(480 + opening, 470);
        ctx.lineTo(480 - opening, 470);
        ctx.lineTo(480 - opening * 0.7, 350);
        ctx.lineTo(480 - opening, 242);
        ctx.lineTo(480 - opening * 0.72, 155);
        ctx.closePath();
        break;
      }
      case "restored_flow": {
        // Recovery reaches the physical vessel wall, with a soft tissue-shaped frontier.
        // Keep the original implant registered to the same scene and camera.
        const edge = progress === 1 ? 1040 : 960 * progress;
        ctx.moveTo(0, 0);
        ctx.lineTo(edge - 28, 0);
        ctx.bezierCurveTo(edge + 34, 90, edge - 48, 145, edge + 8, 235);
        ctx.bezierCurveTo(edge + 46, 310, edge - 35, 390, edge, 490);
        ctx.lineTo(0, 490);
        ctx.closePath();
        break;
      }
      case "restored_lining": {
        // Repaired lower lining and the gathered column are separate visible consequences.
        ctx.rect(0, 425, 960 * progress, 65);
        // Reveal a narrow floor-following band around the surface stroke below the source art.
        ctx.moveTo(0, floorY(state.level.arena.floor, 0) - 12);
        for (let x = 4; x < 960 * progress; x += 4)
          ctx.lineTo(x, floorY(state.level.arena.floor, x) - 12);
        const liningEnd = 960 * progress;
        ctx.lineTo(liningEnd, floorY(state.level.arena.floor, liningEnd) - 12);
        for (let x = liningEnd; x >= 0; x -= 4)
          ctx.lineTo(x, floorY(state.level.arena.floor, x) + 2);
        ctx.lineTo(0, floorY(state.level.arena.floor, 0) + 2);
        ctx.closePath();
        ctx.roundRect(452, 95, 56, 350 * progress, 20);
        break;
      }
      case "patient_recovery": {
        // Living tissue recovers outward along both walls, with an uneven soft frontier.
        // The final earned clearance restores the entire registered scene.
        if (progress === 1) {
          ctx.rect(0, 0, 960, 540);
          break;
        }
        const left = 480 - 480 * progress;
        const right = 480 + 480 * progress;
        const fold = 42 * (1 - progress);
        ctx.moveTo(left - fold, 0);
        ctx.lineTo(right + fold * 0.6, 0);
        ctx.bezierCurveTo(right - fold, 100, right + fold, 175, right, 270);
        ctx.bezierCurveTo(right - fold, 370, right + fold * 1.4, 445, right + fold, 540);
        ctx.lineTo(left - fold * 0.7, 540);
        ctx.bezierCurveTo(left + fold, 440, left - fold * 1.3, 355, left, 265);
        ctx.bezierCurveTo(left + fold, 170, left - fold * 1.2, 90, left - fold, 0);
        ctx.closePath();
        break;
      }
    }
    ctx.clip();
    if (
      objective.restoration === "artery_opening" ||
      objective.restoration === "restored_flow" ||
      objective.restoration === "patient_recovery"
    ) {
      ctx.globalAlpha = 0.65;
      ctx.drawImage(images["scene-healed-flow"], 0, 0, 960, 540);
    }
    if (objective.restoration === "patient_recovery") {
      // Healthy warmth belongs to the tissue; the open lumen stays dark for hazards.
      const warmth = ctx.createLinearGradient(0, 0, 0, 540);
      warmth.addColorStop(0, "rgba(255, 182, 158, 0.2)");
      warmth.addColorStop(0.12, "rgba(255, 182, 158, 0.05)");
      warmth.addColorStop(0.3, "rgba(255, 182, 158, 0)");
      warmth.addColorStop(0.78, "rgba(255, 182, 158, 0)");
      warmth.addColorStop(1, "rgba(255, 182, 158, 0.18)");
      ctx.fillStyle = warmth;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, 960, 540);
    } else {
      ctx.fillStyle = "#95d7c7";
      ctx.globalAlpha = objective.restoration === "artery_opening" ? 0.18 : 0.09;
      ctx.fillRect(0, 50, 960, 440);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(images["restored-flow"], 0, 0, 960, 540);
    if (objective.restoration === "restored_lining" || objective.restoration === "restored_flow") {
      ctx.strokeStyle = "#d9ffee";
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let x = 0; x <= 960 * progress; x += 4) {
        const y = floorY(state.level.arena.floor, x) - 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Movement exists only in earned regions and uses simulation time, so pause freezes it.
    if (!reducedMotion && getEffectiveCurrent(state) === undefined) {
      ctx.strokeStyle = "#eafff4";
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      for (let row = 0; row < 3; row += 1) {
        const x = ((state.elapsed * 95 + row * 270) % 1040) - 40;
        const y = 180 + row * 74;
        ctx.beginPath();
        ctx.moveTo(x - 24, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x - 7, y - 5);
        ctx.moveTo(x, y);
        ctx.lineTo(x - 7, y + 5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawDevices(state: Readonly<SimulationState>): void {
    const flow = state.remix.flow;
    // Device instructions live in CSS-sized HUD text when the world scales down.
    // Large static markers connect each device to its matching HUD cue.
    const showDeviceInstructions = ctx.canvas.getBoundingClientRect().width >= 720;
    const deviceCaption = (
      symbol: string,
      text: string,
      x: number,
      y: number,
      color = "#dcfff1",
    ): void => {
      if (showDeviceInstructions) {
        caption(symbol + " " + text, x, y, color, 16);
        return;
      }
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#211d32";
      ctx.fillRect(x - 20, y - 20, 40, 40);
      ctx.fillStyle = color;
      ctx.fillText(symbol, x, y);
    };
    ctx.save();
    const seam = state.level.clearancePulse;
    if (seam !== undefined && state.remix.clearancePulse !== undefined) {
      const activated = state.remix.clearancePulse.activated;
      const { x, y } = seam.position;
      if (!activated) {
        // The empty outline is the real effect boundary, beneath every active hazard.
        ctx.strokeStyle = "#272136";
        ctx.lineWidth = 4;
        ctx.setLineDash([9, 9]);
        ctx.beginPath();
        ctx.arc(x, y, seam.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#c5ffea";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        for (const reference of seam.seamCells) {
          const cell = state.arena.tissue
            .find((patch) => patch.id === reference.patchId)
            ?.cells.find((item) => item.id === reference.cellId);
          if (cell === undefined || !cell.occupied) continue;
          ctx.strokeStyle = "#272136";
          ctx.lineWidth = 5;
          ctx.strokeRect(cell.position.x + 1, cell.position.y + 1, 10, 10);
          ctx.strokeStyle = "#dcfff1";
          ctx.lineWidth = 2;
          ctx.strokeRect(cell.position.x + 1, cell.position.y + 1, 10, 10);
        }
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 6);
        ctx.lineTo(x, y - 13);
        ctx.lineTo(x + 7, y - 6);
        ctx.moveTo(x - 7, y + 6);
        ctx.lineTo(x, y + 13);
        ctx.lineTo(x + 7, y + 6);
        ctx.stroke();
        deviceCaption("\u25c7", "SHOOT SEAM / CLEAR TINY", x, y - 33);
      } else {
        // The permanent used mark is spatially quiet; the area telegraph is gone.
        deviceCaption("\u25c7", "SEAM SPENT", x, y - 22, "#e1d4cb");
      }
    }
    for (const pulse of pulses) {
      const progress = 1 - pulse.life / 0.8;
      const radius = pulse.radius * (reducedMotion ? 1 : Math.min(1, progress / 0.6));
      ctx.globalAlpha = Math.min(1, pulse.life / 0.25);
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#272136";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = "#dcfff1";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Eight small rays celebrate the opening without filling or hiding it.
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = (ray * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(
          pulse.x + Math.cos(angle) * radius * 0.86,
          pulse.y + Math.sin(angle) * radius * 0.86,
        );
        ctx.lineTo(pulse.x + Math.cos(angle) * radius, pulse.y + Math.sin(angle) * radius);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    const restored = getRestoredCurrent(state);
    const active = getEffectiveCurrent(state);
    if (active !== undefined) {
      // Curved streamlines show the actual gathering lane through both manual and
      // earned flow. They stay thin so tiny hazards retain their silhouettes.
      const bottom = floorY(state.level.arena.floor, active.laneX) - 14;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#b5e9d4";
      ctx.globalAlpha = 0.3;
      for (const side of [-1, 1]) {
        for (let row = 0; row < 3; row += 1) {
          const outerX = side < 0 ? 24 : 936;
          const startY = 105 + row * 90;
          ctx.beginPath();
          ctx.moveTo(outerX, startY);
          ctx.bezierCurveTo(
            outerX + (active.laneX - outerX) * 0.6,
            startY - 18,
            active.laneX + side * 27,
            startY + 25,
            active.laneX + side * 21,
            Math.min(bottom, startY + 125),
          );
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#c5ffea";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      for (const side of [-1, 1]) {
        ctx.moveTo(active.laneX + side * 21, 50);
        ctx.lineTo(active.laneX + side * 21, bottom);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Static inward arrows explain the attraction even with reduced motion.
      for (const side of [-1, 1]) {
        const x = active.laneX + side * 72;
        ctx.beginPath();
        ctx.moveTo(x, active.position.y - 70);
        ctx.lineTo(x - side * 34, active.position.y - 70);
        ctx.lineTo(x - side * 26, active.position.y - 77);
        ctx.moveTo(x - side * 34, active.position.y - 70);
        ctx.lineTo(x - side * 26, active.position.y - 63);
        ctx.stroke();
      }
    }
    for (const definition of state.level.flowSwitches ?? []) {
      const { x, y } = definition.position;
      ctx.drawImage(images["flow-switch"], x - 24, y - 24, 48, 48);
      const manuallyActive = flow.kind === "active" && flow.switchId === definition.id;
      const carryingCurrent = active?.id === definition.id;
      ctx.strokeStyle = carryingCurrent ? "#c5ffea" : flow.kind === "ready" ? "#ffefb3" : "#d6c5e6";
      ctx.lineWidth = carryingCurrent ? 3 : 2;
      ctx.setLineDash(flow.kind === "cooldown" && !carryingCurrent ? [3, 4] : []);
      ctx.beginPath();
      ctx.arc(x, y, 27, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const text =
        manuallyActive && flow.kind === "active"
          ? `CURRENT ${flow.remaining.toFixed(1)}s`
          : restored?.id === definition.id
            ? "RESTORED"
            : flow.kind === "ready"
              ? "READY / SHOOT"
              : flow.kind === "active"
                ? "SWITCH IN USE"
                : `COOLDOWN ${flow.remaining.toFixed(1)}s / SHOTS PASS`;
      deviceCaption("\u2194", text, x, y + 46);
    }
    for (const pocket of state.remix.supportPockets) {
      const definition = state.level.arena.supportPockets?.find((item) => item.id === pocket.id);
      if (definition === undefined || pocket.status === "collected") continue;
      if (pocket.status === "sealed") {
        const cells = definition.shellCells.flatMap((ref) => {
          const cell = state.arena.tissue
            .find((patch) => patch.id === ref.patchId)
            ?.cells.find((item) => item.id === ref.cellId);
          return cell === undefined ? [] : [cell];
        });
        ctx.strokeStyle = "#c5ffea";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        if (cells.length > 0) {
          const left = Math.min(...cells.map((cell) => cell.position.x));
          const top = Math.min(...cells.map((cell) => cell.position.y));
          const right = Math.max(...cells.map((cell) => cell.position.x)) + 12;
          const bottom = Math.max(...cells.map((cell) => cell.position.y)) + 12;
          ctx.strokeRect(left - 3, top - 3, right - left + 6, bottom - top + 6);
          ctx.drawImage(images["support-capsule"], (left + right) / 2 - 13, top - 34, 26, 26);
          deviceCaption("+", "CARVE FOR SUPPORT", (left + right) / 2, top - 51);
        }
        ctx.setLineDash([]);
      } else if (pocket.capsulePosition !== undefined) {
        const { x, y } = pocket.capsulePosition;
        ctx.drawImage(images["support-capsule"], x - 13, y - 13, 26, 26);
        ctx.strokeStyle = "#c5ffea";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 16, y - 16, 32, 32);
        deviceCaption("+", "WALK TO SHIELD", x, y - 38);
      }
    }
    ctx.restore();
  }

  function drawFeedback(state: Readonly<SimulationState>): void {
    ctx.save();
    const entryCue = state.phase === "playing" ? getEntryShiftCue(state) : undefined;
    const objective = state.level.objective;
    if (entryCue && objective.kind === "maintenance" && objective.entryShift) {
      const positions = objective.entryShift.entries.map((entry) => entry.position.x);
      const left = Math.min(...positions) - 16;
      const right = Math.max(...positions) + 16;
      const center = (left + right) / 2;
      const side = entryCue.laneX >= 480 ? "RIGHT" : "LEFT";
      // A top-edge arrival bracket stays separate from the mint current's inward arrows.
      // Static chevrons retain their meaning when motion and audio are disabled.
      caption(
        entryCue.phase === "forecast" ? `${side} STREAM SOON` : `NEW ENTRIES: ${side}`,
        center,
        20,
        "#ffdf92",
      );
      ctx.strokeStyle = "#ffdf92";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(left, 47);
      ctx.lineTo(left, 36);
      ctx.lineTo(right, 36);
      ctx.lineTo(right, 47);
      for (const x of positions) {
        ctx.moveTo(x - 6, 44);
        ctx.lineTo(x, 51);
        ctx.lineTo(x + 6, 44);
      }
      ctx.stroke();
    }
    if (state.remix.contactShield) {
      const { x, y } = state.player.position;
      ctx.strokeStyle = "#c5ffea";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - PLAYER_WIDTH / 2 - 6, y - PLAYER_HEIGHT + 6);
      ctx.lineTo(x, y - PLAYER_HEIGHT - 4);
      ctx.lineTo(x + PLAYER_WIDTH / 2 + 6, y - PLAYER_HEIGHT + 6);
      ctx.lineTo(x + PLAYER_WIDTH / 2 + 6, y - 12);
      ctx.lineTo(x, y + 3);
      ctx.lineTo(x - PLAYER_WIDTH / 2 - 6, y - 12);
      ctx.closePath();
      ctx.stroke();
    }
    for (const item of feedback) {
      ctx.globalAlpha = Math.min(1, item.life / 0.25);
      caption(item.text, item.x, item.y - (reducedMotion ? 0 : (1.1 - item.life) * 10), item.color);
    }
    ctx.globalAlpha = 1;
    if ((state.remix.finale?.transitionRemaining ?? 0) > 0)
      caption("GROUP CLEARED / NEXT GROUP", 480, 64, "#fff0d9");
    ctx.restore();
  }

  return {
    clear: (): void => {
      feedback = [];
      pulses = [];
      lastHitProjectile = undefined;
      consecutiveHits = 0;
    },
    advance: (dt: number): void => {
      for (const item of feedback) item.life -= dt;
      feedback = feedback.filter((item) => item.life > 0);
      for (const pulse of pulses) pulse.life -= dt;
      pulses = pulses.filter((pulse) => pulse.life > 0);
    },
    consumeEvents,
    drawRestoration,
    drawDevices,
    drawFeedback,
  };
}
