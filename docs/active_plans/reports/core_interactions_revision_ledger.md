# Core interactions revision ledger

**Status: IN PROGRESS.** First-pass source work, encounter rebalance, and visuals have landed. The
first build is rejected for acceptance by prototype 1 runtime evidence. Two corrective owners are
active; actual-control acceptance and fresh implementation reviews remain pending.

See the [active plan](../active/core_interactions_revision.md),
[canonical interaction contract](../../CORE_INTERACTIONS_DESIGN.md), and
[game specification](../../GAME_SPEC.md).

## Evidence chronology

| Evidence | Result | Meaning and limit |
| --- | --- | --- |
| First source implementation | Landed | Chronological target/tissue/projectile paths, all-pair bounce, aspirin small-to-three fan and tiny-target burst, direct clopidogrel path, three-lobed visuals, and level rebalance. |
| First canonical temporary code gate | 112/113 Node checks; TypeScript, lint, and format pass | Sole failure was an obsolete merge fixture; corrected. This initial result is not a clean pass. |
| Later full Node and physics lane | 114 Node checks pass | Source evidence only; does not prove actual-control behavior. |
| First build | 136.6 kB; build passes | Prototype 1 gameplay/runtime acceptance is rejected; build success does not accept behavior. See [prototype 1 assessment](../../../output/core_interactions/playtest/prototype1-assessment.md) and [rejected receipt](../../../output/core_interactions/playtest/prototype1-rejected-receipt.json). |
| Fresh visual specification | PASS | Record: [visual specification review](../../../output/core_interactions/reviews/visual_spec.md). |
| Fresh core specification | BLOCKED, P1 | Runaway energy blocks acceptance. Record: [core specification review](../../../output/core_interactions/reviews/core_spec.md). |
| Feedback contract repair | Complete; 11 focused tests pass | Guards stale help/audio zero-point cases and reports weapon-aware difficulty: aspirin four-contact upper bound, clopidogrel and dual direct tools one each. |
| Prototype 1 actual control | Rejected | Ordinary ID 21 is still playing with one life at 11.9 s and speed 37,745; extended ID 8 follows a crash path. Aspirin can clear stage 2 on its first fan, clear stage 8 in 0.15 s, and clear other stages in 0.10-0.32 s. Stage 12's lone-child planner stalled for 94 s; that is not proof of unavoidable human failure. |

## Current assignments

| Work | Owner | Status | Next evidence |
| --- | --- | --- | --- |
| Runtime physics correction | `physics_runtime_fix` | Active | Replace the orbit-slope `preserveVerticalSpeed` transition with authored orbit until physical impulse, then persistent free-fluid velocity and true wall/curved-floor reflections. Avoid an arbitrary speed clamp as the primary patch. Rebuild and rerun runtime cases. |
| Aspirin fan revision | `aspirin_fan_revision` | Active | Ensure all nonzero oblique upward shots clear the firing column safely into three pieces, without an immunity-time hack; then rerun actual-control campaign cases. |
| Independent play preparation | `core_playtest_prepare` | Waiting for next build | Exercise the rebuilt artifact and record inputs, outcomes, failures, and limits. |
| Engineering gate preparation | `core_gate_prepare` | HOLD | Wait for accepted runtime evidence and fresh source rereview. |

The physics root cause is `preserveVerticalSpeed` dividing `vy` by orbit slope near a turn. The near-zero
slope creates extreme angular velocity, followed by later acceleration. The current correction direction
keeps authored orbital motion until physical impulse, then carries persistent free-fluid velocity through
true wall and curved-floor reflections; optional target-motion kind is under evaluation.

The aspirin correction targets the observed over-clear. Its current fan makes short stages nearly
instantaneous and can clear from an initial shot. Safe dispersal across three pieces is required without
adding a temporary immunity window. Planner runtime alone does not establish human clearability or
unavoidable failure.

## Remaining gates

| Gate | Status | Acceptance record |
| --- | --- | --- |
| Physics runtime correction and focused hybrid-motion evidence | Active | Pending implementation and rerun |
| Aspirin fan correction and focused control evidence | Active | Pending implementation and rerun |
| Rebuild and independent actual-control browser review | Waiting for corrected build | Capture artifact identity, inputs, results, failures, and proof limits across stage 2, representative campaign routes, dual-tool encounters, finales, and maintenance. |
| Fresh source rereview | Pending | After both corrections land |
| Fresh quality review | Pending | After source rereview and corrections |
| Fresh integration assessment and any required re-review | Pending | After prior gates pass |
| Canonical docs and closeout | Pending | Reconcile accepted changes and all evidence; no browser acceptance, enjoyment, learning gains, or completion claim before its gate. |

No sampled route establishes human enjoyment, usability, learning gains, or universal clearability. No
deployment or commit is in scope.
