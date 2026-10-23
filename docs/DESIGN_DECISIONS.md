# Design decisions

<!-- VENDORED HEADER: START -->
Record each durable decision about how this code and repository are shaped, once it is settled, with
the reasoning a later reader needs. Guidance Neil Voss states belongs in
[HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md), dated history in `docs/CHANGELOG.md`, open discussion in
`docs/active_plans/decisions/`. [PROPAGATED HEADER - ENTRIES BELOW ARE YOURS]
<!-- VENDORED HEADER: END -->

### Gameplay variety behaviors and clearance seam

**Decision.** Add three authored plaque behaviors and a one-use tissue clearance pulse while
keeping the first three stages and familiar controls. Sticky pauses at a sidewall; a medium heavy
plaque takes one hit and makes three ordinary tiny targets; an unstable plaque has a six-second
active-play fuse whose timeout makes an ordinary next-size split without hit score. Eroding the
marked seam activates one local pulse that removes nearby tiny plaques and platelets and awards
the existing removal points. Introduce these in order at display stages 4, 5, 6 and 9, with
selective later seam returns.

**Why.** The encounters add timing, target-order and cover decisions inside the existing left,
right and fire controls. The compact heavy target offers a shorter cleanup than an ordinary medium
split family. These are arcade mechanics and visual metaphors, not claims about lipid biology,
stent treatment or clinical care.

**Consequence.** `src/remix_levels.ts` owns placement and `src/lipid_behaviors.ts` plus existing
simulation owners implement behavior. Difficulty metrics calculate heavy work from its actual
three-child split. Unstable scored work is a player-shot upper bound; pulse reach and benefit are
encounter-dependent and are not exhaustively estimated. The plan's staged introduction is
authored; integrated play, readability and fun remain subject to their evidence gates.

**Owner.** [active_plans/active/gameplay_variety_plan.md](active_plans/active/gameplay_variety_plan.md),
`src/lipid_behaviors.ts`, `src/remix_levels.ts`, `src/difficulty.ts`, and
[output/gameplay_variety/metrics.md](../output/gameplay_variety/metrics.md).

### Stage-one intercept guide

**Decision.** Add a presentation-only guide in stage 1 that selects the nearest horizontal live
target, retains that target until removal, and marks its horizontal position projected by about
0.8 seconds of velocity within player-center floor limits. Pair the static chevron and target
outline with the persistent tip "Follow the drift: move toward the marker while firing."

**Why.** Detached ordinary-input measurements found a shorter unproductive interval when following
the cue, while nearest-then-latched selection avoided the measured life losses of stateless target
selection on the right-start route. Those measurements do not establish browser usability or human
comprehension.

**Consequence.** The renderer owns selection and resets it for fresh attempts, changed stages,
rewinds, and terminal phases; pause hides the cue but retains selection. The guide does not
automatically move or fire and changes no simulation, save, weapon, level, or input contract.
The independent reassessment records a sampled G5 Concern because the passive-center route retains
a 15.433-second hit gap; cue-following routes are substantially faster.

**Owner.** `src/opening_guide.ts`, `src/renderer.ts`, `src/main.ts`, and
`tests/test_opening_guide.mjs`; current reassessment status is tracked in
[playtest_improvements_plan.md](archive/playtest_improvements_plan.md).

### Completed-maintenance countdown and compact HUD

**Decision.** Display zero remaining and suppress the unfinished-maintenance warning after an
accepted maintenance clear. Retain the existing ceiling countdown during active, paused, and lost
maintenance. Keep essential objective, tool, and warning text at a 12.8px minimum, with responsive
layout preserving gameplay and controls on narrow screens.

**Why.** The prior stage-23 clear showed `00:01` at its accepted completion boundary, and the
portrait HUD's essential objective and tool text measured 10.88px and 10.4px. The fix belongs to
presentation so simulation completion semantics remain unchanged.

