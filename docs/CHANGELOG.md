## 2026-10-23

### Core interaction design

- Document the implemented chronological contact and swept-path contract, including authored orbit
  until first physical impulse, persistent free-fluid velocity, and speed-preserving reflections at
  walls, ceiling, and curved floor. Record aspirin's safe three-piece fan, break-and-sweep help,
  positive-score audio feedback, and weapon-aware workload estimates. Browser acceptance and fresh
  reviews remain pending.

### Gameplay exploration

- Start an adaptable creative gameplay exploration for fun-first memorable stages, medical actions,
  authored mechanic combinations, and visible world restoration. Keep shelter carving and the
  no-merge-on-break rule in view; use focused actual-control experiments to select and expand the
  strongest direction. See [gameplay_creative_evolution.md](active_plans/active/gameplay_creative_evolution.md)
  and [gameplay_creative_evolution_ledger.md](active_plans/reports/gameplay_creative_evolution_ledger.md).

### Decisions and Failures

- Reject prototype 1 acceptance after ordinary target ID 21 reached speed 37,745 at 11.9 seconds and
  extended target ID 8 followed a crash path. The cause was inverse-orbit-slope rephasing near a
  turning point; physical impulses now enter persistent free-fluid motion. The prototype's aspirin
  fan also cleared stages nearly instantly, prompting a safe three-piece spread correction. Runtime,
  browser, and review gates remain open; these failures do not establish a final verdict.

- Complete the selected three-encounter finale: display 12 (stable ID 20) earns the left-current
  baseline at x=320 after phase one; the manual right switch at x=640 overrides it for four seconds,
  then the left baseline resumes during cooldown. Display 16 (stable ID 22) uses the center switch
  at x=480 to gather the right current at x=780 for safe retrieval of the left shield at x=132.
  Display 24 (stable ID 15) earns the right baseline at x=640 after phase one, with an optional
  left-current override at x=320 for player-directed positioning/crossing before the right
  baseline resumes for a saved last-fan flush. Preserve display 12's three phases, display 23's
  original 25-second shift and ordinary maintenance structure, and runtime/save schemas. The
  existing HUD badge now reports gathering through cooldown. Remove the display-23 seam after
  bounded play found no attainable useful seam payoff and surplus
  device/instruction; reject the display-5 concept for discovery load. Actual-control evidence
  includes display 12's 58.6-second ordinary clear (three lives) and risky optional override route;
  display 16's 20.82-second shield-retaining clear (three lives); and display 24's ordinary clear
  plus reproduced saved flush at 23.4 seconds on refreshed real-mobile-RAF capture (three lives,
  shield retained). Route details and
  limits are in the [creative evolution ledger](active_plans/reports/gameplay_creative_evolution_ledger.md).
  The final code check passes 99 Node tests, TypeScript, lint, format, and distribution build. A
  prior full 25-test Playwright run passed; after final rollback, focused 20-test and final 5-test
  runs passed. Source/spec and quality reviews accepted the final configuration, including fresh
  HUDP2 review. The completed plan records its narrow recovery-illustration refinement, refreshed
  source/build identity and visual review, and integration assessment. No human enjoyment or
  usability claim is made.

- Apply the bounded `patient_recovery` rendering refinement: use a center-out organic mask and
  warmer shading on the unchanged physical walls. The latest TypeScript, lint, format, 99 Node
  checks, and 133.8 kB distribution build pass. The refreshed route receipt records stable
  source/distribution identities with no browser errors or overflow. The visual comparison favors
  the organic refinement. Fresh earned-clear capture, bounded-renderer source/spec and quality
  reviews, and gameplay integration acceptance are recorded; sampled agent routes do not establish
  human enjoyment or usability. See the creative-evolution ledger.

### Behavior or Interface Changes

- Record six scoped gamewide contracts: same-patient continuity through earned results; distinct
  split and terminal-hit forms; full-world presentation; stage-13 clopidogrel reacquisition; an
  event-grounded damage-cause sentence; and the existing early-maintenance time-saved/mastery-bonus
  sentence directly below its result title. Retry clears transient cause feedback naturally. Preserve
  practice recovery, simulation and save schemas, existing controls, and authored target workload as
  specified in
  [GAMEWIDE_CONTINUITY_READABILITY.md](active_plans/active/GAMEWIDE_CONTINUITY_READABILITY.md).

- Record the settled player-owned seam contract: only projectile erosion triggers the pulse, and
  target contact reflects while preserving the shootable seam. Select display 18 for the existing
  current-to-seam composition, retain weapon-only completion, and leave display 24 unchanged.
  Complete the deliberate two-target payoff, ordinary/early-spent completion and retry checks;
  move device action/state cues into the existing readable HUD with matching arena symbols.
  Correct the phone font override and faithful canvas test fixture; source, quality, browser and
  responsive acceptance pass within the documented bounded scope. See [GAME_SPEC.md](GAME_SPEC.md),
  [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md), and
  [GAMEWIDE_PLAYFUL_PAYOFF.md](active_plans/active/GAMEWIDE_PLAYFUL_PAYOFF.md).

