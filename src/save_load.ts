import { campaignPosition, LEVEL_IDS } from "./constants";
import { DEFAULT_SURGEON_ID, isSurgeonId } from "./surgeons";
import type { LevelId } from "./types/level";
import type {
  CampaignRecord,
  SaveFile,
  SaveLoadResult,
  StorageStatus,
  TutorialPrompt,
} from "./types/save";

export const SAVE_KEY = "plaque_trouble_save";
const MAX_SAVE_LENGTH = 8192;

export function defaultSave(): SaveFile {
  return {
    version: 3,
    settings: {
      music: false,
      effects: false,
      completedTutorials: [],
      surgeonId: DEFAULT_SURGEON_ID,
    },
    unlockedLevel: 1,
    records: [],
    completedLevelIds: [],
  };
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function level(value: unknown): value is LevelId {
  return LEVEL_IDS.some((id) => id === value);
}

function tutorial(value: unknown): value is TutorialPrompt {
  return value === "move" || value === "fire" || value === "split";
}

function legacyLevel(value: unknown): value is LevelId {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 15;
}

function record(value: unknown, legacy = false): CampaignRecord | undefined {
  if (
    !object(value) ||
    !Number.isSafeInteger(value.score) ||
    typeof value.score !== "number" ||
    value.score < 0 ||
    !level(value.levelReached) ||
    (legacy && !legacyLevel(value.levelReached)) ||
    (!legacy && value.campaign !== "classic" && value.campaign !== "expanded") ||
    (!legacy && value.campaign === "classic" && !legacyLevel(value.levelReached)) ||
    (value.outcome !== "completed" && value.outcome !== "ended") ||
    (value.outcome === "completed" && value.levelReached !== 15) ||
    typeof value.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.date)
  )
    return undefined;
  const timestamp = Date.parse(value.date);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== value.date)
    return undefined;
  return {
    campaign: legacy ? "classic" : value.campaign === "classic" ? "classic" : "expanded",
    score: value.score,
    levelReached: value.levelReached,
    outcome: value.outcome,
    date: value.date,
  };
}

function recordPosition(record: CampaignRecord): number {
  return record.campaign === "classic"
    ? record.levelReached
    : campaignPosition(record.levelReached);
}

function canonicalPrefix(before: LevelId, classicOnly: boolean): LevelId[] {
  const position = LEVEL_IDS.indexOf(before);
  if (position < 0) return [];
  return LEVEL_IDS.slice(0, position).filter((id) => !classicOnly || id <= 15);
}

function completedIds(entries: readonly LevelId[]): LevelId[] {
  return LEVEL_IDS.filter((id) => entries.includes(id));
}

function v1CompletedIds(unlockedLevel: LevelId, records: readonly CampaignRecord[]): LevelId[] {
  const completeClassic = records.some(
    (entry) => entry.campaign === "classic" && entry.outcome === "completed",
  );
  if (completeClassic) return LEVEL_IDS.filter((id) => id <= 15);
  // V1 predates the expanded order, so its numeric unlock is a classic ordinal.
  return LEVEL_IDS.filter((id) => id < unlockedLevel && id <= 15);
}

function v2CompletedIds(unlockedLevel: LevelId, records: readonly CampaignRecord[]): LevelId[] {
  const inferred = new Set<LevelId>(canonicalPrefix(unlockedLevel, true));
  for (const entry of records) {
    if (entry.campaign === "classic" && entry.outcome === "completed") {
      for (const id of LEVEL_IDS) if (id <= 15) inferred.add(id);
      continue;
    }
    if (entry.campaign !== "expanded") continue;
    if (entry.outcome === "completed") return [...LEVEL_IDS];
    // An expanded record proves the stages before its reached stage, while the
    // V2 unlock alone is deliberately limited to classic IDs due to ambiguity.
    for (const id of canonicalPrefix(entry.levelReached, false)) inferred.add(id);
  }
  return completedIds([...inferred]);
}

function rank(records: readonly CampaignRecord[]): CampaignRecord[] {
  return [...records]
    .sort(
      (a, b) =>
        b.score - a.score || recordPosition(b) - recordPosition(a) || a.date.localeCompare(b.date),
    )
    .slice(0, 5);
}

