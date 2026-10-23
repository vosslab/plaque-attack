# Gameplay variety plan

## Goal and evidence

Deliver three readable lipid behaviors and one useful environmental surprise through existing
left/right/fire controls. Preserve the easy first three displayed stages, fluid motion, sculpted
floor, identical surgeon abilities, quick retry, and the organic arcade identity. Completion has
no human approval or playtest dependency. Human feedback remains optional refinement.

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

Detailed behavior and visual intent live in [design.md](../../../output/gameplay_variety/design.md).
The implementation contract owner freezes concrete types and tick placement before production
implementation. One engine owner handles creation, motion, split, merge, tick, scoring and reset
semantics together; rendering/audio follows the real contract.

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

1. **Freeze the source contract.** Specify spawn/runtime unions, events, seam references, tick
   order, and reset ownership. Review it independently against source before engine edits.
   Resolve questions directly with affected owners; ask them to restate and apply decisions.
2. **Play bounded competing prototypes.** Use temporary encounters reached through actual
   controls: sticky pauses 0.6 versus 1.2 seconds; heavy three versus four tiny children; unstable
   five versus eight seconds. Compare seam radius 180 versus 240 logical pixels only if the first
   rendered pulse fails to create a useful visible opening. Keep encounter geometry, seed and
   controls equal. Start with 0.9-second sticky, three-child heavy, seven-second fuse as hypotheses,
   then select one tuning from observed readability, useful repositioning, cleanup and recovery.
   Remove comparison choices from production. Record outcomes, including rejected candidates.
3. **Implement the coherent mechanics.** Extend existing creation, motion, hit, erosion and reset
   owners. Keep swept collision paths valid during sticky holds/releases. Use existing queued
   insertion and next-tick activation for all children; preserve target caps, pending-target
   completion and one-score-per-removal. Process ordinary shot resolution before timed splitting
   so an actual shot wins a same-tick fuse expiry. Preserve existing tick order: process pulse
   against surviving current targets after damage
   and committed erosion, before completion; it cannot retroactively prevent contact damage or
   sweep newly created children.
4. **Introduce, practice, recombine.** Stage 4 (ID 3) introduces one sticky target with simple cover;
   stage 5 (ID 4) introduces one medium heavy target with the existing optional support;
   stage 6 (ID 5) practices these, then introduces one generously timed unstable target in phase 2
   with a clear phase cue and briefing. Stage 9 (ID 7) introduces the clearance seam in a platelet
   encounter, making tiny-platelet removal useful. Recur the seam selectively at stages 18 (ID 10)
   and 24 (ID 15). These drug/dual encounters
   retain their platelet targets: stent hits plaque, drugs hit platelets. Lipid behavior remains
   in the stent chapter; do not change weapon eligibility or add every behavior everywhere.
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

Run the existing checks directly because `check_codebase.sh` internally invokes an out-of-scope
Git command: TypeScript production and lint typechecks, ESLint, Prettier check, then
`node --import tsx --test 'tests/test_*.mjs'`. Run
`source source_me.sh && python3 -m pytest tests/` including mandatory disk guards. Build using the
existing build entrypoint after checking it for Git invocation. Run the existing relevant browser
regressions for stage flow/retry and viewport state; a complete campaign replay is not required.

Meaningful focused contracts: sticky pause/release preserves collision path and moves inward;
heavy produces bounded ordinary children; unstable is inert while paused and cannot double split
or score at expiry; pulse removes eligible bodies once, keeps larger bodies, and cannot stall
completion; retry restores seam and timers. Exact durations/count tuning stay in temporary probes
unless the product contract requires them. Preserve easy stages 1-3 through existing baseline checks.

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
| Shared brief and execution plan | Ready | This plan and `output/gameplay_variety/design.md` |
| Contract specification | In progress | Contract specialist; schema agreed, tick/event details to freeze |
| Competing playable prototypes | Queued | Independent variety_prototype owner, then manager selects tuning |
| Engine and encounter implementation | Queued | Starts after frozen contract |
| Presentation integration | Queued | Starts after actual type contract |
| Quality and integrated play review | Queued | Fresh independent reviewers, consolidated correction list |
| Required checks and documentation closeout | Queued | Manager retains ownership until evidence is recorded |

Elastic and linked are deferred: elastic currently risks becoming ordinary split speed tuning;
linked adds pair lifecycle, cleanup and merge complexity before showing a stronger decision.
Heavy armor and random unstable acceleration are rejected because they add cleanup or undermine
readable motion. Recovery redesign, new controls, new levels, broad opening rebalance and unrelated
polish are outside this iteration and are not claimed complete by its closeout.
