import { campaignPosition } from "./constants";
import { action, element } from "./ui";
import type { CampaignRecord, Settings } from "./types/save";

export function createDialogs(onChange: (open: boolean) => void): {
  open: (
    title: string,
    fill: (body: HTMLElement, close: () => void) => void,
    after?: () => void,
  ) => void;
  close: () => void;
  isOpen: () => boolean;
} {
  const node = element("game_dialog");
  if (!(node instanceof HTMLDialogElement)) throw new Error("Native game dialog is missing");
  const dialog = node;
  let returnFocus: HTMLElement | undefined;
  let afterClose: (() => void) | undefined;
  const close = (): void => {
    if (!dialog.open) return;
    dialog.close();
    onChange(false);
    const focus = returnFocus;
    const after = afterClose;
    returnFocus = undefined;
    afterClose = undefined;
    if (focus?.isConnected && focus.closest("[hidden]") === null)
      focus.focus({ preventScroll: true });
    after?.();
  };
  dialog.addEventListener("cancel", (event): void => {
    event.preventDefault();
    close();
  });
  return {
    isOpen: (): boolean => dialog.open,
    close,
    open: (title, fill, after): void => {
      if (dialog.open) return;
      returnFocus =
        document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      afterClose = after;
      const heading = document.createElement("h2");
      heading.id = "dialog_title";
      heading.textContent = title;
      const body = document.createElement("div");
      dialog.replaceChildren(heading, body);
      dialog.setAttribute("aria-labelledby", heading.id);
      fill(body, close);
      onChange(true);
      dialog.showModal();
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      dialog.scrollTop = 0;
    },
  };
}

export function paragraph(body: HTMLElement, text: string): void {
  const p = document.createElement("p");
  p.textContent = text;
  body.append(p);
}

export function medicine(body: HTMLElement): void {
  paragraph(
    body,
    "This game is an arcade metaphor. Real stents support narrowed arteries; they do not shatter plaque. Aspirin and clopidogrel reduce platelet activity and help prevent clot formation. They do not dissolve cholesterol plaque or an established clot.",
  );
  paragraph(
    body,
    "Plaque contains more than cholesterol. Long-term cardiovascular care can include lipid management, medicines, and lifestyle changes. Projectile speed, range, and timing are game balance choices, not comparisons of real treatment efficacy. The surgeon and artery are schematic, with no anatomical scale.",
  );
  const cards = document.createElement("div");
  cards.className = "medicine_cards";
  for (const [title, art, fact] of [
    [
      "Endothelium",
      "scene-endothelium",
      "The endothelium is the thin cell lining at the blood-facing surface of an artery.",
    ],
    [
      "Foam cells",
      "scene-fatty-streak",
      "Macrophages that accumulate lipids can become foam cells within the artery wall.",
    ],
    [
      "Fibrous cap",
      "scene-fibrous-cap",
      "A fibrous cap covers the lipid-rich core of many atherosclerotic plaques.",
    ],
    ["Stent", "stent", "A coronary stent is a mesh support that holds a narrowed artery open."],
    [
      "Platelets",
      "platelet",
      "Activated platelets help form clots; antiplatelet medicines reduce their activity.",
    ],
    [
      "Healing and care",
      "scene-healed-flow",
      "A stent supports blood flow, while ongoing care still addresses the underlying disease.",
    ],
  ] as const) {
    const card = document.createElement("article");
    const image = document.createElement("img");
    image.src = "assets/" + art + ".svg";
    image.alt = "";
    image.loading = "lazy";
    const heading = document.createElement("h3");
    heading.textContent = title;
    card.append(image, heading);
    paragraph(card, fact);
    cards.append(card);
  }
  body.append(cards);
  for (const [label, href] of [
    ["NHLBI: How plaque develops", "https://www.nhlbi.nih.gov/health/atherosclerosis/causes"],
    ["NCBI: Lipids and plaque biology", "https://www.ncbi.nlm.nih.gov/books/NBK343489/"],
    ["NHLBI: Stents", "https://www.nhlbi.nih.gov/health/stents"],
    ["NHLBI: Living with a stent", "https://www.nhlbi.nih.gov/health/stents/living-with"],
    [
      "AHA: Atherosclerosis",
      "https://www.heart.org/en/health-topics/cholesterol/about-cholesterol/atherosclerosis",
    ],
  ]) {
    const link = document.createElement("a");
    if (label === undefined || href === undefined) continue;
    link.textContent = label;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const p = document.createElement("p");
    p.append(link);
    body.append(p);
  }
}

export function settingsPanel(
  body: HTMLElement,
  settings: Settings,
  changed: () => void,
  status: string,
): void {
  for (const key of ["music", "effects"] as const) {
    const label = document.createElement("label");
    label.textContent = key === "music" ? "Music" : "Sound effects";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = settings[key];
    input.addEventListener("change", (): void => {
      settings[key] = input.checked;
      changed();
    });
    label.append(input);
    body.append(label);
  }
  body.append(
    action("Reset tutorial prompts", (): void => {
      settings.completedTutorials = [];
      changed();
      paragraph(body, "Tutorial prompts will appear on your next level-one attempt.");
    }),
  );
  paragraph(body, status);
}

export function scoresPanel(body: HTMLElement, records: readonly CampaignRecord[]): void {
  if (records.length === 0)
    paragraph(
      body,
      "No campaign records yet. Finish a campaign or reach the end of a run to set your first score.",
    );
  const list = document.createElement("ol");
  for (const record of records) {
    const item = document.createElement("li");
    item.textContent = `${record.score.toLocaleString()} points / ${record.campaign === "classic" ? "Classic 15" : "Expanded 24"} / Stage ${record.campaign === "classic" ? record.levelReached : campaignPosition(record.levelReached)} / ${record.outcome === "completed" ? "Completed" : "Run ended"} / ${new Date(record.date).toLocaleDateString()}`;
    list.append(item);
  }
  body.append(list);
  paragraph(body, "Top five campaigns on this device. Practice scores are unranked.");
}
