import type { SurgeonId } from "./types/surgeon";

type MotionProfile = {
  idleRate: number;
  idleAngle: number;
  idleAccent: number;
  lift: number;
  liftDuration: number;
  tilt: number;
  celebrationRate: number;
};

// Cosmetic rhythms follow personal interests: conducting, ballroom counting,
// stargazing, radio listening, storytelling and a gardener's pleased nod.
// The renderer pivots at the leg seam; these never change movement or firing.
const MOTION: Readonly<Record<SurgeonId, MotionProfile>> = {
  maya: {
    idleRate: 2.4,
    idleAngle: 0.016,
    idleAccent: 0.25,
    lift: 8,
    liftDuration: 0.52,
    tilt: 0.018,
    celebrationRate: 6,
  },
  jules: {
    idleRate: 1.8,
    idleAngle: 0.022,
    idleAccent: 0,
    lift: 5,
    liftDuration: 0.66,
    tilt: -0.025,
    celebrationRate: 4,
  },
  imani: {
    idleRate: 0.9,
    idleAngle: 0.014,
    idleAccent: 0.1,
    lift: 7,
    liftDuration: 0.44,
    tilt: 0.02,
    celebrationRate: 9,
  },
  leo: {
    idleRate: 1.3,
    idleAngle: 0.024,
    idleAccent: 0.3,
    lift: 5,
    liftDuration: 0.38,
    tilt: -0.018,
    celebrationRate: 7,
  },
  samira: {
    idleRate: 1.5,
    idleAngle: -0.027,
    idleAccent: 0.15,
    lift: 9,
    liftDuration: 0.56,
    tilt: -0.04,
    celebrationRate: 5,
  },
  alex: {
    idleRate: 2.1,
    idleAngle: 0.018,
    idleAccent: 0.15,
    lift: 11,
    liftDuration: 0.46,
    tilt: 0.035,
    celebrationRate: 12,
  },
};

export function idleBodyAngle(id: SurgeonId, elapsed: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  const profile = MOTION[id];
  const phase = elapsed * profile.idleRate;
  return profile.idleAngle * (Math.sin(phase) + profile.idleAccent * Math.sin(phase * 2));
}

export function celebrationMotion(
  id: SurgeonId,
  elapsed: number,
  reducedMotion: boolean,
): Readonly<{ hop: number; tilt: number }> {
  if (reducedMotion) return { hop: 0, tilt: 0 };
  const profile = MOTION[id];
  const progress = Math.max(0, elapsed);
  const hop = Math.sin(Math.min(1, progress / profile.liftDuration) * Math.PI) * profile.lift;
  const settle = Math.max(0, 1 - progress / 0.9);
  const tilt = Math.sin(progress * profile.celebrationRate) * profile.tilt * settle;
  return { hop, tilt };
}