### Earned maintenance mastery

- Add an optional early finish to the three maintenance stages for six seconds of damage-free
  control at or below half the safe hazard maximum, available after the midpoint and any actual
  shifted-stream spawn. Preserve the ordinary timed clear and make the reward match full-duration
  survival scoring without counting unplayed time as survival.
- Show progress, threshold, `Flow restored`, and actual time saved through the existing HUD and
  result flow. Record the design basis and evidence limits in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

### Lipid merge briefing

- Clarify that lipids of matching sizes can merge when they collide.

### Lipid collision feedback

- Gate merges on new approaching contact entries between floating plaques, with separation required
  before another roll. Split or break events never trigger merging. Remove split-size and fuse-split
  callouts while retaining hit and merge feedback.
- Update the game specification and design record with insertion-overlap, sticky-hold, cooldown,
  and contact-latch behavior. Correct tick-end contacts to use terminal-segment velocity, with a
  regression test for a multi-segment path; fresh quality review accepts the correction.

### Early tool pacing

- Keep display 1 and the stable ID order, introduce aspirin at display 2 and clopidogrel at display
  3, and use later chapters for mastery and combinations. Name chapter 1 First Response. Preserve
  the README 2x2 screenshot gallery and record the adopted reduced-pressure introduction rationale
  in design decisions; preserve the player's frustration quote in human guidance.
- Correct platelet-only stages 16 and 2 to use disabled merge configs, preventing a misleading
  lipid-merge briefing while retaining the shared merge rules. Specification and quality reviews
  accept. Corrected-build actual-control samples clear display 2 in 7.283 seconds and display 3 in
  1.083 seconds, each with three lives; the display-3 route fires one clopidogrel projectile, then
  no more, before clearing all three targets. A stage-2 contact-loss retry clears in 5.8 seconds with
  aspirin and three lives, but that route is from the prior build. Display 4 clears in 63.0
  seconds with one life; a
  lookahead-assisted keyboard route clears both display-6 finale phases in 102.433 seconds with
  three lives. These routes establish sampled reachability, not unaided performance. Focused
  campaign, arena, and difficulty tests plus TypeScript, scoped ESLint, and scoped Prettier checks
  pass after the merge correction; 81 Node tests were also rerun after it. The earlier 24-test
  browser lane and 1,395-pytest full check predate the correction, so no full-suite or full-browser
  pass is claimed for the corrected build. Specification, quality, and final integration reviews
  accept within the sampled scope. See the active plan and `output/early_weapons/` for evidence
  limits; no human playtest or universal clearability claim is made.

### Additions and New Features

- Reorganize the README screenshot gallery into a clickable 2x2 grid, reusing four current
  documented views for surgeon choice, campaign gameplay, tissue carving and patient recovery.

- Start an anatomy polish pass for the six surgeons. The active plan begins with proportion studies
  and renderer constraint inspection, then covers the twelve editable idle and victory assets,
  integrated browser review, regression checks, local build, and refreshed documentation proofs.
  The manager and independent study assessment selected Maya's 10% and Jules's 25% larger-head
  studies, connected arm-first sleeves with compact gloves, and bespoke scales for the other four.
  Astra delivered all twelve roster SVGs and the active landing-page surgeon, preserving face and
  leg geometry, source anchors, and palette while adding connected arm anatomy and varied uniform
  details. Independent visual review and integration accept the corrected full-body lineup and
  sampled production rendering. The focused browser suite passes 9 tests; TypeScript, lint,
  formatting, 80 Node tests, and 1,394 pytest tests pass. Thirteen managed quality-90 WebP
  screenshots are refreshed. Source, review, integration, and delivery evidence is recorded in
  `output/surgeon_polish/ART_HANDOFF.md`, `output/surgeon_polish/final_visual_review.md`,
  `output/surgeon_polish/integration.md`, and `output/surgeon_polish/delivery/REPORT.md`.

- Author the gameplay-variety introduction across stages 4-6 and the local clearance seam at
  stage 9, with selected seam returns later. Update current specification and design records for
  sticky, heavy, unstable and pulse behavior; calculate heavy workload from its three tiny
  children and label unstable scoring and pulse benefit as bounds. The completed plan records the
  authored content, source-derived metrics, bounded integrated play evidence and remaining
  evidence limits in [gameplay_variety_plan.md](active_plans/active/gameplay_variety_plan.md).

