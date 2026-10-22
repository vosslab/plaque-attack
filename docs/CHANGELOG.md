## 2026-10-22

### Additions and New Features

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

- Freeze paused projectile presentation and explain committed pocket releases after the
  maintenance timer reaches zero. Refresh the two README captures with the current menu and
  actual tissue-carving practice, and record distinct proof lanes in
  [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md).
- Replace ballistic target motion with deterministic lateral drift and smooth vertical circulation.
  Use a shared 24-unit wall inset, gentle first-three-stage work/speeds, and 40-60-second maintenance
  rounds. Tutorial copy now describes drifting hazards.
- Refresh README, GitHub setup, current game specification, decisions, and expansion ledger for the
  expanded source contract. Keep 15-level acceptance evidence explicitly historical.

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

- Current new-mechanics integration passes TypeScript, the full repository check, 39 Node tests,
  production build (74746-byte JavaScript), and final six browser journeys (49.0 s). Exact state checks
  preserve each opening stage over 1,800 ticks. Focused geometry/tissue/merge probes and fresh
  S1-S5 reviews pass. Fresh 24-stage completion/replay ends at score 327950 with three lives and
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
