# Gameplay creative evolution ledger

**Status: COMPLETE (2026-10-23).** The selected three-encounter arc and bounded recovery-illustration
refinement are implemented. Actual-control, configuration, refreshed source/build, visual, and
integration evidence is recorded below; sampled play does not establish human enjoyment.

See [gameplay_creative_evolution.md](../active/gameplay_creative_evolution.md) for the working
brief.

## Selected encounter arc

| Display / ID | Contract and recorded play | Finding |
| --- | --- | --- |
| 12 / 20 | Three phases, 4/4/6 targets. Clearing phase one, transition included, earns a left current at x=320. The manual right switch overrides it for four seconds; then the earned baseline resumes during cooldown. Ordinary route: 58.6 seconds, three lives. Override route: 40.83 to 44.92 seconds before baseline resumed; waiting out the override cost a life. | Keep the override optional. Its time saving is not universally optimal. The existing recovery badge now truthfully reports gathering through cooldown; no new panel was added. |
| 16 / 22 | A switch shot at x=480 gathers the current at x=780, enabling a safe crossing to the left shield and clearance of that column. Actual-control clear: 20.82 seconds, three lives, shield retained; measured safe crossing: 1.27 seconds. | The gather-and-retrieve route works with ordinary inputs. A real-RAF resize capture at 390x844 is `output/creative_evolution/captures/stage16-real-raf-resize-390x844.webp`; earlier empty mobile captures were virtual-clock resize artifacts. |
| 24 / 15 | Original 4/6/5 phases. Clearing phase one earns the right-current baseline at x=640. An optional left-current override at x=320 offers player-directed positioning/crossing; after the override, the right baseline resumes. | Refreshed real-mobile-RAF route: phase-three entry at 18.30 seconds, three lives; use the no-fire flank at x=850, wait 2.25 seconds, then fire from x=780. At 22.25 seconds the pulse changes false to true and removes IDs 12/13, reducing tiny targets from four to two while retaining the shield and three lives; clear at 23.4 seconds (including 383 ms real-RAF time). Separate ordinary clear: 23.87 seconds, three lives. Retry resets phase/current. Earlier desktop and mobile CLEARANCE2 captures also show the route. |

## Rejected experiments

- The optional display-23 / stable ID 24 seam was removed. An ordinary run took 33.2 seconds with
  three lives and six seconds of steady gather. A bounded three-target post-shift gather showed no
  attainable, useful seam payoff; the seam added surplus device and instruction. Its original
  25-second shift and ordinary maintenance structure remain unchanged.
- Display 5 fragment/gather/flush was rejected because its interaction added discovery load.
- Earlier display-23 configuration and rollback experiments are historical only. The final arc
  uses display 24 / stable ID 15.

## Verification and limits

The latest final code check, after the bounded renderer refinement, passed 99 Node tests, TypeScript,
lint, format, and distribution build (133.8 kB). The full 25-test Playwright run passed before the
final small configuration/rollback; after rollback, the focused 20-test run passed, followed by five
passing final tests. Source/spec and quality reviews accepted the selected configuration, including a
fresh HUDP2 correction. The bounded `patient_recovery` mask refinement uses center-out organic
curves and warmer physical-wall shading. The refreshed route receipt records stable source/distribution
identities, no browser errors, and no overflow. Fresh earned-clear captures at 1280x800 and 390x844 were visually
reviewed; the organic treatment has warmer, coherent physical walls and keeps hazards and the shield
readable. The zoomed celebration view crops the full arena borders, while full-progress coverage is
verified by source/spec evidence. The gameplay integration report and final bounded-rendering
source/spec and visual-quality reviews accept the work.

These are sampled agent routes and captures, not human enjoyment or usability findings. Keep
ordinary and mastery routes distinct. Display 23 / stable ID 24 was rejected: its new seam was
removed while its original right shield, entry shift, and steady gather stayed unchanged. The
bounded `patient_recovery` change is owned by `remix_rendering`; it refines the mask with center-out
organic curves and warmer physical-wall shading while preserving physical walls and gameplay.
The final refreshed receipt supersedes the earlier pre-refinement source/build identity. Earned-clear
captures are `output/creative_evolution/organic_recovery/stage24_earned_complete_1280x800.webp` and
`output/creative_evolution/organic_recovery/stage24_earned_complete_390x844.webp`; final quality
acceptance is in `output/creative_evolution/organic_recovery/quality_review.md`, with bounded
source/spec acceptance in `output/creative_evolution/organic_recovery/spec_review.md` and gameplay
integration acceptance in `output/creative_evolution/integration_review.md`. The ignored
`output/creative_evolution/` paths are local evidence receipts, not committed artifacts. These
reports complete the evidence; no human enjoyment or usability claim is made.
