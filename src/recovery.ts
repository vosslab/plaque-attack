import { campaignPosition, getLevel, isLevelUnlocked, LEVEL_IDS } from "./constants";
import type { LevelId } from "./types/level";
import type { RecoveryMapOptions } from "./types/recovery";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

type MapSlot = Readonly<{ x: number; y: number }>;
const CHAPTER_NAMES = ["Plaque Patrol", "Platelet Pop", "Pulse Partners", "Flow State"] as const;

// Stable IDs own their physical coronary territory. Campaign order controls
// routes and labels below, so reordering a campaign never moves a healed area.
const MAP_SLOTS: Readonly<Record<LevelId, MapSlot>> = {
  1: { x: 57, y: 19 },
  16: { x: 66, y: 21 },
  2: { x: 75, y: 27 },
  3: { x: 81, y: 36 },
  4: { x: 82, y: 47 },
  5: { x: 78, y: 60 },
  6: { x: 70, y: 73 },
  17: { x: 61, y: 80 },
  7: { x: 52, y: 83 },
  18: { x: 45, y: 77 },
  19: { x: 44, y: 67 },
  20: { x: 47, y: 57 },
  8: { x: 52, y: 47 },
  21: { x: 49, y: 37 },
  9: { x: 52, y: 28 },
  22: { x: 61, y: 31 },
  23: { x: 67, y: 38 },
  10: { x: 72, y: 47 },
  11: { x: 68, y: 57 },
  12: { x: 61, y: 65 },
  13: { x: 55, y: 70 },
  14: { x: 58, y: 58 },
  24: { x: 61, y: 48 },
  15: { x: 64, y: 40 },
};

function html<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className !== undefined) node.className = className;
  return node;
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  className: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NAMESPACE, tag);
  node.setAttribute("class", className);
  return node;
}

function recoveryTier(completed: number): number {
  if (completed < 6) return 0;
  if (completed < 12) return 1;
  if (completed < 18) return 2;
  if (completed < LEVEL_IDS.length) return 3;
  return 4;
}

function completionText(completed: number): string {
  if (completed === 0) return "The circulation map is waiting for its first clear route.";
  if (completed === LEVEL_IDS.length)
    return "All coronary routes are flowing. A full recovery circuit is complete.";
  return `${completed} of ${LEVEL_IDS.length} routes restored. Each cleared stage brings the patient closer to an easy stride.`;
}

function routePath(from: MapSlot, to: MapSlot, offset: number): string {
  const bendX = (from.x + to.x) / 2 + (offset % 2 === 0 ? 3 : -3);
  const bendY = (from.y + to.y) / 2 + (offset % 3 === 0 ? -3 : 3);
  return `M ${from.x} ${from.y} Q ${bendX} ${bendY} ${to.x} ${to.y}`;
}

function territoryPath(slot: MapSlot, variation: number): string {
  const tilt = variation % 2 === 0 ? 1 : -1;
  return `M ${slot.x - 5} ${slot.y + 2} C ${slot.x - 6} ${slot.y - 2}, ${slot.x - 2} ${slot.y - 5}, ${slot.x + 2 * tilt} ${slot.y - 4} C ${slot.x + 6} ${slot.y - 3}, ${slot.x + 6} ${slot.y + 2}, ${slot.x + 2 * tilt} ${slot.y + 4} C ${slot.x - 1} ${slot.y + 6}, ${slot.x - 5} ${slot.y + 4}, ${slot.x - 5} ${slot.y + 2} Z`;
}

function territoryVesselPath(slot: MapSlot, variation: number): string {
  const tilt = variation % 2 === 0 ? 1 : -1;
  return `M ${slot.x - 3} ${slot.y + 3} Q ${slot.x + tilt} ${slot.y - 1}, ${slot.x + 3} ${slot.y - 3}`;
}

function stageAt(position: number): LevelId {
  const levelId = LEVEL_IDS[position];
  if (levelId === undefined) throw new Error(`Recovery map has no stage at ${position}.`);
  return levelId;
}

