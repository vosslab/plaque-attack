# Plaque Trouble organic expansion plan

**Goal:** Deliver a fun, deliberately paced 24-stage campaign with fluid motion, organic artwork,
erodible shelter, automatic floor following, optional pockets and bounded plaque coalescence.

**Status:** Complete and locally accepted, 2026-10-22. S1-S7 pass, including fresh final
integration review, 24-stage completion/replay, browser and rendered acceptance, and records.
Evidence and limitations are preserved in [MECHANICS_ACCEPTANCE.md](../../MECHANICS_ACCEPTANCE.md).

[STAGE_MECHANICS_PLAN.md](../../STAGE_MECHANICS_PLAN.md) owns executable mechanics and the single
placement matrix. [EXPANSION_PLAN.md](../../EXPANSION_PLAN.md) owns target/wave composition and
stable identities. The manager completes review, repair and acceptance autonomously. Optional
human feedback never blocks completion.

## Product direction

- Keep fun first, optional learning brief, and the first three rounds easy with slow fluid drift.
- Preserve 24 stages, four chapters, stable IDs, version-2 saves and historical record labels.
- Introduce tissue at stage 4, gentle floor at stage 5, merging at stage 6, and pockets at stage 9.
- Keep left/right/fire as the complete controls; follow the floor automatically without jumping.
- Preserve all-shot tissue blocking, frozen per-tick occupancy, and contact erosion/deflection.
- Keep unopened pockets optional; warn and safely admit every committed release at capacity.
- Retain stage 6's four large plaques and its finite merge budget without capacity compensation.
- Keep platelet and plaque identities distinct. Carving and coalescence are arcade abstractions.

## Delivery sequence

| Stage | Status | Implemented outcome / remaining evidence |
| --- | --- | --- |
| Earlier expansion | Accepted historical baseline | 24 stages, organic art, fluid drift, ordinal progression and version-2 saves; proof predates new mechanics. |
| S1. Shared contracts | Accepted | Arena geometry, tissue/pocket, merge and event contracts compile and pass review. |
| S2. Geometry | Accepted | One floor sampler, feet/muzzle/hitbox alignment and local-floor fluid paths; geometry spec and quality reviews accepted. |
| S3. Tissue and pockets | Accepted | Frozen collision occupancy, visible deferred erosion, shared reflected paths and warned finite releases; spec and quality reviews accepted. |
| S4. Coalescence | Accepted | Seeded eligible contact entries, inherited cooldowns, finite budgets and new-size speed; spec and quality reviews accepted. |
| S5. Integration | Accepted | Simulation, renderer, all placements and config-derived metrics integrated; spec and quality reviews pass. |
| S6. Acceptance | Accepted | Fresh final integration review accepts full checks, final six browser journeys, responsive captures, density profile and campaign/practice replays. |
| S7. Closeout | Complete | Canonical prose, final evidence, limitations and current README captures recorded. |

## Current evidence

- Current source passes TypeScript, the full repository check and 39 Node behavior tests, including
  12 new arena tests. The approximately 73 KB production bundle builds successfully.
- Final six browser journeys pass in 49.0 seconds. The ordinary-input state-aware campaign and
  independent replay complete all 24 stages: score 327950, three lives, zero damage, 935.733
  playing seconds, 207 eroded cells and one natural merge. Separate stage-9 practice breaches
  a pocket and releases both targets, then completes and independently replays.
- All 24 practice starts and four viewports are inspected. The initial production gallery and
  final affected-state refresh have separately recorded hashes. All 27 reported axe samples
  detect zero violations, but 19/24 initial samples have unresolved contrast incompletes with
  unknown cause. This does not certify full accessibility conformance.
- A source-imported synthetic 32-target/five-shot density fixture samples 600 frames per motion
  setting: approximately 59.7/60.0 FPS and 1.4 ms combined step/render CPU p95 on Apple M4 Max.
  These are fixture/setup observations, not organic campaign or universal device performance.
- The integration fixture `/private/tmp/plaque_s5_integration.mjs` compares exact state equivalence
  for each of stages 1-3 over 1,800 fixed ticks. It passes with all new mechanics disabled.
- Geometry owner evidence is `/private/tmp/plaque_s2_geometry_check.mjs` (1,024 samples over 300
  ticks each). Independent read-only inspection additionally reported 7,684 samples, 38,400 motion
  ticks and 256 phase reconstructions; those counts are review reports, not a separate saved artifact.
- Tissue runtime probes live in `output/mechanics_tissue/runtime.mjs`; independent review reported
  2,000 additional cases. Merge evidence is 13 probes in `output/mechanics_merge/probes.mjs` with
  `output/mechanics_merge/results.txt`. Focused probes are distinct from ordinary-input campaign proof.

The accepted earlier 24-stage expansion passed 22 source tests, six browser journeys (49 seconds),
a normal-input state-aware completion and independent replay, responsive start captures, 15
zero-violation accessibility samples and approximately 60 fps observations. The original 15-stage
record remains in [game_implementation.md](game_implementation.md). Both are historical evidence,
not acceptance of tissue, floor, pocket or merge mechanics.

## Review and completion

Keep one source owner per mutation boundary. Resolve contract questions from actual source and
focused evidence; fresh reviewers check the implemented behavior. The difficulty report reads real
configs through `src/difficulty.ts` and `devel/report_difficulty.mjs`, with bounds separated from
observed play. Record settled choices in [DESIGN_DECISIONS.md](../../DESIGN_DECISIONS.md) and human
preferences in [HUMAN_GUIDANCE.md](../../HUMAN_GUIDANCE.md).

S1-S7 are complete against the integrated result, including ordinary-input 24-stage completion,
independent replay, responsive rendered inspection and documented limitations. Automated completion
proves mechanical reachability; it does not prove human enjoyment. Optional feedback is welcome
without becoming a milestone or hidden approval requirement. Remote deployment is separate.
