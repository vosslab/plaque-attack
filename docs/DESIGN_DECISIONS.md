# Design decisions

<!-- VENDORED HEADER: START -->
Record each durable decision about how this code and repository are shaped, once it is settled, with
the reasoning a later reader needs. Guidance Neil Voss states belongs in
[HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md), dated history in `docs/CHANGELOG.md`, open discussion in
`docs/active_plans/decisions/`. [PROPAGATED HEADER - ENTRIES BELOW ARE YOURS]
<!-- VENDORED HEADER: END -->

### Present earned hit streaks

**Decision.** Present the existing hit count, x2/x3 milestones, and awarded target points through
compact, bounded feedback. Keep all point awards and streak resets in the existing simulation.

**Why.** The source survey in [FUN_SURVEY.md](FUN_SURVEY.md) favors visible earned momentum as
a small, coherent improvement that uses the game's existing score rules.

**Consequence.** Keep exact 5/10-hit milestone cues, optional audio, stationary reduced-motion
feedback, and pause/retry cleanup. Future medals, collectibles, abilities, and environment changes
remain separate proposals; this decision changes no score balance or saved progress.

**Owner.** [GAME_SPEC.md](GAME_SPEC.md), with verification status in
[FUN_SURVEY.md](FUN_SURVEY.md).

### Temporary Graphify Cargo reconciliation

**Decision.** Reconcile exact Cargo aliases with their AST package twins before
reclustering; verify the resulting IDs against Graphify's loaded graph before writing.

**Why.** Graphify 0.9.80 compares normalized candidate counts with raw JSON counts,
and its original-link export otherwise drops links still pointing to removed aliases.

**Consequence.** Preserve all link records and the active shrinkage guard. Keep the
correction in one removable function; already reconciled upstream output is a no-op.

**Owner.** `normalize_cargo_twins` in
[devel/graphify_prune_tests.py](../devel/graphify_prune_tests.py)
and [devel/graphify_map_repo.py](../devel/graphify_map_repo.py).

Write each decision as a level-three heading with these four fields. `Owner` names the
authoritative code or contract document, rather than a person.

```markdown
### <decision title>

**Decision.** <the durable direction>

**Why.** <the reason it was chosen>

**Consequence.** <the constraint a future change preserves>

**Owner.** <the authoritative code or contract doc>
```

### Game specification authority

**Decision.** Use [GAME_SPEC.md](GAME_SPEC.md) as the current gameplay contract for
Plaque Trouble, with [EXPANSION_PLAN.md](EXPANSION_PLAN.md) owning the exact expanded stage matrix.

**Why.** The concept needs explicit collision, scoring, progression, and maintenance rules before
parallel implementation can share reliable contracts.

**Consequence.** Keep plaque fragmentation as an arcade metaphor and use distinct platelet hazards
for antiplatelet stages. Numerical balance settings remain playtest defaults. Specification work
does not establish implementation, browser acceptance, or deployment.

**Owner.** [GAME_SPEC.md](GAME_SPEC.md), with target/wave composition in
[EXPANSION_PLAN.md](EXPANSION_PLAN.md) and mechanics placement in
[STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md).

### Level configuration contract

**Decision.** Keep `LevelId` as a union and pair it with a `Record` for level configuration.

**Why.** This gives the compiler a complete mapping without deriving the identifier type from a
configuration table that would create an import cycle.

**Consequence.** New levels update the union and the record together; keep their ownership and
imports arranged to avoid a cycle.

**Owner.** Shared level contracts and level configuration modules.

### Additive campaign expansion

**Decision.** Treat the accepted 15-level campaign as the completed baseline and define additional
levels in a separate expansion contract before changing campaign content or runtime behavior.

**Why.** The existing campaign and its acceptance evidence remain a useful stable reference while
the requested expansion establishes its own level count, chapter structure, challenge rubric, and
visual direction.

**Consequence.** The expansion plan and its design contracts own the expanded source behavior. Record fresh
acceptance separately from the baseline; implementation alone does not close acceptance.

