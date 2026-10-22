# Prior request review

Status: complete and locally accepted, 2026-10-22. This review checks the recorded human requests against the
implemented game, tests and delivered artifacts. It closes real omissions within the requested
scope; optional player feedback and remote publication do not gate local completion.

The request inventory comes from [HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md) and the completed
[RECOVERY_ROSTER_PLAN.md](RECOVERY_ROSTER_PLAN.md), [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md)
and [EXPANSION_PLAN.md](EXPANSION_PLAN.md). Earlier template/Graphify guidance remains repository
history, rather than a new game feature request.

## Review plan

| Step | Concrete completion evidence | Status |
| --- | --- | --- |
| Mechanics audit | Trace requested movement, tissue, merging, weapons, campaign, saves and recovery to source and meaningful tests. | Complete |
| Presentation audit | Inspect roster, recovery, 16:10 viewport, compact dialogs, editable art and README captures. | Complete |
| Full verification | Fresh source/repository checks, build and full browser suite; keep simulation and fixture evidence distinct. | Complete |
| Concrete gap repairs | Correct stale setup, expansion values and browser-output documentation; repair any demonstrated runtime defects. | Complete |
| Final review | Independent review accepts corrections; this ledger records exact results and remaining limits. | Complete |

## Requirement traceability

Implemented means the behavior exists in source. Verified means identified evidence exercises it;
neither a fixture nor assisted input establishes subjective enjoyment. The existing acceptance
reports below remain dated evidence until this review records its fresh verification results.

| Human request | Owning source or contract | Test or artifact evidence | Review disposition |
| --- | --- | --- | --- |
| Full cardiovascular arcade game with surgeon, splitting plaque, stent and later antiplatelet tools | [GAME_SPEC.md](GAME_SPEC.md), [simulation.ts](../src/simulation.ts), [weapons.ts](../src/weapons.ts) | [test_simulation.mjs](../tests/test_simulation.mjs), [game.spec.ts](../tests/playwright/game.spec.ts) | Implemented; fresh source and full browser checks pass. |
| More levels, ordered challenge, gentle first three and fluid gravityless drift | [constants.ts](../src/constants.ts), [motion.ts](../src/motion.ts), [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md) | [test_difficulty.mjs](../tests/test_difficulty.mjs), [test_motion.mjs](../tests/test_motion.mjs), opening-six evidence in [RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md) | 24 stages implemented; first-three contract retained. Fun remains subjective and nonblocking. |
| Organic scenes and varied editable lipid art | [ART_DIRECTION.md](ART_DIRECTION.md), [assets.ts](../src/assets.ts), [renderer.ts](../src/renderer.ts) | Editable assets in [src/assets](../src/assets); rendered evidence in [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md) | Implemented; visual evidence has explicit fixture/history limits. |
| Erodible tissue blocks every shot and trades shelter for a firing lane | [tissue.ts](../src/tissue.ts), [simulation.ts](../src/simulation.ts) | [test_arena.mjs](../tests/test_arena.mjs), current [tissue_carving.png](screenshots/tissue_carving.png) | Implemented; screenshot uses actual practice controls. |
| Wavy/sloped floor follows horizontal movement without jumping | [arena_geometry.ts](../src/arena_geometry.ts), [characters.ts](../src/characters.ts) | [test_arena.mjs](../tests/test_arena.mjs), [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md) | Implemented; left/right/fire remains the control set. |
| Same-size lipid merging with level-dependent probability | [coalescence.ts](../src/coalescence.ts), [constants.ts](../src/constants.ts) | [test_arena.mjs](../tests/test_arena.mjs), [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md) | Enabled in all six lipid stages after the subsequent user correction; platelet chapters retain their own target rules. |
| Six diverse cosmetic surgeons with identical abilities | [surgeons.ts](../src/surgeons.ts), [surgeon.ts](../src/types/surgeon.ts), [dialogs.ts](../src/dialogs.ts) | [test_surgeons.mjs](../tests/test_surgeons.mjs), [recovery_roster.spec.ts](../tests/playwright/recovery_roster.spec.ts), [surgeon_roster.png](screenshots/surgeon_roster.png) | Implemented; appearance selection persists. Representation for every player is not an automated claim. |
| Victories visibly restore a distinct patient cardiovascular map | [recovery.ts](../src/recovery.ts), [save_load.ts](../src/save_load.ts), [cardiac_recovery.svg](../src/assets/cardiac_recovery.svg) | [test_recovery.mjs](../tests/test_recovery.mjs), [test_save_load.mjs](../tests/test_save_load.mjs), [patient_recovery.png](screenshots/patient_recovery.png) | Implemented with 24 stable territories and five patient tiers; screenshot labels demonstration progress. |
| 16:10 play view and compact viewport-fitting popups | [style.css](../src/style.css), [dialogs.ts](../src/dialogs.ts), [renderer.ts](../src/renderer.ts) | Refreshed roster/recovery/tissue captures and four-viewport production receipt | 16:10 canvas view implemented; original 960x540 simulation is uniformly scaled inside organic margins. Chooser geometry and keyboard checks pass. |
| Refresh README for gamers/biology enthusiasts and link the live game | [README.md](../README.md) | Visible opening hook, browser-first start and published-game link | Implemented; current local source is not claimed deployed. |
| Prepare GitHub setup and account for unignored root test-results | [GITHUB_SETUP.md](GITHUB_SETUP.md), [playwright.config.ts](../playwright.config.ts), [.gitignore](../.gitignore) | Playwright writes output/playwright under the ignored root output directory | Configuration and corrected documentation agree. |
| Finish milestones autonomously through manager/subagents; remove human approval/playtest gates | [RECOVERY_ROSTER_PLAN.md](RECOVERY_ROSTER_PLAN.md), [organic_expansion.md](active_plans/active/organic_expansion.md) | Completed R1-R9 and S1-S7 ledgers; fresh audit, repairs and final independent review | Complete; no hidden human dependency found. |