**Consequence.** Isolated HUD coverage and source measurements support the rendering contracts;
they do not establish actual-control clear behavior, complete built-artifact fit, or readability.
Independent rebuilt-browser reassessment assigns G6 and U5 Meets within its sampled routes and
viewports; the full scope and bounds are recorded in [PLAYTEST_RESULTS.md](PLAYTEST_RESULTS.md).

**Owner.** `src/ui.ts`, `src/style.css`, `tests/playwright/hud_countdown.spec.ts`, and the
integrated reassessment tracked in [PLAYTEST_RESULTS.md](PLAYTEST_RESULTS.md).

### Agent playtest evidence

**Decision.** Use separate categorical gameplay and usability ratings, each tied to direct
scenario evidence. Keep human enjoyment distinct and do not average ratings into a score.

**Why.** Browser observations can show sampled interaction and friction, but cannot establish
population-level experience or prove enjoyment. One aggregate would hide unlike criteria and
unequal evidence.

**Consequence.** Record `Meets`, `Concern`, `Fail`, or `Not observed` for all twelve criteria;
state build, scenario, evidence lane and sample limits. Treat agent findings as bounded evidence,
not forced approval or a human enjoyment claim.

**Owner.** [PLAYTEST_RUBRICS.md](PLAYTEST_RUBRICS.md) and
[PLAYTEST_RESULTS.md](PLAYTEST_RESULTS.md).

### Current documentation screenshots

**Decision.** Refresh the thirteen managed screenshots together through one capture command,
using quality-90 WebP and a manifest of build hashes, image hashes and scene provenance.

**Why.** Publishing new artwork under a separate review filename left the README showing the
old cast. A complete refresh keeps the existing reader-facing names and embeds current.

**Consequence.** Reject stale build inputs, keep intermediate PNG buffers in memory, inspect
encoded WebPs, and label staged recovery/unlock saves. Historical ignored proof remains separate.

**Owner.** [SCREENSHOTS.md](SCREENSHOTS.md) and
[capture_docs_screenshots.mjs](../tests/playwright/capture_docs_screenshots.mjs).

### Plaque Attack identity

**Decision.** Use **Plaque Attack** as the current display name in the game, metadata and
product documentation. Preserve the repository URL and saved-data keys.

**Why.** The user repeated the intended rhyming title. The earlier Plaque Trouble display
name drifted from that identity.

**Consequence.** Historical changelog entries and completed plan headings may retain the old
name when clearly labeled historical. Correct current player-facing references at their owner.

**Owner.** [GAME_SPEC.md](GAME_SPEC.md) and [src/index.html](../src/index.html).

### Art identity and recovery

**Decision.** Give the six-surgeon cast, six artery settings and cardiac recovery composition
one tangible illustrated world. Favor distinct silhouettes and personalities, readable play
space, and recovery milestones that visibly reward progress. The lean brief is in
[ART_DIRECTION.md](ART_DIRECTION.md).

**Why.** The requested art pass calls for stronger visual identity and meaningful recovery.
Forwarded commentary from another project informs the approach; it is source material rather
than verbatim human rules for this repository.

**Consequence.** Artists choose the visual solutions within existing SVG, collision, anchor,
save and ability contracts. Accept the integrated artwork after actual gameplay-size and
recovery-state captures, fresh specification review, independent visual review and integration.

**Owner.** [ART_DIRECTION.md](ART_DIRECTION.md), with delivery status in
[active_plans/active/art_identity.md](active_plans/active/art_identity.md).

### Cosmetic cast expression

**Decision.** Express six personalities through distinct stature, mass, face, hair, posture,
accessories, chooser copy and idle/victory cadence. Keep the chunky arcade style, editable SVG
sources and the shared source anchors and articulation seams.

**Why.** A same-ability choice becomes meaningful when players recognize an attitude and
silhouette at the actual 44x60 gameplay size. Color and costume alone were insufficient in
the initial roster review.

