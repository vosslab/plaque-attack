# Playtest improvements

**Status: COMPLETE - archived after final integration ACCEPT.** The full pytest suite passed
1,373 tests; source/repository checks, the build, all 25 browser tests, independent reassessment,
responsive bounds and screenshot evidence are accepted. Final ratings are G5 Concern, G6 Meets,
and U5 Meets. G5's passive-center gap remains a documented residual finding.

**Goal:** Resolve the three localized concerns in the 2026-10-23 playtests, rebuild the game,
and independently reassess the changed experience. The evidence is in
[PLAYTEST_RESULTS.md](../PLAYTEST_RESULTS.md),
[gameplay_playtest_2026_10_23.md](../active_plans/reports/gameplay_playtest_2026_10_23.md), and
[usability_playtest_2026_10_23.md](../active_plans/reports/usability_playtest_2026_10_23.md). Preserve the
sample limits and ratings in [PLAYTEST_RUBRICS.md](../PLAYTEST_RUBRICS.md); improvements do not
imply a forced pass.

## Scope and ownership

- **UI owner (G6):** Align terminal countdown with the completed semantic phase. Stage 23
  completed at the accepted simulation boundary while the terminal display showed `00:01`.
  Make terminal remaining time agree with the completion condition and retain the existing
  active countdown ceiling. Avoid broad rounding or epsilon changes that could alter simulation
  completion.
- **UI owner:** Improve essential portrait HUD tool and objective readability. The current text
  measures 10.4px and 10.88px at 390x844. Target at least 12.8px for both, or demonstrate a
  comparable readable treatment while preserving the HUD hierarchy and fitting the narrow view.
- **Pacing owner:** `/root/pacing_design` supplies a bounded, concrete recommendation for G5.
  The recommendation must compare one to three simple input strategies in stage 1 and name an
  implementable pacing improvement grounded in those observations. The manager records the
  selected change here before implementation; pacing implementation has a separate owner from UI.
  Keep the opening approachable: do not increase difficulty or add a new control. If evidence
  does not support a pacing change, document the measured result and resolve G5 with a concrete
  in-game rhythm improvement that does not raise the difficulty.
- Owners confirm exact source files before editing. UI owns HUD source/CSS, terminal countdown
  presentation, and responsive layout; pacing owns the approved opening-guide presentation files.
  The integrator owns shared integration, full checks, generated `dist/`, browser
  captures, and final playtest report updates. Do not overlap file ownership.

## Milestones

1. **Resolve G5 choice.** Run and compare one to three ordinary, simple-input stage-1 strategies
   (including the stationary held-fire baseline) using productive-event timing and actual browser
   play. Record each strategy, route, sample limits, and the chosen small change below. Select a
   change that shortens the demonstrated unproductive interval without raising difficulty or
   adding controls. The 12-second concern is localized evidence, not a campaign-wide difficulty
   claim. If no supported change emerges, document the evidence and select a concrete rhythm change
   that preserves the easy opening. Proceed to implementation in this plan; no separate research
   milestone or human-playtest gate remains.

   **Decision:** Add a stage-1-only visible intercept guide: select the nearest horizontal live
   target, retain its ID until removal, and suggest its x plus 0.8 seconds of horizontal velocity,
   clamped to player-center floor limits. A static floor chevron and matching target outline pair
   with the persistent DOM tip "Follow the drift: move toward the marker while firing."
   The temporary seed-1 comparison measured center held-fire clear at 32.617s with a 15.434s
   maximum hit gap; the detached prototype cleared in 3.717s with a 1.267s gap and three lives.
   In the independent rebuilt-browser reassessment, following the displayed guide cleared in
   4.583s (300ms observation) and 7.067s (500ms), with maximum hit intervals of 2.100s and 2.000s.
   The unchanged center held-fire route remained 32.617s with a 15.433s maximum gap. Left/right
   two-second starts also kept three lives in the prototype comparison. Stateless lowest-ID selection
   lost lives on the right-start route; nearest-then-latched avoids that measured drawback.
   These are detached ordinary-input simulations; browser controls and human readability remain
   separate reassessment gates. Evidence: `output/playtest_fixes/pacing_design/RECOMMENDATION.md`.
   Exact owner files: `src/opening_guide.ts`, `src/renderer.ts`, `src/main.ts`, and
   `tests/test_opening_guide.mjs`. The renderer owns the small presentation ID, resets fresh
   attempts and terminal phases, and hides the cue while retaining selection through pause.
   The helper and DOM share applicability. No simulation, save, weapon, level, or input changes.

2. **Implement the three fixes - complete.** UI and pacing owners made their scoped source
   edits: the terminal value aligns with accepted maintenance completion while active countdown
   behavior stays unchanged; essential HUD typography/layout meets the 12.8px target; and the
   recorded stage-one guide adds no control or difficulty. The integrator owns any integration
   fixes at the source boundaries. Implementation and independent source-review evidence are in
   `output/playtest_fixes/opening_impl.md`, `output/playtest_fixes/source_review.md`, and
   `output/playtest_fixes/hud/README.md`. Their focused checks passed; these do not replace the
   integrated build or browser acceptance in milestone 3.

3. **Build and reassess - complete.** Source checks,
   repository checks, the Pages build and all 25 browser tests passed. Independent browser
   reassessment used actual controls and reviewed the rebuilt artifact against G5, G6, and U5 in
   [PLAYTEST_RUBRICS.md](../PLAYTEST_RUBRICS.md), including stage-23 completion and responsive
   captures. Source, browser, build, full pytest (1,373 passed), and screenshot evidence are
   recorded in the [independent reassessment report](../active_plans/reports/playtest_improvements_reassessment.md)
   and [PLAYTEST_RESULTS.md](../PLAYTEST_RESULTS.md). Final integration ACCEPT is recorded in
   `output/playtest_fixes/integration.md`.

## Completion

- The stage-23 terminal countdown agrees with the accepted maintenance completion state; the
  active countdown still uses its prior ceiling behavior.
- Essential portrait tool and objective text reaches at least 12.8px, or independent inspection
  supports a documented comparable readable treatment. At 390x844, 320px-wide portrait,
  844x390, and desktop, actual bounds show the complete required HUD and controls fit without
  clipping or hidden play information.
- A measured G5 comparison informs the selected opening rhythm improvement. The updated rating
  follows evidence and may remain Concern if the rubric anchor is still unmet; the passive-center
  route remains a documented residual concern rather than a required implementation.
- TypeScript, repository checks, build, all 25 browser tests, full pytest (1,373 passed),
  independent reassessment and updated result artifacts are complete. Final integration ACCEPT
  is recorded in `output/playtest_fixes/integration.md`. Preserve the measured G5 residual rather
  than forcing acceptance.

## File scope

- `src/` and `src/style.css`: owning simulation, pacing, and UI changes.
- `tests/`: focused durable coverage only where a stable contract merits permanent protection;
  use existing full tests and temporary checks for one-time evidence.
- `dist/`: rebuild output from canonical source after source checks pass.
- ignored `output/playtest_fixes/`: browser captures, bounds, route measurements, and provenance.
- `docs/PLAYTEST_RESULTS.md` and `docs/active_plans/reports/`: updated ratings and independent
  evidence. `docs/CHANGELOG.md`: implementation entry after changes are complete.
