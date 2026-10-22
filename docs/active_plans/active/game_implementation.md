# Plaque Trouble implementation ledger

**Goal:** Implement the complete 15-level Plaque Trouble campaign in `docs/GAME_SPEC.md`,
including browser-ready presentation and acceptance evidence. The spec is the source of truth;
its colorful vector arcade direction is sufficient to begin without a separate UI decision.

**Status:** Complete. **Updated:** 2026-10-22.

## Execution rules

- Keep dependencies serialized: no dependent implementation starts before its contracts and
  previous batch gates pass.
- Assign an explicit owner to every file before each batch. Owners report evidence and blockers;
  the manager integrates at batch boundaries.
- After **every batch**, require all four gates: `npx tsc --noEmit -p tsconfig.json`,
  `./check_codebase.sh`, the repository build, and the batch's Playwright smoke. Record the exact
  commands, outcomes, and artifact or browser evidence below. Any failure stops progression until
  repaired and the gates rerun.
- Complete all 15 levels. The five-level first playable is an intermediate milestone only.
- Before quality review, reread `docs/GAME_SPEC.md` against the implementation. Use fresh agents
  for the independent quality review and final integration review.

## Stages

| Stage | Scope and ownership | Status | Evidence / pending work |
| --- | --- | --- | --- |
| A0. Contracts | Contracts agent owns importable shared types and contract notes. Establish player/input, simulation, levels/objectives, events, and versioned save shapes; inspect real TypeScript configuration and retain strictness. | Complete | All 15 configs and shared contracts accepted. `LevelId` union plus `Record` config is the accepted design; avoid deriving a table that creates an import cycle. TypeScript, ESLint, and spec/quality reviewers passed. Fresh `foundation_spec` and `foundation_quality` reviews also accepted `constants`, `characters`, and `game_state` with no findings. |
| Batch 1. Foundation | Foundation owner scaffolds the application, configuration/state transitions, and bootable shell against accepted contracts. | Complete | All 15 configs and state shell are present. Meaningful `tests/playwright/game.spec.ts` coverage is in place. The four gates pass; one Playwright test passed (541 ms). |
| Batch 2. Presentation and utilities | Isolated owners: editable SVG/render assets; CSS/HTML shell; runtime utilities (input, timing, persistence). No overlapping file ownership. | Complete | Renderer corrections passed TypeScript, `check_codebase.sh`, build (exit 0), and Playwright (1 test, 802 ms). Fresh renderer spec rereview and Batch 2 quality review accepted. Clarification: the outline alpha pulse is allowed because the sprite remains opaque. |
| Batch 3. Simulation and integration | Simulation owner implements campaign mechanics; integration owner implements `main` and UI composition. Respect dependency direction and single simulation-state ownership. | Complete | All 6 focused browser journeys pass (27.4 s), 13 Node tests pass, and all 15 levels are reachable in ordinary play and independent replay (score 298500, 3 lives, 691.95 s; refreshed hashes match 9/9). Fresh full spec review accepted with no source blockers. See gate record for production subpath checks. Earlier renderer, label/audio, group-markup, and viewport findings were resolved before acceptance. |
| Batch 4. Advanced coverage and acceptance | Owners complete advanced campaign paths, durable behavior coverage, and gaps found during full-campaign validation. | Evidence passed | All final gates pass. The lifecycle fix passes its persisted-event runtime probe and fresh quality review. Full-campaign and production evidence is recorded. Stress profile `output/performance/profile.json` passes with 32 platelets, 5 shots, and 600 frames: about 60 rAF FPS and 0.2 ms combined step/render CPU time, p95; 128 hits and zero errors on an Apple M4 Max. This is an explicit stress fixture, not an organic campaign state or a universal hardware claim. Integration verdict is being finalized. |
| Fresh spec review | Fresh reviewer checks the full implementation against every requirement in `docs/GAME_SPEC.md`; route findings to file owners. | Accepted | Fresh `final_spec_accept` found no source blockers. Refreshed 15-level replay evidence reports all 9 hashes matching. |
| Quality review | Fresh independent quality reviewers assess code and product evidence after the spec review is clean. | Accepted | Fresh `final_quality` accepts the source correction for persisted `pagehide` controller lifecycle. The isolated runtime probe is still pending. Synthetic persisted-event reproduction identified the bug; actual BFCache restoration is unavailable in headless Chromium. UI/UX audit passed 22 AXE checks with zero violations, 12 geometry checks across 6 viewports, and 21 contrast pairs. |
| Final integration | Fresh integration reviewer checks the merged result and final evidence; manager records the canonical disposition. | Accepted | Fresh `finalintegration_accept` accepted with no blockers after all gates and performance evidence passed. |

## Batch gate record

Copy this record for each batch, preserving failures and reruns as evidence.

