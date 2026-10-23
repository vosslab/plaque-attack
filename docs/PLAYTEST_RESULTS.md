# Playtest results

## Baseline assessment - 2026-10-23

Independent agent assessments of the baseline local build, 2026-10-23. The gameplay review used
ordinary browser controls plus a predictive planner in some later stages; the usability review used
fresh browser contexts for its task walkthrough. Both reports compare the game with
[PLAYTEST_RUBRICS.md](PLAYTEST_RUBRICS.md). These are bounded expert observations, not a human
enjoyment study, a novice study, or an overall approval.

## Build and scope

Both reviewers served the existing `dist/` build in headless Chromium at 1280x800 for primary
play. The usability review also sampled 844x390 landscape, 390x844 portrait, and reduced motion.
Both reports give the same `dist/main.js` SHA-256:
`7bd8bc2518e5ca3d1cead433ccd28092ffa343ebc12b963e9652871abb909b8a`. Each confirms that all 32
bundled source-map contents match current source and that source/build files remained unchanged
during review. This identifies the reviewed local artifact; it is not a deployment claim. The
findings and ratings below remain the baseline for this artifact; subsequent fixes do not rewrite
these observations.

Gameplay sampled fresh practice routes for stages 1, 2, 3, 5, 6, 8, 23, and 24, including one
terminal loss, several clears, and a maintenance clear. The later-stage planner used read-only
telemetry to guide actual keyboard inputs and had predictive information unavailable to ordinary
players. Stage 1 held-fire runs used ordinary inputs. The usability walkthrough used fresh storage,
ordinary controls, a genuine practice loss and retry, keyboard continuation, and reduced-motion
clear flow. It was led by an agent familiar with the specification. Neither review covers the
whole campaign or represents human enjoyment.

## Ratings

| Criterion | Rating | Evidence |
| --- | --- | --- |
| G1 Control response | Meets (combined evidence) | The gameplay reviewer observed movement, firing, and release. The usability reviewer observed focused keyboard controls, pause/resume, and a genuine loss/retry. The gameplay report retains its original `Not observed` rating because those controls were outside that review's scope; together the reports cover the sampled G1 behaviors. See the [gameplay report](active_plans/reports/gameplay_playtest_2026_10_23.md) and [usability report](active_plans/reports/usability_playtest_2026_10_23.md). |
| G2 Fairness and readability | Meets | Sampled threats and responses were visible; no broad fairness claim. [Gameplay report](active_plans/reports/gameplay_playtest_2026_10_23.md) |
| G3 Meaningful choices | Meets | Carved support and a gathering current changed routes and protection in sampled play. [Gameplay report](active_plans/reports/gameplay_playtest_2026_10_23.md) |
| G4 Novelty and progression | Meets | Sampled opening, support/current stages, and finales changed actions and spatial tasks. [Gameplay report](active_plans/reports/gameplay_playtest_2026_10_23.md) |
| G5 Cleanup and pacing | Concern | A held-fire opening route had at least 12 seconds without a hit or target-count change. [Gameplay report](active_plans/reports/gameplay_playtest_2026_10_23.md) |
| G6 Feedback and payoff | Concern | At stage 23's maintenance clear, the terminal HUD still showed `REMAINING 00:01`. [Gameplay report](active_plans/reports/gameplay_playtest_2026_10_23.md) |
| U1 First-run tasks | Meets | The expert walkthrough chose a surgeon, started stage 1, cleared it, and continued to stage 2 using visible controls. [Usability report](active_plans/reports/usability_playtest_2026_10_23.md) |
| U2 Objective and mechanic cues | Meets | Sampled opening briefing and HUD identified objective, tool, and tutorial state. [Usability report](active_plans/reports/usability_playtest_2026_10_23.md) |
| U3 Failure and retry | Meets | A real practice loss, clean same-stage retry, and menu return preserved saved records. [Usability report](active_plans/reports/usability_playtest_2026_10_23.md) |
| U4 Keyboard and focus | Meets | Keyboard-only opening and continuation worked; focused controls retained their expected actions. [Usability report](active_plans/reports/usability_playtest_2026_10_23.md) |
| U5 Responsive readability | Concern | Portrait layout remained usable, though essential tool and objective text measured 10.4px and 10.88px. [Usability report](active_plans/reports/usability_playtest_2026_10_23.md) |
| U6 Reduced motion | Meets | Sampled static celebration retained clear and recovery meaning. [Usability report](active_plans/reports/usability_playtest_2026_10_23.md) |

Ratings are categorical and are not averaged. `Not observed` records missing evidence, not a pass.
G1 combines the two reports' directly observed control behaviors; every rating remains limited to
the sampled behaviors and routes described above.

## Supported follow-up checks

