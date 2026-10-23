# Core interactions revision

**Status: IN PROGRESS.** The first source implementation, campaign rebalance, and visual pass have
landed. Static checks and a build pass, but prototype 1 runtime evidence rejects that build for
acceptance because of runaway velocity and inconsistent actual-control outcomes. Physics and aspirin
revisions are active; browser acceptance and fresh reviews remain pending. This is an authorized
foundational preproduction revision; fun and readable arcade action take priority over medical
simulation. Keep the current arcade disclaimer and do not present invented mechanics as biology or
treatment advice.

## Goal

Make target contact physically consequential across sizes and kinds, retain rare natural plaque
merges under controlled eligibility, and turn aspirin into a distinct multi-step platelet action.
Keep projectile fragmentation, clopidogrel, and stent behavior meaningfully distinct.

## Settled contract

- Every active target pair bounces and redirects on contact, including tiny/mixed targets and
  platelets. Apply persistent impulses and rewrite swept path suffixes after events.
- One chronological `target_contacts` agenda orders target, tissue, pair, projectile, weapon, and
  session contacts. Earliest event wins; an exact projectile/pair tie goes to the projectile.
  Consumers and rendering use the corrected paths.
- Same-size plaque merges remain occasional and require a genuine approaching contact entry,
  available probability, cooldown, and level budget. No merge on projectile break. Newborn targets
  activate next tick and separate before a later live collision can qualify.
- An aspirin hit on a small platelet aggregate creates three tiny targets without score or streak
  credit. Newborns activate next tick.
- An aspirin hit on a tiny target triggers a local-radius burst against existing active tiny targets
  only. It excludes aggregates, plaque, and same-tick newborns. In deterministic target-ID order,
  score and advance streak once per removed existing tiny target; do not recurse or double-award.
- Clopidogrel directly deletes platelet targets along its persistent three-target path, with no fan
  or area effect. Stent plaque splitting retains its size cascade.
- Stage 2 introduces aspirin with one small aggregate. Rebalance chapter, dual-tool, finale, and
  maintenance workloads around the fan; avoid mechanically tripling authored target counts.
  Exact tuning waits for actual-control play.

The canonical details are in [CORE_INTERACTIONS_DESIGN.md](../../CORE_INTERACTIONS_DESIGN.md) and
[GAME_SPEC.md](../../GAME_SPEC.md).

## Execution and gates

1. **Repair physics runtime.** Owner: `physics_runtime_fix`. The first source pass landed the
   chronological agenda, all-pair bounce, persistent redirects, corrected path suffixes, tie ordering,
   and eligible merge behavior. Runtime evidence found runaway angular velocity:
   `preserveVerticalSpeed` divides `vy` by orbit slope near a turn, producing extreme angular speed
   and later acceleration. Replace the transition with authored orbit motion until physical impulse,
   then persistent free-fluid velocity and true wall/curved-floor reflections. Do not use an arbitrary
   speed clamp as the primary fix. Optional target-motion kind remains under evaluation.
2. **Revise aspirin fan.** Owner: `aspirin_fan_revision`. The first fan landed, but actual control
   clears stage 2 on the first fan, clears all stage-8 targets in 0.15 s, and produces other very short
   clear times. Revise the fan so all nonzero oblique upward shots clear the firing column safely into
   three pieces, without an immunity-time hack. A stage-12 lone-child planner stall is not evidence of
   unavoidable human failure.
3. **Preserve landed work.** Source implementation includes target/tissue/projectile chronology,
   all-pair bounce, aspirin small-to-three fan and tiny-only burst, direct clopidogrel path, three-lobed
   visuals, and encounter rebalance. A feedback-contract repair guards stale help/audio zero-point
   cases and records weapon-aware difficulty metrics (aspirin four-contact upper bound; clopidogrel
   and dual direct tools one each).
4. **Focused implementation checks.** Protect stable behavior for all-size contact response,
   tissue/projectile ordering, impulses and path rewrites, eligible rare merge, no merge on break,
   newborn separation, aspirin fan/burst scope and scoring, weapon distinction, and authored reach.
5. **Actual-control browser review.** After the active physics and fan revisions, rebuild and
   exercise stage 2, representative chapter and dual-tool stages, all finales, and maintenance. Record artifact identity, inputs, outcomes,
   failures, and limits. Source probes alone do not establish feel or integrated reachability.
6. **Fresh review sequence.** Complete a fresh specification review, address and verify its
   corrections, complete a fresh quality review, address and verify its corrections, then complete a
   fresh integration assessment and any required re-review. Record scope and evidence limitations.
7. **Closeout.** Reconcile this plan and the ledger with accepted implementation and evidence. Do not
   claim browser acceptance, enjoyment, learning gains, or completion before the corresponding gate.

## Encounter writer handoff

Use these authored platelet counts as the current rebalance starting point; verify them against
level source and actual-control workload before treating them as accepted tuning:

- Displays 7-8: one small aggregate per encounter.
- Display 12: phase counts 1+2, 1+2, and 1+3.
- Dual-tool displays 15-17: one aggregate per encounter, with companion counts 3, 3, and 4.
- Display 24: phase counts 1+3, 1+3, and 0+5.
- Maintenance displays 19, 21, and 23: tiny platelets throughout, including scheduled and pocket
  targets.

## Boundaries

- No merge is triggered by a projectile break; newborns are not eligible before later separation.
- The revision is an arcade fiction and preserves the game's current medical disclaimer.
- Balance values stay adjustable; permanent checks protect contracts, not selected tuning values.
- No deployment or commit is in scope.

Live assignments and evidence are recorded in
[core_interactions_revision_ledger.md](../reports/core_interactions_revision_ledger.md).
