# Gameplay variety plan

**Status: COMPLETE within the sampled evidence scope.** No implementation or review steps remain;
unobserved scenarios and human enjoyment remain explicit evidence limits. See the final evidence
and integration acceptance in `output/gameplay_variety/closeout.md` and
`output/gameplay_variety/integration.md`.

## Goal and evidence

Deliver three readable lipid behaviors and one useful environmental surprise through existing
left/right/fire controls. Preserve the easy first three displayed stages, fluid motion, sculpted
floor, identical surgeon abilities, quick retry, and the organic arcade identity. Closeout required
independent actual-control play and fresh integrated acceptance; human enjoyment research remains
outside this iteration.

Current source: `src/simulation.ts` owns tick order, `src/characters.ts` creates targets,
`src/weapons.ts` splits them, `src/coalescence.ts` merges them, and `src/tissue.ts` owns frozen
occupancy and committed erosion. `src/remix_levels.ts` authors encounters. Display order comes
from `src/constants.ts`: stages 1-3 are IDs 1, 16, 2. Stage number is never inferred from stable ID.
The existing gameplay report observes useful carving/current decisions but sparse opening hits;
this iteration adds later choices rather than raising opening pressure. That report is agent
assessment, not evidence of human enjoyment.

## Shared creative brief

Promise: read a strange lipid, choose when and where to split it, then carve the artery itself
into a helpful weapon. New behaviors change positioning, target order, and payoff without extra
buttons or extra health. A soft sticky body pauses against a sidewall; a compact heavy body
breaks into a rewarding short cleanup; an unstable body warns before ordinary fragmentation.
A marked tissue seam releases a harmless local clearance pulse. These are arcade inventions,
not claims about real lipid mechanics or clinical treatment.

Detailed behavior and visual intent receipt: `output/gameplay_variety/design.md`.
Concrete types and tick placement are frozen in `output/gameplay_variety/contracts.md`. One engine
owner handles creation, motion, split, merge, tick, scoring and reset semantics together;
rendering/audio follows the real contract.

## Settled behavior decisions

| Behavior | Player choice | Fixed contract |
| --- | --- | --- |
| Sticky | Move under the temporarily held sidewall target, or pursue another target | Brief whole-body pause at a sidewall, visible countdown, then ordinary inward motion; no tissue attachment |
| Heavy | Take a slower bulky target now for a short, satisfying cleanup | Author medium targets; one hit creates three ordinary tiny children, without armor or extra required hits |
| Unstable | Shoot early at a chosen location, or clear a more urgent hazard before the fuse expires | Fixed visible active-time fuse; timeout performs an ordinary next-size split, with ordinary child speeds and no score award |
| Clearance seam | Keep cover, or carve the marked notch when tiny hazards enter its area | First marked seam-cell erosion triggers one bounded pulse removing nearby tiny plaque and platelets; larger hazards remain |

Ordinary is the default when the spawn has no behavior. Split descendants and merged results are
ordinary. A merger can consume a special body under the existing merge rules and yields an
ordinary body; no hidden inheritance or permanent immunity. Timers pause with play. Retry and
stage creation reconstruct all behavior and one-use seam state from authored content.

The seam uses a distinct patch, separated from hazard pockets and support caches. Either projectile
or target erosion can release it, so incidental erosion never silently destroys the opportunity.
The telegraph shows its real local area before activation; the pulse is harmless to the surgeon,
clears tiny targets of either family, awards existing hit points once per removed body, and never
recursively activates lipid behavior or fabricates projectile IDs.

## Approach and milestones

1. **Freeze the source contract.** Done. The frozen unions, events, seam references, tick order,
   and reset ownership are recorded in `output/gameplay_variety/contracts.md`; the contract
   artifact records source/type and formatting evidence.
2. **Play bounded competing prototypes.** Completed in the temporary playable comparison at
   `output/gameplay_variety/prototype/prototypecomparison.md` (seven actual-control sessions,
   paired fixed-seed encounters). Compared sticky 0.65 versus 1.5 seconds, unstable six versus
   three seconds, and heavy three versus four tiny children. Selected 0.65-second sticky,
   six-second fuse, three heavy children, and a 0.65 heavy movement factor. These are bounded
   agent design judgments from the tested single-target opening, not human enjoyment, shipping-art
   readability, broad encounter safety, or campaign-balance evidence. The seam radius stayed at
   180 logical pixels; it was not compared in the prototype.