function slotFor(levelId: LevelId): MapSlot {
  const slot = MAP_SLOTS[levelId];
  if (slot === undefined) throw new Error(`Recovery map has no territory for stage ${levelId}.`);
  return slot;
}

/**
 * Builds the read-only campaign recovery presentation. Buttons only report a
 * selection; their owner decides whether it starts a stage, opens its briefing,
 * or merely changes focus.
 */
export function createRecoveryMap(options: Readonly<RecoveryMapOptions>): HTMLElement {
  const completed = new Set<LevelId>(options.completedLevelIds);
  const section = html("section", "recovery_map");
  section.setAttribute("aria-label", "Coronary recovery map");
  section.dataset.recoveryTier = String(recoveryTier(completed.size));

  const intro = html("div", "recovery_map_intro");
  const eyebrow = html("p", "eyebrow");
  eyebrow.textContent = "Restore the rhythm";
  const title = html("h2");
  title.textContent = "Restore the coronary routes.";
  const vitality = html("p", "recovery_vitality");
  vitality.setAttribute("role", "status");
  vitality.textContent = completionText(completed.size);
  const ledger = html("ul", "recovery_chapter_ledger");
  for (const chapter of [1, 2, 3, 4] as const) {
    const restored = LEVEL_IDS.filter(
      (levelId) => getLevel(levelId).chapter === chapter && completed.has(levelId),
    ).length;
    const item = html("li");
    item.textContent = `Chapter ${chapter}: ${restored} / 6 ${CHAPTER_NAMES[chapter - 1]} routes`;
    ledger.append(item);
  }
  intro.append(eyebrow, title, vitality, ledger);

  const art = html("div", "recovery_map_art");
  const illustration = document.createElement("img");
  illustration.className = "recovery_map_illustration";
  illustration.src = "assets/cardiac_recovery.svg";
  illustration.alt =
    "A stylized patient and heart with branching coronary vessels that brighten as routes are restored.";

  // The external SVG keeps these reusable patient states editable with the
  // cardiac illustration; this view selects the progress-appropriate symbol.
  const patient = svg("svg", "recovery_patient_overlay");
  patient.setAttribute("viewBox", "0 0 1000 640");
  patient.setAttribute("preserveAspectRatio", "xMidYMid slice");
  patient.setAttribute("aria-hidden", "true");
  const patientState = document.createElementNS(SVG_NAMESPACE, "use");
  patientState.setAttribute(
    "href",
    `assets/cardiac_recovery.svg#recovery-patient-tier-${recoveryTier(completed.size)}`,
  );
  patient.append(patientState);

  const overlay = svg("svg", "recovery_map_svg");
  overlay.setAttribute("viewBox", "0 0 100 100");
  overlay.setAttribute("preserveAspectRatio", "none");
  overlay.setAttribute("aria-hidden", "true");
  for (let index = 1; index < LEVEL_IDS.length; index += 1) {
    const previous = stageAt(index - 1);
    const current = stageAt(index);
    const route = svg("path", "recovery_connector");
    route.dataset.stage = String(current);
    route.dataset.completed = String(completed.has(previous) && completed.has(current));
    route.setAttribute("d", routePath(slotFor(previous), slotFor(current), index));
    overlay.append(route);
  }
  for (let index = 0; index < LEVEL_IDS.length; index += 1) {
    const levelId = stageAt(index);
    const slot = slotFor(levelId);
    const territory = svg("path", "recovery_territory");
    territory.dataset.stage = String(levelId);
    territory.dataset.completed = String(completed.has(levelId));
    territory.setAttribute("d", territoryPath(slot, index));
    overlay.append(territory);
    const vessel = svg("path", "recovery_territory_vessel");
    vessel.dataset.stage = String(levelId);
    vessel.dataset.completed = String(completed.has(levelId));
    vessel.setAttribute("d", territoryVesselPath(slot, index));
    overlay.append(vessel);
    const marker = svg("circle", "recovery_marker");
    marker.dataset.completed = String(completed.has(levelId));
    marker.setAttribute("cx", String(slot.x));
    marker.setAttribute("cy", String(slot.y));
    marker.setAttribute("r", "1.2");
    overlay.append(marker);
    const lesion = svg("circle", "recovery_lesion");
    lesion.dataset.stage = String(levelId);
    lesion.dataset.completed = String(completed.has(levelId));
    lesion.setAttribute("cx", String(slot.x + (index % 2 === 0 ? 1.4 : -1.4)));
    lesion.setAttribute("cy", String(slot.y - 0.7));
    lesion.setAttribute("r", "1.65");
    overlay.append(lesion);
  }

  const buttons = html("div", "recovery_stage_buttons");
  for (let index = 0; index < LEVEL_IDS.length; index += 1) {
    const levelId = stageAt(index);
    const level = getLevel(levelId);
    const slot = slotFor(levelId);
    const complete = completed.has(levelId);
    const unlocked = isLevelUnlocked(levelId, options.unlockedLevel);
    const selected = options.selectedLevelId === levelId;
    const stage = document.createElement("button");
    stage.type = "button";
    stage.className = "recovery_stage";
    stage.dataset.stage = String(levelId);
    stage.dataset.completed = String(complete);
    stage.dataset.newlyCompleted = String(options.newlyCompletedLevelId === levelId);
    stage.dataset.state = complete
      ? "completed"
      : selected
        ? "current"
        : unlocked
          ? "unlocked"
          : "locked";
    stage.style.setProperty("--map-x", `${slot.x}%`);
    stage.style.setProperty("--map-y", `${slot.y}%`);
    stage.disabled = !unlocked;
    if (selected) stage.setAttribute("aria-current", "step");
    stage.setAttribute(
      "aria-label",
      `Stage ${campaignPosition(levelId)}: ${level.name}. ${complete ? "Route restored." : unlocked ? "Available." : "Locked."}`,
    );
    const chapter = html("span", "recovery_stage_chapter");
    chapter.textContent = `C${level.chapter}`;
    const label = html("span", "recovery_stage_label");
    label.textContent = String(campaignPosition(levelId));
    stage.append(chapter, label);
    stage.addEventListener("click", () => options.onStageSelected(levelId));
    buttons.append(stage);
  }

  art.append(illustration, patient, overlay, buttons);
  const legend = html("p", "recovery_map_legend");
  legend.textContent =
    "Bright nodes show restored routes. Select any available stage to revisit its place in the recovery circuit.";
  const stageList = html("div", "recovery_stage_list");
  stageList.setAttribute("aria-label", "Recovery stages");
  for (const levelId of LEVEL_IDS) {
    const level = getLevel(levelId);
    const complete = completed.has(levelId);
    const unlocked = isLevelUnlocked(levelId, options.unlockedLevel);
    const selected = options.selectedLevelId === levelId;
    const stage = document.createElement("button");
    stage.type = "button";
    stage.className = "recovery_stage_list_button";
    stage.dataset.stage = String(levelId);
    stage.dataset.state = complete
      ? "completed"
      : selected
        ? "current"
        : unlocked
          ? "unlocked"
          : "locked";
    stage.disabled = !unlocked;
    if (selected) stage.setAttribute("aria-current", "step");
    stage.textContent = `Stage ${campaignPosition(levelId)}: ${level.name}${selected ? " - current" : ""}${complete ? " - restored" : unlocked ? "" : " - locked"}`;
    stage.addEventListener("click", () => options.onStageSelected(levelId));
    stageList.append(stage);
  }
  section.append(intro, art, legend, stageList);
  if (options.newlyCompletedLevelId !== undefined) {
    const level = getLevel(options.newlyCompletedLevelId);
    const notice = html("p", "recovery_newly_cleared");
    notice.setAttribute("role", "status");
    notice.textContent = `Route restored: Stage ${campaignPosition(level.id)}, ${level.name}.`;
    section.append(notice);
  }
  return section;
}
