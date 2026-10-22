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

**Decision.** Use [GAME_SPEC.md](GAME_SPEC.md) as the proposed implementation contract for
Plaque Trouble, preserving the supplied 15-level campaign and five-level first playable milestone.

**Why.** The concept needs explicit collision, scoring, progression, and maintenance rules before
parallel implementation can share reliable contracts.

**Consequence.** Keep plaque fragmentation as an arcade metaphor and use distinct platelet hazards
for antiplatelet stages. Numerical balance settings remain playtest defaults. Specification work
does not establish implementation, browser acceptance, or deployment.

**Owner.** [GAME_SPEC.md](GAME_SPEC.md).

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

**Consequence.** The expansion plan and its design contracts define future work. Their existence
does not mean new levels, mechanics, or artwork have been implemented or accepted.

**Owner.** [active_plans/active/organic_expansion.md](active_plans/active/organic_expansion.md)
and the expansion contracts it defines.

### Expanded campaign identity and order

**Decision.** The expanded campaign has 24 levels across four chapters, with stable level IDs in
this canonical play order: `[1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10,
11, 12, 13, 14, 24, 15]`. Preserve the existing Act III mechanics and add Chapter 4 as a
presentation layer; plan a coherent migration for legacy version-1 saves.

**Why.** The ordered curve brings new players into the campaign gradually, then introduces later
challenges and chapter presentation without changing the established maintenance rules. Stable IDs
allow the authored order to evolve independently of saved progress.

**Consequence.** Treat this order and ID mapping as canonical across metadata, navigation, save
progress, and the rubric. Legacy-save migration remains planned work until implemented and verified.

**Owner.** [EXPANSION_PLAN.md](EXPANSION_PLAN.md), [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md),
and the level configuration contract in `src/constants.ts`.

### Beginner curve tuning

**Decision.** Tune the opening three levels around the accepted beginner-curve evidence: those levels
are pretty easy, while low, fast, small fragments are hard. The current adjustment direction is to
pace the first three more gently by reducing small-fragment pressure and using higher bounce arcs.

**Why.** The challenge rubric and evidence indicate that small fragments moving low and fast create
the sharpest early difficulty. The opening should give new players room to learn while preserving
the fun-first campaign direction.

**Consequence.** Treat the current adjustment as active tuning, not completed campaign acceptance.
Use progression evidence to guide balance without freezing every tunable value into permanent tests.

**Owner.** [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md) and `src/constants.ts`.

### Expansion art integration status

**Decision.** The 12 new SVG assets have passed art specification and quality review; runtime/renderer
integration remains separate work.

**Why.** Accepted source artwork is not evidence that the game loads or displays the assets.

**Consequence.** Report the assets as produced and reviewed, not integrated or campaign-accepted, until
the renderer consumes them and integrated visual checks pass.

**Owner.** [ART_DIRECTION.md](ART_DIRECTION.md) and the renderer asset-loading contract.
