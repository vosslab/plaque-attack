# Stage mechanics implementation plan

**Status:** Implemented and locally accepted, 2026-10-22. S1-S7 are complete; fresh final
integration review accepts the evidence in [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md).
This retained design and execution contract extends
[EXPANSION_PLAN.md](EXPANSION_PLAN.md) and preserves its stable-ID campaign order, tools, saves,
first-three-stage ease, and fluid motion. Human feedback is optional and never a dependency.

## Outcome and scope

Add erodible tissue shelter, optional membrane pockets, a cellular sloping floor, and occasional
lipid coalescence to the existing campaign. Give players choices about shelter, firing lanes,
and when to release optional hazards. Keep left/right/fire as the complete control set. The
surgeon follows the floor automatically, with no jumping, jump binding, or airborne state.

The surgeon cannot shoot through tissue. Every shot removes a visible piece of the first tissue
it reaches and ends there. Repeated shots carve a lane at the cost of that shelter. Hazards also
erode tissue on contact and are deflected by surviving tissue. Tissue is gameplay geometry,
separate from the decorative medical scene and the permanent walkable floor.

Use 24 stages, without changing their stable IDs or replay/save interpretation. Stages 1-3 stay
flat, uncovered, pocket-free, and merge-free at their existing speeds and workloads. Introduce
new mechanics one at a time from stage 4, then interleave them rather than accumulate every
mechanic in every stage. Retain platelet-only drug chapters: platelet hazards never merge and
medicines still do not destroy lipid targets. Tissue carving is an explicit arcade abstraction.

## Evidence and current boundaries

The earlier expansion's accepted baseline evidence is 22 source tests, six browser tests (49 seconds),
a normal-input state-aware completion/replay of all 24 stages, responsive captures of all starts,
15 zero-violation accessibility samples, and approximately 60 fps observations. Those results
predate this work. Fresh integrated evidence is recorded in
[MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md), including 39 Node tests, final six browser
journeys (49.0 seconds), 24-stage campaign/replay and separate optional-pocket practice/replay.

`graphify-out/graph.json` maps the current game's simulation, weapon, wave, rendering, and type
owners. [GRAPHIFY.md](GRAPHIFY.md) still describes starter-template communities and is not a
reliable game architecture summary. Current source wins when the graph snapshot differs.

The arena is 960x540 logical pixels, origin at upper left, increasing y downward. Currently
`game_state.ts` initializes player feet at y=540; `simulation.ts` changes only x; `renderer.ts`
draws the 44x60 sprite upward from its feet; `collision.ts` uses a 28x46 hitbox upward from those
same feet; `weapons.ts` fires at `(feet.x, feet.y - 60 + 8)`. Preserve that shared feet anchor.
Current `motion.ts` reconstructs target y from phase every tick, so changing velocity alone
cannot produce lasting tissue deflection. Current `weapons.ts` already resolves global earliest
swept target contacts; extend that owner rather than add an independent late tissue-hit pass.

## Shared contracts

The manager freezes compiling shared contracts before dependent implementations. Names below
are proposed API names; once frozen, implementation owners use the actual exported names.