3. **Implement the coherent mechanics.** Extend existing creation, motion, hit, erosion and reset
   owners. Keep swept collision paths valid during sticky holds/releases. Use existing queued
   insertion and next-tick activation for all children; preserve target caps, pending-target
   completion and one-score-per-removal. Process ordinary shot resolution before timed splitting
   so an actual shot wins a same-tick fuse expiry. Preserve existing tick order: process pulse
   against surviving current targets after existing damage handling and committed erosion,
   before completion; it cannot retroactively prevent contact damage or sweep newly created children.
4. **Introduce, practice, recombine.** Stage 4 (ID 3) introduces one sticky target with simple cover;
   stage 5 (ID 4) introduces one medium heavy target with the existing optional support;
   stage 6 (ID 5) practices these, then introduces one six-second-fuse unstable target in phase 2
   with a clear phase cue and briefing. Stage 9 (ID 7) introduces the clearance seam in a platelet
   encounter, making tiny-platelet removal useful. Recur the seam selectively at stages 18 (ID 10)
   and 24 (ID 15). These drug/dual encounters
   retain their platelet targets: stent hits plaque, drugs hit platelets. Lipid behavior remains
   in the stent chapter; do not change weapon eligibility or add every behavior everywhere.
   Implemented in `src/remix_levels.ts`; encounter decisions and limits are in
   `output/gameplay_variety/encounters.md`.
5. **Integrate and assess.** Run focused probes and the existing regression lanes. A fresh quality
   reviewer inspects the implementation and built readability; independent short actual-control
   play sessions assess one introduction, one combination, and failure/retry. Consolidate findings
   per iteration, repair demonstrated defects, and rerun only affected scenarios plus required checks.
6. **Close and document.** Record chosen variants, actual evidence and limits; update canonical
   design/spec and changelog through their assigned owner. Classify and remove temporary checks,
   leaving meaningful stable regression protection. Mark milestones complete only with evidence.

## File scope and ownership

- `src/types/level.ts`, `src/types/simulation.ts`, `src/types/events.ts`: contract owner initially;
  engine owner thereafter. Inline types stay in their existing files.
- `src/characters.ts`, `src/motion.ts`, `src/weapons.ts`, `src/coalescence.ts`, `src/tissue.ts`,
  `src/simulation.ts`, `src/remix_mechanics.ts`, `src/game_state.ts`: one engine owner; extend the
  existing boundaries without a new mechanics framework.
- `src/remix_levels.ts` and only necessary level constants: encounter owner after contract freeze.
- `src/renderer.ts`, `src/remix_rendering.ts`, `src/audio.ts`: presentation owner after real types;
  distinguish bodies by shape, outline and state cue as well as color. Preserve existing assets.
- Existing `tests/test_simulation.mjs`, `tests/test_arena.mjs`, `tests/test_remix.mjs`,
  `tests/test_remix_campaign.mjs` and browser suites: focused behavior protection only where needed.
- `tests/_temp/`: disposable probes; `output/gameplay_variety/`: comparison captures/reports.
- This plan, the design brief, and canonical `docs/GAME_SPEC.md`, `docs/DESIGN_DECISIONS.md`,
  `docs/CHANGELOG.md`: their assigned documentation owners; preserve concurrent edits.

## Completion evidence

The initial integrated build SHA-256 is
`7ae15fbcf1d94fd759e0477a004cbe83db7cf103a55a7747e9a87502aad50bc0`; evidence and limits are
recorded in `output/gameplay_variety/closeout.md`. The manager's TypeScript, ESLint, Prettier and 80-Node-test
gate passed at `/private/tmp/plaque_variety_node.log`; the repository pytest lane passed 1,391
tests at `/private/tmp/plaque_variety_pytest.log`; and 25 browser tests passed at
`/private/tmp/plaque_variety_browser.log`. The independent specification review accepted after a
sticky/tissue correction, and the quality review accepted without further required source changes.
The actual-control play report found a readable sticky hold and heavy one-hit payoff, visible
phase-2 fuse cue (but did not observe fuse expiry), a stage-9 pulse removing one target for 250
points with all lives intact on desktop/mobile, and retry reset. The stage-24 correction and exact-
build retest are recorded in `output/gameplay_variety/finale_fix/report.md`; fresh integration
acceptance is recorded in `output/gameplay_variety/integration.md`. No human enjoyment claim is
supported or required.