| Batch | `tsc --noEmit` | `check_codebase.sh` | Build | Playwright smoke | Owner / artifact / decision |
| --- | --- | --- | --- | --- | --- |
| Batch 1 | Pass | Pass | Pass | Pass (1 test, 541 ms) | `npx tsc --noEmit -p tsconfig.json`; `./check_codebase.sh`; `./build_github_pages.sh`; Playwright. Initial TS18003 fixed by adding meaningful Playwright coverage. |
| Batch 2 | Pass | Pass | Pass | Pass (1 test, 802 ms) | After correction, exact TypeScript gate, `./check_codebase.sh`, build (exit 0), and Playwright passed. Fresh renderer spec rereview and Batch 2 quality review accepted. |
| Batch 3 | Pass | Pass | Pass | Pass (6 journeys, 27.4 s) | Browser workers bounded to 2 after failures reproduced with stable dist and Python backlog (5 vs. 6 workers); no assertions changed. Production subpath check: all 7 SVGs plus CSS/JS returned 200; movement/split/score reached 250 without errors. 13 Node tests pass; 15-level replay hashes match 9/9. |
| Batch 4 | Pass | Pass | Pass | Pass (6 journeys, 27.3 s) | Canonical TypeScript, `./check_codebase.sh`, build, and 6 browser journeys pass after lifecycle correction. Persisted-event runtime probe and fresh quality review pass. Full repository check reports 39 documentation checks passing. Explicit performance stress fixture in `output/performance/profile.json`: 32 platelets, 5 shots, 600 frames, about 60 rAF FPS, 0.2 ms combined step/render CPU time p95, 128 hits, zero errors (Apple M4 Max). |

## Decisions and current evidence

- **Source of truth:** `docs/GAME_SPEC.md`; the supplied 15-level campaign is required.
- **Visual direction:** Use the spec's colorful vector-art and browser-arcade direction. No extra
  UI-preference decision is needed before implementation.
- **Workflow:** Use `html-game-parallel-builder`, with concrete contracts first, exclusive file
  ownership, serialized batch gates, and real browser evidence.
- **Model routing:** Use `gpt-6-luna` for bounded documentation work and `gpt-6.1-sol` for strict
  game implementation complexity.
- **Toolchain:** `npm install --cache /private/tmp/plaque-attack-npm-cache` completed (106 packages,
  0 vulnerabilities); the default npm cache was root-owned. Playwright browsers use
  `/private/tmp/plaque-attack-playwright-browsers`; `output/toolchain.log` is transient.
- **Test output:** Root `test-results` was not ignored. It was cleaned after `git ls-files` confirmed
  it was untracked; Playwright now writes to `output/playwright` via `playwright.config`.
- **Runtime evidence:** `run_web_server.sh` is serving at `http://localhost:8728`. Browser launch
  required macOS MachPort sandbox escalation.
- **Lint scope:** Consumer-local `eslint.config.local.js` ignores generated `output/**` while
  preserving source lint rules.
- **UI/UX evidence:** 22 AXE checks passed with zero violations; geometry checks passed for 6
  viewports; 21 contrast pairs passed.
- **Browser evidence:** Six focused browser journeys pass (27.4 s) with workers bounded to 2 after
  stable runs exposed Python server backlog; assertions did not change. Production subpath checks
  loaded all 7 SVGs plus CSS/JS and completed movement/split/score at 250 without errors.
- **Campaign evidence:** Ordinary-input play and an independent replay reached all 15 levels. The
  refreshed replay matched all 9 hashes. This establishes mechanical reachability, not a human
  playtest or actual BFCache restoration.
- **Documentation:** README/GitHub setup and screenshot documentation are complete. Two PNGs are
  stored in `docs/screenshots`; `tools/capture_readme.mjs` captures them.
- **Lifecycle:** `bfcache_fix` is released. The persisted-event runtime probe and fresh quality review
  pass. Actual BFCache restoration is unavailable in headless Chromium; retain that limitation in
  final evidence.
- **Performance evidence:** Stress profiling passes the explicit fixture in
  `output/performance/profile.json`: 32 platelets, 5 shots, and 600 frames, about 60 rAF FPS, 0.2 ms
  combined step/render CPU time p95, 128 hits, zero errors on Apple M4 Max. Treat this as fixture-
  and hardware-specific evidence, not an organic campaign state or universal hardware claim.

## Final status

**Disposition:** Complete. All four batch gates, campaign evidence, final spec, quality and UI/UX
reviews, lifecycle probe, screenshots, and performance evidence pass. Fresh final integration review
accepted with no blockers. Headless Chromium could not exercise an actual BFCache restoration; the
persisted-event runtime probe passes. Performance results describe the explicit stress fixture on
Apple M4 Max only. **Evidence:** See the stage table and gate record above.