- Record the initial gameplay-variety gates and actual-control assessment: specification review
  ACCEPT after a sticky/tissue motion correction; quality review ACCEPT; build
  `7ae15fbcf1d94fd759e0477a004cbe83db7cf103a55a7747e9a87502aad50bc0`; TypeScript, ESLint,
  Prettier, 80 Node tests, 1,391 pytest tests and 25 browser tests pass. Actual-control play finds
  useful stage-9 pulse removal on desktop/mobile and successful retry, but stage 24 spends the
  pulse on initial small targets before tiny targets arrive. Then change two existing stage-24
  right-side targets to tiny targets, placing the outer target at (940, 440) without changing
  target count, phases, or total authored hazards. On corrected build
  `f64a28d20b61c97cbd3b7b8af111ff554afcbb5d03850365d3caaaf13eba41b2`, ordinary rightward input
  causes incidental seam erosion and one 250-point removal with three hazards and all lives
  remaining. Fresh integration accepts within sampled scope. The corrected build passed TypeScript,
  the affected nine Remix/campaign tests, and exact-build play; the 25-test browser run remains tied
  to the initial build. Stage 18, deliberate shot activation, fuse expiry, and human enjoyment
  remain unobserved. The active plan is complete with its evidence limits recorded in the local
  gameplay-variety closeout report.

- Implement the stage-1 intercept guide as a persistent tip, static floor chevron, and latched
  nearest-target outline with an approximate 0.8-second horizontal lead. It does not auto-move or
  fire and does not change simulation behavior. Show zero remaining after completed maintenance,
  preserve the active countdown ceiling, and raise essential HUD text to 12.8px with narrow-screen
  layout adjustments. Source, repository, build, all 25 browser tests, and the 1,373-test pytest
  suite pass. Final integration accepts the bounded delivery. G5 remains Concern because the
  passive-center route still has a 15.433s maximum hit gap, while cue-following is much faster in
  the sampled run; G6 and U5 are Meets. Evidence and status are in the
  [archived plan](archive/playtest_improvements_plan.md) and
  [independent reassessment](active_plans/reports/playtest_improvements_reassessment.md).

- Add separate gameplay and usability rubrics and record a bounded agent playtest against the
  current build in [PLAYTEST_RUBRICS.md](PLAYTEST_RUBRICS.md) and
  [PLAYTEST_RESULTS.md](PLAYTEST_RESULTS.md). Findings retain categorical ratings, exact
  evidence links, unobserved criteria and sample limits; they do not claim human enjoyment.

### Decisions and Failures

- Record six gamewide contracts and the authoritative 960x540 (16:9) world in
  [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md): patient continuity, distinct hit outcomes, full-world
  presentation, stage-13 reacquisition, transient cause-specific retry guidance, and earned-result
  hierarchy.
- Complete the six implementation tracks and record actual-control evidence, final bundle hashes,
  measured viewport limits, and evidence boundaries in
  [GAMEWIDE_CONTINUATION_LEDGER.md](active_plans/reports/GAMEWIDE_CONTINUATION_LEDGER.md). The five-contract baseline passed fresh specification, quality, and integration review. Fresh specification, focused quality, and integration reviews accept all six contracts on the final
  build. The sixth result-hierarchy change is accepted on its scoped checks; the baseline suites are
  recorded separately.
- Add a six-report ranked-opportunity reassessment to the ledger. Fresh integration confirms every
  disposition, inspects the practice-result hierarchy at phone and desktop sizes, and records the
  stop decision.

### Developer Tests and Notes

- The five-contract baseline passes both TypeScript configurations, ESLint, Prettier, 94 Node tests,
  and all 25 browser tests (4.1 minutes, zero failures). Focused hygiene passes 18 explicit files for
  Latin-1 encoding, BOM/CR absence, trailing newlines, line limits, and local Markdown links. Served
  and on-disk hashes and the 37-module source map match; the renderer comment-only change has an
  identical esbuild transform. For the sixth UI-only contract, fresh scoped TypeScript, ESLint, and
  Prettier checks pass, and the actual Stage 23 practice-result route confirms the promoted sentence
  at desktop and 390px portrait. The baseline 94/25 suites were not rerun for that change; no full
  pytest claim is made.

## 2026-10-22

### Additions and New Features

- Give stage 23 a forecast right-side entry shift at 25 seconds of its existing 50-second
  maintenance objective. Preserve pending warnings and switch state; offer crossing to gather
  or staying left to carve shelter. Add static world/HUD cues and include the optional shift
  in descriptive difficulty-report patterns. Actual-input routes complete both choices with
  normal/reduced motion; stage 23 failure/retry and adjacent stage 22/24 practice smokes pass.
  Final integration accepts all milestones. The source gate, full repository pytest, and browser
  suite pass; human enjoyment remains untested.

- Author the complete 24-stage remix in stable order, preserving the first three stages. Add
  shootable four-second currents with shared six-second cooldown, six optional support caches,
  four finite phase finales and distinct earned artery/flow/lining/patient restoration.
