# Playtest improvements reassessment

Independent browser reassessment, 2026-10-23, of the rebuilt artifact against G5, G6,
and U5 in [PLAYTEST_RUBRICS.md](../../PLAYTEST_RUBRICS.md). The scoped changes are
accepted with the residual passive-opening G5 Concern preserved. This is agent inspection
and measured browser input, not evidence of human enjoyment.

## Artifact and evidence lanes

- Served `dist/` on the reviewer's local port 8152. Chromium 156.0.8078.4, headless macOS.
- `dist/main.js` SHA-256:
  `da06cab168a4543ffdcfa215e396bb956523e37dfd090a68920d03d4467b7527`.
- `dist/style.css` SHA-256:
  `fcb9e834b4d2ba6a515630ad092e7cbd562102af5114897e3fac53704a7cbefe`.
- All 33 source-map contents match current source files. Complete before/after source and
  dist hashes are equal in the main, matched-route, focused, and bounds manifests. No
  production changes, builds, or Git operations were performed by this reviewer.
- Every route uses fresh practice storage: surgeon Alex, seed 1, unlock 24, no completed
  tutorials, records, or recovery. Only practice availability is supplied; lives, targets,
  score, phase, and completion are never injected.
- Fresh actual controls: native practice/start/retry buttons and actual keyboard down/up
  events. Playwright controls RAF/time. These are repeatable input routes, not measured
  human reaction times or unprimed novice sessions.
- Stage-1 actions use only the actual drawn cyan floor chevron and current player x. A
  temporary Canvas2D wrapper records the production renderer's three-point cyan stroke;
  the driver moves toward its displayed x with a 24-logical-pixel deadband while firing.
  It does not import the guide, inspect target positions/lives to choose inputs, predict
  trajectories, or use the planner. Cyan target-outline strokes are observed separately.
- Read-only telemetry sampled every 10 virtual ms explains outcomes. Hit times are the
  simulation elapsed times at observed streak increases; damage is a lives decrease.
  The intervals below include the initial time-to-first-hit and final clearing hit.
- Stage 23 alone uses the disclosed existing detached-state planner every 300 ms to choose
  real keyboard inputs. This establishes a reachable maintenance endpoint and its display,
  not ordinary-player mastery, fairness, or enjoyment.
- Long-text fixtures mutate DOM text only while the clock is paused. They are explicitly
  separate from reachable gameplay states and do not establish play completion.

Evidence lives under `output/playtest_fixes/acceptance/`. `report.json`,
`matched/report.json`, `focused/report.json`, and `bounds/report.json` are authoritative.
`source_map_check.json` records source/build agreement. Runners and screenshots remain
beside their manifests. No browser page errors occurred in the accepted runs.

## G5: actual opening routes

All routes start with the same stage, seed, center position, and ordinary held fire.
The two delayed-follow routes first hold the named wrong-way direction while firing for
at least two simulation seconds, then follow the displayed cue. Their matched controls
make the same initial movement, then release movement and continue firing at that position.
The 300 ms route starts following at about 2.083 s; the 500 ms route at about 2.483 s.
No health-dependent or target-dependent correction changes these policies.

| Route | Observation interval | Clear seconds | Shots | Lives | Maximum hit interval |
| --- | --- | --- | --- | --- | --- |
| Center held fire | 300 ms | 32.617 | 44 | 3 | 15.433 s |
| Follow displayed guide | 300 ms | 4.583 | 9 | 3 | 2.100 s |
| Follow displayed guide | 500 ms | 7.067 | 12 | 3 | 2.000 s |
| Left for 2 s, then guide | 300 ms | 8.300 | 14 | 2 | 3.633 s |
| Left for 2 s, then stationary | 300 ms | 57.550 | 75 | 2 | 17.200 s |
| Right for 2 s, then guide | 500 ms | 17.167 | 25 | 2 | 5.150 s |
| Right for 2 s, then stationary | 500 ms | 57.917 | 75 | 2 | 18.217 s |

The unchanged center route hits at 0.350, 0.750, 1.133, 16.567, 17.150, 17.633, and
32.617 seconds. The displayed guide gives a concrete repositioning task and substantially
shortens every sampled comparison. It preserves the passive route's mechanics and difficulty.
It does not eliminate passive waiting if the player ignores it.

Both delayed-follow routes take one contact: left at 7.117 s, right at 11.200 s. Their matched
stationary routes also take one contact, at 25.800 s and 8.267 s respectively. Equal sampled
contact counts support the bounded comparison; they do not prove the cue is universally safe.
The successful no-delay routes keep all three lives. Complete per-hit times and intervals,
allocated shots, damage samples, and cue/action logs are preserved in JSON.

The inspected stable-frame captures show a cyan floor chevron and a matching cyan outline
around the selected plaque. The cyan remains distinct against the dark floor; a dark border
separates it from the art. Portrait `focused/*-after-move-fire.png` shows the instruction
`Follow the drift: move toward the marker while firing.` after the initial move/fire tasks
have been completed. The existing text remains readable and gives the marker an action.
The renderer's target latch is private presentation state; this reviewer did not replace it
with a second selection algorithm. Its implementation-level identity contract belongs to the
independent source review; this browser review establishes its displayed result and usability.

