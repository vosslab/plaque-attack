# Lipid collision merging

## Intended behavior

Shots reliably split plaque into smaller fragments. Occasional equal-size lipid merges come
only from approaching contacts after the bodies have separated. Preserve split particles,
sound and impact rings; remove redundant split captions and retain clear merge feedback.

## Diagnosis and design

Children spawn at one center and become active next tick. Coalescence currently counts their
initial overlap as a fresh collision, which can immediately undo the shot. Coalescence owns
the correction: require an entering boundary with approaching relative motion. Initial
penetration and persistent overlap cannot spend RNG; no timer or family tracking is needed.
Sticky wall holds are stationary rather than freely floating. Existing probability, cooldown
and finite merge budgets continue to bound frequency and workload.

Design follows Keep it simple and Fix the design, not the symptom. The game-design reference
lesson from Ms Taq Man is to preserve the familiar main action and keep messages from obscuring
play. Here, shot effects express splitting while a separate ring and caption identify merging.

## Steps and ledger

- [x] Inspect split creation, activation order, swept contacts, feedback and existing tests.
- [x] Send geometric-contact diagnosis and design checkpoint to manager; design approved.
- [x] Implement geometric entry and stationary-hold checks; remove split captions.
- [x] Cover reliable shot splitting, heavy/unstable/deferred fragments, natural later contact,
  tick-start tangency, overlap RNG latching and held-body exclusion.
- [x] Run focused behavior tests, typechecks, lint and format checks; record exact results in
  `output/lipid_collision/implementation.md`.
- [x] Reconcile canonical specification, human guidance, design decisions and changelog.
- [x] Inspect actual-control browser split feedback and bounded natural merge frequency,
  including reduced motion; record visual evidence.
- [x] Fresh specification review and code-quality review; correct supported findings.
- [x] Manager integration check of implementation, docs, browser and review evidence.

## Integration closeout

**ACCEPT.** The implementation, canonical contract, accepted specification review, corrected
quality review, and production browser evidence agree with the intended behavior. The browser
run used actual keyboard fire in Stage 4 under normal and reduced motion on production build
`6db35a8d4d1c2fcad33719690756e9f471cd6923ab8f9aa4df95e6e0de894667`. Both routes scored a split;
children separated from their shared birth center, no split-size caption appeared, and the hit
feedback remained. The merge budget stayed at 3 during the sampled window.

No natural merge occurred in the bounded browser sample, so this is not claimed as observed
browser behavior. Simulation tests cover a separated sibling pair later approaching and merging;
source and review evidence confirm matching-size eligibility, probability, cooldown, budget, and
merge feedback remain. The endpoint correction uses the terminal motion segment at the tick end;
the fresh quality re-review accepts it. The manager reports all 85 Node tests and 337 Markdown/
ASCII checks passing before closeout. Focused Markdown link and ASCII checks also passed for this
closeout. No human approval or playtesting gate remains.

Evidence: `output/lipid_collision/implementation.md`, `output/lipid_collision/spec.md`,
`output/lipid_collision/quality.md`, `output/lipid_collision/endpoint_fix.md`,
`output/lipid_collision/quality_recheck.md`, `output/lipid_collision/play/REPORT.md`, and
`output/lipid_collision/docs.md` (ignored local evidence files).
