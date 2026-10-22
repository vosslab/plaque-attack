# Plan: A livelier 24-stage campaign

**Status:** The 24-stage organic expansion and integrated tissue, floor, pocket and merge
mechanics are locally accepted, 2026-10-22. All expansion milestones and S1-S7 are complete;
fresh evidence and limits are recorded in [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md).
[STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md) owns their contracts and sole placement matrix.

## Context

The user wants more levels, a measured difficulty progression, organic medical artwork, and
more lipid variety. The latest priority is fun: learning can be part of the fun. This plan turns
the existing 15-stage game into 24 authored encounters, rather than extending its timers.
Planning is complete when contracts and the matrix are reviewable; delivery requires implementation
and the acceptance evidence below. Local acceptance is complete; external deployment is separate.

## Objectives

- Ship 24 reachable stages with distinct movement, firing, and entry-pattern decisions.
- Show four playful chapters and honest stage ordinals, with difficulty measured from real configs.
- Render organic artery, plaque, platelet, and tool artwork with readable silhouettes.
- Preserve existing progress, settings, and historical campaign records.
- Keep optional medical explanations brief, accurate, and connected to what the player sees.

## Design philosophy

Apply **Dream big**, **Fix the design, not the symptom**, and **Use the scientific method** from
[REPO_STYLE.md](REPO_STYLE.md). Author a stronger campaign on the existing arcade rules. Use
short rounds, target-size mixtures, crossing currents, and predictable entry motifs to create variety.
Tune from config measurements and browser play; a formula alone cannot establish fun.

## Scope

- Expand the campaign, chapter presentation, practice menu, and result progression together.
- Add the computable rubric defined in [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md).
- Add organic SVG artwork and visual-only plaque variants selected by stable target ID.
- Sequence maintenance entries so authored movement motifs actually occur.
- Migrate old saves and label old records as the original 15-stage campaign.

## Non-goals

- Add clinical treatment decisions, dosing, mandatory quizzes, or weapon-selection complexity.
- Introduce new collision classes for each illustrated lipid form.
- Claim that drug projectiles dissolve plaque or that winning cures disease.
- Publish remotely without the user's deployment authorization.

## Historical baseline analysis

The original expansion analysis inspected [../src/constants.ts](../src/constants.ts),
[../src/types/level.ts](../src/types/level.ts), [../src/waves.ts](../src/waves.ts),
[../src/save_load.ts](../src/save_load.ts), and [../src/main.ts](../src/main.ts).
[GRAPHIFY.md](GRAPHIFY.md) describes a different repository template; it is unsuitable as a game
dependency map. The actual game uses a small fixed-step simulation and separate Canvas renderer.

Before the 24-stage expansion, the 15-stage campaign had these contracts and hazards:

- One large plaque requires 15 hits; medium requires seven, small three, and tiny one.
- Old stage 3 requires 29 hits, slightly fewer than stage 2's 30, despite its later position.
- Stage 6 deliberately resets to four platelet hits after stage 5's 60 plaque hits.
- Old maintenance lasts 45, 60, 75, 90, 90, and 120 seconds. Duration carries too much variety.
- `LevelId`, act types, completed-record validation, and UI copy assume 15 stages or three acts.
- Unlock comparisons and record tie breaks compare numeric IDs. Reordering requires ordinal helpers.
- Maintenance randomly chooses entry positions; a left/right motif needs actual sequence ownership.

## Architecture boundaries and ownership

### Mapping (milestones -> components)

| Milestone | Component | Review boundary |
| --- | --- | --- |
| M1 | Level contracts and campaign order | One authoritative ordered list and metadata |
| M2 | Configs, rubric, progression, art | Independent source owners after contracts settle |
| M3 | Rendering and application integration | Actual target variants, chapter UI, migration |
| M4 | Browser acceptance and documentation | Built artifact and explicit evidence limits |

### File scope

Assign one exclusive owner to each group before implementation. Owners preserve other agents' edits
and raise contract questions with the manager before compensating locally.