Actual pause removes both chevron and outline; resume restores them. Actual practice clear
removes them, and clicking Retry practice returns elapsed 0, ready phase, three lives, no cue,
then a new stage-1 cue when play starts. Active stages 2, 3, and 23 have no opening cue or
outline. Normal and reduced-motion portrait samples retain the same static chevron/outline
geometry and persistent instruction. The marker moves with the game's guidance; it has no
observed pulse or decorative animation of its own. This does not claim the moving game is static.

## G6: maintenance completion

A full stage-23 actual-keyboard route reaches tick 3000, elapsed
49.999999999998444 seconds, `level_complete`, one life, one remaining hazard versus a safe
maximum of five, and 143 allocated shots. `stage23-terminal.png` visibly shows
`REMAINING 00:00` together with `Stage clear! Nice work.`
`stage23-preterminal.png` shows active `00:01` before completion. Earlier active samples retain
positive ceiling-style countdown values, including `00:50` during the opening fraction of a
second. The accepted simulation boundary now agrees with the terminal HUD without changing the
active rounding behavior. The terminal still correctly allows the one safe remaining hazard.

## U5: measured and inspected layout

The computed tool and objective font sizes are **12.8 px** in every sampled viewport.
The ordinary measurements include objective, tool, lives, score, time, stage title, pause,
all three touch controls, and arena bounds. Each remains inside the viewport with no
horizontal page overflow. The complete arena retains its 16:10 ratio.

| Viewport | Ordinary scenario | Arena size | Fire control height |
| --- | --- | --- | --- |
| 390x844 | Stage 23 | 358x223.75 | 56 px |
| 320x844 | Stage 23 | 288x180 | 56 px |
| 844x390 | Stage 23 | 508.797x318 | 46 px |
| 1280x800 | Stage 23 | 784x490 | 56 px |
| 320x568 | Stage 1 with full initial guide text | 288x180 | 56 px |

Screenshots at each viewport were opened and inspected. Portrait tool/objective text is larger
than the prior 10.4/10.88 px evidence and maintains the stage/lives/score hierarchy. The narrow
arena and small decorative world labels retain their inherent scale limits; essential DOM HUD
information and controls are visible. This does not prove comfortable physical-phone play.

Additional actual stage-5/support and stage-23/maintenance starts at 320x568 fit a complete
288x180 arena and 56 px touch controls whose bottom is 562 px, within the 568 px viewport.
Stage 23's actual `Incoming hazard` warning also fits. Desktop stage-1 instruction Range bounds
are x140, y747.828, width560.203, height16 inside its x140/y745.828/w1000/h21.031 container;
the word `Move` is fully present and unclipped.

The separate `fixture-long-*` screenshots add optional/releasing/pending counts plus the long
maintenance warning. Their measured controls and required HUD remain bounded at all five
viewports. At 320x568, Fire is y468.563/h56, bottom524.563; the full guide text fits below it.
This fixture intentionally combines text that does not occur in stage 1 and proves only layout
stress behavior. An initial visual impression of clipping was corrected against full-resolution
inspection and measured bounds; no such defect is asserted.

## Ratings and limits

| Criterion | Rating | Lane and rationale | Impact / priority |
| --- | --- | --- | --- |
| G5 | Concern | Fresh actual controls, telemetry, inspected rendering. Cue-following routes meet the productive pacing anchor, including delayed and 500 ms observation routes. The unchanged stationary route still has a 15.433 s no-hit gap, so the overall sampled criterion retains its localized Concern. | Guidance materially improves active cleanup without requiring new controls. Passive waiting remains P3; no forced pass. |
| G6 | Meets | Fresh actual stage-23 controls plus terminal/preterminal screenshots and telemetry. Successful maintenance now displays 00:00 at the accepted tick boundary while active countdown remains positive beforehand. | The previously contradictory terminal feedback is resolved in this sampled scenario. |
| U5 | Meets | Actual controls, computed text/bounds, inspected responsive captures, and separately labeled stress fixtures. Essential text reaches 12.8 px; required controls and complete arena fit every sampled viewport. | The measured portrait readability concern is resolved within this viewport sample. |

Other rubric ratings are not comprehensively reassessed by this bounded review. Pause/retry,
other-stage guide absence, and reduced motion are regression observations for the changed cue,
not substitutes for the earlier complete control/usability assessment. There is no campaign-wide
replay, audio assessment, physical touch-device trial, screen-reader study, or human enjoyment
measurement. No claim is made that the fastest scripted route will be discovered by every player.

An initial harness probe had two faults: a RAF observer was replaced by the controlled-clock
shim, and a stage-23 detached snapshot initially lost Map types across serialization. Its
`initial_probe_report.json` is retained transparently. Corrected accepted runs use the observer
installed after clock setup and preserve Maps/Sets for the stage-23 planner. Initial t=0 captures
can show fallback art before asset readiness; stable later frames and focused portrait captures
are the visual evidence used above. These probe limitations are not scored as product defects.

Reproduce from the repository root with the rebuilt artifact and a static server on port 8152:

```bash
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/playtest_fixes/acceptance/run.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/playtest_fixes/acceptance/matched.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/playtest_fixes/acceptance/focused.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/playtest_fixes/acceptance/bounds.mjs
```

Chromium required macOS sandbox escalation. The owning server was stopped after review.
