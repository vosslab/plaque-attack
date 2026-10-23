import type { RuntimeState } from "./types/runtime";
import type { SimulationState } from "./types/simulation";

type AcceptanceSnapshot = {
  screen: RuntimeState["screen"]["kind"];
  dialog: RuntimeState["dialog"];
  simulation: SimulationState | undefined;
};

declare global {
  interface Window {
    __plaqueAcceptance?: () => AcceptanceSnapshot;
  }
}

/** Opt-in observation returns detached copies, including the simulation's Map and Set values. */
export function installAcceptanceHook(runtime: RuntimeState): void {
  if (!new URLSearchParams(window.location.search).has("acceptance")) return;
  window.__plaqueAcceptance = (): AcceptanceSnapshot => ({
    screen: runtime.screen.kind,
    dialog: runtime.dialog,
    simulation: runtime.simulation === undefined ? undefined : structuredClone(runtime.simulation),
  });
}