| Owner boundary | Expected files | Responsibility and dependency |
| --- | --- | --- |
| Contracts/configuration | `src/types/level.ts`, `src/constants.ts`, `src/waves.ts` | Freeze types, author all 24 configs, order/ordinal helpers and entry sequencing atomically; M1 first |
| Rubric/report | new `src/difficulty.ts`, development report tool | Pure config-derived metrics; consumes M1, writes no level configs |
| Progression/persistence | `src/types/save.ts`, `src/save_load.ts`, `src/main.ts`, `src/dialogs.ts`, `src/ui.ts`, `src/index.html`, `src/style.css` | Migrate v1, show chapter/stage order, update all progress consumers after M1 |
| Renderer variant selection | `src/renderer.ts` | Select deterministic visual-only appearance by stable target ID after M1 |
| Art | `src/assets/*.svg` | Original editable organic assets with a manifest agreed at M1 |
| Rendering | `src/types/runtime.ts`, `src/assets.ts`, `src/renderer.ts` | Load manifest, render variants and scenes; depends on M1 and art manifest |
| Integration/review | existing tests, game docs, build output | Adapt meaningful contracts, run gates, inspect actual browser output |

These are ownership boundaries for dispatch, not permission to edit vendored style files.
Generate `dist/` from canonical source with the repository build script. Keep temporary tuning
reports and captures in the existing temporary evidence location agreed by the manager.

### Campaign contracts

Keep original numeric IDs 1-15 as stable identities. Add IDs 16-24; presentation uses the index in
`LEVEL_IDS`, never the numeric ID. Canonical order:

```text
1,16,2,3,4,5, 6,17,7,18,19,20, 8,21,9,22,23,10, 11,12,13,14,24,15
```

The four six-stage chapters are **Plaque Patrol**, **Platelet Pop**, **Pulse Partners**, and
**Flow State**. Use required `chapter: Chapter` (1-4) as the presentation authority; preserve
`act: Act` (1-3) for the existing mechanical/rendering contract. Add required `scene: SceneId`
and nonempty `lipidVariants: readonly [LipidVariant, ...LipidVariant[]]` without changing target
identity or physics. Appearance keys are `lipid-amber`, `lipid-pear`, `lipid-ruffled`, `lipid-lobed`,
`lipid-dimpled`, and `lipid-swirl`. These are playful visual forms, not six new medical substances.
The renderer selects each target's variant from its stable ID; split children may differ from
their parent. Appearance remains visual-only, with no simulation appearance field. Shape and texture distinguish variants
as well as color. Make high-detail art readable at tiny target size.

Maintenance has required `entryOrder: "cycle" | "seeded"`; all new configs choose `cycle` and
consume their entry list starting at index zero to implement the motifs below. Seeded behavior
remains an explicit supported mode for existing simulation coverage. Finite
clear waves retain authored scheduled positions/directions and existing early-arrival behavior.
All entry warnings retain 0.75 seconds. The subsequent mechanics extension adds floor-aware
geometry and tissue collision through [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md).
`campaignPosition(id)` returns the one-based display order. `isLevelUnlocked(id, unlocked)`
compares canonical positions; all progress consumers use these helpers and `nextLevelId`.

### Target and wave matrix

