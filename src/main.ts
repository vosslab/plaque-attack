import { getLevel } from "./constants";

function main(): void {
  const start = document.querySelector("#play_campaign");
  const back = document.querySelector("#back_menu");
  const menu = document.querySelector("#main_menu");
  const briefing = document.querySelector("#level_briefing");
  const title = document.querySelector("#briefing_title");
  const objective = document.querySelector("#briefing_objective");
  if (
    !(start instanceof HTMLButtonElement) ||
    !(back instanceof HTMLButtonElement) ||
    !(menu instanceof HTMLElement) ||
    !(briefing instanceof HTMLElement) ||
    !(title instanceof HTMLElement) ||
    !(objective instanceof HTMLElement)
  ) {
    throw new Error("The Plaque Trouble launch shell is incomplete");
  }
  start.addEventListener("click", (): void => {
    const level = getLevel(1);
    title.textContent = `Level ${level.id}: ${level.name}`;
    objective.textContent = level.briefing;
    menu.hidden = true;
    briefing.hidden = false;
    title.focus();
  });
  back.addEventListener("click", (): void => {
    briefing.hidden = true;
    menu.hidden = false;
    start.focus();
  });
}

main();
