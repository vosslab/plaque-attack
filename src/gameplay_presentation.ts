/** Upgrade the existing rotation hint; the complete arena always keeps its proportions. */
export function installGameplayPresentation(): void {
  const hint = document.querySelector<HTMLElement>(".orientation_hint");
  if (hint === null) return;
  const message = document.createElement("span");
  message.textContent = "Turn your phone sideways for a larger arena.";
  message.setAttribute("role", "status");
  hint.replaceChildren(message);
  if (!document.fullscreenEnabled) return;

  const expand = document.createElement("button");
  expand.type = "button";
  expand.className = "quiet_button arena_expand";
  expand.textContent = "Larger arena";
  hint.prepend(expand);
  const refresh = (): void => {
    expand.textContent = document.fullscreenElement === null ? "Larger arena" : "Exit fullscreen";
  };
  document.addEventListener("fullscreenchange", refresh);
  async function expandArena(): Promise<void> {
    expand.disabled = true;
    try {
      if (document.fullscreenElement !== null) {
        try {
          await document.exitFullscreen();
          message.textContent = "Turn your phone sideways for a larger arena.";
        } catch {
          message.textContent = "Use your browser to exit fullscreen.";
        }
        return;
      }
      // ASVS 16.5.1: browser permission failures use an actionable message, never raw errors.
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        message.textContent =
          "Fullscreen unavailable. Turn your phone sideways for a larger arena.";
        return;
      }
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: "landscape") => Promise<void>;
      };
      if (orientation?.lock !== undefined) {
        try {
          await orientation.lock("landscape");
        } catch {
          // Some browsers allow fullscreen but require the player to rotate the device.
        }
      }
      message.textContent =
        "Turn your phone sideways if needed. Use your browser to exit fullscreen.";
    } finally {
      expand.disabled = false;
      refresh();
    }
  }
  expand.addEventListener("click", () => {
    void expandArena();
  });
}