| Contract | Owner and required meaning |
| --- | --- |
| `ArenaLayout` | Level-owned immutable floor control points, tissue patches, and pocket definitions, all in logical pixels. Defaults explicitly represent the baseline flat arena. |
| `FloorProfile` | Continuous piecewise smooth height function or control points sampled by one geometry owner; no discontinuous steps. |
| `TissuePatch` | Stable ID plus 12x12 logical-pixel occupied cells; optional pocket association. Cells are authoritative for rendering and collision. |
| `PocketDefinition` | Stable ID, shell cell references, breach cells, release position and finite compatible `TargetSpawn[]`; unopened contents are optional. |
| `MergeRule` | Probability as a fraction in [0,1] per eligible contact entry, cooldown seconds, finite integer stage budget. Explicit disabled rule for stages 1-3 and platelet stages. |
| Runtime tissue | Mutable occupancy copied from config; immutable start-of-tick collision snapshot; deduplicated pending erosion set; pocket state (`sealed`, `pending`, `released`), release queue and warning timer. Commit erosion once after contacts. No mutation of level configs. |
| Target motion | Ordered piecewise motion segments with start/end positions and normalized tick intervals in [0,1]. All collision consumers use the same segments, including tissue reflections. |
| Runtime contacts | Stable sorted target-pair keys, prior contact set and last-attempt tick; tissue contact latches per target/patch. Clear on restart, prune removed IDs. |
| Runtime merge budget | Remaining count initialized once per stage/retry, decremented only on successful merge. No restoration on splits. |
| Events | `tissue_eroded`, `pocket_breached`, `pocket_released`, `targets_merged`; positions and IDs describe committed state changes. Rendering/audio consume events without mutating simulation. |

Keep these in `types/level.ts`, `types/simulation.ts`, and `types/events.ts` under one contract
owner. New mechanics are transient simulation state; saves retain the existing version-2
progress/settings/history contract because no live arena snapshot is persisted.

## Floor and movement

Create `arena_geometry.ts` as the sole owner of floor sampling, normal/tangent calculation,
player feet placement and solid-cell geometric queries. Renderer, movement, projectile origins,
hazard creation and collision consume this geometry; none embeds a second height formula.

For the initial implementation use authored control points across x=0..960 with smoothstep
interpolation, zero endpoint derivative, and y in [492,540]. Keep adjacent rise/run <=0.20 after
sampling the actual curve. Flat is y=540 everywhere. Cellular scallops are drawn inside/below
this solid silhouette and cannot create invisible obstacles. The 44-pixel-wide upright surgeon
stands on the minimum sampled floor y across their footprint (highest support in screen space),
so feet do not penetrate the slope. Compute x with the existing speed/bounds, then feet y before
firing or checking damage. The visual hitbox and muzzle follow those feet. No jump input is added.

Use the same floor envelope for target motion. Ceiling clearance remains radius+24; the bottom
center bound is `floorY(x)-radius-24`. Derive orbit center/amplitude from these local bounds and
update phase smoothly; ceiling/floor approaches retain zero vertical speed. Include floor slope
in velocity estimates. A raised floor preserves the existing 22-pixel lower-edge overlap with
the player's 46-pixel hitbox and keeps every target orbit inside aspirin range eventually.
Clamp authored spawns/splits/merges against the local envelope, not global arena height.

Any floor correction that changes position must also update phase consistently. For tissue
reflection, project to the nearest free position, reverse the velocity component into the
contact normal, and reconstruct phase and phase direction from the corrected y/local envelope.
The next tick must continue away from the surface rather than snap back into it. Smooth fluid
circulation remains the base model; no gravity, acceleration from falling, or floor hopping.

## Tissue and shot ordering

Author suspended tissue arches at y=330..410, leaving a continuous walkable corridor below:
every occupied cell bottom is at least 16 pixels above the highest possible local muzzle.
The earliest layouts use two 96x48 patches centered at x=270 and x=690; later patches vary width
and gaps. Keep at least one open firing lane 120 pixels wide. Never enclose the surgeon or cover
scheduled spawn points. Cells disappear in their actual collision shape, exposing background;
decorative strokes stay within occupied cells and never visually fill a cleared lane.

At the start of each fixed simulation tick, freeze the occupied-cell set. Hazard contacts and
ALL projectile contacts use that same immutable snapshot throughout the tick. Accumulate erosion
in a deduplicated set and commit occupancy once after all contacts; a hole is usable on the next
fixed tick (about 16 ms later). Two shots may hit the same cell this tick and both are consumed,
while its removal emits only one committed cell change. An early shot cannot pass through a
hole requested by a later hazard. There is no chronological within-tick occupancy mutation.

