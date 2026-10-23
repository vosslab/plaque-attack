import { campaignPosition, getLevel, LEVEL_IDS, nextLevelId, OVERLOAD_DURATION } from "./constants";
import { hitMultiplier } from "./scoring";
import { getEntryShiftCue } from "./entry_shift";
import type { LevelConfig, WeaponMode } from "./types/level";
import type { AppScreen } from "./types/runtime";
import type { SimulationState } from "./types/simulation";

export function element(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!(node instanceof HTMLElement)) throw new Error(`Missing game element: ${id}`);
  return node;
}

export function button(id: string): HTMLButtonElement {
  const node = element(id);
  if (!(node instanceof HTMLButtonElement)) throw new Error(`Expected button: ${id}`);
  return node;
}

export function action(text: string, run: () => void, primary = false): HTMLButtonElement {
  const node = document.createElement("button");
  node.type = "button";
  node.className = primary ? "action_button" : "quiet_button";
  node.textContent = text;
  node.addEventListener("click", run);
  return node;
}

export const TOOL_NAMES: Record<WeaponMode, string> = {
  stent: "Coronary stent",
  aspirin: "Aspirin",
  clopidogrel: "Clopidogrel",
  dual: "Dual antiplatelet mode",
};
const TOOL_DETAILS: Record<WeaponMode, string> = {
  stent: "One mesh shot at a time. Split plaque into smaller, faster fragments.",
  aspirin: "Rapid, short-range shots. Each inactivates one platelet hazard.",
  clopidogrel: "Slower, persistent shots. Each can inactivate three different hazards.",
  dual: "Shots alternate automatically between aspirin and clopidogrel. Hold fire to keep going.",
};
export const CHAPTER_NAMES = {
  1: "First Response",
  2: "Platelet Pop",
  3: "Pulse Partners",
  4: "Flow State",
} as const;

export function showScreen(screen: AppScreen): void {
  const kind = screen.kind;
  element("main_menu").hidden = kind !== "menu";
  element("practice_select").hidden = kind !== "practice_select";
  element("level_briefing").hidden = kind !== "briefing";
  element("gameplay").hidden = kind !== "gameplay" && kind !== "celebration" && kind !== "pause";
  element("celebration_status").hidden = kind !== "celebration";
  element("result_panel").hidden = !["level_result", "game_over", "campaign_result"].includes(kind);
}

export function showBriefing(level: LevelConfig, practice: boolean): void {
  element("briefing_act").textContent =
    `Chapter ${level.chapter} / ${CHAPTER_NAMES[level.chapter]}${practice ? " / Practice" : ""}`;
  element("briefing_title").textContent = `Stage ${campaignPosition(level.id)}: ${level.name}`;
  const mechanics: string[] = [];
  if (level.arena.tissue.length > 0)
    mechanics.push("Tissue blocks every shot. Repeated shots carve openings and remove shelter.");
  if (level.arena.floor.controlPoints.some((point) => point.y < 540))
    mechanics.push("Move left and right to follow the wavy floor automatically.");
  if (level.merge.budget > 0)
    mechanics.push("Floating lipids of matching sizes can sometimes merge on collision.");
  if (level.arena.pockets.length > 0)
    mechanics.push(
      "Sealed pockets are optional. Breach one to release extra hazards after a short warning.",
    );
  element("briefing_objective").textContent = [level.briefing, ...mechanics].join(" ");
  const tactics = element("briefing_tactics");
  tactics.replaceChildren();
  const instructions: string[] = [];
  if (level.flowSwitches?.length)
    instructions.push(
      "Shoot a ready flow switch with any tool to pull hazards toward its marked lane for 4 seconds. All switches then cool for 6 seconds; shots pass through active or cooling switches.",
    );
  if (level.arena.supportPockets?.length)
    instructions.push(
      "Optional support: carve the marked pocket, then walk to collect its capsule. One shield absorbs one contact; it does not stack. Overload damage bypasses it. Support never blocks a clear.",
    );
  if (level.objective.kind === "clear" && level.objective.phases)
    instructions.push(
      `Clear each finite group: ${level.objective.phases.map((phase) => phase.name).join(" / ")}. Watch for the next-phase warning; your carved openings, current and shield carry forward.`,
    );
  for (const instruction of instructions) {
    const item = document.createElement("li");
    item.textContent = instruction;
    tactics.append(item);
  }
  tactics.hidden = instructions.length === 0;
  const position = campaignPosition(level.id);
  element("briefing_feel").textContent =
    position <= 3
      ? "Gentle warm-up / take your time"
      : position === 15
        ? "Fresh rhythm / settle into dual-tool play"
        : position === 7 || position === 13 || position === 18
          ? "Mastery lap / refine your timing"
          : level.objective.kind === "maintenance"
            ? "Keep the rhythm / stay below the safe count"
            : "Find your opening / keep moving";
  const scene = element("briefing_scene");
  if (scene instanceof HTMLImageElement) scene.src = `assets/${level.scene}.svg`;
  element("briefing_weapon").textContent = TOOL_NAMES[level.weapon];
  element("briefing_tool_description").textContent = TOOL_DETAILS[level.weapon];
  element("briefing_caption").textContent =
    instructions.length > 0
      ? "Arcade fiction: flow switches, carving and contact shields are game mechanics, not cardiovascular treatments."
      : level.act === 1
        ? "Arcade model: real stents hold arteries open."
        : "New target: platelet activation. Antiplatelet drugs help prevent clot formation.";
  const tool = element("briefing_tool_art");
  const target = element("briefing_target_art");
  if (tool instanceof HTMLImageElement)
    tool.src = `assets/${level.weapon === "dual" ? "aspirin" : level.weapon}.svg`;
  if (target instanceof HTMLImageElement)
    target.src = `assets/${level.act === 1 ? level.lipidVariants[0] : "platelet"}.svg`;
  element("briefing_title").focus();
}