Meaningful focused contracts: sticky pause/release preserves collision path and moves inward;
heavy produces bounded ordinary children; unstable is inert while paused and cannot double split
or score at expiry; pulse removes eligible bodies once, keeps larger bodies, and cannot stall
completion; retry restores seam and timers. Chosen durations and counts are implementation tuning;
their temporary comparison evidence remains in
`output/gameplay_variety/prototype/prototypecomparison.md`. Preserve easy stages 1-3 through
existing baseline checks.

Actual-control sessions start from an ordinary stage entry/practice selection, without target,
score, lives, or phase mutation. Use short independent sessions with honest outcomes; screenshots
and event traces establish encounter reachability, visible cues, useful movement choices, pulse
payoff, and retry reset. No exhaustive replay or arbitrary fun-score threshold. If a cue cannot be
read, correct rendering; if it adds waiting or unavoidable near-player scatter, correct the owning
mechanic/tuning. State agent judgment separately from measured outcomes and human enjoyment.

## Decision and task ledger

| Item | Status | Owner/result |
| --- | --- | --- |
| Independent alternative | Done | `output/gameplay_variety/alternatives.md`; elastic/linked considered |
| Shared brief and execution plan | Done | This plan and `output/gameplay_variety/design.md` |
| Contract specification | Done | `output/gameplay_variety/contracts.md`; reviewed against source |
| Competing playable prototypes | Done | `output/gameplay_variety/prototype/prototypecomparison.md`; selected 0.65s / 6s / 3 children / 0.65 speed factor with stated evidence limits |
| Engine implementation | Complete | `output/gameplay_variety/engine.md`; accepted specification review, focused behavior lane and final gates pass |
| Encounter implementation | Complete | `output/gameplay_variety/encounters.md`; 24-level weapon eligibility enumeration found no incompatible targets |
| Presentation integration | Complete | `output/gameplay_variety/presentation.md`; source quality accepted; actual-control visual evidence remains separate |
| Metrics implementation | Complete | `output/gameplay_variety/metrics.md`; configuration evidence only |
| Specification review | Complete | `output/gameplay_variety/spec_review.md`; ACCEPT after sticky/tissue correction |
| Quality review | Complete | `output/gameplay_variety/quality.md`; ACCEPT, no required source changes |
| Build and required checks | Complete | Initial build `7ae15f...`: 80 Node, 1,391 pytest, 25 browser checks. Corrected build `f64a28...`: TypeScript, ESLint, Prettier, 80 Node, focused nine Remix/campaign tests, exact-build play, and fresh 1,393-test repository pytest pass. The browser suite was not rerun on the corrected build. |
| Independent actual-control play | Complete within sampled scope | Stage 9 removes one target for 250 points with all lives intact on desktop/mobile. On corrected stage 24, the outer tiny target reaches the seam during an ordinary rightward approach; the pulse clears one target for 250 points with all lives intact. Stage 6 fuse expiry was not observed. See `output/gameplay_variety/closeout.md` and `finale_fix/report.md` |
| Finale correction and retest | Complete | The two existing right-side phase-one targets are tiny, with the outer target at (940, 440). The encounter retains four initial hazards, three phases, and 15 total authored hazards. Exact-build actual-control retest passed; see `output/gameplay_variety/finale_fix/report.md` |
| Fresh integration acceptance | Complete | `output/gameplay_variety/integration.md` accepts within sampled scope and records final build identity and evidence limits |

## Completion status

All milestones are complete within the stated evidence scope. The final authored source change is
in `src/remix_levels.ts`; the corrected integrated build SHA-256 is
`f64a28d20b61c97cbd3b7b8af111ff554afcbb5d03850365d3caaaf13eba41b2`. The initial 25-test browser
suite belongs to the initial integrated build; it was not rerun after the final stage-24 authoring
change. The corrected build instead passed TypeScript, the focused nine Remix/campaign tests, and
the exact-build actual-control retest. The full repository pytest result after this documentation
closure is recorded in `output/gameplay_variety/closeout.md`. No outstanding steps remain in this
plan; limits on unobserved behavior and human enjoyment remain evidence limits, not open tasks.

Elastic and linked are deferred: elastic currently risks becoming ordinary split speed tuning;
linked adds pair lifecycle, cleanup and merge complexity before showing a stronger decision.
Heavy armor and random unstable acceleration are rejected because they add cleanup or undermine
readable motion. Recovery redesign, new controls, new levels, broad opening rebalance and unrelated
polish are outside this iteration and are not claimed complete by its closeout.