- **P3, G6:** Check the stage-23 terminal countdown state against the clear message and capture
  the expiry boundary. The observation is a one-second display ambiguity; the stage did clear.
- **P3, U5:** At 390x844, capture browser bounds and screenshots for the current essential HUD
  typography and a modestly enlarged version, then request an independent agent readability review.
  Human feedback may add context but is optional. The reviewed frame had no clipping or blocked
  action.
- **P3, G5:** Sample the first-stage opening with simple scripted input strategies and record time
  between productive events. One held-fire route supports a localized pacing concern, not a
  campaign-wide difficulty conclusion.

The initial locked-stage selection timeout in the gameplay setup was a probe error and is retained
in its report, not scored as a game failure. An initial usability recovery-runner timeout was also
a harness issue; the corrected route completed a real loss and retry. These events are not smoothed
into product findings. No P1 or P2 issue was supported, no forced pass was applied, and no fix or
human enjoyment claim is made here. Unplayed encounters, physical touch hardware, assistive
technology, full-campaign completion, and representative human response remain outside this sample.

## Current fix status

The rebuilt artifact was independently reassessed on 2026-10-23. Its `dist/main.js` SHA-256 is
`da06cab168a4543ffdcfa215e396bb956523e37dfd090a68920d03d4467b7527`; all 33 source-map contents
match current source. This is local browser evidence, not a deployment claim. The original ratings
above remain tied to baseline hash `7bd8bc...` and are retained as historical observations.

| Criterion | Baseline | Rebuilt reassessment | Evidence |
| --- | --- | --- | --- |
| G5 Cleanup and pacing | Concern | **Concern** | Cue-following actual-control routes clear in 4.583s (300ms observation) and 7.067s (500ms), with maximum hit intervals of 2.100s and 2.000s. The unchanged center held-fire route remains 32.617s with a 15.433s maximum hit interval, so passive waiting remains a localized concern. |
| G6 Feedback and payoff | Concern | **Meets** | Actual stage-23 completion shows `REMAINING 00:00` with the clear message at the accepted maintenance boundary; active countdown retains positive ceiling behavior. |
| U5 Responsive readability | Concern | **Meets** | Essential tool/objective text measures 12.8px. The complete arena, required HUD and controls fit the five sampled viewports from 320x568 through 1280x800. |

The stage-one guide teaches movement while firing but does not move, aim, or fire for the player.
The measured benefit applies to the sampled cue-following routes; it does not remove passive
waiting when the player stays centered and ignores the cue. Keep G5 at Concern without forcing a
pass. The G6 and U5 resolutions are bounded to the scenarios and viewports in the independent
[reassessment report](active_plans/reports/playtest_improvements_reassessment.md). That report
records artifact identity, actual inputs, route telemetry, measured bounds, screenshots, and
limits. The completed [playtest improvements plan](archive/playtest_improvements_plan.md)
records implementation and final integration closeout. Human enjoyment and comfortable physical-
phone play remain unmeasured.

## Gameplay variety iteration - 2026-10-23

This iteration preserves the baseline ratings above as historical results for their recorded
builds. The accepted source/specification review and quality review are not playtest ratings.
Quality review visually inspected the held sticky cue, heavy silhouette, combined encounter, and
intact seam in desktop captures; it found them legible at those captured sizes. Subsequent
actual-control play found stage 9's timed pulse removed one target for 250 points with all three
lives intact on desktop and at 390x844 in reduced motion. The 56px touch controls fit without
horizontal overflow, and the seam mark and HUD remained readable; the small canvas caption was
very small. Stage 6's phase-2 fuse cue and retry reset were observed, but fuse expiry was not.

The implemented choices are a 0.65-second sticky pause, six-second active-play unstable fuse,
three-child heavy split with a 0.65 movement factor, and a 180-unit seam radius. These are selected
prototype/source settings, not a measured fun score or human preference. The initial stage-24
session found that small platelets could spend the one-use pulse before tiny targets arrived. The
final authoring change made two existing right-side targets tiny and positioned the outer one at
(940, 440), preserving target count. On corrected build
`f64a28d20b61c97cbd3b7b8af111ff554afcbb5d03850365d3caaaf13eba41b2`, ordinary rightward movement
caused incidental seam erosion; the pulse cleared one tiny target for 250 points with three
hazards and all three lives remaining. It activated before the later fire input, so deliberate
shot activation was not observed. Fresh integration accepts within the sampled scope. Stage-6
fuse expiry, stage 18, a full stage/campaign replay, and human enjoyment remain unobserved. The
active [gameplay variety plan](active_plans/active/gameplay_variety_plan.md) is complete with
these limits recorded in `output/gameplay_variety/closeout.md`, `finale_fix/report.md`, and
`integration.md`.
