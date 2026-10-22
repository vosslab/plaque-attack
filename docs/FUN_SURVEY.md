# Fun ideas from neighboring games

## Scope and evidence

The request is to survey games in `~/nsh/TYPESCRIPT` for more fun ideas: "the more fun the
game, the happier I will be!" This survey inspects source in eleven neighboring repositories.
It does not run or playtest those games. The observations below describe implemented mechanics;
their expected appeal and suitability for Plaque Attack are design hypotheses.

Neighboring paths are source pointers, written relative to each named repository. Borrow the
interaction principle and author original code, artwork, sounds, and cardiovascular copy.

## Source observations

| Repository | Source evidence | Observed mechanic | Plaque Attack fit |
| --- | --- | --- | --- |
| `ms-taq-man` | `src/game/arcade_rewards.ts`: `synthesisReward`, `advanceRewards`; `src/game/game_state.ts`; `src/game/bonus.ts`: `advanceBonus` | A three-second synthesis chain announces each eighth hit; timed speed and shield boosts expire. | Strong inspiration for readable earned momentum. Keep our damage-reset streak instead of importing a timeout. |
| `super-bowling` | `src/app/roll_celebration.ts`: `roll_celebration`; `src/audio/audio.ts`: `result_motifs`; `src/render/impact_accent.ts`: `select_impact_accent` | Authoritative STRIKE/SPARE results choose a celebration hierarchy, sound motif, and limited impact accents. | Strong: prioritize a few meaningful events and bound effects so targets remain readable. |
| `nobel-combat` | `src/match.ts`: `gainMeter`, `specialTierForMeter`, `Match.step` | Earned meter funds abilities at tiers costing 100, 200, or 300. | Promising future agency: one shared charged ability, with no surgeon-specific advantage. Requires balance work. |
| `steroid-quest-into-the-nucleus` | `src/journey_presentation.ts`: `actionText`, `currentAction`; `src/simulation.ts`: `advanceEncounter`, `restoreCheckpoint` | Current-action guidance follows encounter state; checkpoints restore an encounter. | Adapt brief contextual cues and recovery clarity. Plaque Attack already offers retry and practice. |
| `glycolysis-race-to-pyruvate` | `src/game/state.ts`: `extensionError`, `playMeld`, `drawCard`; `src/game/rules.ts`: `validateMeld`; `src/ui/render.ts`: `renderPlayer` | Validated card sequences and private local-player handoffs make turns understandable. | Low direct fit: turn handoffs interrupt continuous arcade movement. Clear failure explanations remain useful. |
| `stem-lesson-quiz-game` | `src/feedback.ts`: `streak_banner_for`; `src/scoring.ts`: `apply_correct`; `src/coins.ts`: `award_correct`; `src/daily_goals.ts`: `GOAL_POOL` | Exact streak milestones receive distinct banners; correctness also earns coins and goal progress. | Strong milestone-feedback fit. Keep existing score; no spendable currency or daily grind. |
| `glycolysis-okimon` | `src/constants.ts`: `SIDE_QUESTS`; `src/game_state.ts`: `getAvailableSideQuestTokens`, `getSideQuestCompletions`, `collectSideQuestToken` | Optional side-quest tokens award one-time badges. | Good future replay motive if medals never gate stages, recovery, or completion. |
| `bad-cell-day` | `src/level_friendly_fire.ts`; `src/physics.ts`: `move_players`; `src/level_breathing_room.ts` | Authored float routes, shoves, returning hazards, and recoil surfaces turn environment behavior into tactics. | Promising later-stage manipulation; retain automatic floor following and no jumping. Existing tissue already supplies a simpler tactic. |
| `attack-on-cancer` | `src/upgrade_paths.ts`: `ordinaryUpgrade`, `signatureUpgrade`; `src/simulation.ts`: `upgradeTower` | Ordinary and signature upgrades change tower roles, with visible tier identity. | A single temporary tool variation may suit an arcade round better than a permanent upgrade tree. |
| `science-choose-adventure` | `src/engine.ts`: `drawNextCard`, `trajectorySignal`, `trajectoryNoteText` | Prior behavior influences follow-up cards and an explanatory trajectory recap. | Useful for optional post-round observations. Avoid claiming medical outcomes from arcade performance. |
| `andes-virus-outbreak-game` | `src/scenarios.ts`: `SCENARIO_PRESETS`; `src/init.ts`: `rebuildFromControls`, `resetSimulation`, `DEFAULT_SEED` | Named scenarios and a controlled seed support comparable rematches. | Useful for development comparisons and understandable practice; no need to add a separate scenario menu now. |

## Selected immediate improvement

Make the existing hit streak feel visible and earned. Plaque Attack already awards x2 at hit 5
and x3 at hit 10; damage resets the streak, misses do not, and each new level starts fresh.
The selected change presents those existing rules through a compact HUD streak count, exact
5/10-hit milestone cues and optional sound, and bounded floats showing points actually awarded.
It adds no scoring multiplier, ability, collectible, balance change, or saved progression field.

