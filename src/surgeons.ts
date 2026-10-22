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
    description: "A calm hand in cobalt scrubs with coral accents.",
  },
  jules: {
    id: "jules",
    name: "Dr. Jules Okafor",
    portraitAssetId: "surgeon-jules",
    description: "A steady specialist with violet scrubs.",
  },
  imani: {
    id: "imani",
    name: "Dr. Imani Patel",
    portraitAssetId: "surgeon-imani",
    description: "A precise operator in a berry headscarf and deep teal scrubs.",
  },
  leo: {
    id: "leo",
    name: "Dr. Leo Rivera",
    portraitAssetId: "surgeon-leo",
    description: "A focused clinician in bright blue scrubs and a neat beard.",
  },
  samira: {
    id: "samira",
    name: "Dr. Samira Haddad",
    portraitAssetId: "surgeon-samira",
    description: "A confident surgeon in plum scrubs with rose accents.",
  },
  alex: {
    id: "alex",
    name: "Dr. Alex Morgan",
    portraitAssetId: "surgeon-alex",
    description: "A quick thinker in forest green scrubs and round glasses.",
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
