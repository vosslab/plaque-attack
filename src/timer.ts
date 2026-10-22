import { FIXED_STEP, MAX_FRAME_TIME } from "./constants";

export function createFixedLoop(
  step: (dt: number) => void,
  render: (alpha: number) => void,
): { start: () => void; stop: () => void } {
  let running = false;
  let frameId = 0;
  let previous: number | undefined;
  let accumulated = 0;
  const frame = (now: number): void => {
    if (!running) return;
    if (document.hidden) {
      previous = undefined;
      accumulated = 0;
    } else {
      const elapsed = previous === undefined ? 0 : Math.max(0, (now - previous) / 1000);
      previous = now;
      // A suspended/background frame is discarded, never replayed as delayed gameplay.
      accumulated += elapsed > MAX_FRAME_TIME ? 0 : Math.min(elapsed, MAX_FRAME_TIME);
      while (accumulated >= FIXED_STEP && running) {
        accumulated -= FIXED_STEP;
        step(FIXED_STEP);
      }
      if (running) render(accumulated / FIXED_STEP);
    }
    if (running) frameId = requestAnimationFrame(frame);
  };
  return {
    start: (): void => {
      if (running) return;
      running = true;
      previous = undefined;
      accumulated = 0;
      frameId = requestAnimationFrame(frame);
    },
    stop: (): void => {
      running = false;
      cancelAnimationFrame(frameId);
      previous = undefined;
      accumulated = 0;
    },
  };
}
