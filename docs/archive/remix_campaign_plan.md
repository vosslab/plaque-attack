# Remix campaign implementation

Status: completed and archived, 2026-10-22. M0-M4 are accepted on the combined evidence in
[remix_execution_ledger.md](../active_plans/reports/remix_execution_ledger.md).

This is the implementation contract for the approved campaign remix. The manager resolves routine
choices and supported defects without human approval or playtesting dependencies. Optional human
feedback remains welcome. This plan preserves the accepted cast, controls, opening balance, and
existing fluid-motion strengths documented in [organic_expansion.md](../active_plans/active/organic_expansion.md).

## Shared experience brief

Make moving, carving, splitting, and restoring satisfying throughout the campaign. Familiar
left/right/fire controls support new spatial choices: carve shelter into a firing lane, attract
hazards into that lane, and choose whether optional aid is worth exposing. Keep the first three
stages easy. Six surgeons retain identical abilities and their current expressive identities.

The opening teaches reliable play; later stages introduce support, currents, and multi-hit
combinations with readable cues. Four authored finales deliver distinct visible transformations.
Finite breathers interrupt pressure, and quick retries let players immediately use what they learn.
The patient and surgeon supply a visible payoff beyond score. Fictional flow switches, carving,
and contact shields are arcade abstractions, not claims of cardiovascular treatment accuracy.

Keep the established chunky arcade style and current cast. New devices and restoration artwork
are original editable SVGs integrated into the Canvas renderer at gameplay scale. Make ready,
active, cooldown, shield, and phase states readable through shape, position, and restrained motion
as well as color. Keep the hazard field quiet. Reinforce actual carve, split, current, shield,
and multi-hit events with distinct visual and audio feedback. Honor mute and reduced motion.

## Design evidence and hypothesis

The game-design-expert skill's six case studies inform specific choices: Plaque Attack's carving
tradeoff stays central; Steroid Quest contributes dependable controls with changing situations;
Bad Cell Day contributes visible world recovery; Super Bowling contributes anticipation followed
by a consequence-driven payoff. Ms Taq Man supports readable assistance and feedback; Glycolysis
supports using collected help. These are design analogies, not runtime evidence for this remix.

Local books were inspected on 2026-10-22 in `~/nsh/MARKDOWN_BOOKS/game_design/`:

- Koster, *A Theory of Fun for Game Design* (2013), body lines 456-472: familiar patterns need
  fresh situations after comprehension. Apply this by changing spatial decisions and combining
  tools rather than merely increasing counts or speed.
- Schell, *The Art of Game Design*, third edition (2019), meaningful-choices discussion at
  lines 5443-5466: choices need consequential outcomes. Apply this to carving versus shelter,
  current placement, and optional support risk. Cosmetic surgeon equality remains intentional.
- Schell, body lines 6870-6907, interest curves and the Lens of Moments: arrange memorable
  moments and relief across the whole experience. Apply this to four different finales,
  maintenance chapters, finite breathers, and visible restoration.

These passages substantiate design reasoning; agent assessment and automated completion cannot
establish human enjoyment or learning. M1 tests the uncertain interaction before content expansion.

## Campaign and stage contracts

Keep 24 stable IDs in exactly this display order:

```text
[1,16,2,3,4,5,6,17,7,18,19,20,8,21,9,22,23,10,11,12,13,14,24,15]
```

Stage numbers below mean display positions, not stable IDs. Preserve first-three-stage balance.
Keep automatic floor following, left/right/fire, and no jump action. Preserve the floor-relative
sinusoidal vertical motion law, swept collision handling, and configured hazard speed bounds.
The manager freezes compiling shared contracts before dependent edits and records their actual
exported names and owner paths in the ledger.

Execute core work sequentially: contracts, then foundation and playable slice. Art/assets may
run in parallel only after contracts freeze; renderer, UI, and save integration follow the core
gate. Current owners include `game_state`, `simulation`, `tissue`, `weapons`, `waves`, `motion`,
`constants`, and `arena_layouts`, with `main` as the sole runtime. Follow actual source ownership
rather than introducing a generic parallel-builder directory layout.

### Flow switches

- Any tool can shoot a fictional switch. A ready switch consumes its activating shot.
- Active and cooling switches pass shots onward without consuming them.
- Activation attracts hazards horizontally toward the marked firing lane for four seconds.
- After activation ends, all switches share a six-second cooldown; only one current is active.
- Horizontal attraction preserves vertical motion, collision correctness, and speed bounds.
- Introduce currents at stage 8, two lanes at stage 10, and multi-hit combinations at stage 14.
- HUD and world cues expose the lane, active state, and shared cooldown.

### Optional support pockets

- Stages 5, 11, 16, 20, 23, and 24 contain optional support pockets.
- Carving releases a slow collectible into the walking area; walking collects it.
- Collection grants one contact shield; shields do not stack and award no points.
- A shield absorbs one ordinary contact while preserving life and streak, then grants the
  normal contact invulnerability interval.