## Corrections and disposition

- Corrected [GITHUB_SETUP.md](GITHUB_SETUP.md) distinguishes accepted local delivery from the
  published-game link and its unverified deployed revision; workflow instructions match the repo.
- Corrected [EXPANSION_PLAN.md](EXPANSION_PLAN.md) and [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md)
  match final stage-4/5 composition, work and speed. [ART_DIRECTION.md](ART_DIRECTION.md) routes
  current and historical evidence separately.
- [PLAYWRIGHT_USAGE.md](PLAYWRIGHT_USAGE.md) now documents configured output/playwright under
  ignored root output. No active producer of root test-results was found; no extra ignore is needed.
- Historical [game_implementation.md](active_plans/active/game_implementation.md) pending probe and
  integration sentences now match its already accepted evidence.
- The earlier 11-plus-1 browser disposition is superseded for this build by a fresh post-correction
  12/12 full run. Historical [RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md) stays intact.
- Recovery now shows current-stage text and aria-current in its visible list. The surgeon chooser
  keeps Done outside its scrolling roster on short screens. Build/source/browser checks pass;
  fresh viewport captures and independent specification/quality reviews accept both repairs.

## Fresh verification

- `./check_codebase.sh` passes all 47 Node tests plus lint, format and TypeScript checks.
- The full post-correction browser run passes 12/12 in 1.1 minutes, exit 0. An earlier sandbox
  launch failed with EPERM; the authorized browser launch passes. Retained final logs below
  identify the post-correction run, separately from the first 12-pass review run.
- Focused ASCII, Markdown links, guidance format and README opening checks pass 223/223, exit 0:

```bash
source source_me.sh && python3 -m pytest -q tests/test_ascii_compliance.py tests/test_markdown_links.py tests/test_guidance_doc_format.py tests/test_readme_first_paragraph.py
```

- Historical baseline ledger pending runtime-probe/integration sentences now match its already
  recorded passing probe and final integration verdict; no new BFCache-restoration claim is made.
- Independent original-baseline source review finds no material missing controls, three-life and
  protection rules, hit-streak/completion/maintenance scoring, five local records, separate music/SFX
  controls and event audio, result/retry flows, optional illustrated medical cards, distinct drug
  tools or safe-count maintenance/overload rules. This is static source evidence; it does not claim
  a fresh full-campaign completion.
- `./build_github_pages.sh` exits 0 after the corrections. Fresh source and documentation
  specification reviews, independent quality review and fresh final integration review accept
  the bounded repairs with no blockers. Final integration independently checks all 24 source-map
  sources against current source, CSS/assets against dist and receipt hashes against the build.

## Rendered and keyboard acceptance

The same built artifact passes Chromium checks at 1280x800, 844x390, 390x844 and 320x640.
At every size, all six roster cards support pointer selection and keyboard Tab/Space selection;
Tab reaches Done and Enter dismisses the chooser. Title and Done stay visible while central
content scrolls; no horizontal overflow appears. Settings retains its separate roster heading.
The current/restored source-module fixture shows both text cues and aria-current=step. This fixture
proves the rendering contract rather than an earned campaign clear. No page errors were collected.