**Consequence.** Check native grayscale and solid silhouettes as well as full portraits.
Motion is presentation only and reduced motion is static. Distinctness requires visual review;
valid XML and preserved coordinates establish source integrity only.

**Owner.** [ART_DIRECTION.md](ART_DIRECTION.md), `src/surgeons.ts`, `src/surgeon_motion.ts`,
`src/renderer.ts`, and chooser-scoped rules in `src/dialogs.ts` and `src/style.css`.

### Purposeful recovery poses

**Decision.** Preserve patient identity across five poses from seated rest to purposeful
activity, with stronger body and limb silhouettes. Keep the existing heart, map anchors,
stable route IDs and territory overlays.

**Why.** Changes in posture and activity make the existing milestones emotionally legible.
Shared face, hair and clothing identify the same person through those changes.

**Consequence.** The artwork carries the visible return to activity; `src/recovery.ts` owns
restored territories and state text. Staged route fixtures establish presentation, not earned
campaign completion or a medical outcome.

**Owner.** [ART_DIRECTION.md](ART_DIRECTION.md), `src/assets/cardiac_recovery.svg`, and
`src/recovery.ts`.

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

**Owner.** [active_plans/active/organic_expansion.md](active_plans/active/organic_expansion.md)
and the expansion contracts it defines.

### Expanded campaign identity and order

**Decision.** The expanded campaign has 24 levels across four chapters, with stable level IDs in
this canonical play order: `[1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10,
11, 12, 13, 14, 24, 15]`. The remix preserves this order and the first three stages while
reauthoring later encounters. Historical expansion save decisions are superseded by version 4.

**Why.** The ordered curve brings new players into the campaign gradually, then introduces later
challenges and chapter presentation with explicit finite and maintenance objectives. Stable IDs
allow the authored order to evolve independently of saved progress.

**Consequence.** Treat this order and ID mapping as canonical across metadata, navigation, save
progress, and the rubric. Preserve earlier editions and completion facts through version-4 migration;
keep classic, expanded and remix records separate so historical scores retain their meaning.

**Owner.** `src/constants.ts`, `src/remix_levels.ts`, [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md)
and [archive/remix_campaign_plan.md](archive/remix_campaign_plan.md).

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

**Decision.** Use deterministic fluid drift with smooth analytic vertical orbits. Plaques use a
rounded profile (`k=0.90`) that shortens lower turns; platelets retain their original cosine
profile. Size-based lateral speeds and a shared vertical angular rate scale per stage. A shared
24-unit wall inset preserves suspended turns and access to the short-range firing/contact region.
Select the six lipid appearances from stable target IDs in the renderer; visual form does not
alter medical target identity or physics.

**Why.** The requested setting is a fluid, gravityless interior-body environment where lipid and
bubble motion should feel smooth and buoyant. Ballistic bounces suggest gravity and floor contact.

**Consequence.** Keep first-three-level ease as the leading challenge priority. Use the shared
kind-selected orbit for motion, creation, rephasing and plaque exposure reporting. The scoped local
trial is accepted: controlled no-fire observations reduce floor-band dwell and travel by 17.4%
on a flat floor and 14.4% on a wavy floor, while adaptive route pacing is mixed. Platelet control
motion is unchanged. These results do not establish human enjoyment or universal play improvement;
final integration accepts the current source, with no human study or universal play-improvement
claim.

**Owner.** `src/motion.ts`, [EXPANSION_PLAN.md](EXPANSION_PLAN.md),
[DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md), and the renderer asset-loading contract.

### Plaque rounded floor turns

**Decision.** Use the rounded analytic orbit only for plaques and preserve platelet cosine
motion exactly. Share plaque position, derivative and inverse across motion, creation, rephasing
and flat-floor exposure estimates.

**Why.** Controlled no-fire observations show lower floor-band dwell and travel (17.4% flat,
14.4% wavy) with bounds and period preserved. Adaptive routes vary: they do not show a universal
clear-time or total-exposure improvement. Fixed-center first-stage held fire clears both versions
at 32.62 seconds with three lives, showing an ordinary alternative to the slower adaptive cleanup.

