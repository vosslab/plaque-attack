import type { AssetId, AssetImages } from "./types/runtime";

// Keep every required path in one checked manifest, including menu and briefing art.
export const ASSET_SOURCES = {
  surgeon: "assets/surgeon.svg",
  plaque: "assets/plaque.svg",
  platelet: "assets/platelet.svg",
  stent: "assets/stent.svg",
  aspirin: "assets/aspirin.svg",
  clopidogrel: "assets/clopidogrel.svg",
  artery: "assets/artery.svg",
  "scene-endothelium": "assets/scene-endothelium.svg",
  "scene-fatty-streak": "assets/scene-fatty-streak.svg",
  "scene-fibrous-cap": "assets/scene-fibrous-cap.svg",
  "scene-stented-lumen": "assets/scene-stented-lumen.svg",
  "scene-platelet-adhesion": "assets/scene-platelet-adhesion.svg",
  "scene-healed-flow": "assets/scene-healed-flow.svg",
  "lipid-amber": "assets/lipid-amber.svg",
  "lipid-pear": "assets/lipid-pear.svg",
  "lipid-ruffled": "assets/lipid-ruffled.svg",
  "lipid-lobed": "assets/lipid-lobed.svg",
  "lipid-dimpled": "assets/lipid-dimpled.svg",
  "lipid-swirl": "assets/lipid-swirl.svg",
} as const satisfies Readonly<Record<AssetId, string>>;

function loadImage(id: AssetId): Promise<HTMLImageElement> {
  return new Promise((resolve, reject): void => {
    const image = new Image();
    image.onload = (): void => resolve(image);
    image.onerror = (): void =>
      reject(new Error(`Could not load ${id} art. Check your connection and retry.`));
    image.src = ASSET_SOURCES[id];
  });
}

/** Preload required original vectors before enabling play. Paths support Pages subdirectories. */
export async function loadAssets(): Promise<AssetImages> {
  const ids = Object.keys(ASSET_SOURCES) as AssetId[];
  const entries = await Promise.all(
    ids.map(async (id): Promise<readonly [AssetId, HTMLImageElement]> => [id, await loadImage(id)]),
  );
  // Every manifest key resolves before publishing the complete record to the runtime.
  return Object.fromEntries(entries) as AssetImages;
}