**Owner.** [active_plans/active/organic_expansion.md](active_plans/active/organic_expansion.md)
and the expansion contracts it defines.

### Expanded campaign identity and order

**Decision.** The expanded campaign has 24 levels across four chapters, with stable level IDs in
this canonical play order: `[1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10,
11, 12, 13, 14, 24, 15]`. Preserve the existing Act III mechanics and add Chapter 4 as a
presentation layer; migrate legacy version-1 saves into validated version-2 data.

**Why.** The ordered curve brings new players into the campaign gradually, then introduces later
challenges and chapter presentation without changing the established maintenance rules. Stable IDs
allow the authored order to evolve independently of saved progress.

**Consequence.** Treat this order and ID mapping as canonical across metadata, navigation, save
progress, and the rubric. Version-2 migration preserves old settings, unlocked identities, and historical records. Label
classic versus expanded records explicitly so an old completion cannot count as a new completion.

**Owner.** [EXPANSION_PLAN.md](EXPANSION_PLAN.md), [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md),
and the level configuration contract in `src/constants.ts`.

### Beginner curve tuning

**Decision.** Keep the opening three stages easy, with seven, ten, and fifteen plaque hits and
slow fluid motion. Tune work, speed, and wave pressure against the fun-first rubric.

**Why.** Small fragments moving low and fast create sharp early difficulty. New players need room
to learn movement and firing before managing denser families or new weapon rhythms.

**Consequence.** The earlier higher-bounce novice experiments are superseded and were not applied.
Use measured progression, agent browser review and optional human feedback for balance; permanent tests protect meaningful
behavior rather than freezing every tunable value.

**Owner.** [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md), `src/difficulty.ts`, and `src/constants.ts`.

### Fluid motion and organic presentation

**Decision.** Use deterministic fluid drift with smooth vertical orbits for the organic expansion;
replace ballistic floor hops. Size-based lateral speeds and a shared vertical angular rate
scale per stage. A shared 24-unit wall inset preserves smooth suspended turns and access to the
short-range firing/contact region. Select the six lipid appearances from stable target IDs in the
renderer; visual form does not alter medical target identity or physics.

**Why.** The requested setting is a fluid, gravityless interior-body environment where lipid and
bubble motion should feel smooth and buoyant. Ballistic bounces suggest gravity and floor contact.

**Consequence.** Keep first-three-level ease as the leading challenge priority. Treat the beginner
ballistic experiments as superseded and unapplied, not as a completed goal. Source integration and
isolated rendering do not establish integrated campaign acceptance. The config-derived difficulty
report uses the current fluid profile; automated evidence does not establish human enjoyment.

**Owner.** `src/motion.ts`, [EXPANSION_PLAN.md](EXPANSION_PLAN.md),
[DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md), and the renderer asset-loading contract.

### Fixed-tick tissue collision geometry

**Decision.** Freeze tissue occupancy at fixed-tick start for hazard contacts and all shots.
Accumulate erosion and commit it once after contacts. Record normalized piecewise target motion
segments for reflected paths and use them for projectile, merge and player contacts.

**Why.** This keeps obstruction independent of processing order: a later hazard cannot open a
lane for an earlier shot, and multiple shots hitting one cell are all consumed. A single
start/end chord after reflection would invent contacts and miss real travel legs.

**Consequence.** Holes become usable next tick, about 16 ms later. Deduplicate cell removal and
commit pocket breaches with erosion. Contact positions and split/merge origins follow the real
segment at normalized contact time; no within-tick occupancy mutation is needed.

**Owner.** [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md).

### Coalescence motion and speed

**Decision.** Average parent horizontal velocity to choose merged direction; set merged speed to
the new size preset times level speed. Near-zero averages use the lower-ID parent's direction.

**Why.** This preserves the intended direction while preventing a larger merged target from
retaining a tiny parent's slower speed.

**Consequence.** Reconstruct fluid phase from contact height and averaged vertical direction.

**Owner.** [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md).

### Gradual stage mechanics introductions