- Overload damage bypasses a shield, including when ordinary contact happens in the same tick.
- Sealed or uncollected support never blocks clear. Distinguish support releases from pending
  hazard releases, which must resolve before a phase or stage clears.

### Finale and cadence contracts

| Display stage | Stable ID | Required encounter and payoff |
| --- | --- | --- |
| 6 | 5 | Original four-large-lipid workload; two pairs alternate sides, then fissure and artery opening. |
| 12 | 20 | Redirect the left stream, reposition for the right stream, then a final crossing volley; show restored flow. |
| 18 | 10 | Carve an aperture, gather a column, use piercing multi-hit, clean up; show restored lining. |
| 24 | 15 | Three finite groups in one changing arena: opening, cross-stream optional-shield risk, last fan. |

The last finale preserves the visible last pop and gives the full surgeon/patient payoff. Each
phase preserves tissue occupancy, current state, and shield. Wait for all targets and pending
hazard releases; communicate a short transition gap without adding timer padding. Stages 19,
21, and 23 are maintenance; stages 20 and 22 are finite breathers. Preserve finite workloads.

## Retry and record contracts

Retry is the primary failure action. Retry uses the same stage entry seed and score, restores
three lives, resets stage-local state, skips the briefing, and enters a short ready interval
requiring a fresh press. A held input must not leak through into a new action. Run retry count
carries across stages. Failure and retry do not commit records.

Campaign completion or a confirmed intentional menu, restart, or practice departure finalizes
the displayed attempt score exactly once. There is no active-run persistence. Practice does
not heal campaign progress. Save version 4 preserves version 1-3 settings, progress, and records;
adds remix edition and retry data; and retains five records per edition sorted by descending
score, then ascending retry count for ties. Preserve malformed-save handling and existing data
that remain valid. Migration and reset/finalization ownership must be explicit before UI edits.

## Milestones and observable acceptance

### M0: Plan and contracts

Record this approved plan and the execution ledger. Inspect existing ownership and freeze the
minimal shared type/state contracts for gameplay, phase release, renderer events, retry, and
save migration. Dispatch isolated responsibilities only after dependencies are clear. Invite
questions, challenges, and escalation; checkpoint decisions before dependent writing. Confirm
the affected owner applies and verifies a decision before closing its question.

### M1: Playable representative slice

Integrate stages 5, 6, 8, and 14 with support, first finale, first current, and multi-hit
combination. Exercise actual controls, carving, switching, shield consumption, and phase
completion. Obtain autonomous experience assessment of readability, choices, input response,
and pacing. Correct supported problems before expanding the same design across the campaign.

### M2: Complete campaign and presentation

Complete all 24 stages and four finales, original editable SVG devices and restoration,
Canvas integration, event feedback, quiet hazard presentation, and HUD phase/current/shield
states. Inspect actual-size artwork, muted/reduced-motion behavior, and visible state changes.

### M3: Retry and save behavior

Integrate primary retry, entry rollback, fresh-input ready behavior, run retry count, exactly-once
record finalization, edition separation, version 1-3 migration, five-record ranking, and practice
isolation. Verify failure does not commit, intentional departures finalize the displayed attempt,
and preserved settings/progress/records survive migration.

### M4: Integrated acceptance and delivery

- Complete all 24 stages in a rebuilt browser using actual player input. Read-only telemetry
  may guide input; injecting completion state does not count as campaign proof.
- Exercise desktop 1280x800, landscape 844x390, and portrait 320x568; keyboard and touch;
  focus and pause; mute, reduced motion, and fresh-press behavior.
- Run `./check_codebase.sh`, `./build_github_pages.sh`, the repository Playwright suite, and
  required pytest checks using `source source_me.sh && python3`.
- Obtain fresh specification, quality, and integration reviews. Correct supported findings,
  rerun affected checks, and record final evidence against the delivered source/build.
- Refresh canonical documentation, changelog, decisions, screenshots, and local Pages-ready
  `dist/`. Export screenshots as WebP quality 90. No remote deployment or commit is authorized.

## Verification and execution discipline

Permanent tests protect deterministic mechanics, pending hazard releases, retry rollback,
exactly-once records, migration, malformed-save preservation, and practice isolation. Temporary
probes support tunable values and exhaustive exploration. Distinguish fixture inspection from
actual-input reachability, focused checks from complete suites, and local build from publication.
Record commands, results, exact artifact paths, and remaining limitations without asserting unrun
checks. Preserve a runnable campaign route where practical.

The manager owns integration and the ledger. Each isolated implementation or review task gets a
fresh agent and explicit file ownership; agents accommodate concurrent edits. Sol 6.1 handles
implementation and reviews whose complexity requires it; Luna handles narrow documentation or
checks. Asset production uses the requested SVG specialist workflow while preserving the cast.
The task list covers contracts, gameplay, art, rendering, UI, persistence, integration, reviews,
and evidence. No narrow passing slice closes a later milestone.
