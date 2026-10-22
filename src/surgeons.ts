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
    description: "Conducts a choir. Always sneaks in one more encore.",
  },
  jules: {
    id: "jules",
    name: "Dr. Jules Okafor",
    portraitAssetId: "surgeon-jules",
    description: "Ballroom competitor. Counts the beat under their breath.",
  },
  imani: {
    id: "imani",
    name: "Dr. Imani Patel",
    portraitAssetId: "surgeon-imani",
    description: "Stargazer. Gives every telescope a name.",
  },
  leo: {
    id: "leo",
    name: "Dr. Leo Rivera",
    portraitAssetId: "surgeon-leo",
    description: "Repairs old radios. Listens for faraway stations.",
  },
  samira: {
    id: "samira",
    name: "Dr. Samira Haddad",
    portraitAssetId: "surgeon-samira",
    description: "Collects antique tools. Ask about the suspicious forceps.",
  },
  alex: {
    id: "alex",
    name: "Dr. Alex Morgan",
    portraitAssetId: "surgeon-alex",
    description: "Balcony gardener. Their prize tomato is named Gerald.",
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