**Decision.** Introduce tissue at stage 4, gentle floor at stage 5, and the first optional pocket
at stage 9. Lipid merging is available from stage 1 with a rising probability, as described below.

**Why.** One new mechanic at a time keeps the learning curve legible while retaining existing
campaign identities and workloads.

**Consequence.** Stage 6 keeps its original four large plaques and 32 leaf units; it has no
pocket and needs no capacity compensation. New mechanics require fresh integrated acceptance.

**Owner.** [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md).

### Frozen presentation and committed releases

**Decision.** Render paused projectiles at their current simulation position. When a maintenance
timer expires with committed pocket contents still pending, explain that release must finish
rather than tell the player to hold out until zero.

**Why.** Interpolation must not move a frozen scene, and elapsed time alone cannot complete a
round while a breached pocket still owes its warned contents.

**Consequence.** Keep presentation consistent with frozen simulation and the completion predicate;
preserve visible waiting/release warnings without changing capacity or safety admission rules.

**Owner.** `src/renderer.ts`, `src/ui.ts` and the pending-release contract in
[STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md).

### Cosmetic surgeon roster

**Decision.** Keep six stable surgeon identities in presentation and saved settings. The roster
contains names, descriptions and asset references; shared simulation configuration owns every
movement, collision, muzzle and weapon value.

**Why.** A visual choice supports different player preferences without creating balance branches.

**Consequence.** Select the saved appearance in the renderer and UI. Invalid cosmetic IDs fall
back to Maya while retaining otherwise valid progress. Roster changes never alter campaign rules.

**Owner.** `src/surgeons.ts`, `src/renderer.ts`, and `src/types/surgeon.ts`.

### Stable recovery progress

**Decision.** Save campaign-clear facts as canonical-order stable `completedLevelIds` in version 3.
Award them only for successful campaign stages; practice and retries preserve the existing set.
Use a fixed territory for each stable identity and advance patient presentation by cleared count.

**Why.** Unlocks are navigation permissions and cannot represent every historical completion,
especially across inserted campaign stages. Explicit IDs keep map restoration idempotent.

**Consequence.** Migrate V1 historical prefixes and completed classic records. Limit ambiguous V2
unlock prefixes to classic IDs, while expanded records prove their earlier canonical stages.
Reject malformed V3 completion lists and preserve unsupported saves. Keep active-run resumption
outside persistence. The recovery illustration is an arcade narrative, not a clinical simulation.

**Owner.** `src/save_load.ts`, `src/recovery.ts`, and
[RECOVERY_ROSTER_PLAN.md](RECOVERY_ROSTER_PLAN.md).

### Gentler tissue introduction

**Decision.** Keep the opening three stages unchanged; reduce stages 4 and 5 to 25 and 37 mandatory
hits at speeds 0.75 and 0.85. Retain stage 6's 60-hit bounded-merge capstone.

**Why.** Teach tissue shelter and gentle floor relief before the chapter's full workload.

**Consequence.** Report the opening vector as `7, 10, 15, 25, 37, 60`. Label the earlier full-campaign
completion evidence historical and the new six-stage assisted simulation separately.

**Owner.** `src/constants.ts` and [DIFFICULTY_REVIEW.md](DIFFICULTY_REVIEW.md).

### Taller play presentation

**Decision.** Present the existing 960x540 simulation in a 16:10 canvas using uniform scale and
centering. Fill the extra margins with organic artery-wall decoration. Keep dialogs bounded to
the viewport; use a compact two-column recovery view on wide screens and stack it on narrow ones.

**Why.** The requested taller play view and smaller popups improve presentation without changing
target shapes, collision coordinates or the authored level geometry.

**Consequence.** Canvas resize affects presentation only. Circles remain circular, and decorative
margins add no playable space. The recovery header and Close footer stay visible around an internally scrolling map; all 24
stages need not be visible at once.

**Owner.** `src/renderer.ts` and `src/style.css`.

### Current route and chooser footer

**Decision.** Label the current recovery stage visibly in its stage list and expose aria-current.
Keep the surgeon chooser title and Done action outside its internally scrolling roster area.

