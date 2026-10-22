import type { LevelId } from "./level";

export type TutorialPrompt = "move" | "fire" | "split";
export type Settings = {
  music: boolean;
  effects: boolean;
  completedTutorials: TutorialPrompt[];
};
export type CampaignRecord = {
  score: number;
  levelReached: LevelId;
  outcome: "completed" | "ended";
  // ISO 8601 date generated at record commit, never used for simulation timing.
  date: string;
};
export type SaveFileV1 = {
  version: 1;
  settings: Settings;
  unlockedLevel: LevelId;
  records: CampaignRecord[];
};
export type SaveFile = SaveFileV1;
export type StorageStatus = "available" | "unavailable" | "malformed" | "unsupported";
export type SaveLoadResult = { save: SaveFile; status: StorageStatus };
// Validation consumes unknown; unsupported data must remain intact.
export type SaveValidator = (value: unknown) => SaveFile | undefined;
