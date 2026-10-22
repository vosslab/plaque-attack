import type { AssetId, AssetImages } from "./types/runtime";

function loadImage(id: AssetId): Promise<HTMLImageElement> {
  return new Promise((resolve, reject): void => {
    const image = new Image();
    image.onload = (): void => resolve(image);
    image.onerror = (): void =>
      reject(new Error(`Could not load ${id} art. Check your connection and retry.`));
    image.src = `assets/${id}.svg`;
  });
}

/** Preload required original vectors before enabling play. Paths support Pages subdirectories. */
export async function loadAssets(): Promise<AssetImages> {
  const [surgeon, plaque, platelet, stent, aspirin, clopidogrel, artery] = await Promise.all([
    loadImage("surgeon"),
    loadImage("plaque"),
    loadImage("platelet"),
    loadImage("stent"),
    loadImage("aspirin"),
    loadImage("clopidogrel"),
    loadImage("artery"),
  ]);
  return { surgeon, plaque, platelet, stent, aspirin, clopidogrel, artery };
}