**Consequence.** Keep the plaque-only profile as the accepted scoped trial. Describe paired
observations separately from adaptive clear routes, and keep claims limited to these scenarios.

**Owner.** `src/motion.ts`, `src/characters.ts`, `src/difficulty.ts`, and
[archive/lipid_floor_turn_plan.md](archive/lipid_floor_turn_plan.md).

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

**Decision.** Introduce tissue at stage 4, gentle floor and optional support at stage 5, and the
optional hazard-risk pocket at stage 9. Lipid merging is available from stage 1 with rising
probability. The remix adds currents at stage 8 without changing the first three stages.

**Why.** One new mechanic at a time keeps the learning curve legible while retaining existing
campaign identities and workloads.

**Consequence.** Stage 6 keeps its four original large plaques and 32 total authored leaf units
across two finite groups, with no pocket. New mechanics require fresh integrated acceptance.

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

**Decision.** Preserve the final pop for approximately 0.3 seconds, move into a full-body surgeon
close-up, then play the victory gesture and hold before results at approximately 2.2 seconds total.
Start the gesture after the camera settles so its action is visible at the enlarged scale.
Reduced motion cuts to a static close-up. These are tunable presentation defaults.
Use contextual Enter and freshly pressed Space for continuation, with one transition per physical
press. Show the patient recovery illustration directly in every successful result, with the
cleared route emphasized and an explicit continuation action. Keep route browsing optional.

**Why.** A visible outcome gives the last shot closure; carried firing input and repeated keys must
not dismiss results or start the next stage. The former optional-map button hid the visual payoff
from players who continued normally. Following Bad Cell Day's completion-panel pattern makes
recovery visible without adding a mandatory dialog dismissal.

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

### Scientist-inspired surgeon ensemble

**Decision.** Use inspected Nobel laureate and HHMI scientist photographs as a pool of visual
observations for six original surgeons. Give the cast different age ranges, builds, facial
structures and invented personal interests, while retaining common surgical equipment cues.

**Why.** The supplied creative critique identified generic personality classes and conventional
visual shortcuts. Mixing observed features and independently invented stories gives the cast
more specific identities. The critique informs this decision as supplied source material.

**Consequence.** Revise both base and victory SVGs, chooser descriptions and cosmetic cadence.
Keep stable IDs, selection layout, shared abilities and the Canvas articulation contract.
Reference photographs are local study material; the game ships only original editable artwork.

**Owner.** [ART_DIRECTION.md](ART_DIRECTION.md), [src/surgeons.ts](../src/surgeons.ts),
[src/surgeon_motion.ts](../src/surgeon_motion.ts) and the surgeon SVGs in src/assets.

### First-run surgeon choice

**Decision.** Open the surgeon chooser when no explicit choice is saved. Require a card
activation before Continue returns to the menu. Keep Play campaign guarded until a choice
exists, and remember the choice across reloads.

**Why.** The user asked to choose a surgeon first thing before level 1. The default Maya
portrait cannot establish player intent. Dismissing a dialog should not start a stage.

**Consequence.** Store a validated `surgeonChosen` boolean alongside the stable surgeon ID.
Older saves retain their progress and selected ID but receive the new explicit-choice prompt.
The ordinary chooser remains available for later changes. Keyboard dismissal returns to the
menu; campaign play reopens the prompt while no choice exists.

**Owner.** [src/main.ts](../src/main.ts), [src/dialogs.ts](../src/dialogs.ts) and
[src/save_load.ts](../src/save_load.ts).

### Flexible stent geometry

**Decision.** Depict stents with rounded crown rings, short curved bridges and restrained
front/back metal shading. Use the same visual language for fired tools and retained implants.

**Why.** Straight crossed struts and long boundary rails read as a trellis. Curved open cells
give the medical device a flexible tubular form while remaining readable at gameplay size.