This combines the chain readability of `ms-taq-man`, the exact milestones of the quiz game, and
the event hierarchy of `super-bowling`. Expected benefit: a player can see why a hit pays more
and recognize a successful sequence during play. This is a hypothesis about enjoyment, not
playtest evidence. Reduced motion keeps point feedback stationary; pause, retry, and level
transitions own feedback cleanup. Sound remains optional and never carries the only signal.

The scoring contract is in [GAME_SPEC.md](GAME_SPEC.md). The local work log is
`output/fun_survey/LEDGER.md`, an ignored artifact. Durable verification status belongs below.
Selection does not by itself establish that source, browser acceptance, or deployment is complete.

## Ranked future candidates

These are concrete, unimplemented options for later work, not pending requirements of this
delivery. Rankings reflect expected fit and cost from source inspection, not measured fun.

| Rank | Candidate and expected appeal | Implementation boundary | Autonomous acceptance |
| --- | --- | --- | --- |
| 1 | Optional skill medals: recognize one clear achievement such as finishing without damage, giving a replay a purpose. | Derive from authoritative round outcomes; keep medals outside score, unlocks, patient healing, and mandatory objectives. Define persistence only if selected. | Ordinary campaign completion works with zero medals; practice cannot award campaign progress; each medal condition awards once; results remain compact at required viewports. |
| 2 | One temporary collectible: an explicit arcade instrument shield or tool variation makes positioning a choice. | Simulation owns spawn, pickup, expiry, and interactions. Start in one later stage; preserve opening three stages and tool/target compatibility. Do not imply that a drug or HDL directly destroys plaque. | Deterministic pickup/expiry checks, pause-frozen duration, no double pickup, readable remaining state, no mandatory collection, and ordinary-input completion of the affected stage. |
| 3 | Shared charged ability: successful hits fill one clearly signaled, player-triggered defensive action. | One simulation-owned meter and one action shared by all six surgeons; reuse existing input conventions only after resolving keyboard/touch parity. Requires explicit scoring and balance decisions. | Meter bounds and spend-once behavior pass; damage and retry resets are defined; no hidden charge during pause; all surgeons behave identically; ordinary-input review checks readability and difficulty. |
| 4 | Predictable environment manipulation: a visible switch briefly changes a later-stage flow lane or shelter behavior. | One authored stage mechanic with an explicit state and visible cue; use existing tissue/floor ownership. Keep no-jump movement and avoid random unavoidable damage. | Seeded behavior repeats; switch timing pauses correctly; collision geometry matches the cue; recovery cannot trap the surgeon; ordinary-input play verifies reachable clear and retry. |

Optional recaps and controlled practice seeds can support these experiments if a concrete need
appears. They are weaker immediate rewards than showing the successful hits already happening.

## Existing strengths and limits

The current game already has split/impact rings, patient recovery routes, six cosmetic surgeons,
varied floors, erodible tissue, merging, 24 stages, and score records. These are existing foundations,
not new survey proposals. Preserve the easy first three stages, 16:10 arena, keyboard controls,
cardiovascular identity, and smooth automatic floor following without jumping.

Use the scientific method and focus on important issues from [REPO_STYLE.md](REPO_STYLE.md):
verify point accuracy, lifecycle, readability, and ordinary-input play before broadening effects.
Automated checks can establish correctness and rendered inspection can establish legibility;
neither proves that players enjoy the change. Optional human feedback may inform later tuning
without becoming a completion gate. Purchases, extra currencies, and daily obligations do not
follow from this survey.

## Verification status

The eleven-repository source survey and feedback implementation are complete. Runtime review
found narrow-screen lives overflow and a collapsed arena after stage transitions by button or
keyboard. A definite arena grid row and three-column mobile HUD correct the owning layout;
score content wraps within its column. The corrected source passes all 49 source tests, with
an arena-extent browser guard and a stronger reduced-motion position check.

The corrected production build and all 18 browser journeys pass. Captures at 1280x800, 844x390,
and 320x568 show contained HUD content and a preserved arena after button and keyboard stage
transitions. Reduced-motion point feedback stays stationary, and pause freezes canvas and HUD
in four captured contexts. No browser console errors occur in these probes.

Fresh specification and quality reviews accept the corrected source with no blocking findings.
Fresh final integration review accepts the complete delivery with no blocking findings and
verifies current source, tests, build, screenshot, and probe identity. All 227 focused
documentation checks pass.

[screenshots/streak_feedback.png](screenshots/streak_feedback.png) shows actual gameplay with
the 5-hit x2 milestone, compact streak HUD, and awarded-point feedback. The image is 166,500 bytes.
The capture demonstrates rendered feedback; it does not establish increased enjoyment.

A mock Web Audio probe verifies distinct four-voice milestone schedules at 5 and 10 hits versus
one voice for an ordinary hit, no scheduled effects while muted or paused, and active-voice
cleanup on mute. This checks scheduling and lifecycle, not audible sound quality.

The local logs are under `output/fun_survey/`: `check_codebase_implementation.log`,
`layout_fix_check.log`, `build.log`, `browser.log`, `audio_probe.log`, and `VERIFICATION.md`.
These are ignored artifacts. No deployment is requested.
