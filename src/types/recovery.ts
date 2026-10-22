import type { LevelId } from "./level";

/**
 * Presentation inputs for the recovery map. Save and progression ownership stay
 * with the application: this view never writes progress or infers a completion.
 */
export type RecoveryMapOptions = {
  readonly completedLevelIds: readonly LevelId[];
  readonly unlockedLevel: LevelId;
  readonly selectedLevelId?: LevelId;
  readonly newlyCompletedLevelId?: LevelId;
  readonly presentation?: "result";
  readonly onStageSelected: (levelId: LevelId) => void;
};