- Add original editable flow-switch, support-capsule and restored-flow SVGs; integrate bounded
  event feedback and muted-by-default audio while preserving the six cosmetic surgeons.

- Show patient recovery directly after each successful stage, following Bad Cell Day's
  inline completion presentation. Preserve the surgeon close-up, emphasize the cleared route,
  and keep the next-stage action direct. Practice shows saved recovery without changing it.
  Verify 51 source tests and all 19 browser tests across two runs, inspect desktop/mobile real-clear
  captures, and probe the first five result states plus replay, practice, defeat and final
  completion. Add the current result image to [CLEAR_FLOW.md](CLEAR_FLOW.md).
  Tighten landscape spacing so recovery and Next both fit at 844 by 390.

- Lower tissue shields to a small clearance above the surgeon's head, following the local
  floor height. Make the arch underside shallow to reduce the space where lipids can circulate
  beneath cover. Preserve the central firing lane and separate optional membrane encounters.
  Verify all 51 source tests, 19 browser tests, and rendered flat/sloped cover with actual
  firing and erosion probes; refresh the thirteen managed documentation screenshots.

- Give the landing illustration explicit, isolated background and foreground layers in response
  to a report of clipped lipid artwork. Preserve the composition and SVGs; verify Chromium and
  WebKit at desktop, mobile and Retina sizes. The exact reported clipping was not reproduced
  locally, so confirmation in the affected browser remains outstanding.
- Follow up on the persistent Firefox 158.0.1 clipping report by simplifying the hero to a
  single container rotation. Remove decorative child rotations and drop-shadow filters,
  preserving artwork positions and sizes. Clean-profile Firefox renders both versions, so
  this is a targeted mitigation rather than a demonstrated reproduction-and-fix.

- Zoom in on the selected surgeon after a successful stage. Preserve the final pop, frame the
  whole figure, then play the victory gesture at close range before results. Use a static
  close-up with reduced motion and freeze the camera when paused. Verify both real-clear
  browser journeys, 50 source tests, and all six surgeons at center and edges in desktop/small
  viewports. Refresh all thirteen managed documentation screenshots from the rebuilt game.

- Replace the stent's crossed lattice with rounded metal rings and curved links. Carry the
  flexible tubular form into implanted artery artwork and the shared Canvas wall decoration.
  Verify XML, native-size renders in three scenes, 50 source tests and the focused browser
  firing/pause test. Rebuild locally and add a before/after artwork comparison.

- Rework the six surgeons as original scientist-inspired individuals across age ranges, with
  distinct facial structures, silhouettes, personal interests, ergonomic tool housings and
  hobby-linked victory gestures. Replace generic personality labels and tune cosmetic rhythms;
  preserve the chooser layout, stable identities and equal gameplay abilities.
- Introduce an explicit first-run surgeon choice before stage 1 and remember the player's choice.
  Keep character switching available through the existing chooser and Settings. Verify 50
  source tests, 19 browser tests, native-size Canvas rendering and all thirteen refreshed WebPs.

- Refresh all thirteen documentation screenshots from the current game as quality-90 WebP.
  Correct the README's stale surgeon chooser image and links across the documentation; remove
  replaced PNGs. Add a repeatable capture command and provenance manifest, including explicit
  staged recovery/unlock labels. Verify the live site's core build and sampled artwork match
  the local build, and remove the stale README deployment notice. Capture-tool fixes remain
  separate from game behavior; no production gameplay changes are required.

- Restore **Plaque Attack**, the user's intended rhyming title, in the menu, browser title,
  metadata, Canvas fallback and current product documentation. Preserve historical old-name
  records, repository URLs and saved-data keys.
- Establish the lean [ART_DIRECTION.md](ART_DIRECTION.md) identity brief and
  [active_plans/active/art_identity.md](active_plans/active/art_identity.md) delivery ledger for
  twelve surgeon SVGs, six artery scenes and cardiac recovery art. Source/specification review
  accepts the corrected artwork; independent quality and final integration reviews also ACCEPT.
- Give the six cosmetic surgeons distinct character concepts, larger chooser portraits and
  personality copy; add individual idle/victory cadences with static reduced motion. Revise
  six artery illustrations and the renderer's organic frame/floor presentation, retaining
  authoritative gameplay geometry and carved lanes.
- Correct the first enlarged chooser's desktop height regression with a three-column,
  two-row horizontal-card layout: 960x597.30 instead of 960x686.45 at 1280x800, retaining
  100x120 portraits, visible personality copy and fixed narrow-screen actions.
- Replace near-identical recovery busts with five poses from seated rest to purposeful activity;
  retain the heart/map alignment, route IDs and existing restored-territory overlays. Record
  actual user guidance separately from the forwarded art commentary used as design input.