The three README PNGs are refreshed and inspected against the review hashes: the roster shows all
six choices and Done; the recovery view labels synthetic eight-route progress; tissue carving uses
actual Stage 4 Practice movement and shots. Practice access uses a synthetic unlocked save, rather
than claiming an earned unlock. No screenshot-only styling or zoom is applied. File and asset
hashes remain unchanged before/after the viewport probe and captures.

Local receipts are `output/request_audit/ui/report.md`, `geometry_receipt.json` and
`readme_capture_receipt.json` in that UI evidence directory. These desktop Chromium viewport and
keyboard checks do not establish native mobile-browser or screen-reader acceptance.

The review build has these production hashes:

```text
main.js dc1905e142bf24d22222418bcb538c988eccb8cc02947ea2980abb8371ad02e5
style.css a982ac2744f2642d7db0ec6349618ec8e4233ccf4fabeea899a718545167ee06
```

This ledger owns the later review build's acceptance. The earlier hashes in
[RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md) remain historical evidence.

Retained local evidence is in `output/request_audit/final_checks.log`, `final_build.log` and
`final_browser.log`. Independent source reports are `base_spec.md`, `doc_spec.md` and `ui_spec.md`
in that same ignored evidence directory; `quality.md` and `integration.md` record independent
acceptance. These local outputs are not committed documentation.

## Evidence boundaries

The ambitious requested concepts have concrete implementations: 24 authored stages, organic
editable art, eroding cover, floor following, merging, six saved cosmetic characters and persistent
24-route patient recovery. This review does not queue speculative features as unfinished requests.

The previous 24-stage completion/replay predates the latest stage-4/5 tuning. The current opening
simulation proves one feasible assisted six-stage path. Recovery fixtures prove known-state rendering;
they do not prove earned campaign progress. Automated checks establish bounded behavior and layout,
not human enjoyment. All limits remain nonblocking observations rather than hidden human tasks.

The README links an existing published game. Local build acceptance does not prove those latest
changes are published; deployment is separate from this authorized review.

The 16:10 result describes the canvas presentation, with uniform scaling and organic margins
around the original 960x540 simulation; it does not enlarge the collision world. The subsequent
user correction enables bounded merging across all six lipid stages with rising probabilities.

## Latest delivery appendix

This 2026-10-22 closeout indexes requests delivered after the review above. Its 47-source-test,
12-browser-test and production-hash receipts remain historical; they identify that earlier build.

- [CLEAR_FLOW.md](CLEAR_FLOW.md) closes visible final-pop/celebration feedback and deliberate
  Enter/fresh-Space continuation, with actual-clear journeys and explicit final-campaign fixture limits.
- [FLOOR_VARIATION.md](FLOOR_VARIATION.md) records the basin, shelf and shoulder profiles,
  24-layout geometry checks and five independent seed-1729 assisted stage clears.
- [DIALOG_LAYOUT.md](DIALOG_LAYOUT.md) records shared scrolling content with persistent headings
  and actions; all 28 measured actions fit across four viewports.
- [GAME_SPEC.md](GAME_SPEC.md) and [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md) own the current
  six-lipid merge curve: 5%-25% probabilities and finite budgets of 1, 1, 2, 3, 4, 5.
  Retained `output/merge_curve/probe.json` records all 90 opening-stage stationary-fire clears;
  stages 1-2 lose no lives and stage 3 retains at least two. `campaign-summary.json` in that
  directory records one moving-input opening-six clear with three lives intact and seven merges.
  These are bounded prior simulations, not a fresh full-campaign replay or human difficulty proof.
- [FUN_SURVEY.md](FUN_SURVEY.md) closes the eleven-game source survey and selected streak/point
  feedback improvement, including the later mobile HUD and arena layout corrections. Its final
  delivery retains 49 passing source tests and 18 passing browser journeys, accepted specification,
  quality and integration reviews. Future survey candidates remain proposals.

The closeout request audit rechecks all 19 entries in `output/fun_survey/hashes.txt`; those entries
tie named sources, tests, build files, screenshot and probes to the retained evidence. The 49/18
runs were inspected, not rerun during this documentation closeout.

A fresh packaging audit verifies all 32 source/dist SVGs byte-for-byte and reproduces the shipped
JavaScript and source map with an in-memory production build. A focused Chromium session at
`/plaque-attack/` loads all 32 SVGs, six chooser portraits and recovery art, and starts ordinary
campaign gameplay with no console or page errors. Local receipts are
`output/stay_busy_closeout/PACKAGE_AUDIT.md`, `package_probe.json` and `package_subpath.json`.
These checks establish local package consistency and subpath operation; deployment, audible sound
quality, subjective fun and a new all-24-stage completion remain outside their scope.