Expand each occupied cell by projectile half-width and sweep the projectile tip against it.
For stents, include the anchored growing rectangle and any existing occupied overlap; a stent
cannot acquire a shaft through a previously blocked cell. Put tissue candidates in the same
global normalized-time queue as target contacts. Earliest time wins; exact ties prefer solid
tissue, then stable cell ID, then target/projectile IDs. A clopidogrel shot may hit compatible
hazards encountered before tissue, but tissue consumes its remaining life immediately.

Each shot impact queues removal of the contacted cell and its occupied horizontal neighbors
(one visible 36x12 notch, clipped to the patch), then consumes that projectile. Do not process
a second cell or a target behind that notch in the same shot. Commit the notch after contacts.
Tissue erosion awards no points and does not advance streak. Every shot kind, including stent and piercing clopidogrel, obeys this rule.

Sweep hazard circles against the frozen occupied cells before player contact. On contact queue
removal of the first cell plus an adjacent cell in the contact-normal direction and deflect the
hazard against that unchanged snapshot. A per-target, per-patch entry latch plus 0.30-second
minimum erosion interval prevents a hovering hazard from
deleting an entire patch in successive 60-Hz ticks. Sustained contact still blocks/deflects;
erosion requires separation and re-entry as well as the cooldown. Deflection occurs at cells
occupied at tick start, including cells queued for erosion. A full-diameter opening admits the
hazard only when it exists in the start-of-tick snapshot.
Circle sweep and depenetration inspect neighboring snapshot solids as well as the contacted cell.

Every reflected target path records each continuous travel leg with its normalized start/end
time and positions; preserve the reflection time when composing later legs into [0,1]. A
depenetration correction is placement repair, not a swept travel leg through solids. Projectile
contacts, surviving target-pair merge entries and player contact evaluate the same piecewise
path over overlapping time intervals, clipped by projectile lifetime/growth. Interpolate split
and merge origins on the actual segment at contact time. Never substitute the straight chord
from the target's tick-start position to its reflected tick-end position.

Keep a bounded contact iteration count with a conservative stop at the last nonpenetrating
position when dense geometry defeats resolution. Treat repeated stops as a failing authored
layout or collision bug; repair that owner, then rerun the scenario. Do not disable collisions.

## Optional membrane pockets

Use transparent, visibly enclosed contents and a distinct thin shell built from the same tissue
cells. A pocket has authored breach cells: removing one opens it once and queues its finite
contents. A shot that breaches the shell is consumed like any tissue hit. Hazard erosion may
also breach it. Show a 0.75-second pulse and release direction before activation.

Every pocket stage also begins with ordinary active hazards, leaving time to choose a release
before the round clears. The briefing/HUD labels sealed contents as an optional encounter and
labels breached pending contents as releasing.

Pockets are optional extra encounters, not required objectives. A sealed pocket does not block
clear completion or count toward maintenance overload. Once breached, every queued or warning
hazard is committed: pending release prevents clear completion and maintenance completion until
it is spawned or the run ends. Pending objects never damage the player or count as active hazards.
A pocket cannot reopen, duplicate contents, or replenish on merge/split.

Use an authored release point outside all remaining shell solids, with at least target radius+16
clearance from the player's hitbox. Wait while the player overlaps its release safety area or
while capacity is unavailable; keep the warning visible. Fill available slots in stable pocket/
content order without dropping contents; first collision eligibility is tick+1. Let shots clear
existing hazards so a full arena can recover. Unopened shells may remain visually after a clear;
freeze them with the rest of the completed arena. Do not auto-breach to force completion.

Count initial, scheduled and opened-pocket split descendants in capacity analysis. The existing
limit is 32 active targets; reserve a slot before a plaque split (one removal, two insertions).
Validate each authored plaque stage's worst-case tiny-leaf count <=32, including optional pocket
contents; merges conserve that leaf mass. If capacity can be exceeded by an extension, defer the
committed insertion in a visible pending queue rather than silently discard a target. Pending
insertions block completion. Platelet waves/pockets share the existing capacity admission rule.

## Lipid coalescence

