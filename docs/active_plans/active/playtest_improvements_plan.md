# Playtest improvements

**Goal:** Resolve the three localized concerns in the 2026-10-23 playtests, rebuild the game,
and independently reassess the changed experience. The evidence is in
[PLAYTEST_RESULTS.md](../../PLAYTEST_RESULTS.md),
[gameplay_playtest_2026_10_23.md](../reports/gameplay_playtest_2026_10_23.md), and
[usability_playtest_2026_10_23.md](../reports/usability_playtest_2026_10_23.md). Preserve the
sample limits and ratings in [PLAYTEST_RUBRICS.md](../../PLAYTEST_RUBRICS.md); improvements do not
imply a forced pass.

## Scope and ownership

- **Simulation owner:** Fix maintenance completion/countdown alignment at its source. Stage 23
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
- Owners confirm exact source files before editing. UI owns presentation source/CSS and responsive
  layout; simulation owns maintenance completion/countdown logic; pacing owns only its approved
  gameplay source. The integrator owns shared integration, full checks, generated `dist/`, browser
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

   **Decision:** Pending pacing comparison. The owner must replace this line with the selected
   behavior and its evidence before pacing implementation begins. If the comparison contradicts
   the original concern, record that result and the concrete resolution selected.

2. **Implement the three fixes.** Simulation, UI, and pacing owners make their scoped source edits.
   Keep active countdown behavior unchanged while aligning the terminal value with accepted
   completion. Adjust essential HUD typography/layout to meet the portrait target and fit checks.
   Implement the recorded pacing choice with no new control or difficulty increase. Owners report
   changed files and focused evidence; the integrator resolves integration issues at those owning
   boundaries.

3. **Build and reassess.** Run `npx tsc --noEmit -p tsconfig.json`, `./check_codebase.sh`,
   `./build_github_pages.sh`, and `npx playwright test --reporter=list` for the complete browser
   suite, followed by relevant focused browser journeys.
   Then have an independent reviewer assess the rebuilt artifact against G5, G6, and U5 in
   [PLAYTEST_RUBRICS.md](../../PLAYTEST_RUBRICS.md). Use actual controls for the sampled stage-1
   pace comparison and stage-23 terminal completion; inspect responsive UI at 390x844,
   320px-wide narrow portrait, 844x390, and desktop. Record browser bounds and screenshots for
   each viewport, and judge measured text and layout from those artifacts rather than CSS values
   alone. Include terminal state evidence at stage 23 and verify the accepted completion boundary
   no longer conflicts with the displayed countdown. Update the existing results and independent
   review report with artifact identity, observations, ratings, and limits.

## Completion

- The stage-23 terminal countdown agrees with the accepted maintenance completion state; the
  active countdown still uses its prior ceiling behavior.
- Essential portrait tool and objective text reaches at least 12.8px, or independent inspection
  supports a documented comparable readable treatment. At 390x844, 320px-wide portrait,
  844x390, and desktop, actual bounds show the complete required HUD and controls fit without
  clipping or hidden play information.
- A measured G5 comparison informs and resolves the selected opening rhythm improvement. The
  updated rating follows evidence and may remain Concern if the rubric anchor is still unmet.
- TypeScript, repository checks, build, full existing tests, and relevant browser journeys pass;
  independent reassessment and updated result artifacts are present. Any failed check is repaired
  at its owning boundary and rerun. Preserve genuine failures and residual findings rather than
  forcing acceptance.

## File scope

- `src/` and `src/style.css`: owning simulation, pacing, and UI changes.
- `tests/`: focused durable coverage only where a stable contract merits permanent protection;
  use existing full tests and temporary checks for one-time evidence.
- `dist/`: rebuild output from canonical source after source checks pass.
- `output/rubric_playtest/`: browser captures, bounds, route measurements, and provenance.
- `docs/PLAYTEST_RESULTS.md` and `docs/active_plans/reports/`: updated ratings and independent
  evidence. `docs/CHANGELOG.md`: implementation entry after changes are complete.
