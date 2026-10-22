import type { SurgeonDefinition, SurgeonId } from "./types/surgeon";

export const DEFAULT_SURGEON_ID: SurgeonId = "maya";

/**
 * Cosmetic roster only. Physics, collision, movement and weapon cadence deliberately live
 * outside this table so every surgeon has exactly the same abilities.
 */
export const SURGEONS = {
  maya: {
    id: "maya",
    name: "Dr. Maya Chen",
    portraitAssetId: "surgeon-maya",
    description: "The calm anchor. A deep breath, then onward.",
  },
  jules: {
    id: "jules",
    name: "Dr. Jules Okafor",
    portraitAssetId: "surgeon-jules",
    description: "The quiet lookout. Always in your corner.",
  },
  imani: {
    id: "imani",
    name: "Dr. Imani Patel",
    portraitAssetId: "surgeon-imani",
    description: "The thoughtful planner. Every detail has a place.",
  },
  leo: {
    id: "leo",
    name: "Dr. Leo Rivera",
    portraitAssetId: "surgeon-leo",
    description: "The determined closer. Celebrates every little win.",
  },
  samira: {
    id: "samira",
    name: "Dr. Samira Haddad",
    portraitAssetId: "surgeon-samira",
    description: "The bold pathfinder. First to say, let's go.",
  },
  alex: {
    id: "alex",
    name: "Dr. Alex Morgan",
    portraitAssetId: "surgeon-alex",
    description: "The curious inventor. One more idea to try.",
  },
} as const satisfies Record<SurgeonId, SurgeonDefinition>;

export const SURGEON_IDS = [
  "maya",
  "jules",
  "imani",
  "leo",
  "samira",
  "alex",
] as const satisfies readonly SurgeonId[];

export function isSurgeonId(value: unknown): value is SurgeonId {
  return typeof value === "string" && SURGEON_IDS.some((id) => id === value);
}

export function getSurgeon(id: SurgeonId): SurgeonDefinition {
  return SURGEONS[id];
}