- Record fresh art-pass verification: 49 source tests, local production rebuild, 32 SVG
  source/build parity checks and the final integrated capture probe pass. The full browser run
  has 16 passes and two stale-copy assertion failures; the corrected affected rerun passes 2/2.
  Publish durable local roster, staged recovery and real-game before/after images in
  [ART_DIRECTION.md](ART_DIRECTION.md); retain failed harness proof separately. No deployment.

- Add [FUN_SURVEY.md](FUN_SURVEY.md), a source-grounded survey of eleven neighboring games,
  with ranked future ideas and explicit evidence limits. Present the existing hit streak,
  exact 5/10-hit milestone cues, optional sound, and actual awarded points. Keep existing scoring
  and balance. Record the real-game screenshot and delivery evidence in the survey.

- Keep every popup heading and action row outside its scrolling content. Widen ordinary desktop
  dialogs to at most 900px and cap height at 560px or the available viewport. Consolidate surgeon
  chooser actions into the shared footer, and retain the 16:10 game arena. Record the measured
  improvement and screenshot in [DIALOG_LAYOUT.md](DIALOG_LAYOUT.md).

- Expand later-stage terrain with broad basins (10/23), central shelves (14/24), and an
  off-center shoulder (17). Keep smooth automatic movement and existing slope/relief limits.
  Add brief terrain cues and a geometry-aligned surface highlight with deeper tissue shading.
  Record real game captures and bounded verification in [FLOOR_VARIATION.md](FLOOR_VARIATION.md).

- Enable lipid merging across all six intervention stages, with rising 5%-25% contact chances,
  longer opening cooldowns and finite 1-5 success budgets. Correct the earlier agent-imposed
  stage-6-only restriction and its mistaken attribution to human guidance. Keep platelet rules intact.

- Add [CLEAR_FLOW.md](CLEAR_FLOW.md) with the clear-to-next-level task model, keyboard
  press/release safety, visible victory contract and runnable acceptance ledger. Record the
  user's keyboard/celebration request and the settled presentation/input design.
- Document contextual Enter/fresh-Space continuation, separate briefing activation, inline route
  restoration and the pop-then-victory interval. Inventory six editable victory assets and their
  actual local art references. Fix short-landscape briefing/result hierarchy after capture exposed
  hidden primary actions; publish the actual final-pop/victory/result montage and targeted
  keyboard, motion, focus and contrast evidence in [CLEAR_FLOW.md](CLEAR_FLOW.md).

- Add [REQUEST_REVIEW.md](REQUEST_REVIEW.md) to trace recorded requests to source, tests and
  artifacts, identify concrete documentation gaps and track fresh autonomous acceptance.
- Reconcile the historical 15-stage ledger's pending probe/integration wording with its already
  accepted Batch 4 evidence, preserving the actual BFCache-restoration limitation.
- Record the current-stage list cue and short-screen surgeon chooser footer decision, and point
  earlier roster acceptance to the subsequent review build without rewriting historical hashes.
- Refresh the three README captures against the review build and verify the chooser's visible
  title/Done action, six pointer/keyboard choices and preserved Settings layout at four viewports.
- Complete the prior-request review with 47 passing source tests, a clean 12-test browser run,
  223 documentation checks and fresh specification, quality and final integration acceptance.

- Refresh README surgeon-roster, eight-route demonstration recovery, and actual stage-4 tissue
  carving captures against the final compact-popup/16:10 build. Keep the historical menu image
  for its earlier mechanics-evidence reference. All three refreshed PNGs are under 300 KB.

- Add six original cosmetic surgeons, saved appearance selection, and a stable-ID patient recovery
  map. Campaign clears restore routes once; practice remains unranked and does not heal the map.
  Add V3 recovery persistence with conservative V1/V2 migration and intact unknown save data.
  Final integration evidence is tracked in [RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md).

- Put the confirmed live GitHub Pages game near the README opening, address gamers and biology
  enthusiasts, and make browser play the first quick-start path before local development setup.

- Integrate erodible tissue, all-shot solid blocking, reflected fluid paths, automatic floor
  following, optional warned membrane releases and bounded same-size plaque coalescence. Introduce
  them at stages 4/5/6/9; keep the first three stages and stage 6's four large plaques intact.
  Complete S1-S7 with accepted fresh specification, quality and final integration reviews.

- Integrate the 24-stage, four-chapter expansion in canonical stable-ID order, with nine new IDs,
  authored entry cycles, version-2 save migration, and separately labeled classic/expanded records.
- Add six original scene SVGs, six editable lipid SVGs, renderer-selected visual variants, and six
  optional medicine cards. Keep weapon compatibility and plaque/platelet identity unchanged.
