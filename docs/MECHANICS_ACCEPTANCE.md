# Integrated mechanics acceptance

**Status:** Accepted on 2026-10-22 after fresh final integration review
(`mechanics_final_integration`). S1-S6 pass; S7 documentation closeout is complete.
This report covers the integrated 24-stage campaign with tissue, floor, pockets
and coalescence. The earlier expansion evidence predates these mechanics.

## Evidence lanes

| Lane | Current evidence | Meaning |
| --- | --- | --- |
| Source checks | TypeScript, repository lint/format checks and 39 Node behavior tests pass, including 12 arena tests. | Stable source contracts and repository quality. |
| Production build | Production build passes; JavaScript is approximately 73 KB. | Local static artifact generated, without a deployment claim. |
| Browser journeys | Final six-journey rerun passes in 49.0 seconds. | Browser interactions and save/record contracts, separately from campaign reachability. |
| Opening-stage compatibility | Exact state equality for each opening stage over 1,800 fixed ticks. | Stages 1-3 retain baseline behavior with mechanics disabled. |
| Campaign inputs and replay | 24 stages completed in canonical order and independently replayed against final source hashes. | One legal, assisted ordinary-input completion path. |
| Optional pocket inputs | Stage 9 practice completes after one breach and release of both optional targets; independent replay passes. | Optional content is reachable and can finish through ordinary inputs. |
| Rendered acceptance | All 24 practice starts, four viewports, ordinary-input mechanics captures and zero detected axe violations; contrast checks remain incomplete. | Separate browser layout and accessibility evidence. |
| Frame timing | 600 sampled frames each with normal and reduced motion, about 59.7/60.0 rAF FPS and 1.4 ms combined step/render CPU p95. | Controlled worst-density fixture on Apple M4 Max; separate from organic play. |

The manager's source checks use `npx tsc --noEmit -p tsconfig.json`,
`node --test tests/test_*.mjs`, `./check_codebase.sh`, `./build_github_pages.sh` and the
Playwright suite. Focused geometry, tissue and merge probes supplement these checks; they
do not substitute for campaign completion or browser inspection.

## Campaign and optional pocket

`output/mechanics_campaign/REPORT.md` records seed 1729, all 24 stages in canonical order,
and final phase `campaign_complete` at stable ID 15. The run carries its actual score and
three lives through each transition, without retries or resets: score 327950, zero damage,
935.733 playing seconds, 2549 shots, 509 hits, 207 eroded tissue cells and one natural merge.
No optional pocket opens in that campaign path.

The controller reads live state and plans on cloned states, issuing ordinary left/right/fire
inputs. It does not replace live state with a prediction or alter health, clocks, objectives,
geometry, hazards or score. This is state-aware assisted reachability, not novice difficulty
or enjoyment evidence. The independent replay performs no planning and deeply compares each
stage's recorded metrics, input ticks, IDs, final state and complete final-source hash map.

Stage 9 / stable ID 7 is separately exercised in practice: 48.083 playing seconds, 207 shots,
14 hits, 45 eroded cells, one breach, two released targets, zero damage and three lives.
The opening is reached through ordinary inputs; the full practice trace is independently
replayed. Unopened pockets remain optional campaign encounters.

The recording and replay hash manifests explicitly preserve two presentation-only source
updates: paused projectile interpolation and expired maintenance wording, plus the exact
reporting-only `src/difficulty.ts` change from "human inspection" to "reviewer inspection".
Reverse replacement restores that file's recorded hash; it changes no gameplay behavior.
The initial strict all-source replay guard rejected the presentation drift. The bounded exception in
`output/mechanics_campaign/presentation-source-update.json` retains recording and final hashes;
all other source hashes must match, and both final replays assert the complete 30-file final map.
Final integration independently confirms those maps and matching source hashes for all 22
modules embedded in the production bundle. Refreshed layout enumeration in
`output/mechanics_layout/enumeration.json` covers all 24 placements, including stage 6's final
merge budget of one. This enumeration is authored-layout proof rather than ordinary-input play.

Reproduce the saved evidence from the repository root:

```bash
npx tsx output/mechanics_campaign/probe.mjs
npx tsx output/mechanics_campaign/replay.mjs
npx tsx output/mechanics_campaign/probe.mjs 7
npx tsx output/mechanics_campaign/replay.mjs 7
node output/mechanics_campaign/report.mjs
```

These scripts and their JSON summaries, inputs and verification manifests are local evidence
under ignored `output/`; this repository report preserves their result and interpretation.

## Rendering and captures

