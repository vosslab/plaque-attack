# Core interactions revision ledger

**Status: COMPLETE, 2026-10-23.** Candidate 3 is accepted after final source, browser, native
visual, and fresh specification/quality/integration evidence. Candidate 1 remains rejected for
runaway motion and aspirin over-clear; candidate 2 remains rejected for its mathematically
inaccessible stage-12 target. Final integration ACCEPT and manager GO authorize this closeout.

See the [active plan](../active/core_interactions_revision.md),
[CORE_INTERACTIONS_DESIGN.md](../../CORE_INTERACTIONS_DESIGN.md), and
[GAME_SPEC.md](../../GAME_SPEC.md).

## Candidate history

| Candidate | Result | Evidence and limit |
| --- | --- | --- |
| 1: orbit rephasing and initial fan | REJECTED | Ordinary ID 21 reached speed 37,745 at 11.9 s; extended ID 8 followed a crash path. The fan cleared stage 2 on its first hit and stage 8 in 0.15 s. `output/core_interactions/playtest/prototype1-assessment.md` and `prototype1-rejected-receipt.json` record the rejected build. |
| 2: constant-velocity impulse motion and revised fan | REJECTED | Stage 12 phase 2 contained a platelet outside every aspirin firing column for at least 15 s. This was a geometric access failure, rather than an inference from planner runtime. The blind route cleared in 90.267 s with one life. `output/core_interactions/reviews/final_gameplay_integration.md` records the rejection. |
| 3: shared restoring field and burst feedback correction | ACCEPTED | Every impulse-mode plaque and platelet uses the same bounded vertical field. Final main JS SHA-256 is `530926bed1f967b0c5e36b7351b91457adf1d01c12222fe9b7dca0fe0b5b7aca`; impulse source SHA-256 is `385cfe68e1f887579ed28e143c7a71474da09bd16b3b70517c8b183389c3db40`. Final browser/review gates below support acceptance. |

Candidate 1's root cause was division by near-zero orbit slope during `preserveVerticalSpeed`
rephasing. Targets now retain authored orbit motion until physical impulse, then enter persistent
fluid motion. Candidate 2 removed the runaway mechanism but exposed a constant-velocity access
failure. The approved correction is the global restoring field, with exact resolved parabolas,
true boundary reflections, bounded collision chords, and loss-only sub-resolution vertical
settling. The canonical interaction contract owns the equations and numerical limits.

The historical y=94 reach crossing and 15-second interval reproduce candidate 2's failure; they
are not durable tuning gates. In the source reproduction, candidate 3 crosses that historical
height in 1.283 s. Actual-control encounters must still demonstrate useful cleanup and fairness.

## Current evidence