**Why.** A map-only current marker does not identify the current stage in the visible list.
An internally scrolling roster keeps its dismissal action reachable on short screens.

**Consequence.** Preserve keyboard navigation and the existing stage availability labels.
Scope chooser layout rules to that dialog so other dialogs retain their own scrolling behavior.

**Owner.** [recovery.ts](../src/recovery.ts), [dialogs.ts](../src/dialogs.ts) and
[style.css](../src/style.css).

### Successful clear presentation and input

**Decision.** Preserve the final pop for approximately 0.3 seconds, show a short cosmetic surgeon
victory, then show results at approximately 1.2 seconds total. These are tunable presentation defaults.
Use contextual Enter and freshly pressed Space for continuation, with one transition per physical
press. Show newly restored routes inline and open the recovery map by explicit action.

**Why.** A visible outcome gives the last shot closure; carried firing input and repeated keys must
not dismiss results or start the next stage. Inline restoration preserves the route feedback while
keeping continuation direct.

**Consequence.** Freeze terminal simulation during celebration, honor reduced motion, preserve
native control activation and modal focus, and retain distinct campaign/practice completion paths.
No controllable jump or collision-state change is introduced by celebration.

**Owner.** [CLEAR_FLOW.md](CLEAR_FLOW.md), [src/main.ts](../src/main.ts),
[src/input.ts](../src/input.ts) and renderer modules.

### Lipid merging throughout intervention

**Decision.** Enable same-size lipid merging in every lipid stage. Stages 1-6 use probabilities
5%, 8%, 12%, 16%, 20%, 25%; cooldowns 3, 3, 2.5, 2, 1.75, 1.5 seconds; successful-merge
budgets 1, 1, 2, 3, 4, 5. Platelet-only chapters retain their existing target rules.

**Why.** The user wants merging to be a recurring behavior with level-dependent probability.
The previous stage-6-only restriction was an agent balancing choice, not human guidance.

**Consequence.** Each merge adds at most one removal hit; maximum opening-stage work is now
8, 11, 17 hits. Longer early cooldowns limit rapid recombination. Rates are tuning choices,
not a guarantee that a merge occurs in any run. Persistent contact still rolls only once.

**Owner.** [arena_layouts.ts](../src/arena_layouts.ts).

### Distinct floor silhouettes

**Decision.** Add broad basin, shelf and off-center shoulder profiles at stages 10/14/17,
then reuse basin and shelf with existing cover at 23/24. Keep the first six stages and tool
introductions unchanged. Highlight the exact collision surface inside the solid tissue.

**Why.** Repeating a shallow wave does not give enough spatial identity. Broad high and low
regions vary muzzle height and tissue clearance without steps, jumping or movement penalties.

**Consequence.** Preserve the existing 48-pixel relief ceiling, 0.20 slope bound and common
floor sampler. Hazard envelopes, feet, muzzle and rendering follow the same geometry. Terrain
is an arcade tissue abstraction; no claim that high or low ground is always safer.

**Owner.** [arena_layouts.ts](../src/arena_layouts.ts) and [renderer.ts](../src/renderer.ts).

### Shared compact dialog frame

**Decision.** Give every dialog a heading, scrollable content region and persistent action footer.
Dialog builders explicitly place closing, resume, restart and leave actions in that footer.
Use a 900px desktop width ceiling and 560px height ceiling with viewport gutters. The recovery
map keeps its wider specialized layout within viewport bounds. The game arena remains 16:10.

**Why.** Whole-dialog scrolling hid Done and Close below the viewport. A shared layout fixes
Settings, pause, help and medicine at the owning boundary instead of adding per-panel exceptions.

**Consequence.** Long content scrolls while heading/actions stay visible. Phone dialogs adapt to
readable width rather than forcing text into a fixed aspect ratio. Surgeon selection reuses the
same footer and native dialog focus/escape handling.

**Owner.** [dialogs.ts](../src/dialogs.ts), [main.ts](../src/main.ts) and
[style.css](../src/style.css).