Only two active plaque targets of the same size below large can merge: tiny+tiny -> small,
small+small -> medium, medium+medium -> large. Large+large and all platelet pairs are ineligible.
Use leaf-mass units tiny=1, small=2, medium=4, large=8; each permitted merge conserves exact mass.
Radius follows the existing preset, not additive visual area. State the arcade size abstraction
in the optional medicine material without presenting it as literal physical conservation.

Collect swept circle/circle contact entries, sorted by normalized contact time then lower/higher
ID. Eligible means neither target is newly inactive, consumed, or used in an earlier merge this
tick. Draw exactly one seeded random value per eligible new entry when both targets' cooldowns
have elapsed and budget remains; compare a uniform [0,1) value to configured probability.
Advance the simulation-owned seed with the existing deterministic generator, in that stable
order. Persistent overlaps never reroll each tick. Separation followed by a new entry can try
again only after a 1.5-second pair/target cooldown. Disabled mechanics consume no random draws.

Successful merging replaces both parents with one fresh ID, at their mass-weighted swept contact
center, constrained to free arena space. Average the parents' horizontal velocities to choose the
merged target's direction. Its speed is always the new size preset multiplied by level speed; if
the averaged horizontal velocity is near zero, use the lower-ID parent's direction. Reconstruct
fluid phase from the contact y and averaged vertical direction; do not teleport to a canonical
orbit point. The new target activates on tick+1 and cannot merge again until its cooldown expires.
Splits inherit the parent's remaining cooldown, preventing immediate sibling recombination. Prune
removed IDs from contacts.

Start with probability 0.18 and budgets 1 (introductory stage) or 2 (later plaque stage). These
are tuneable implementation defaults, not permanent test constants. Merging emits no hit points
or streak increment. Keep the existing scoring implementation: split-tree work is 1/3/7/15
for tiny/small/medium/large; each successful merge adds exactly one future hit. Therefore total
hits <= baseline authored/opened-pocket tree work + finite merge budget, and hit score <=750
times that bound under the current maximum multiplier. This bounds score farming and completion
work without introducing per-target score-credit bookkeeping. Budget exhaustion leaves ordinary
fluid contacts. Three first-stage configurations explicitly disable merging.

## Stage placement matrix

Stage numbers are ordinals; IDs stay `[1,16,2,3,4,5,6,17,7,18,19,20,8,21,9,22,23,10,11,12,13,14,24,15]`.
`gentle` floor has 16-pixel relief; `wave` has 32; `slope` has 48. Apply smooth slope limits above.
`paired` is two tissue patches; `arch` is one broad patch with open flank lanes; `offset` uses
staggered patches. Pocket contents use the current stage's compatible target kind only.

| Stage / ID | Floor | Cover | Optional pocket | Merge p / budget |
| --- | --- | --- | --- | --- |
| 1 / 1 | flat | none | none | off |
| 2 / 16 | flat | none | none | off |
| 3 / 2 | flat | none | none | off |
| 4 / 3 | flat | paired | none | off |
| 5 / 4 | gentle | none | none | off |
| 6 / 5 | gentle | offset | none | 0.18 / 1 |
| 7 / 6 | flat | none | none | off |
| 8 / 17 | gentle | paired | none | off |
| 9 / 7 | flat | arch | 2 tiny platelets | off |
| 10 / 18 | wave | none | none | off |
| 11 / 19 | gentle | offset | 2 tiny platelets | off |
| 12 / 20 | wave | paired | none | off |
| 13 / 8 | flat | none | none | off |
| 14 / 21 | gentle | arch | none | off |
| 15 / 9 | flat | none | none | off |
| 16 / 22 | wave | offset | 2 tiny platelets | off |
| 17 / 23 | slope | paired | none | off |
| 18 / 10 | flat | none | none | off |
| 19 / 11 | gentle | paired | none | off |
| 20 / 12 | wave | none | 2 tiny platelets | off |
| 21 / 13 | slope | offset | none | off |
| 22 / 14 | gentle | arch | 2 tiny platelets | off |
| 23 / 24 | wave | paired | none | off |
| 24 / 15 | slope | offset | 2 tiny platelets | off |