/** ASVS 1.5.2 / 2.2.1: allowlist every deserialized value and rebuild the known schema. */
export function validateSave(value: unknown): SaveFile | undefined {
  if (
    !object(value) ||
    (value.version !== 1 && value.version !== 2 && value.version !== 3) ||
    !level(value.unlockedLevel) ||
    (value.version === 1 && !legacyLevel(value.unlockedLevel)) ||
    !object(value.settings) ||
    !Array.isArray(value.records) ||
    value.records.length > 5
  )
    return undefined;
  const settings = value.settings;
  if (
    typeof settings.music !== "boolean" ||
    typeof settings.effects !== "boolean" ||
    !Array.isArray(settings.completedTutorials) ||
    settings.completedTutorials.length > 3
  )
    return undefined;
  const completedTutorials: TutorialPrompt[] = [];
  for (const entry of settings.completedTutorials) {
    if (!tutorial(entry) || completedTutorials.includes(entry)) return undefined;
    completedTutorials.push(entry);
  }
  const records: CampaignRecord[] = [];
  for (const entry of value.records) {
    const parsed = record(entry, value.version === 1);
    if (parsed === undefined) return undefined;
    records.push(parsed);
  }
  let restored: LevelId[];
  if (value.version === 3) {
    if (
      !Array.isArray(value.completedLevelIds) ||
      value.completedLevelIds.length > LEVEL_IDS.length
    )
      return undefined;
    const values: LevelId[] = [];
    for (const entry of value.completedLevelIds) {
      if (!level(entry) || values.includes(entry)) return undefined;
      values.push(entry);
    }
    restored = completedIds(values);
  } else if (value.version === 1) {
    restored = v1CompletedIds(value.unlockedLevel, records);
  } else {
    restored = v2CompletedIds(value.unlockedLevel, records);
  }
  return {
    version: 3,
    unlockedLevel: value.unlockedLevel,
    // A cosmetic choice must never discard earned progress. Older and tampered values simply
    // fall back to the default roster member while the rest of the save remains usable.
    settings: {
      music: settings.music,
      effects: settings.effects,
      completedTutorials,
      surgeonId: isSurgeonId(settings.surgeonId) ? settings.surgeonId : DEFAULT_SURGEON_ID,
    },
    records: rank(records),
    completedLevelIds: restored,
  };
}

export function loadSave(): SaveLoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return { save: defaultSave(), status: "unavailable" };
  }
  if (raw === null) return { save: defaultSave(), status: "available" };
  if (raw.length > MAX_SAVE_LENGTH) return { save: defaultSave(), status: "malformed" };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { save: defaultSave(), status: "malformed" };
  }
  if (
    object(value) &&
    value.version !== undefined &&
    value.version !== 1 &&
    value.version !== 2 &&
    value.version !== 3
  )
    return { save: defaultSave(), status: "unsupported" };
  const save = validateSave(value);
  return save === undefined
    ? { save: defaultSave(), status: "malformed" }
    : { save, status: "available" };
}

export function saveSave(save: SaveFile, status: StorageStatus): StorageStatus {
  if (status !== "available") return status;
  const validated = validateSave(save);
  if (validated === undefined) return "malformed";
  // ASVS 14.3.3: store only game settings, unlocks, scores and dates; no identity or clinical data.
  const serialized = JSON.stringify(validated);
  try {
    localStorage.setItem(SAVE_KEY, serialized);
  } catch {
    return "unavailable";
  }
  return "available";
}

export function addRecord(save: SaveFile, entry: CampaignRecord): SaveFile {
  const validated = record(entry);
  if (validated === undefined) return save;
  return { ...save, records: rank([...save.records, validated]) };
}

/** Records a real campaign clear. Practice and failed runs never call this boundary. */
export function markLevelCompleted(save: SaveFile, levelId: LevelId): SaveFile {
  if (save.completedLevelIds.includes(levelId)) return save;
  return { ...save, completedLevelIds: completedIds([...save.completedLevelIds, levelId]) };
}

export function storageMessage(status: StorageStatus): string {
  switch (status) {
    case "available":
      return "Progress and settings save on this device.";
    case "unsupported":
      return "This device has a newer save format. Progress cannot be saved; existing data is preserved.";
    case "malformed":
      return "Saved data could not be read. Progress cannot be saved; existing data is preserved.";
    case "unavailable":
      return "Browser storage is unavailable. You can play, but progress cannot be saved.";
  }
}