| Evidence | Result | Meaning and limit |
| --- | --- | --- |
| Landed interactions and encounters | Source implemented | Chronological agenda, all-pair bounce, corrected swept paths, eligible rare merge, next-tick newborns, aspirin three-piece fan/tiny-only burst, direct clopidogrel, three-lobed art, and encounter rebalance. |
| Canonical engineering gate | PASS, 123 Node checks and build | Final-source static checks and build reported by gate owner; receipts under `output/core_interactions/gates/candidate3/`. Browser suite remains a separate gate. |
| Final-source long probe | PASS within sampled scope | `output/core_interactions/buoyancy/probe.json` matches impulse source `385cfe68...`: all 24 stages, 180 s each including ready time (177 s playing), about 1.99 million target samples, maximum speed 475.441, at most five movement legs, zero boundary violations. Isolated floor trajectories cover 60 s with maximum relative energy error about 2.20e-9. Uses 1,000 lives and no firing; this is numerical stress evidence, not ordinary play. |
| Fresh restoring specification | PASS, source only | `output/core_interactions/reviews/restoring_spec.md`: 25 independently run focused tests plus midpoint and settling-threshold oracles. Documentation now qualifies conservation and chord-derived contact velocity. |
| Burst feedback regression | PASS, three focused cases | Renderer precollects primary and secondary burst victim IDs before event processing; they do not advance THROUGH. Clopidogrel direct-path accumulation remains. Final play owner inspects `final/stage12-aim-intercept-local-burst-multiple.webp` with ring/point labels and no THROUGH; independent integration confirms the feedback. |
| Final targeted stage 12 | Cleared, 17.950 s, three lives, score 10,250 | All three phases; actual keyboard input guided by observed target velocity and shot flight. Final receipt and served build match `530926bed...`; this is a targeted policy, not the earlier blind sweep. |
| Final actual-control matrix | Six sampled routes clear with three lives | `output/core_interactions/playtest/final/receipt.json` and `summary.json`: stage 2 delayed 12.900 s; stage 8 15.067 s; stage 24 phone 19.033 s; stage 6 stent 27.917 s across two authored phases; stage 18 clopidogrel 34.883 s; stage 12 as above. Real keyboard input with virtual 60 Hz RAF; phone run has simultaneous CDP left/fire touch preflight followed by keyboard traversal. Practice-unlock save only; no simulation-state injection. Source/served-build hashes match; no page errors or overflow. Independent integration accepts these routes within their stated limits. |
| Final maintenance failure/retry | Ordinary controls verified | `output/core_interactions/maintenance_proof/receipt.json` matches served main `530926bed...`: stage 21 begins with three tiny targets, warns at 7/6 hazards at 8.983 s, and loses its final life to overload at 13.783 s. Actual Retry restores ready/three lives; subsequent movement/fire earns 280. No records or page errors. This is failure/recovery evidence, not a maintenance clear; integration independently inspects the native frames. |
| Final native pair and natural merge captures | Accepted by independent integration | `output/core_interactions/pair_playproof/final/receipt.json` identifies final main JS. Inspected stage-6 tiny/medium and tiny/small plaque contact, stage-8 tiny/tiny platelet rebound, and natural-merge frames show later separation or rare coalescence. The natural merge occurs at tick 1093, with its child active at 1094; it is not triggered by a break. |

The blind sweep and targeted interception use different policies. A blind candidate-3 attempt lost
at about 59 s as the field changed danger timing. A targeted route may establish a useful response
to visible motion; comparing its clear time with candidate 2's blind route does not establish a
strict same-controller improvement.

## Completed gates

| Gate | Status | Required record |
| --- | --- | --- |
| Final-source engineering checks and build | PASS reported | Preserve final identity and owner logs. |
| Browser validation | Prior 24 passes plus corrected focused 1 pass | Full invocation in `output/core_interactions/gates/candidate3/playwright.log` has 24 passes and one obsolete opening-stage-1 blind-death setup failure. A test-only actual-contact controller preserves earned score, entry rollback, retry, and record assertions without state injection or timeout inflation. `retry_setup_fix_final.log` passes 1/1 in 6.5 s; both TypeScript configs and owned lint/format pass. Fresh `output/core_interactions/reviews/retry_fixture_review.md` ACCEPT. This is composed evidence, not a clean full 25-test rerun. Production build remains unchanged. |
| Fresh restoring specification | PASS | Source scope only; canonical settling and chord qualifications reconciled. |
| Final actual-control browser evidence | ACCEPT | Final six-route matrix and burst recapture in `output/core_interactions/playtest/final/ASSESSMENT.md`, plus pair/merge and maintenance records, independently inspected by final integration. |
| Fresh quality review | PASS, source scope | `output/core_interactions/reviews/restoring_quality.md`; independently checked source and build identity, no actionable findings. |
| Fresh integration assessment | ACCEPT candidate 3 | NEW `output/core_interactions/reviews/final_restoring_integration.md` independently accepts final routes, native pair/burst/merge frames, maintenance, identities, and composed browser evidence. HISTORICAL `output/core_interactions/reviews/final_gameplay_integration.md` remains the candidate-2 rejection. Its access P2 and the burst-feedback finding are resolved on candidate 3. |
| Canonical docs and manager closeout | Complete | Final numerical qualifications, candidate failures, source/build identities, exact verification composition, and proof limits reconciled after final integration ACCEPT and manager GO. |

No sampled route establishes human enjoyment, novice usability, learning gains, universal clearability,
uninterrupted full-campaign completion, or full touch-only traversal.
No deployment or commit is in scope.
