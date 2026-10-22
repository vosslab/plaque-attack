import type { SimulationEvent } from "./events";
import type { LevelId } from "./level";
import type { DisplayPoint, LogicalPoint } from "./player";
import type { SaveFile, StorageStatus } from "./save";
import type { SimulationState } from "./simulation";

export type AppScreen =
  | { kind: "menu" }
  | { kind: "practice_select" }
  | { kind: "briefing"; levelId: LevelId }
  | { kind: "gameplay" }
  | { kind: "pause" }
  | { kind: "level_result" }
  | { kind: "game_over" }
  | { kind: "campaign_result" };
export type DialogKind = "instructions" | "settings" | "scores" | "medicine" | "confirm_quit";
export type AssetId =
  "surgeon" | "plaque" | "platelet" | "stent" | "aspirin" | "clopidogrel" | "artery";
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

// The renderer owns only visual resources and effects. It never mutates gameplay state.
export type ArenaRenderer = {
  render: (state: Readonly<SimulationState>, interpolation: number) => void;
  consumeEvents: (events: readonly SimulationEvent[]) => void;
  resize: () => void;
  destroy: () => void;
};
export type ArenaTransform = {
  toLogical: (point: DisplayPoint) => LogicalPoint;
  toDisplay: (point: LogicalPoint) => DisplayPoint;
};