Introduce tissue at stage 4, gentle floor at stage 5 with merging off, and merging at stage 6
with the already introduced floor/cover. Stage 6 retains its original four large plaques
(32 leaf units) and has no pocket or capacity compensation. The first pocket appears at stage 9.
These introductions add one new mechanic at a time.
Stage 4's existing workload jumps to 37 hits; lower its speed from 0.80 toward 0.72 if cover
makes the ordinary-input replay lose lives repeatedly. Tune cover opening/quantity before
increasing shot rate. Chapter/tool introductions 7/13/15/18 remain breathing spaces.

## Ownership and execution order

The prior 24-stage baseline remains historical evidence. S1-S5 implementation, specification
and quality gates are accepted. S6 fresh final integration review accepts the source, campaign
and practice replays, final hashes, 24-stage layout enumeration, browser journeys, responsive
captures and density profile. S7 canonical documentation and evidence closeout is complete.
The acceptance report preserves fixture boundaries, contrast incompletes and enjoyment limits.

The manager dispatches each batch to fresh owners with exclusive files, invites concrete
contract challenges, and resolves them from source/evidence. No batch waits for human review,
subjective fun signoff, approval, external playtesting, or optional feedback.

| Batch | Exclusive implementation responsibility | Dependency / exit evidence |
| --- | --- | --- |
| S1 | Contract owner: `types/level.ts`, `types/simulation.ts`, `types/events.ts`; defaults wired in `game_state.ts` and existing config constructors | Manager freezes this plan and contract compile; consumers restate and apply actual exports. |
| S2 | Geometry owner: new `arena_geometry.ts`, `motion.ts`, `characters.ts`, player movement portion of `simulation.ts` | S1; flat baseline unchanged, automatic feet/muzzle/hitbox and smooth floor drift proven. |
| S3 | Tissue/pocket owner: new `tissue.ts`, geometric sweep additions in `collision.ts`, `weapons.ts`, `waves.ts` completion/admission changes | S1 and S2 geometry; earliest obstruction, erosion, committed releases and capacity proven. |
| S4 | Merge owner: new `coalescence.ts`, target merge/split cooldown helpers, merge orchestration hook | S1/S2; deterministic entry handling, exact mass and bounded work proven. Parallel with S3 only after shared simulation hook locations are frozen. |
| S5 | Integration owner: `constants.ts` layouts, `renderer.ts`, `audio.ts`, `ui.ts`, final `simulation.ts` hook ordering, difficulty/report integration | S2-S4; all 24 authored placements playable; visible holes, pockets and merges match collision. |
| S6 | Fresh acceptance owners: focused tests, full gates, browser journeys and campaign evidence | S5; all proof lanes below pass against one built artifact; repair failures and rerun affected lanes. |
| S7 | Documentation owner: spec, rubric, art/decisions/changelog, active-plan status, acceptance report | S6; actual evidence and limits recorded, scope complete without hidden human work. |

Integrate shared `simulation.ts` edits sequentially through its single owner. Required tick
order: freeze tissue occupancy; move/ground player; fire; propose hazard motion; resolve hazard
contacts against frozen tissue and record reflected motion segments/phase; resolve global swept
projectile/target/tissue contacts against the same snapshot; resolve surviving merge entries;
resolve player damage using those motion segments; commit the deduplicated erosion set and
resulting pocket breaches/events once; elapsed/waves/pocket admission; overload/survival/completion.
All contacts use normalized tick intervals and actual piecewise target paths. Erosion changes
geometry for the next tick only. Keep earliest-solid precedence and tick+1 target activation.
Repair inconsistent time composition at its owner before acceptance.

## Autonomous acceptance and recovery

Focused permanent tests protect stable behavior, not the stage probability/patch-count constants:

- Flat stage compatibility and first-three-stage absence of all four mechanics; raised floor
  moves feet, hitbox and muzzle together with left/right/fire only; tiny and large orbits stay
  smooth, within local geometry, and eventually inside the short-range firing area.
- Stent, aspirin and clopidogrel each visibly erode and stop at first solid cell; target-before-
  tissue can hit, target-behind cannot; exact ties prefer tissue; two projectiles and multiple
  occupied cells consume both shots even at the same cell, deduplicate erosion, and cannot leak
  a shot through any same-tick hole. An early shot stays blocked when a later hazard erodes that
  cell; a shot on the next tick can use the committed hole.
- Hazards deflect off the frozen cover snapshot, erosion waits for re-entry/cooldown, and a
  diameter-wide lane admits them starting on the tick after erosion commits. Reflected-path
  fixtures place targets/shots on a real travel leg and on the false start/end chord: only the
  real leg yields contact; player/merge contacts and split origins use its normalized time.
  Paused/ready/terminal states mutate none of these mechanics.
- Sealed optional pockets permit clear, breached pending pockets prevent completion, release is
  warned and exactly once, full capacity and unsafe player proximity defer without dropping,
  and retry resets occupancy/queues/budget. Maintenance counts active hazards consistently.
- Equal-size plaque entries merge under controlled seed and probability endpoints, persistent
  contact draws once, cooldown/newborn timing holds, platelets/large/mixed sizes never merge,
  IDs stay unique, mass is conserved and budget/work/score bounds hold across split-merge loops.

Use temporary exhaustive scenario enumeration for every stage's geometry, capacity, floor
clearance, reachable lanes, optional release safety, and deterministic multi-seed pair order.
The manager repairs authored violations directly. Do not encode every tunable coordinate as a
permanent expected-value test.

Run `npx tsc --noEmit -p tsconfig.json`, relevant existing/new Node tests, `./check_codebase.sh`,
the repository production build, and browser suite, reporting each lane distinctly. Re-run the
full 24-stage normal-input state-aware completion and practice replay after integration. The
controller may read positions/configs and issue ordinary left/right/fire; it must not remove
hazards, alter lives/time/score, skip objectives or mutate geometry. Controlled fixture tests
exercise rare merges, capacity and collisions separately and are labelled as fixtures.

Against the production build under its project subpath, capture desktop and narrow mobile
stage 4 before/after carving, stage 5 gentle floor with merging off, stage 6 forced merge,
stage 9 pocket before/after release, stage 14 clopidogrel obstruction, and stage 24 combined
maintenance. Inspect all 24 starts and
chapter transitions for muzzle placement, readable cell silhouettes, unobscured targets, controls,
overload feedback and no added jump control. Capture actual frame timings at worst density;
compare with the baseline approximately 60 fps and fix a sustained regression that harms input
or collision stability. Batch cell rendering and simplify particles before changing simulation.

Recheck legacy save load/reload, version-2 completion records, accessibility samples and console/
network errors. Record screenshot paths, seed, stage ID, build identity and actual commands in
an acceptance report. Agent reviewers inspect captures and source independently; failure routes
to its owning batch, followed by focused reproduction and affected full/browser proof reruns.

Repeated campaign failure means identify the concrete hazard/cover/shot constraint, then reduce
cover thickness, pocket load, merge budget/probability or existing wave pressure in that order
appropriate to the failure. Keep the mechanic present where introduced. Preserve all 24 stages,
the first-three ease, tool compatibility and geometry truth. Runtime correctness failures are
repaired at their owner; no visual masking, invulnerability cheat, target deletion, skipped clear
condition or human balancing gate counts as recovery.

Completion is all four mechanics implemented, integrated placements verified, required proof
passing, and documentation updated. Automated completion and agent inspection provide evidence
of reachability, clarity and observed pacing; they cannot establish every player's enjoyment.
State that observational limit in the report as nonblocking, without leaving a human playtest
or approval task in any milestone or checklist.
