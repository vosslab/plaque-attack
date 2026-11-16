# Campaign and mechanics decisions

These settled decisions are part of the [design decisions index](DESIGN_DECISIONS.md).
They preserve the campaign, geometry, collision, and persistence contracts and their historical
context; current behavior remains owned by the linked specifications and source.

### Game specification authority

**Decision.** Use [GAME_SPEC.md](GAME_SPEC.md) as the current gameplay contract for
Plaque Attack. The current [remix_campaign_plan.md](archive/remix_campaign_plan.md)
and `src/remix_levels.ts` own the remix composition; the expansion matrix remains historical.

**Why.** The concept needs explicit collision, scoring, progression, and maintenance rules before
parallel implementation can share reliable contracts.

**Consequence.** Keep plaque fragmentation as an arcade metaphor and use distinct platelet hazards
for antiplatelet stages. Numerical balance settings remain playtest defaults. Specification work
does not establish implementation, browser acceptance, or deployment.

**Owner.** [GAME_SPEC.md](GAME_SPEC.md), `src/constants.ts`, `src/remix_levels.ts` and
[archive/remix_campaign_plan.md](archive/remix_campaign_plan.md).

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

**Owner.** [archive/organic_expansion.md](archive/organic_expansion.md)
and the expansion contracts it defines.

### Expanded campaign identity and order

**Decision.** The expanded campaign has 24 levels across four chapters, with stable level IDs in
this canonical play order: `[1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10,
11, 12, 13, 14, 24, 15]`. The remix preserves this order and the first stage configuration while
reauthoring later encounters. Historical expansion save decisions are superseded by version 4.

**Why.** The ordered curve brings new players into the campaign gradually, then introduces later
challenges and chapter presentation with explicit finite and maintenance objectives. Stable IDs
allow the authored order to evolve independently of saved progress.

**Consequence.** Treat this order and ID mapping as canonical across metadata, navigation, save
progress, and the rubric. Preserve earlier editions and completion facts through version-4 migration;
keep classic, expanded and remix records separate so historical scores retain their meaning.

**Owner.** `src/constants.ts`, `src/remix_levels.ts`, [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md)
and [archive/remix_campaign_plan.md](archive/remix_campaign_plan.md).

### Early weapon discovery (superseded count)

**Decision.** Keep all 24 stable IDs in their existing display order and preserve display 1 (ID 1)
exactly. Introduce aspirin at display 2 (ID 16) against two separated small platelets and
clopidogrel at display 3 (ID 2) against three vertically aligned small platelets; one persistent
shot can inactivate all three. Keep the opening speed multipliers at 0.55, 0.60, and 0.65 and
retain flat arenas. Name chapter 1 First Response. Use displays 4-6 to introduce sticky, heavy,
and unstable plaque; treat displays 7 and 13 as mastery, not first tool discovery. Retain current,
seam, support, dual-tool, and finale placements later in the campaign.

**Why.** A player can leave after six stages without seeing the newer weapons. The manager adopted
an early, reduced-pressure tool introduction inspired by the progression analogy in *A Theory of
Fun for Game Design* (2013), lines 456-500, and SteroidQuest's use of stable controls with new uses.
The opening remains gentle while later stages let players practice and combine the tools.

**Consequence.** Stable IDs continue to own saves, records, unlocks and recovery; chapter 1 stays
an act-independent presentation group. The four finales at displays 6, 12, 18, and 24 remain in
place; later dual-tool current and seam encounters remain part of mastery play. The corrected
opening disables platelet-stage merge cues for IDs 16 and 2 while leaving shared lipid merge rules
unchanged. On corrected build
`f99fb7d2d4dc3a5ff7b8fab578cbd08e0dc1ad88995e9c393460628334633590`, sampled actual-control play
cleared displays 2 and 3 in 7.283 and 1.083 seconds, respectively, each with three lives. Display 4
cleared in 63.0 seconds with one life, and a lookahead-assisted keyboard route cleared both
display-6 finale phases in 102.433 seconds with three lives. A stage-2 contact-loss retry cleared
in 5.8 seconds with aspirin and three lives; this retry route is from prior build
`72978ad2188f581d024a4e9e32ccf4f0cbfb88975ca70bcdd68b0465947663aa`. The corrected-build display-3
route fires once after the ready interval and no further times; its three-target clear is recorded
in `final.json` and its input sequence in `final.mjs`. Corrected-build routes establish sampled
reachability, not unaided player performance or human enjoyment. Earlier full-browser and campaign
routes also predate the merge correction. Final integration accepts the sampled delivery within
these evidence limits; the full verdict is in `output/early_weapons/integration.md`. Details are
in `output/early_weapons/play/final.json`, `output/early_weapons/play/final.mjs`,
`output/early_weapons/play/retry.json`, `output/early_weapons/play/center-return.json`, and
`output/early_weapons/play/finale-assisted.json`.

**Owner.** [early_weapon_discovery.md](archive/early_weapon_discovery.md),
`src/constants.ts`, `src/remix_levels.ts`, [GAME_SPEC.md](GAME_SPEC.md), and
[DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md).

### Fluid motion and organic presentation

**Decision.** Use deterministic fluid drift with smooth analytic vertical orbits. Plaques use a
rounded profile (`k=0.90`) that shortens lower turns; platelets retain their original cosine
profile. Size-based lateral speeds and a shared vertical angular rate scale per stage. A shared
24-unit wall inset preserves suspended turns and access to the short-range firing/contact region.
Select the six lipid appearances from stable target IDs; appearance does not alter identity or physics.

