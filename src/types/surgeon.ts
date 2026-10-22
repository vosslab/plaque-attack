/** Stable cosmetic identity used by presentation and the local settings save only. */
export type SurgeonId = "maya" | "jules" | "imani" | "leo" | "samira" | "alex";

export type SurgeonDefinition = {
  readonly id: SurgeonId;
  readonly name: string;
  readonly portraitAssetId: `surgeon-${SurgeonId}`;
  readonly description: string;
};
