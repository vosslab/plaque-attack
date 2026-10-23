import type { ProjectileId } from "./brands";
import type { SimulationEvent } from "./types/events";
import type { Settings } from "./types/save";
import { streakMilestone } from "./scoring";

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
  let lastHitProjectile: ProjectileId | undefined;
  let consecutiveHits = 0;
  let lastShotProjectile: ProjectileId | undefined;
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
      if (!effects) {
        stopVoices(effectVoices);
        lastHitProjectile = undefined;
        consecutiveHits = 0;
        lastShotProjectile = undefined;
      }
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
            if (lastShotProjectile !== undefined && event.projectileId <= lastShotProjectile) {
              lastHitProjectile = undefined;
              consecutiveHits = 0;
            }
            lastShotProjectile = event.projectileId;
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
          case "target_hit": {
            consecutiveHits = event.projectileId === lastHitProjectile ? consecutiveHits + 1 : 1;
            lastHitProjectile = event.projectileId;
            const splitPitch = event.size === "large" ? 180 : event.size === "medium" ? 250 : 340;
            tone(
              event.split ? splitPitch : 620,
              0.12,
              0.04,
              now,
              effectVoices,
              "sine",
              event.split ? splitPitch * 2 : 880,
            );
            if (consecutiveHits > 1)
              tone(
                700 + Math.min(consecutiveHits, 5) * 120,
                0.18,
                0.025,
                now + 0.035,
                effectVoices,
                "triangle",
              );
            const milestone = streakMilestone(event.streak);
            if (milestone !== undefined) {
              const notes = milestone === 3 ? [659.25, 880, 1318.51] : [523.25, 659.25, 1046.5];
              for (const [index, note] of notes.entries())
                tone(note, 0.14, 0.025, now + 0.04 + index * 0.075, effectVoices, "triangle");
            }
            break;
          }
          case "damage":
            tone(170, 0.3, 0.05, now, effectVoices, "triangle", 75);
            break;
          case "tissue_eroded":
            tone(260, 0.11, 0.018, now, effectVoices, "triangle", 150);
            break;
          case "pocket_breached":
            tone(420, 0.22, 0.022, now, effectVoices, "sine", 600);
            break;
          case "pocket_released":
            tone(600, 0.18, 0.022, now, effectVoices, "sine", 320);
            break;
          case "flow_activated":
            tone(220, 0.34, 0.028, now, effectVoices, "sine", 660);
            tone(330, 0.25, 0.018, now + 0.08, effectVoices, "sine", 990);
            break;
          case "clearance_pulse":
            // A brief ascending chord belongs to the clearance event, even with no removals.
            tone(392, 0.22, 0.03, now, effectVoices, "triangle", 784);
            tone(587.33, 0.24, 0.022, now + 0.06, effectVoices, "sine", 1174.66);
            break;
          case "unstable_split":
            tone(210, 0.14, 0.025, now, effectVoices, "triangle", 420);
            break;
          case "support_released":
            tone(520, 0.16, 0.025, now, effectVoices, "triangle", 780);
            break;
          case "shield_collected":
            tone(659.25, 0.22, 0.025, now, effectVoices);
            tone(987.77, 0.3, 0.025, now + 0.09, effectVoices);
            break;
          case "shield_absorbed":
            tone(880, 0.19, 0.035, now, effectVoices, "triangle", 440);
            tone(660, 0.24, 0.02, now + 0.04, effectVoices, "sine", 330);
            break;
          case "finale_phase_started":
            tone(392, 0.18, 0.025, now, effectVoices);
            tone(523.25, 0.24, 0.025, now + 0.13, effectVoices);
            break;
          case "targets_merged":
            tone(180, 0.24, 0.025, now, effectVoices, "sine", 310);
            tone(270, 0.24, 0.012, now, effectVoices, "sine", 465);
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