- Accept the expansion plan, difficulty rubric, and art direction contracts; add config-derived
  difficulty reporting and focused behavior coverage. Record the fun-first, easy-opening and
  fluid-body human guidance.
- Complete A0 shared contracts and Batch 1 foundation for the 15-level Plaque Trouble campaign.
  Batch 1 passed TypeScript, repository checks, GitHub Pages build, and one Playwright smoke test.
- Start Batch 2 presentation and utility work with separate renderer/assets, shell/style, and
  runtime utility owners. The game remains in progress; simulation and full-campaign acceptance
  are still pending.
- Complete fresh `foundation_spec` and `foundation_quality` reviews of `constants`, `characters`,
  and `game_state`; both accepted with no findings. Batch 2 SVG assets, renderer loading, and
  utilities are written and compile, while shell styling remains in progress.
- Pass all four Batch 2 gates: TypeScript, `./check_codebase.sh`, build (exit 0), and Playwright
  (1 test, 779 ms). The fresh `batch2_spec` review found rapid invulnerability flash and missing
  implanted stents for acts 2 and 3; renderer correction and review are required before Batch 3.
- Resolve the renderer findings: corrected Batch 2 gates pass, including Playwright (1 test,
  802 ms); fresh renderer spec rereview and Batch 2 quality review accept the result. The outline
  alpha pulse is allowed because the sprite remains opaque. Start Batch 3 simulation and integration
  for all 15 levels; reserve durable tests and full-campaign proof for Batch 4.
- Pass 6 focused browser journeys (26.5 s) and 13 Node tests. An ordinary-input campaign run and an
  independent replay each reached all 15 levels (score 298500, 3 lives, 691.95 s); record this as
  mechanical reachability evidence only. Fresh Batch 3 spec review identified residual labels,
  final audio, and generic group markup for repair; viewport and UI/UX reviews remain active.
- Accept the fresh final spec review with no source blockers; refreshed replay evidence matches all
  9 hashes. UI/UX review passes 22 AXE checks with zero violations, 12 geometry checks across 6
  viewports, and 21 contrast pairs. TypeScript, repository checks, and build pass; the default
  browser run failed 4/6 during parallel build network bootstrap and is being rerun. Final quality
  review is checking BFCache lifecycle, so final acceptance remains open.
- Pass the stable six-journey browser rerun (27.4 s) with Playwright workers bounded to 2 after
  failures were reproduced against stable output and traced to Python server backlog; no assertions
  changed. Production subpath checks loaded all seven SVGs plus CSS/JS and completed movement, split,
  and score actions without errors. Final quality found a persisted `pagehide` BFCache lifecycle
  defect; a synthetic persisted event reproduces it, while actual BFCache restoration is unavailable
  in headless Chromium. The correction and quality disposition remain pending.
- Release the persisted `pagehide` lifecycle correction and accept it in fresh quality review. An
  isolated runtime probe and final gates remain before fresh final integration review; actual BFCache
  restoration is still unavailable in headless Chromium.
- Pass final TypeScript, repository, build, and six-journey browser gates after the lifecycle fix;
  the persisted-event runtime probe and fresh quality review pass. Complete README screenshots with
  two PNGs and `tools/capture_readme.mjs`; repository check reports 39 documentation checks passing.
  Explicit stress profile passes with 32 platelets, 5 shots, and 600 frames: about 60 rAF FPS and
  0.2 ms combined step/render CPU time p95, 128 hits, and zero errors on an Apple M4 Max. This is a
  stress fixture result, not an organic campaign state or universal hardware claim. Fresh final
  integration review then accepted with no blockers; all planned implementation gates are complete.
- Ignore generated `output/**` files in consumer-local `eslint.config.local.js` after generated
  artifacts initially failed lint. Keep source lint rules active.

### Behavior or Interface Changes

- Use a bounded rounded analytic orbit for plaques, sharing position, derivative and inverse
  across motion, creation and difficulty exposure estimates while preserving platelet motion,
  bounds, period, levels and controls. Matched no-fire observations reduce floor-band dwell and
  travel by 17.4% flat and 14.4% wavy; adaptive pacing is mixed. Fixed-center stage-1 held fire
  clears both variants in 32.62 seconds with three lives. The scoped experience review accepts
  the trial. Final integration accepts the current source; source checks (70 tests), full pytest
  (1,344 tests), the local build and all 24 browser checks pass.
  Refresh all 13 managed screenshots as WebP at quality 90 (647,202 bytes) from the candidate build.

- Make failed-stage retry primary: same entry seed and score, three lives, one-second ready,
  fresh input and a run retry count. Failure records nothing; completion or confirmed intentional
  departure finalizes once. Preserve old saves in version 4 with five records per edition.
- Persist recovery and next unlock at terminal clear before celebration, including the final
  completed record. Keep practice separate from campaign recovery and ranking.
