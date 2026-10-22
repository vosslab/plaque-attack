import { campaignPosition } from "./constants";
import { SURGEON_IDS, SURGEONS } from "./surgeons";
import { action, element } from "./ui";
import type { CampaignRecord, Settings } from "./types/save";
import type { SurgeonId } from "./types/surgeon";

export function createDialogs(onChange: (open: boolean) => void): {
  open: (
    title: string,
    fill: (body: HTMLElement, close: () => void, footer: HTMLElement) => void,
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
      body.className = "dialog_content";
      const footer = document.createElement("footer");
      footer.className = "dialog_actions";
      dialog.replaceChildren(heading, body, footer);
      dialog.setAttribute("aria-labelledby", heading.id);
      fill(body, close, footer);
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
  surgeonPanel(body, settings.surgeonId, (surgeonId): void => {
    settings.surgeonId = surgeonId;
    settings.surgeonChosen = true;
    changed();
  });
  paragraph(body, status);
}

/** Reused in Settings, pause, and the dedicated chooser so all roster controls stay equivalent. */
export function surgeonPanel(
  body: HTMLElement,
  selectedId: SurgeonId | null,
  selected: (surgeonId: SurgeonId) => void,
  showHeading = true,
): void {
  let activeId = selectedId;
  const heading = document.createElement("h3");
  heading.textContent = "Choose your surgeon";
  const intro = document.createElement("p");
  intro.className = "surgeon_roster_intro";
  intro.textContent =
    "Same abilities for every surgeon. Choose the teammate you want in the artery.";
  const roster = document.createElement("div");
  roster.className = "surgeon_roster";
  roster.setAttribute("role", "group");
  roster.setAttribute("aria-label", "Choose your surgeon");
  for (const id of SURGEON_IDS) {
    const surgeon = SURGEONS[id];
    const card = document.createElement("button");
    card.type = "button";
    card.className = "surgeon_card";
    card.setAttribute("aria-pressed", String(id === activeId));
    card.setAttribute("aria-label", `Choose ${surgeon.name}; same abilities`);
    const portrait = document.createElement("img");
    portrait.className = "surgeon_portrait";
    portrait.src = `assets/surgeon_${id}.svg`;
    portrait.alt = "";
    const name = document.createElement("strong");
    name.className = "surgeon_name";
    name.textContent = surgeon.name;
    const description = document.createElement("span");
    description.textContent = surgeon.description;
    card.append(portrait, name, description);
    card.addEventListener("click", (): void => {
      selected(id);
      if (id === activeId) return;
      activeId = id;
      for (const candidate of roster.querySelectorAll<HTMLButtonElement>(".surgeon_card"))
        candidate.setAttribute("aria-pressed", String(candidate === card));
    });
    roster.append(card);
  }
  if (showHeading) body.append(heading);
  body.append(intro, roster);
}

/** Use the common dialog footer so roster scrolling never hides Done. */
export function surgeonChooser(
  body: HTMLElement,
  selectedId: SurgeonId,
  selected: (surgeonId: SurgeonId) => void,
  close: () => void,
  footer: HTMLElement,
): void {
  body.classList.add("surgeon_chooser");
  surgeonPanel(body, selectedId, selected, false);
  const intro = body.querySelector(".surgeon_roster_intro");
  if (intro !== null)
    intro.textContent = "Six personalities. Same abilities. Pick your kind of teammate.";
  for (const [index, card] of body.querySelectorAll(".surgeon_card").entries()) {
    const description = card.querySelector(".surgeon_name + span");
    if (description === null) continue;
    description.id = `surgeon_personality_${index}`;
    card.setAttribute("aria-describedby", description.id);
  }
  footer.append(action("Done", close, true));
}

/** Opening campaign play requires an explicit roster-card activation before it can continue. */
export function firstSurgeonChooser(
  body: HTMLElement,
  selected: (surgeonId: SurgeonId) => void,
  continueToMenu: () => void,
  footer: HTMLElement,
): void {
  body.classList.add("surgeon_chooser");
  const start = action("Continue", continueToMenu, true);
  start.disabled = true;
  surgeonPanel(
    body,
    null,
    (surgeonId): void => {
      selected(surgeonId);
      start.disabled = false;
    },
    false,
  );
  const intro = body.querySelector(".surgeon_roster_intro");
  if (intro !== null)
    intro.textContent =
      "Choose the surgeon joining you for your first stage. Every surgeon has the same abilities.";
  footer.append(start);
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
