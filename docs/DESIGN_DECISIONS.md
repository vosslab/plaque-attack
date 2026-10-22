# Design decisions

<!-- VENDORED HEADER: START -->
Record each durable decision about how this code and repository are shaped, once it is settled, with
the reasoning a later reader needs. Guidance Neil Voss states belongs in
[HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md), dated history in `docs/CHANGELOG.md`, open discussion in
`docs/active_plans/decisions/`. [PROPAGATED HEADER - ENTRIES BELOW ARE YOURS]
<!-- VENDORED HEADER: END -->

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

**Decision.** Introduce tissue at stage 4, gentle floor with merging off at stage 5, merging
with existing floor/cover at stage 6, and the first optional pocket at stage 9.

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