- Alternate late maintenance with finite breathers, give stage 18 guaranteed piercing, show
  current/shield/phase status when relevant, and use a HUD sidebar in short landscape play.

- Present the fixed 960x540 world in a 16:10 play viewport with centered organic margins and
  uniform scaling. Compact the recovery popup into a responsive two-column view and bound dialogs
  to the viewport.

- Reduce stage 4/5 plaque work to 25/37 hits and speed to 0.75/0.85, preserving the first three
  stages and stage-6 capstone. Sync README, game specification, rubric, art direction, decisions
  and delivery ledger; retain earlier 24-stage evidence as historical after this tuning.

- Freeze paused projectile presentation and explain committed pocket releases after the
  maintenance timer reaches zero. Refresh the two README captures with the current menu and
  actual tissue-carving practice, and record distinct proof lanes in
  [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md).
- Replace ballistic target motion with deterministic lateral drift and smooth vertical circulation.
  Use a shared 24-unit wall inset, gentle first-three-stage work/speeds, and 40-60-second maintenance
  rounds. Tutorial copy now describes drifting hazards.
- Refresh README, GitHub setup, current game specification, decisions, and expansion ledger for the
  expanded source contract. Keep 15-level acceptance evidence explicitly historical.

### Fixes and Maintenance

- Correct campaign victory to "Circulation restored!" and finite act-three stage/practice clears
  to "Stage cleared!"; reserve maintenance wording for maintenance objectives. Separate the
  short-landscape HUD status content from Pause so a persistent control can own its own row.

- Restore ordinary drift magnitude when a current expires. Separate first-phase occupancy,
  all-phase work and maximum-phase density in difficulty reporting; count support shells once.
- Refresh canonical gameplay, difficulty, art, retry/save and README contracts for the remix;
  label older evidence and screenshots by snapshot rather than asserting current acceptance.
- Mark `devel/report_difficulty.mjs` executable to match its Node shebang and CLI usage.

- Synchronized shared style guides, tests, and repository support files from the starter template.

### Removals and Deprecations

- Supersede the unapplied higher-bounce novice experiments with the fluid-motion direction.

### Decisions and Failures

- Use a `LevelId` union paired with a `Record` for complete level configuration while avoiding an
  import cycle. See [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).
- Add meaningful Playwright coverage after the initial TypeScript check found TS18003 due to the
  absence of tests. Move Playwright output to `output/playwright`; root `test-results` was untracked
  and not ignored.
- Install the toolchain using a task-specific npm cache because the default cache was root-owned;
  keep Playwright browser binaries under `/private/tmp`.

### Developer Tests and Notes

- Close M0-M4 and archive the remix campaign plan after independent integration ACCEPT.
  Preserve the complete original 24-stage actual-input route and its V4 record, unchanged
  gameplay/runtime/artwork hashes, final UI acceptance, and capped final-build 22-clear replay
  as distinct evidence. The rendered final-result fixture establishes presentation only.
- Refresh all thirteen managed quality-90 WebP screenshots and provenance manifest against the
  stable remix build; capture reports no browser errors. Full source checks pass 64 Node tests.
  Full browser regression and actual-input campaign evidence remain separately tracked below.
- Canonical documentation checks pass 493 tests across Markdown links, guidance format, ASCII
  compliance and source-file line limits using the repository Python environment.
- Track remix focused checks, fresh full suites, browser completion, rendered review and screenshot
  refresh separately in
  [active_plans/reports/remix_execution_ledger.md](active_plans/reports/remix_execution_ledger.md).
  Authored content and owner-level probes retain their limited scope; final integration accepts
  the combined evidence recorded there.

- Close the request-review documentation gap with a latest-delivery appendix in
  [REQUEST_REVIEW.md](REQUEST_REVIEW.md). Index clear flow, terrain, compact dialogs, the current
  six-lipid merge curve and the completed fun survey while preserving earlier test/hash receipts
  as history. A fresh package audit confirms 32 source/dist SVGs, in-memory bundle/map parity and
  Chromium startup under `/plaque-attack/`; prior 49-source/18-browser passes are retained evidence.
  All 227 focused documentation checks and `git diff --check` pass. This bounded closeout changes
  documentation only and makes no deployment claim.

- Streak feedback passes 49 source tests, the production build, and all 18 browser journeys.
  Runtime review found narrow-screen lives overflow and a collapsed arena after stage transitions;
  correct the owning arena grid row and mobile HUD, add a browser arena-extent guard, and
  strengthen the reduced-motion position oracle. Refreshed captures at three viewports pass
  containment and transition checks, with stationary reduced-motion feedback and frozen paused
  canvas/HUD. A mock audio probe verifies milestone scheduling and mute/pause cleanup; audible
  quality is untested. All 227 focused documentation checks pass. Fresh specification, quality,
  and final integration reviews accept the delivery with no blocking findings; retain evidence
  limits in [FUN_SURVEY.md](FUN_SURVEY.md).