**Why.** The requested setting is a fluid, gravityless interior-body environment where lipid and
bubble motion should feel smooth and buoyant. Ballistic bounces suggest gravity and floor contact.

**Consequence.** Keep opening ease as the challenge priority. Use the kind-selected orbit for
ordinary motion until first physical impulse, then the shared bounded restoring field for every
plaque and platelet. Exact parabolic free flight and speed-preserving reflections return targets
to the lower firing/play region in seconds. Floor normal-offset tolerance and loss-only settling
of an entire sub-resolution vertical orbit qualify conservation; the existing chord error supplies
the settling threshold without another tuning knob. Collision chords approximate instantaneous
velocity. [CORE_INTERACTIONS_DESIGN.md](CORE_INTERACTIONS_DESIGN.md) owns these bounds and the global
motion contract. Representative encounters verify useful cleanup.

**Owner.** `src/motion.ts`, `src/impulse_motion.ts`, [EXPANSION_PLAN.md](archive/EXPANSION_PLAN.md),
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

**Owner.** [STAGE_MECHANICS_PLAN.md](archive/STAGE_MECHANICS_PLAN.md).

### Coalescence motion and speed

**Decision.** Average parent horizontal velocity to choose merged direction; set merged speed to
the new size preset times level speed. Near-zero averages use the lower-ID parent's direction.

**Why.** This preserves the intended direction while preventing a larger merged target from
retaining a tiny parent's slower speed.

**Consequence.** Reconstruct fluid phase from contact height and averaged vertical direction.

**Owner.** [STAGE_MECHANICS_PLAN.md](archive/STAGE_MECHANICS_PLAN.md).

### Gradual stage mechanics introductions

**Decision.** Introduce tissue at stage 4, gentle floor and optional support at stage 5, and the
optional hazard-risk pocket at stage 9. Lipid merging is available from stage 1 with rising
probability. The remix adds currents at stage 8 while preserving the stable ID order.

**Why.** One new mechanic at a time keeps the learning curve legible while retaining familiar
controls and broader progression.

**Consequence.** Stage 6 keeps its four original large plaques and 32 total authored leaf units
across two finite groups, with no pocket. New mechanics require fresh integrated acceptance.

**Owner.** [STAGE_MECHANICS_PLAN.md](archive/STAGE_MECHANICS_PLAN.md).

### Frozen presentation and committed releases

**Decision.** Render paused projectiles at their current simulation position. When a maintenance
timer expires with committed pocket contents still pending, explain that release must finish
rather than tell the player to hold out until zero.

**Why.** Interpolation must not move a frozen scene, and elapsed time alone cannot complete a
round while a breached pocket still owes its warned contents.

**Consequence.** Keep presentation consistent with frozen simulation and the completion predicate;
preserve visible waiting/release warnings without changing capacity or safety admission rules.

**Owner.** `src/renderer.ts`, `src/ui.ts` and the pending-release contract in
[STAGE_MECHANICS_PLAN.md](archive/STAGE_MECHANICS_PLAN.md).

### Cosmetic surgeon roster

**Decision.** Keep six stable surgeon identities in presentation and saved settings. The roster
contains names, descriptions and asset references; shared simulation configuration owns every
movement, collision, muzzle and weapon value.

**Why.** A visual choice supports different player preferences without creating balance branches.

**Consequence.** Select the saved appearance in the renderer and UI. Invalid cosmetic IDs fall
back to Maya while retaining otherwise valid progress. Roster changes never alter campaign rules.

**Owner.** `src/surgeons.ts`, `src/renderer.ts`, and `src/types/surgeon.ts`.

### Stable recovery progress

**Decision.** Save campaign-clear facts as canonical-order stable `completedLevelIds` in version 4.
Award them only for successful campaign stages; practice and retries preserve the existing set.
Use a fixed territory for each stable identity and advance patient presentation by cleared count.

**Why.** Unlocks are navigation permissions and cannot represent every historical completion,
especially across inserted campaign stages. Explicit IDs keep map restoration idempotent.

**Consequence.** Migrate V1 historical prefixes and completed classic records. Limit ambiguous V2
unlock prefixes to classic IDs, while expanded records prove their earlier canonical stages.
Reject malformed V3/V4 completion lists and preserve unsupported saves. Keep active-run resumption
outside persistence. The recovery illustration is an arcade narrative, not a clinical simulation.

**Owner.** `src/save_load.ts`, `src/recovery.ts`, and
[RECOVERY_ROSTER_PLAN.md](archive/RECOVERY_ROSTER_PLAN.md).

### Historical: gentler tissue introduction

**Decision.** The earlier campaign kept the opening three stages unchanged, reduced stages 4 and 5
to 25 and 37 mandatory hits at speeds 0.75 and 0.85, and retained stage 6's 60-hit
bounded-merge capstone. The early-weapon discovery decision above supersedes the first-three-stage
workload claim.

**Why.** Teach tissue shelter and gentle floor relief before the chapter's full workload.

**Consequence.** The earlier opening vector was `7, 10, 15, 25, 37, 60`. Keep its full-campaign
completion evidence historical; current opening values follow [GAME_SPEC.md](GAME_SPEC.md) and
the approved early-weapon plan.

**Owner.** `src/constants.ts` and [DIFFICULTY_REVIEW.md](DIFFICULTY_REVIEW.md).