The actual production UI is sampled across all 24 starts and four viewports. Final rendered
details are recorded in `output/mechanics_visual/REPORT.md`: 1440x900, 1024x768, 390x844 and
844x390, under `/plaque-attack/`, without console/page/network errors. A version-1 save fixture
unlocks practice; starting all stages through that UI is distinct from campaign completion.
Controlled states that expose rare collisions, merges, maximum density or pending releases
are fixtures and remain distinct from ordinary-input play.

The initial gallery uses production bundle SHA256
`c435c057099ff8973f1f81f92628e8e3aaf3be7dc54ec3843a1cd6a67ab910f8` (74718 bytes).
After the two presentation fixes, affected pause/warning captures use the final bundle below;
the original all-stage gallery is not relabeled as final-bundle coverage. The optional probe
route adds only a runtime reference/event observer in memory, leaving gameplay state and input
unchanged. Ordinary-input evidence shows tissue carving at stages 4 and 14, floor following at
stage 5, a natural merge at stage 6 (tick 562 / 9.366667 seconds in the photographed run), and
stage 9 pocket breach at tick 87 followed by both releases at tick 132 after the 0.75-second
warning. Stage 24 ordinary play exercises erosion, spawns and maintenance awards.

All 27 reported automated accessibility samples detect zero violations. The 24 initial samples
include 19 with an unresolved serious `color-contrast` incomplete result. Saved entries identify
rule/impact only,
so the affected elements and cause remain unknown. Additional mobile pending-state checks also
detect no violations. Zero violations does not certify all contrast pairs, canvas content or
full accessibility conformance. Rendered readability inspection is a separate lane.

`output/mechanics_visual/final-refresh.json` identifies the final production JavaScript as
74746 bytes, SHA256 `7ea216024c126456ff14d781e5315d15c6e71a8f2dbb7ee956408f4159760b00`.
Its refreshed warning, pause and pending-pocket layouts fit the sampled viewports.
`output/mechanics_visual/profile.json` records Chromium 156 on macOS arm64, Apple M4 Max,
36 GB RAM and DPR 2. The controlled stage-24 floor/tissue/pocket fixture holds 32 tiny
platelets and five shots, beyond authored maintenance density, with real collision effects.
After 120 warmup frames, each motion setting samples 600 frames: normal 59.7 rAF FPS,
reduced 60.0 FPS, combined simulation/render CPU p95 1.4 ms for both, and zero app errors.
Fixture refill is measured separately from combined CPU. Three normal-motion frames exceed
25 ms; no combined CPU sample exceeds 16.667 ms. The earlier approximately 60 FPS baseline
had different geometry and a 0.2 ms CPU p95; these observations show no sustained cadence
regression on this setup, without asserting equal CPU cost or universal hardware results.
The profile imports current source into an output-only harness; it does not execute the
production bundle. Long mobile briefings use native vertical scrolling, and their visible
start buttons successfully enter play. No horizontal scrolling or added jump control appears.
An ordinary-input stage-24 attempt completes in both mobile sizes with two lives; it does not
reach the expired-but-unsafe state, so the new expired warning has focused-check evidence only.

Browser reproduction uses `node output/mechanics_visual/accept.mjs`, then the sibling
`supplement.mjs`, `finish.mjs`, `final-refresh.mjs`, `profile.mjs` and `expired.mjs` scripts with
`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers`. The production
browser-suite result is preserved in `/private/tmp/plaque_mechanics_browser_final.log`.

The refreshed README images are [screenshots/main_menu.webp](screenshots/main_menu.webp) and
[screenshots/tissue_carving.webp](screenshots/tissue_carving.webp), refreshed from a 1280x800 viewport.
The menu includes its complete page; exact image sizes are in
[screenshots/manifest.json](screenshots/manifest.json). The latter is
actual Stage 4 practice using the screenshot harness, with readable carved tissue and three
lives. The managed README screenshot block remains owned by its capture workflow.

## Review and limits

S1-S5 specification and quality reviews pass. Fresh final integration review accepts source,
runtime, final hashes/replays, refreshed layouts, production identity, browser journeys,
rendered evidence and the explicit accessibility limitation. S6 acceptance and S7 records are
complete. Current status is tracked in
[organic_expansion.md](active_plans/active/organic_expansion.md).

Automated completion establishes mechanical reachability. Agent inspection and sampled frame
timings establish the observed browser behavior on the tested setup. They do not establish
novice ease, every player's enjoyment, universal device performance or actual audio listening.
Optional future player feedback may inform tuning and is not a completion dependency.
Local acceptance and static build generation do not establish external deployment.
