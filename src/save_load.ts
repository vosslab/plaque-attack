import { LEVEL_IDS } from "./constants";
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
    version: 1,
    settings: { music: false, effects: false, completedTutorials: [] },
    unlockedLevel: 1,
    records: [],
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

function record(value: unknown): CampaignRecord | undefined {
  if (
    !object(value) ||
    !Number.isSafeInteger(value.score) ||
    typeof value.score !== "number" ||
    value.score < 0 ||
    !level(value.levelReached) ||
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
    score: value.score,
    levelReached: value.levelReached,
    outcome: value.outcome,
    date: value.date,
  };
}

function rank(records: readonly CampaignRecord[]): CampaignRecord[] {
  return [...records]
    .sort(
      (a, b) =>
        b.score - a.score || b.levelReached - a.levelReached || a.date.localeCompare(b.date),
    )
    .slice(0, 5);
}

/** ASVS 1.5.2 / 2.2.1: allowlist every deserialized value and rebuild the known schema. */
export function validateSave(value: unknown): SaveFile | undefined {
  if (
    !object(value) ||
    value.version !== 1 ||
    !level(value.unlockedLevel) ||
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
    const parsed = record(entry);
    if (parsed === undefined) return undefined;
    records.push(parsed);
  }
  return {
    version: 1,
    unlockedLevel: value.unlockedLevel,
    settings: { music: settings.music, effects: settings.effects, completedTutorials },
    records: rank(records),
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
  if (object(value) && value.version !== undefined && value.version !== 1)
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