**Consequence.** Keep the projectile footprint, timing and collision behavior unchanged. The
generic wall implant reuses the tool SVG; the two artery scenes retain editable wall-fitted art.

**Owner.** [src/assets/stent.svg](../src/assets/stent.svg), the retained-implant groups in the
stented/healed scene SVGs, and [src/renderer.ts](../src/renderer.ts).

### Landing illustration layers

**Decision.** Isolate the hero artwork and assign explicit local layers: artery background,
shot, then lipid targets, surgeon and sparks. Rotate the scene once at its container; keep
foreground elements free of individual CSS transforms and drop-shadow filters.

**Why.** The reported Firefox image loses transformed children while retaining an untransformed
spark. A single scene transform reduces nested clipping/compositing work; explicit layer ownership
makes the intended paint order clear. The screenshot supports this mitigation, not a proven
browser-engine diagnosis.

**Consequence.** Preserve positions, dimensions and SVGs; foreground artwork leans with the
scene instead of counter-rotating. Cross-browser captures validate the intended appearance;
they do not establish reproduction of the reported clipping defect.

**Owner.** [src/style.css](../src/style.css).

### Low tissue shields

**Decision.** Position each cover patch above the local floor with a small surgeon-head
clearance. Keep the patch rigid and the arch opening shallow. Use the shared floor sampler and
player dimensions so sloped-floor placement follows the same geometry as walking.

**Why.** High cover leaves a large chamber where lipids can bounce beneath the shield.
Lower cover reduces that space while leaving the surgeon room to move and carve a firing hole.

**Consequence.** Preserve the central firing lane and optional membrane-pocket coordinates.
Small hazards can still enter from the sides; cover reduces exposure rather than granting immunity.

**Owner.** [src/arena_layouts.ts](../src/arena_layouts.ts),
[src/floor_geometry.ts](../src/floor_geometry.ts), and
[src/player_dimensions.ts](../src/player_dimensions.ts).


### Remix interactions and cadence

The remix decisions below incorporate LLM reviewer input adopted by the manager; they are
design direction, not quotations or guidance attributed to the human.

**Decision.** Keep left/right/fire and the first three stages. Add any-tool flow switches with
four-second bounded steering and a shared six-second cooldown, optional one-contact shields at
5/11/16/20/23/24, and clear-gated finales at 6/12/18/24. Stage 18 guarantees clopidogrel piercing;
19/21/23 use dual maintenance, while 20/22 are finite breathers.

**Why.** Shelter, carving, lane selection and optional support create consequential spatial
choices; finite relief and distinct earned transformations break up sustained pressure.

**Consequence.** Active/cooling switches pass shots; current expiry restores ordinary drift.
Support never blocks clear and overload bypasses its nonstacking shield. Phases preserve tissue,
current and shield; pending hazard releases still block advancement. Devices remain arcade fiction.

**Owner.** `src/remix_levels.ts`, `src/remix_mechanics.ts`, `src/waves.ts`, and
[archive/remix_campaign_plan.md](archive/remix_campaign_plan.md).

### Quick retry and fair records

**Decision.** Make same-stage retry primary on failure, using entry seed and score, three lives,
one-second ready and cleared held inputs. Carry run retry count across stages. Failure and retry
commit no record; true completion or confirmed intentional departure finalizes the displayed
attempt exactly once. Save version 4 preserves older data and keeps five records per edition.

**Why.** Immediate retries support learning without score farming or erasing historical records.

**Consequence.** Clear recovery and unlocks persist before celebration; the final clear commits
its completed record there too. Practice never heals or ranks. Remix ties prefer fewer retries,
then later canonical position and earlier date. Older records gain no invented retry history.

**Owner.** `src/main.ts`, `src/game_state.ts`, `src/save_load.ts`, and `src/types/save.ts`.

### Phase measurements and quiet feedback

