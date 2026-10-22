import { campaignPosition, getLevel, LEVEL_IDS, OVERLOAD_DURATION } from "./constants";
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
  1: "Plaque Patrol",
  2: "Platelet Pop",
  3: "Pulse Partners",
  4: "Flow State",
} as const;

export function showScreen(screen: AppScreen): void {
  const kind = screen.kind;
  element("main_menu").hidden = kind !== "menu";
  element("practice_select").hidden = kind !== "practice_select";
  element("level_briefing").hidden = kind !== "briefing";
  element("gameplay").hidden = kind !== "gameplay" && kind !== "pause";
  element("result_panel").hidden = !["level_result", "game_over", "campaign_result"].includes(kind);
}

export function showBriefing(level: LevelConfig, practice: boolean): void {
  element("briefing_act").textContent =
    `Chapter ${level.chapter} / ${CHAPTER_NAMES[level.chapter]}${practice ? " / Practice" : ""}`;
  element("briefing_title").textContent = `Stage ${campaignPosition(level.id)}: ${level.name}`;
  element("briefing_objective").textContent = level.briefing;
  const position = campaignPosition(level.id);
  element("briefing_feel").textContent =
    position <= 3
      ? "Gentle warm-up / take your time"
      : position === 7 || position === 13 || position === 15 || position === 18
        ? "Fresh rhythm / settle into your new tool"
        : level.objective.kind === "maintenance"
          ? "Keep the rhythm / stay below the safe count"
          : "Find your opening / keep moving";
  const scene = element("briefing_scene");
  if (scene instanceof HTMLImageElement) scene.src = `assets/${level.scene}.svg`;
  element("briefing_weapon").textContent = TOOL_NAMES[level.weapon];
  element("briefing_tool_description").textContent = TOOL_DETAILS[level.weapon];
  element("briefing_caption").textContent =
    level.act === 1
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

export function updateHud(state: Readonly<SimulationState>): void {
  const { level } = state;
  element("hud_level").textContent =
    `Stage ${campaignPosition(level.id)}: ${level.name}${state.mode === "practice" ? " / Practice" : ""}`;
  element("hud_lives").textContent =
    `${"\u2665".repeat(state.player.lives)}${"\u2661".repeat(3 - state.player.lives)} ${state.player.lives} / 3`;
  element("hud_score").textContent = String(state.score).padStart(6, "0");
  element("hud_weapon").textContent = TOOL_NAMES[level.weapon];
  const objective = level.objective;
  element("hud_time_label").textContent =
    objective.kind === "maintenance" ? "Remaining" : "Elapsed";
  element("hud_time").textContent = clock(
    objective.kind === "maintenance" ? objective.duration - state.elapsed : state.elapsed,
  );
  element("hud_objective").textContent =
    objective.kind === "maintenance"
      ? `Active platelet hazards: ${state.targets.length} / ${objective.safeMaximum}`
      : level.act === 1
        ? `Plaque fragments: ${state.targets.length}`
        : `Hazards remaining: ${state.targets.length + objective.reinforcements.length - state.waves.spawned}`;
  const expired = objective.kind === "maintenance" && state.elapsed >= objective.duration;
  const countdown =
    state.overloadElapsed > 0
      ? `Reduce hazards: ${Math.max(0, OVERLOAD_DURATION - state.overloadElapsed).toFixed(1)} s`
      : "";
  element("hud_warning").textContent = expired
    ? `Time complete - reduce hazards to finish${countdown ? ` / ${countdown}` : ""}`
    : countdown || (state.waves.warning !== undefined ? "Incoming hazard" : "");
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
    : final || state.level.objective.kind === "maintenance"
      ? "Maintenance complete!"
      : state.level.act === 1
        ? "Plaque cleared!"
        : state.level.act === 2
          ? "Platelet activity controlled!"
          : "Maintenance complete!";
  element("result_summary").textContent =
    `Stage ${campaignPosition(state.level.id)}: ${state.level.name}. Points earned this level: ${(state.score - state.levelStartScore).toLocaleString()}. Total score: ${state.score.toLocaleString()}. Lives remaining: ${state.player.lives} / 3.${recordRank === undefined ? "" : ` High-score rank: ${recordRank} / 5.`}`;
  element("result_fact").textContent =
    state.level.fact ??
    getLevel(state.level.act === 1 ? 3 : state.level.act === 2 ? 6 : 11).fact ??
    "";
  button("continue_button").hidden = lost || final || state.mode === "practice";
  button("retry_button").hidden = !lost && !final && state.mode !== "practice";
  button("retry_button").textContent =
    state.mode === "practice" ? "Retry practice" : final ? "Play again" : "Retry campaign";
  element("result_title").focus();
}