- Compact dialogs pass 47 source tests, 17 browser journeys, 226 documentation checks and the
  Pages build. Measure seven popup actions and the 16:10 arena at four viewport sizes; all
  28 actions fit. Add three behavior tests covering internal scrolling, keyboard dismissal,
  repeated Settings feedback and pause/resume. Record actual before/after Settings captures.

- Floor variation passes geometry sweeps across all 24 layouts, including four hazard sizes,
  support and muzzle alignment. All five changed stages clear with ordinary movement/fire inputs
  in independent seed-1729 simulations, retaining three lives. Inspect three real built-app
  captures and verify short-screen Start visibility. All 47 source tests, 14 browser journeys,
  225 documentation checks and the Pages build pass. This does not claim human playtesting.

- Lipid merge tuning passes 47 source tests, 224 documentation checks, the Pages build and two
  real keyboard/celebration browser journeys. A 30-seed stationary-fire probe per lipid stage
  clears all 90 opening runs: stages 1-2 lose no lives; stage 3 retains at least two. The initial
  zero-damage assertion for all three was too strict: stage 3 also loses a life with merging
  disabled. A state-aware moving-input run then clears all six stages with three lives intact
  and 7 natural merges. It uses ordinary movement/fire inputs, with no state overrides; this
  proves completion for the recorded run, not human difficulty or every random seed.
  Synthetic tissue/capacity fixtures now explicitly disable merging rather than inheriting
  stage-1 tuning. Difficulty reports and run evidence are in ignored `output/merge_curve/`.

- Complete clear-flow acceptance with 47 passing source tests, 14 passing browser tests and
  224 passing documentation checks. Fresh specification, quality and integration reviews accept
  the rebuilt game; normal/reduced-motion actual-clear captures and 36 immutable renderer
  fixtures retain distinct proof lanes in [CLEAR_FLOW.md](CLEAR_FLOW.md). No deployment or commit.

- Complete R1-R9 after fresh specification, quality and final integration acceptance. The final
  source gate passes all 47 Node tests plus TypeScript, lint and format. The browser full run has
  11 passes and one stale modal-flow expectation; after its test-only correction, the focused
  rerun passes 1/1 in 16.0 s. This is 11 plus 1 evidence, not a clean 12-test single run. Final
  documentation checks pass 220/220. Build hashes, matching compact captures and proof limits
  are recorded in [RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md).

- Earlier new-mechanics integration passes TypeScript, the full repository check, 39 Node tests,
  production build (74746-byte JavaScript), and final six browser journeys (49.0 s). Exact state checks
  preserve each opening stage over 1,800 ticks. Focused geometry/tissue/merge probes and fresh
  S1-S5 reviews pass. That snapshot's 24-stage completion/replay ends at score 327950 with three lives and
  zero damage; separate practice/replay opens and completes an optional pocket. Final integration
  accepts refreshed hashes/layouts, four-viewport rendered evidence and density profiling.
  All 27 reported axe samples detect zero violations; 19/24 initial samples retain unresolved
  contrast incompletes. See [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md) for exact proof limits.
- Refresh the README, game spec, rubric, art direction, expansion contracts and active ledger for
  implemented mechanics. Keep one canonical placement matrix, separate optional/bounded work
  from guaranteed workload, and keep human feedback optional. No remote deployment is claimed.
- Documentation/README/ASCII checks pass (209 tests); TypeScript and focused `src/main.ts` lint
  pass after the instruction-copy edit. No build was run during this documentation pass.
- Batch 1 gates passed: `npx tsc --noEmit -p tsconfig.json`, `./check_codebase.sh`,
  `./build_github_pages.sh`, and Playwright (1 test, 541 ms).
- Local runtime is available through `run_web_server.sh` at `http://localhost:8728`.

## 2026-10-21

### Additions and New Features

- Add [GAME_SPEC.md](GAME_SPEC.md) for Plaque Trouble: a 15-level cardiovascular arcade campaign
  with plaque fragmentation, antiplatelet tools, and timed maintenance objectives.
- Specify controls, collision rules, lives, scoring, local records, educational framing, SVG art,
  CSS presentation, TypeScript ownership, implementation milestones, and acceptance criteria.

### Decisions and Failures

- Preserve one-hit fragmentation and distinguish plaque targets from platelet-activation hazards.
  Treat numerical balance values as proposed playtest settings.
- Record human-stated project guidance and establish the specification's authority in
  [HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md) and [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

### Developer Tests and Notes

- Documentation checks: Markdown links and ASCII compliance pass (118 tests).
- This change defines the game; it does not implement or publish it. Runtime, art rendering,
  compiler acceptance, and the complete campaign playthrough remain implementation checks.
