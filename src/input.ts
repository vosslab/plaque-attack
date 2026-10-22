import type { InputController, InputState } from "./types/player";

/** The caller enables gameplay keys only while the arena is active. */
export function createInputController(
  arena: HTMLElement,
  onPause: () => void,
  touch: { left: HTMLElement; right: HTMLElement; fire: HTMLElement },
  isActive: () => boolean,
): InputController {
  const keys = new Set<string>();
  const pointers = { left: new Set<number>(), right: new Set<number>(), fire: new Set<number>() };
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const clear = (): void => {
    keys.clear();
    for (const held of Object.values(pointers)) held.clear();
  };
  const isControl = (target: EventTarget | null): boolean =>
    target instanceof Element &&
    target.closest(
      "button, input, textarea, select, a, dialog, [role='dialog'], [contenteditable='true']",
    ) !== null;
  const keydown = (event: KeyboardEvent): void => {
    if (isControl(event.target)) return;
    if (event.code === "Escape" || event.code === "KeyP") {
      if (!event.repeat) {
        event.preventDefault();
        onPause();
      }
      return;
    }
    if (!isActive()) return;
    if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD", "Space"].includes(event.code)) {
      event.preventDefault();
      keys.add(event.code);
    }
  };
  window.addEventListener("keydown", keydown, options);
  window.addEventListener("keyup", (event) => keys.delete(event.code), options);
  window.addEventListener("blur", clear, options);
  document.addEventListener("visibilitychange", clear, options);
  for (const action of ["left", "right", "fire"] as const) {
    const button = touch[action];
    button.addEventListener(
      "pointerdown",
      (event) => {
        if (!isActive()) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        pointers[action].add(event.pointerId);
        arena.focus({ preventScroll: true });
      },
      options,
    );
    const release = (event: PointerEvent): void => {
      pointers[action].delete(event.pointerId);
    };
    button.addEventListener("pointerup", release, options);
    button.addEventListener("pointercancel", release, options);
    button.addEventListener("lostpointercapture", release, options);
  }
  const read = (): InputState => {
    if (!isActive()) {
      clear();
      return { left: false, right: false, fire: false };
    }
    return {
      left: keys.has("ArrowLeft") || keys.has("KeyA") || pointers.left.size > 0,
      right: keys.has("ArrowRight") || keys.has("KeyD") || pointers.right.size > 0,
      fire: keys.has("Space") || pointers.fire.size > 0,
    };
  };
  return {
    read,
    clear,
    destroy: (): void => {
      clear();
      listeners.abort();
    },
  };
}
