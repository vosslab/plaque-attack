# Remix rendering and audio handoff

Implementation follows the approved remix plan and the manager's `CORE_GATE_GREEN`.
Owned changes: `src/renderer.ts`, `src/audio.ts`, and `src/remix_rendering.ts`.
Existing SVG assets and manifest remain their asset owner's sources. Documentation owner records
changelog and settled decisions. No build was run during the concurrent implementation batch.

## Presentation ownership

The cohesive `createRemixRendering` helper consumes required `SimulationState.remix` and the
existing event union without casts or gameplay writes. The parent renderer owns its shared
simulation/celebration clock, effect reset on new attempt, and resource cleanup. Its source is
828 lines; the helper is 320 lines; audio is 260 lines.

- Switch images draw at 48 logical pixels. Solid ready rings say `READY / SHOOT`; active devices
  show actual remaining time, two dashed lane boundaries and inward arrows; shared cooldown uses
  a dashed ring and actual remaining time with `SHOTS PASS`. Every switch reads the same flow state.
- Optional support uses a capsule/shield icon and outlined shell separate from hazard pocket
  silhouettes. Released capsules draw at 26 logical pixels and descend using simulation position.
  Collection draws a static shield contour around the surgeon, while absorption has its own cue.
- Event feedback distinguishes carving, split size/children, current activation, capsule release,
  shield collection/absorption, actual phase names and consecutive hits from the same projectile.
  Small-region repeated carving labels coalesce and feedback capacity is bounded. Ordinary hazards
  receive no additional constant particles, rings or labels.
- Synthesized audio distinguishes split sizes, piercing multi-hit, current, support, collection,
  absorption and phase release. Existing music/effects defaults remain false. Playback still uses
  existing settings, unlock, pause/suspend and voice-limit boundaries. Muting clears hit associations.
- Restoration derives only from completed groups: phase index, an extra cleared group during the
  warned transition, and successful terminal state. `game_over` retains only already-earned progress.
  Opening reveals a jagged fissure widening into the healed lumen; restored flow extends a continuous
  stream beneath the installed stent; lining reveals a gathered column and floor-following smooth
  lining; final recovery reveals a widening fan and retains the existing surgeon/patient payoff.
  Each treatment clips the original editable `restored-flow` SVG plus Canvas consequences. Reduced
  motion keeps the earned shapes and all labels/arrows/static shield. Moving flow markers use
  simulation elapsed time and freeze with pause.

The existing visible last-pop effect, victory pose/camera, and runtime-owned 2.2-second celebration
are preserved. Optional aid and phase changes never clear or rebuild rendering state themselves.

## Verification

- `npx tsc --noEmit -p tsconfig.json`: exit 0 after final edits.
- `npx eslint src/renderer.ts src/audio.ts src/remix_rendering.ts`: exit 0.
- `npx prettier --check src/renderer.ts src/audio.ts src/remix_rendering.ts`: exit 0.
- `node --import tsx --test tests/test_streak_feedback.mjs tests/test_recovery.mjs`: 7 passed,
  0 failed. Existing renderer behavior assertions cover bounded labels, reduced-motion static
  placement, pause freeze, expiry and new-attempt clearing.
- Temporary `node --import tsx output/remix_renderer/probe.mjs`: passed. It checks zero initial
  restoration, earned transition/phase progress, no false completion on game over, successful
  terminal completion, same-projectile multi-hit label, zero-delta/static feedback, helper reset,
  and default-off/pause/mute audio with a fake AudioContext. This is focused presentation evidence,
  not actual browser or audio-device acceptance.

Shipping-render inspection, actual controls, device/label overlap at responsive sizes, all four
restoration state pairs, reduced-motion/pause/retry interactions and final audio-browser checks
remain the manager's stable-batch integration and independent-review gates. No M1/M2 visual or
full campaign acceptance is claimed by the focused checks above.

## Design references applied

Applied the local `game-design-expert` workflow and its task selection, project workflow, cases,
principles, art direction and testing references: communicate assistance before commitment,
connect effects to real consequences, preserve a readable hazard field, and distinguish probes
from actual-input proof. Applied `svg-creator-expert` task selection, project workflow and testing
references for existing SVG integration: preserve editable sources and viewBox proportions, layer
through the actual Canvas image boundary, pair color with rings/dashes/arrows/text, and reserve
actual integrated rendering as the visual acceptance oracle. No new SVG geometry was authored.