function clock(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function tactic(id: string, text: string): void {
  const node = element(id);
  node.hidden = text === "";
  if (node.textContent !== text) node.textContent = text;
}

export function updateHud(state: Readonly<SimulationState>): void {
  const { level } = state;
  element("hud_level").textContent =
    `Stage ${campaignPosition(level.id)}: ${level.name}${state.mode === "practice" ? " / Practice" : ""}`;
  element("hud_lives").textContent =
    `${"\u2665".repeat(state.player.lives)}${"\u2661".repeat(3 - state.player.lives)} ${state.player.lives} / 3`;
  element("hud_score").textContent = String(state.score).padStart(6, "0");
  element("hud_streak").textContent = `${state.streak}-hit streak`;
  element("hud_multiplier").textContent = `x${hitMultiplier(state.streak)} points`;
  element("hud_weapon").textContent = TOOL_NAMES[level.weapon];
  const objective = level.objective;
  const completed = state.phase === "level_complete" || state.phase === "campaign_complete";
  element("hud_time_label").textContent =
    objective.kind === "maintenance" ? "Remaining" : "Elapsed";
  element("hud_time").textContent = clock(
    objective.kind === "maintenance"
      ? completed
        ? 0
        : objective.duration - state.elapsed
      : state.elapsed,
  );
  element("hud_objective").textContent =
    objective.kind === "maintenance"
      ? `Active platelet hazards: ${state.targets.length} / ${objective.safeMaximum}`
      : level.act === 1
        ? `Plaque fragments: ${state.targets.length}`
        : `Hazards remaining: ${state.targets.length + objective.reinforcements.length - state.waves.spawned}`;
  const sealed = state.arena.pockets.filter((pocket) => pocket.status === "sealed").length;
  const pending = state.arena.pockets.filter((pocket) => pocket.status === "pending").length;
  const deferred = state.arena.pendingInsertions.filter((entry) => entry.kind === "split").length;
  if (sealed > 0) element("hud_objective").textContent += ` / Optional pockets: ${sealed}`;
  if (pending > 0) element("hud_objective").textContent += ` / Releasing pockets: ${pending}`;
  if (deferred > 0) element("hud_objective").textContent += ` / Pending hazards: ${deferred}`;
  const expired =
    objective.kind === "maintenance" && !completed && state.elapsed >= objective.duration;
  const countdown =
    state.overloadElapsed > 0
      ? `Reduce hazards: ${Math.max(0, OVERLOAD_DURATION - state.overloadElapsed).toFixed(1)} s`
      : "";
  const warnings = [
    expired ? "Time complete - return to safe maximum and finish pending releases" : "",
    countdown,
    state.waves.warning !== undefined ? "Incoming hazard" : "",
    pending > 0 ? "Opened pockets must finish releasing" : "",
    deferred > 0 ? "Clear hazards to make room for pending fragments" : "",
  ].filter(Boolean);
  const phases = objective.kind === "clear" ? objective.phases : undefined;
  const finale = state.remix.finale;
  const phase = phases && finale ? phases[finale.phaseIndex] : undefined;
  const nextPhase = phases && finale ? phases[finale.phaseIndex + 1] : undefined;
  const entryCue = state.phase === "playing" ? getEntryShiftCue(state) : undefined;
  const entrySide = entryCue && entryCue.laneX >= 480 ? "Right" : "Left";
  const entryStatus = entryCue
    ? entryCue.phase === "forecast"
      ? `${entrySide}-side arrivals coming: cross to gather, or keep carving shelter`
      : `New arrivals: ${entrySide.toLowerCase()}`
    : "";
  const phaseText =
    phase && finale
      ? finale.transitionRemaining > 0 && nextPhase
        ? `Next: ${nextPhase.name}`
        : `Phase ${finale.phaseIndex + 1}/${phases?.length}: ${phase.name}`
      : entryCue
        ? entryCue.phase === "forecast"
          ? `${entrySide}-side arrivals in ${Math.ceil(entryCue.remaining)}s`
          : `New arrivals: ${entrySide.toLowerCase()}`
        : "";
  if (finale && finale.transitionRemaining > 0 && nextPhase)
    warnings.push(`Next group: ${nextPhase.name} - get ready`);
  tactic("hud_phase", phaseText);
  const flow = state.remix.flow;
  const hasFlow = (level.flowSwitches?.length ?? 0) > 0;
  const lane =
    flow.kind === "active"
      ? (level.flowSwitches?.findIndex((entry) => entry.id === flow.switchId) ?? -1) + 1
      : 0;
  const flowLabel =
    flow.kind === "ready"
      ? "Flow ready"
      : flow.kind === "active"
        ? `Current: lane ${lane}`
        : "Flow cooling";
  tactic(
    "hud_flow",
    hasFlow ? `${flowLabel}${flow.kind === "ready" ? "" : ` / ${Math.ceil(flow.remaining)}s`}` : "",
  );
  element("hud_flow").dataset.state = flow.kind;
  const hasSupport = state.remix.supportPockets.length > 0 || state.remix.contactShield;
  const supportReleased = state.remix.supportPockets.some((pocket) => pocket.status === "released");
  const shieldText = state.remix.contactShield
    ? "Shield: 1 contact"
    : supportReleased
      ? "Support: walk to collect"
      : "Shield: empty";
  tactic("hud_shield", hasSupport ? shieldText : "");
  element("hud_shield").dataset.state = state.remix.contactShield ? "armed" : "empty";
  const retries = state.remix.retry.retryCount;
  tactic("hud_retries", retries > 0 ? `Retries: ${retries}` : "");
  element("hud_tactics").hidden = !phaseText && !hasFlow && !hasSupport && retries === 0;
  element("hud_warning").textContent = warnings.join(" / ");
  // Live announcements describe changes, not the visual clocks or target counts.
  const status = [
    entryCue ? entryStatus : phaseText,
    hasFlow ? flowLabel : "",
    hasSupport ? shieldText : "",
    state.overloadElapsed > 0 ? "Overload: reduce hazards" : "",
    ...warnings.filter((warning) => warning !== countdown),
  ]
    .filter(Boolean)
    .join(". ");
  const statusNode = element("hud_status");
  if (statusNode.textContent !== status) statusNode.textContent = status;
}

export function showResult(state: Readonly<SimulationState>, recordRank?: number): void {
  const lost = state.phase === "game_over";
  const final = state.phase === "campaign_complete";
  element("result_eyebrow").textContent =
    state.mode === "practice"
      ? "Practice / Unranked"
      : final
        ? `All ${LEVEL_IDS.length} stages complete`
        : "Your shift continues";
  element("result_title").textContent = lost
    ? "Run ended"
    : final && state.mode !== "practice"
      ? "Circulation restored!"
      : state.level.objective.kind === "maintenance"
        ? "Maintenance complete!"
        : state.level.act === 1
          ? "Plaque cleared!"
          : state.level.act === 2
            ? "Platelet activity controlled!"
            : "Stage cleared!";
  element("result_summary").textContent =
    `Stage ${campaignPosition(state.level.id)}: ${state.level.name}. Points earned this level: ${(state.score - state.levelStartScore).toLocaleString()}. Total score: ${state.score.toLocaleString()}. Lives remaining: ${state.player.lives} / 3. Retries: ${state.remix.retry.retryCount}.${lost ? ` Retry this stage from its entry score of ${state.levelStartScore.toLocaleString()} with 3 lives and the same opening. Each retry adds to the run retry count; this failure saves no record.` : ""}${recordRank === undefined ? "" : ` High-score rank: ${recordRank} / 5.`}`;
  element("result_fact").textContent =
    state.level.fact ??
    getLevel(state.level.act === 1 ? 3 : state.level.act === 2 ? 6 : 11).fact ??
    "";
  button("continue_button").hidden = lost || final || state.mode === "practice";
  const next = nextLevelId(state.level.id);
  button("continue_button").textContent =
    next === undefined
      ? "Continue"
      : `Next: Stage ${campaignPosition(next)} - ${getLevel(next).name} \u2192`;
  button("retry_button").hidden = !lost && !final && state.mode !== "practice";
  button("retry_button").textContent =
    state.mode === "practice" ? "Retry practice" : final ? "Play again" : "Retry this stage";
  element("result_keyboard_hint").textContent =
    state.mode === "practice"
      ? "Press Enter or Space to retry practice."
      : final
        ? "Press Enter or Space to play again."
        : lost
          ? "Press Enter or Space to retry this stage. Release, then press again when ready."
          : "Press Enter or Space for the next stage.";
  element("result_title").focus();
}
