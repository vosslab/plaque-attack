import type { LevelId } from "./level";
import type { SurgeonId } from "./surgeon";

export type TutorialPrompt = "move" | "fire" | "split";
export type Settings = {
  music: boolean;
  effects: boolean;
  completedTutorials: TutorialPrompt[];
  // Presentation-only. It never changes simulation state, scores, or difficulty.
  surgeonId: SurgeonId;
  // A default portrait is an initial display value, not evidence of a player choice.
  surgeonChosen: boolean;
};
export type LegacyCampaignRecord = {
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
  records: LegacyCampaignRecord[];
};
export type CampaignRecord = LegacyCampaignRecord & { campaign: "classic" | "expanded" };
export type SaveFileV2 = {
  version: 2;
  settings: Settings;
  unlockedLevel: LevelId;
  records: CampaignRecord[];
};
/**
 * V3 makes recovery a first-class progression fact.  Stable level IDs are
 * stored rather than ordinals because campaign order deliberately differs
 * from numeric IDs.
 */
export type SaveFileV3 = {
  version: 3;
  settings: Settings;
  unlockedLevel: LevelId;
  records: CampaignRecord[];
  completedLevelIds: LevelId[];
};
export type SaveFile = SaveFileV3;
export type StorageStatus = "available" | "unavailable" | "malformed" | "unsupported";
export type SaveLoadResult = { save: SaveFile; status: StorageStatus };
// Validation consumes unknown; unsupported data must remain intact.
export type SaveValidator = (value: unknown) => SaveFile | undefined;
