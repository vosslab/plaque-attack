# Remix representative core handoff

Scope: display stages 5, 6, 8, 14 (stable IDs 4, 5, 17, 21). This is the M1 core
implementation; rendered browser acceptance and the remaining campaign are not complete.
The manager owns changelog, human guidance, and design-decision updates.

## Implemented ownership

- `src/remix_levels.ts` owns the four representative configuration overrides. Constants retain
  the original source data and expose those four overrides without changing the first three.
- `src/remix_mechanics.ts` owns current clocks, steering, switch geometry adapter, optional aid
  release/descent/collection, and shield absorption. Switch contact participates in the existing
  global earliest-contact solver in `weapons.ts`; earlier solids and compatible targets win.
- `src/game_state.ts` initializes required remix state in every mode and creates first-phase
  targets from the phase contract. `retryLevel` reconstructs the entry seed and score with three
  lives, one-second ready, and incremented run retry count; advance carries that count and
  captures the next entry seed.
- `src/waves.ts` owns finite phase transitions and clear gating. Hazard pending queues block
  progress; optional support does not. Tissue, current, shield and elapsed play persist.
- `src/simulation.ts` integrates current and support at the existing interaction boundaries.
  Only actual ordinary-contact damage suppresses duplicate overload damage; shield absorption
  therefore permits simultaneous overload damage.
- `tests/test_remix.mjs` protects seven stable behavior groups. No tuning thresholds are pinned.

Public consumer import lines:

```ts
import { retryLevel } from "./game_state";
import { FLOW_SWITCH_RADIUS, FLOW_ACTIVE_DURATION, FLOW_COOLDOWN_DURATION,
  FINALE_TRANSITION_DURATION } from "./remix_mechanics";
import type { RemixState, FlowState, RuntimeSupportPocket, FinaleState,
  StageRetryState } from "./types/simulation";
```

Renderer data: `state.remix.flow`, `state.remix.contactShield`,
`state.remix.supportPockets`, `state.remix.finale`; switches remain authored in
`state.level.flowSwitches`. Stage 6 has two finite phases, each preserving two original large
lipid spawns, then `artery_opening` restoration. Stage 5 support shell is x102..162/y414;
release x132/y436, descending at 42px/s and collecting only at player contact. Both current
switches are centered at x480/y300 with a 24px hit radius and central attraction lane.

## Verification

- `npx tsc --noEmit -p tsconfig.json`: exit 0, no diagnostics.
- `node --import tsx --test tests/test_remix.mjs tests/test_simulation.mjs
  tests/test_motion.mjs tests/test_arena.mjs`: 34 tests, 34 pass, 0 fail.
- `node --import tsx --test tests/test_*.mjs`: 58 tests, 58 pass, 0 fail. Node emitted its
  existing experimental localStorage warning because no localstorage-file was supplied.
- `npx eslint` on all changed owned TypeScript/MJS files: exit 0.
- `npx prettier --check` on all changed owned TypeScript/MJS files: exit 0.
- Largest owned source is `constants.ts`, 807 lines; other changed source files below 220.

Temporary controlled motion probe (not integrated gameplay and not a permanent tuning test):
over four seconds, stage 8 mean distance to the lane was 220.57px without current vs 9.41px
with current, with 2 vs 6 targets within 40px. Stage 14 was 212.72px vs 11.17px, again 2 vs 6.
Permanent tests separately verify carving/collection and shield contact/overload behavior.

## Open correction and acceptance

Review identified D3: current expiry retains reduced horizontal velocity. The manager requires
restoration of ordinary preset drift magnitude with preserved direction and deterministic
zero-velocity fallback. The fresh correction agent owns that change; this handoff deliberately
leaves it untouched to prevent overlapping edits. The current clock/steering test does not yet
cover post-expiry drift restoration.

Actual-control browser usefulness, visible shell/device readability, held-input retry clearing,
UI/renderer events, persistence integration, and M2 campaign expansion belong to their next
owners and gates. No claim of complete M1 or campaign acceptance is made here.