This matrix owns target/wave composition, speed and chapter metadata. Arena mechanics placement
lives only in [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md#stage-placement-matrix).

`L/M/S/T` mean large/medium/small/tiny. Plaque letters refer to splitting targets; platelet letters
refer to one-hit hazards. `+nT@x` means n finite tiny reinforcements at x-second intervals, beginning
at x seconds; an empty arena can accelerate the next arrival under existing rules. All clear
objectives end after every initial and scheduled hazard is gone, without a time limit.

| Stage / ID | Name / tool | Initial; arrivals | Speed multiplier | Objective / seconds | Entry and movement motif | Scene / optional concept |
| --- | --- | --- | --- | --- | --- | --- |
| 1 / 1 | First blockage / stent | 1M; none | 0.55 | Clear / unlimited | One medium family, slow fluid drift | Artery interior / plaque in artery walls |
| 2 / 16 | Little trouble / stent | 1M+1S; none | 0.60 | Clear / unlimited | Medium and small families on slow crossing currents | Lipid pools / mixed plaque components |
| 3 / 2 | Crossing currents / stent | 1L; none | 0.65 | Clear / unlimited | One large family with slow fluid descendants | Endothelial folds / crossing trajectories |
| 4 / 3 | Three-way squeeze / stent | 1L+1M+1S; none | 0.75 | Clear / unlimited | Mixed sizes crossing three lanes | Wall cross-section / wall-associated plaque |
| 5 / 4 | Lesion junction / stent | 2L+1M; none | 0.85 | Clear / unlimited | Medium center between two large families | Fibrous ridges / fibrous plaque components |
| 6 / 5 | Plaque crescendo / stent | 4L; none | 1.00 | Clear / unlimited | Four families, staggered upper heights | Textured lesion / arcade stent abstraction |
| 7 / 6 | Aspirin arcade / aspirin | 4S; none | 0.85 | Clear / unlimited | Broad separated currents; tool lesson | Installed stent / platelet activity |
| 8 / 17 | Pocket-sized panic / aspirin | 3S+3T; none | 0.90 | Clear / unlimited | Alternate small and tiny targets | Stent struts / short-range shot timing |
| 9 / 7 | Platelet parade / aspirin | 4S; +8T@3.0 | 0.90 | Clear / unlimited | Alternate outer entry points | Platelet-rich lumen / prevention framing |
| 10 / 18 | Side-to-side / aspirin | 4S; +10T@2.7 | 0.95 | Clear / unlimited | Repeat left-left-right-right entries | Endothelial ripples / anticipation |
| 11 / 19 | Center stage / aspirin | 4S; +12T@2.4 | 1.00 | Clear / unlimited | Center-left-center-right entries | Open stent lattice / tracking small hazards |
| 12 / 20 | Aspirin encore / aspirin | 4S; +16T@2.1 | 1.05 | Clear / unlimited | Alternating fan from four upper positions | Lumen vista / platelet activation metaphor |
| 13 / 8 | Slow shot, big chance / clopidogrel | 6S; +6T@4.0 | 0.85 | Clear / unlimited | Repeated narrow entry column | Stent close-up / persistent arcade projectile |
| 14 / 21 | Three in a line / clopidogrel | 6S; +10T@3.0 | 0.90 | Clear / unlimited | Two alternating narrow columns | Receptor-pattern background / P2Y12 concept |
| 15 / 9 | Better together / dual | 6S; +12T@2.5 | 0.90 | Clear / unlimited | Broad alternating entries; new rhythm | Paired medicine motifs / complementary pathways |
| 16 / 22 | Crossfire chorus / dual | 4S+4T; +12T@2.3 | 1.00 | Clear / unlimited | Opposing pairs, then outer fan | Flow ribbons / arcade alternation |
| 17 / 23 | Tiny target tango / dual | 4S+6T; +16T@2.0 | 1.05 | Clear / unlimited | Small drifting targets and changing columns | Textured stent / precise timing |
| 18 / 10 | Find your flow / dual | 4T; T every 3.0s | 1.00 | Maintain <=8 / 40 | Cyclic left/right introductory rhythm | Calm arterial lumen / recoverable control |
| 19 / 11 | Recovery groove / dual | 3T; T every 2.8s | 1.00 | Maintain <=8 / 40 | Cyclic outer left/right | Flowing lumen / continuing care |
| 20 / 12 | Rehab rhythm / dual | 3T; T every 2.5s | 1.02 | Maintain <=7 / 45 | Left-left-right-right cycle | Layered endothelium / ongoing prevention |
| 21 / 13 | Centerline shuffle / dual | 3T; T every 2.2s | 1.04 | Maintain <=6 / 45 | Center-left-center-right cycle | Open stent / rhythm changes |
| 22 / 14 | Keep the beat / dual | 3T; T every 1.9s | 1.06 | Maintain <=5 / 50 | Left-center-right-center cycle | Dense wall detail / safe-count awareness |
| 23 / 24 | Last-lap lipids / dual | 3T; T every 1.7s | 1.08 | Maintain <=5 / 50 | Four-position traveling sweep | Diverse plaque in wall / plaque persists in background |
| 24 / 15 | Flow state finale / dual | 3T; T every 1.5s | 1.10 | Maintain <=4 / 60 | Alternating outer/inner sweep | Bright open lumen / maintenance complete |

Positions use the existing 960x540 arena: outer x=160/800, inner x=320/640, center x=480;
upper entry y=100/165. Initial large plaques retain enough separation to remain inside bounds.
Directions alternate toward and away from center to implement the named motif. Scene descriptions
are authored variation within a small shared scene palette; they do not require 24 separate SVGs.

The first three stages are deliberately easy: seven, ten, then fifteen total plaque hits.
All sizes use steady lateral drift and the same smooth vertical circulation rate, scaled by the
stage speed. A tiny fragment no longer receives a fast, low floor-hopping trajectory. On a flat floor the center
follows `y = H/2 - (H/2 - radius - FLUID_WALL_INSET) * cos(phase)` with angular speed
`0.6 * speedMultiplier`. The shared 24-pixel inset leaves bodies suspended off the ceiling and
floor with zero vertical speed at each turn. Authored spawn heights are clamped into this orbit
at creation; initial phase uses that height and stable target ID. Split children start at the swept hit position, then drift
normally on the following tick. Every orbit enters both the short-range aspirin firing area and
the player contact zone: the circle's lowest edge overlaps the 46-pixel player hitbox by 22 pixels.
Raised floors use the local floor envelope; tissue can deflect targets along continuous reflected
paths. This is a predictable arcade circulation model, not a fluid solver.
The first three rounds remain ordinary clear objectives, with no forced lesson or extra duration.

Later chapter-two and chapter-three configurations combine authored arrivals with interleaved
cover, floor and optional-pocket decisions; browser tuning must inspect their combined effect.
The accepted gentler opening requires 7, 10, 15, 25, 37 and 60 mandatory plaque hits across
stages 1-6, at speeds 0.55, 0.60, 0.65, 0.75, 0.85 and 1.00. Stage 4 uses one large, one medium
and one small family; stage 5 uses two large and one medium. See
[DIFFICULTY_REVIEW.md](DIFFICULTY_REVIEW.md) for the correction and evidence.
Chapter introductions explicitly reset difficulty to teach the tool. Stage 15 introduces dual
rhythm; stage 18 introduces maintenance. The rubric labels these transitions rather than claiming
a single globally increasing difficulty score.

## Milestone plan

| M | Title | Summary | Goal |
| --- | --- | --- | --- |
| M1 | Freeze shared contracts | Order, metadata, visual variants, migration shape | Safe parallel ownership |
| M2 | Build the expansion | Configs and measurements; progress/UI; original art | All 24 configurations exist |
| M3 | Integrate playable campaign | Variant flow, scenes, cycling entries, save compatibility | Actual new encounters and presentation |
| M4 | Accept built game | Focused checks, full repo gates, browser evidence, closeout | Reviewable delivery |

The following milestones describe the accepted earlier expansion, not completion of the new
mechanics. Current S1-S7 status lives in
[organic_expansion.md](active_plans/active/organic_expansion.md).

M1 depends on this reviewed matrix. Deliverables are compiling contracts plus an explicit asset
manifest. Exit when every consumer owner can restate ordinal-versus-ID and appearance semantics.
Parallel-plan ready: no; this is the shared boundary freeze.

M2 depends on M1. Deliverables are all 24 real configs, rubric output, migration/UI integration,
and inspected editable SVGs. Exit with focused compilation/checks and no ambiguous manifest keys.
Parallel-plan ready: yes; file boundaries above are exclusive.

M3 depends on M2 and the art manifest. Deliverables are playable reordered progression, deterministic
renderer appearance, chapter screens, entry motifs, and legacy save handling. Exit after fresh browser
verification of chapter transitions, split descendants, and saved progress.
Parallel-plan ready: yes for simulation and rendering until the final integration gate.

M4 depends on M3. Deliverables are actual report/captures, passing required checks, and docs updated
to the implemented result. Exit after built-artifact acceptance, with fun/human-playtest limitations
stated honestly. Parallel-plan ready: yes for independent review and browser evidence.

## Test and verification strategy

- Run `npx tsc --noEmit -p tsconfig.json`, focused simulation/save tests, then `./check_codebase.sh`
  and the production build. Report each lane separately. A failed gate returns to its source owner.
- Generate the full rubric table from actual configs, including ordered stage/ID, raw metrics,
  within-block comparisons, and explicit resets. Inspect outliers and retune their actual cause.
- Use temporary exhaustive config checks for count, order, compatibility, bounds, split capacity,
  and endpoint semantics. Retain permanent tests only for stable ordinal, deterministic variant selection,
  save migration, and medical target-compatibility contracts with plausible regressions.
- In the browser, exercise real input in representative stages 1, 6, 7, 12, 13, 15, 18, and 24;
  sample all 24 authored starts and cycle boundaries with controlled fixtures. Distinguish a fixture
  check from a normal campaign completion; never call enumeration a human playthrough.
- Capture actual title/practice, plaque variants including tiny descendants, platelet/tool scenes,
  late maintenance, overload recovery, and final result at desktop and narrow mobile widths.
- Verify the built Pages artifact under a project subpath with no missing assets or app errors.
  Check worst-density rendering and effects in a real browser. Simplify decorative effects first
  if frame time affects collision/input stability.
- Preserve a v1 midgame save and a v1 completed-15-stage record through load/save/reload. Check
  unknown newer saves remain untouched and old unlocked IDs remain accessible.

## Migration and compatibility policy

Use a versioned migration rather than changing the meaning of historical records silently. V2
records carry a campaign tag/version identifying 15-stage legacy or 24-stage current completion.
Maintain the top-five bounded record contract; label legacy records in results/history, and do
not call a historical level-15 record a new 24-stage completion. The migration preserves stored
scores, dates, settings, tutorial completions, and old unlocked identities.

Map a v1 unlocked ID to that same ID in the new ordered list; all earlier entries in the list
unlock. This preserves every previously unlocked old ID and also opens inserted earlier stages.
Keep the local-storage key. V1 input validates under its original rules before conversion. V2
validates under its own campaign rules. A write uses only validated v2 data; malformed or unknown
versions preserve original bytes under the existing read-only failure behavior. Stage labels,
practice access, unlock updates, record tie breaks, and final completion use ordinal helpers.

## Risk register

| Risk | Impact | Trigger | Owner | Mitigation |
| --- | --- | --- | --- | --- |
| IDs mistaken for order | Lost progress or wrong menu labels | Numeric progress comparison remains | Progression | Audit all ID consumers; migration fixture |
| Decorative variants imply new mechanics | Confusion or medical misconception | Pill appears to destroy plaque | Art/rendering | Same target semantics; plaque remains in background in drug chapters |
| Formula rewards repetition | Longer campaign without more fun | Higher work but same movement choices | Config/rubric | Inspect motifs and play representative levels |
| Tiny detailed art blurs | Unreadable collisions | Tiny-size capture loses silhouette | Art/rendering | Simplify at small sizes; inspect rendered arena |
| New loops become too hard | Lost campaign fairness | Dense late scenes overwhelm three lives | Config | Tune pressure or safe threshold; keep 24 stages and entry variety |
| Contract overlap | Concurrent conflicting edits | Multiple owners edit shared types | Manager | Freeze M1 and assign exclusive file owners |

Safe fallback preserves the 24-stage structure, real motif sequencing, old progress, and readable
organic target art. If a visual effect is costly, remove that effect. If a stage is unfair, lower
its spawn rate or speed based on measured/play evidence. Do not fall back to renamed duplicates
or longer timers; do not paper over a migration failure by resetting player progress.

## Rollout and release checklist

- [x] Freeze shared contracts and implement the earlier expansion matrix.
- [x] Integrate and measure the earlier expanded configs.
- [x] Accept the earlier expanded campaign captures and built behavior.
- [x] Record new-mechanics passing/failing evidence and optional feedback limits.
- [x] Close new-mechanics documentation after fresh acceptance; deployment remains separate.

## Documentation close-out requirements

Update [GAME_SPEC.md](GAME_SPEC.md), [CHANGELOG.md](CHANGELOG.md),
[DESIGN_DECISIONS.md](DESIGN_DECISIONS.md), and [HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md) through their
assigned integration owner. Distinguish user guidance from agent design decisions. Update this
plan's status and the rubric with actual implementation/report locations. Verify medical source
links before changing facts; retain source attribution in the optional medicine panel. The existing
spec's NHLBI/AHA links are starting points, not evidence of a fresh fact review.

## Open questions and decisions needed

The manager resolves non-blocking naming and palette choices. Agents should challenge a contract
that makes the game less fun or loses information: send the concrete consumer, proposed simpler
alternative, and evidence. A decision remains open until affected owners restate, apply, and verify
it. Numeric balance is provisional until actual config metrics and browser play support it.
