# Playtest results

Independent agent assessments of the current local build, 2026-10-23. The gameplay review used
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
during review. This identifies the reviewed local artifact; it is not a deployment claim.

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