**Decision.** Separate first-phase occupancy, all-phase work and maximum-phase concurrency in
`src/difficulty.ts`. Tie distinct restoration and restrained feedback to actual gameplay events.

**Why.** Total authored leaves overstate simultaneous density, while generic finale art hides
progress. Neither descriptive measurements nor automated completion establish player enjoyment.

**Consequence.** Named groups retain order and clear gating. Support adds no target workload;
its tissue cells count once. The renderer preserves cast identity, quiet hazards, mute and reduced
motion. Short landscape uses a HUD sidebar to preserve a large fixed-world arena. Status content
scrolls within its own row; Pause keeps a separate persistent row. Completion headings follow
the objective: maintenance, finite stage, or full campaign restoration.

**Owner.** `src/difficulty.ts`, `src/remix_rendering.ts`, `src/style.css`,
[DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md) and [ART_DIRECTION.md](ART_DIRECTION.md).

### Remix acceptance evidence

**Decision.** Require an actual-input browser campaign for reachability. Use fixtures for isolated
mechanics and presentation, with source checks, rendered review and full suites recorded separately.

**Why.** Injected stage state cannot establish that ordinary controls can complete the campaign.

**Consequence.** Match acceptance to the delivered build and retain each check's scope. Automated
completion establishes reachability; player enjoyment remains an experience judgment.

**Owner.** [active_plans/reports/remix_execution_ledger.md](active_plans/reports/remix_execution_ledger.md).

### Further creative iteration

**Decision.** Assess later ideas by player-visible fun, surprise and mastery. Start a separate
iteration after the accepted remix closes, drawing on the reviewer-derived direction.

**Why.** New spatial decisions and satisfying payoffs improve play; more infrastructure alone
does not provide those experiences.

**Consequence.** Give each proposed addition a concrete play benefit and observable experience
check before expanding systems or tooling.

**Owner.** [FUN_SURVEY.md](FUN_SURVEY.md) and [GAME_SPEC.md](GAME_SPEC.md).

### Stage 23 entry shift

**Decision.** Forecast one right-side entry shift halfway through stage 23's existing maintenance
objective. Offer crossing to gather or staying left to carve shelter; preserve both switches,
ordinary warning/spawn handling, cover, shield, score and cooldown state.

**Why.** The reviewer-derived direction favors a legible spatial choice using existing mechanics.
An optional maintenance field and elapsed-time cue make that choice visible without new combat
rules or reset state. Actual-input completion establishes route feasibility, not human enjoyment.

**Consequence.** Already announced arrivals keep their targets. Pause freezes cue timing and retry
uses the normal fresh stage. Difficulty reports include the optional shift as descriptive pattern
metadata; unchanged target sizes and cadence require no metric formula change.

**Owner.** `src/remix_levels.ts`, `src/waves.ts`, `src/entry_shift.ts`, `src/difficulty.ts`,
and [GAME_SPEC.md](GAME_SPEC.md).

### Opening guidance and bounded playtest findings

**Decision.** Use a persistent stage-one instruction with a static, latched intercept marker to
teach movement while firing. Keep the cue presentational: it does not aim, move or fire for the
player and does not change simulation rules. Completed maintenance displays zero remaining while
active countdown behavior retains its existing ceiling.

**Why.** In the sampled input comparison, following the marker greatly shortened the stage-one
route and productive-event gap. The passive-center held-fire route remained unchanged, so the
evidence supports a useful optional guide but not a universal pacing fix.

**Consequence.** Keep G5 at Concern for the measured passive-center gap and document it as a
residual finding, not a required implementation or a human-study claim. G6 and U5 ratings follow
the rebuilt browser evidence and remain bounded to the sampled artifact and viewports.

**Owner.** `src/opening_guide.ts`, `src/renderer.ts`, `src/ui.ts`, `src/style.css`, and
[PLAYTEST_RESULTS.md](PLAYTEST_RESULTS.md), with delivery status in
[archive/playtest_improvements_plan.md](archive/playtest_improvements_plan.md).
