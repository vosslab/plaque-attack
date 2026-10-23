import type { SimulationEvent } from "./events";
import type { LevelId, LipidVariant, SceneId } from "./level";
import type { DisplayPoint, LogicalPoint } from "./player";
import type { SaveFile, StorageStatus } from "./save";
import type { SimulationState } from "./simulation";
import type { SurgeonId } from "./surgeon";

export type AppScreen =
  | { kind: "menu" }
  | { kind: "practice_select" }
  | { kind: "briefing"; levelId: LevelId }
  | { kind: "gameplay" }
  | { kind: "celebration" }
  | { kind: "pause" }
  | { kind: "level_result" }
  | { kind: "game_over" }
  | { kind: "campaign_result" };
export type DialogKind =
  "instructions" | "settings" | "surgeon" | "scores" | "medicine" | "confirm_quit";
export type AssetId =
  | "surgeon"
  | `surgeon-${SurgeonId}`
  | `surgeon-${SurgeonId}-victory`
  | "plaque"
  | "platelet"
  | "stent"
  | "aspirin"
  | "clopidogrel"
  | "artery"
  | "flow-switch"
  | "support-capsule"
  | "restored-flow"
  | "cardiac-recovery"
  | SceneId
  | LipidVariant;
export type AssetImages = Readonly<Record<AssetId, HTMLImageElement>>;
export type AssetLoadState =
  { kind: "loading" } | { kind: "ready"; images: AssetImages } | { kind: "error"; message: string };

export type RuntimeState = {
  screen: AppScreen;
  dialog: DialogKind | undefined;
  simulation: SimulationState | undefined;
  save: SaveFile;
  storageStatus: StorageStatus;
  reducedMotion: boolean;
};

// Runtime owns this presentation clock, measured in seconds independently of simulation time.
export type CelebrationPresentation = {
  elapsed: number;
  duration: number;
};

// The renderer owns only visual resources and effects. It never mutates gameplay state.
export type ArenaRenderer = {
  render: (
    state: Readonly<SimulationState>,
    interpolation: number,
    surgeonId?: SurgeonId,
    celebration?: Readonly<CelebrationPresentation>,
  ) => void;
  consumeEvents: (events: readonly SimulationEvent[]) => void;
  resize: () => void;
  destroy: () => void;
};
export type ArenaTransform = {
  toLogical: (point: DisplayPoint) => LogicalPoint;
  toDisplay: (point: LogicalPoint) => DisplayPoint;
};
