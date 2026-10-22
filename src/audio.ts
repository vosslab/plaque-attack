import type { SimulationEvent } from "./types/events";
import type { Settings } from "./types/save";

/** Original synthesized sounds; constructing the controller never requests audio playback. */
export function createAudio(): {
  unlock: () => void;
  setSettings: (settings: Settings) => void;
  consumeEvents: (events: readonly SimulationEvent[]) => void;
  setPaused: (paused: boolean, allowResultEffects?: boolean) => void;
  destroy: () => void;
} {
  let context: AudioContext | undefined;
  let music = false;
  let effects = false;
  let paused = true;
  let destroyed = false;
  let nextBeat = 0;
  let beat = 0;
  let musicTimer: ReturnType<typeof setInterval> | undefined;
  const musicVoices = new Set<OscillatorNode>();
  const effectVoices = new Set<OscillatorNode>();
  // A sparse original eight-bar pentatonic motif, with a quiet bass on downbeats.
  const melody = [
    329.63, 0, 392, 440, 0, 392, 293.66, 0, 261.63, 0, 329.63, 392, 0, 293.66, 261.63, 0,
  ];
  const bass = [130.81, 110, 98, 130.81];
  const tone = (
    frequency: number,
    duration: number,
    volume: number,
    at: number,
    voices: Set<OscillatorNode>,
    type: OscillatorType = "sine",
    endFrequency: number = frequency,
  ): void => {
    if (context === undefined || context.state !== "running" || voices.size >= 32) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    voices.add(oscillator);
    oscillator.onended = (): void => {
      voices.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
  };
  const stopVoices = (voices: Set<OscillatorNode>): void => {
    for (const voice of voices) voice.stop();
    voices.clear();
  };
  const stopMusic = (): void => {
    if (musicTimer !== undefined) clearInterval(musicTimer);
    musicTimer = undefined;
    stopVoices(musicVoices);
  };
  const schedule = (): void => {
    if (context === undefined || context.state !== "running" || paused || !music) return;
    if (nextBeat < context.currentTime) nextBeat = context.currentTime;
    while (nextBeat < context.currentTime + 0.2) {
      const note = melody[beat % melody.length];
      if (note !== undefined && note > 0) tone(note, 0.28, 0.018, nextBeat, musicVoices);
      const low = bass[Math.floor(beat / 4) % bass.length];
      if (beat % 4 === 0 && low !== undefined) tone(low, 0.65, 0.022, nextBeat, musicVoices);
      beat += 1;
      nextBeat += 0.375;
    }
  };
  const syncMusic = (): void => {
    if (destroyed || paused || !music || context?.state !== "running") {
      stopMusic();
      return;
    }
    if (musicTimer !== undefined) return;
    nextBeat = context.currentTime;
    schedule();
    musicTimer = setInterval(schedule, 100);
  };
  const resume = (): void => {
    if (context === undefined || destroyed || paused) return;
    // A browser may deny audio activation; gameplay remains independent of playback.
    void context
      .resume()
      .then(syncMusic)
      .catch((): void => {
        stopMusic();
      });
  };
  return {
    unlock: (): void => {
      if (destroyed) return;
      if (context === undefined) {
        if (typeof AudioContext === "undefined") return;
        try {
          context = new AudioContext();
        } catch {
          return;
        }
      }
      resume();
    },
    setSettings: (settings: Settings): void => {
      music = settings.music;
      effects = settings.effects;
      if (!effects) stopVoices(effectVoices);
      syncMusic();
    },
    consumeEvents: (events: readonly SimulationEvent[]): void => {
      if (destroyed || paused || !effects || context?.state !== "running") return;
      const now = context.currentTime;
      const completedRun = events.some(
        (event) => event.type === "run_end" && event.outcome === "completed",
      );
      for (const event of events) {
        switch (event.type) {
          case "shot":
            tone(
              event.kind === "stent" ? 460 : event.kind === "aspirin" ? 680 : 340,
              0.09,
              0.035,
              now,
              effectVoices,
              "triangle",
              210,
            );
            break;
          case "target_hit":
            tone(
              event.split ? 220 : 620,
              0.12,
              0.04,
              now,
              effectVoices,
              "sine",
              event.split ? 440 : 880,
            );
            break;
          case "damage":
            tone(170, 0.3, 0.05, now, effectVoices, "triangle", 75);
            break;
          case "level_complete":
            if (completedRun) break;
            for (const [index, note] of [523.25, 659.25, 783.99].entries())
              tone(note, 0.23, 0.035, now + index * 0.13, effectVoices);
            break;
          case "overload":
            if (event.active) tone(196, 0.24, 0.035, now, effectVoices, "triangle");
            break;
          case "run_end":
            if (event.outcome === "ended")
              tone(220, 0.5, 0.035, now, effectVoices, "triangle", 110);
            else {
              for (const [index, note] of [523.25, 659.25, 783.99, 1046.5].entries())
                tone(note, 0.32, 0.035, now + index * 0.15, effectVoices);
              for (const note of [523.25, 659.25, 783.99, 1046.5])
                tone(note, 0.65, 0.025, now + 0.65, effectVoices);
            }
            break;
          case "spawn":
          case "survival_points":
            break;
        }
      }
    },
    setPaused: (value: boolean, allowResultEffects = false): void => {
      paused = value;
      if (paused) {
        stopMusic();
        if (!allowResultEffects || !effects) stopVoices(effectVoices);
        if ((!allowResultEffects || !effects) && context?.state === "running")
          void context.suspend().catch((): void => {
            /* Audio denial does not affect play. */
          });
      } else resume();
    },
    destroy: (): void => {
      destroyed = true;
      stopMusic();
      stopVoices(effectVoices);
      if (context !== undefined && context.state !== "closed")
        void context.close().catch((): void => {
          /* Context may already be closed by the browser. */
        });
    },
  };
}
