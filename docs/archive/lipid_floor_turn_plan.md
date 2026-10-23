# Lipid floor turn plan

Status: Complete. Source/math and scoped experience reviews accept the plaque-only orbit; source,
pytest, build, browser, screenshot and final integration gates pass, 2026-10-22.

## Goal and evidence

Reduce yellow lipid time spent skimming the floor while preserving readable, approachable
opening stages and the existing left/right/fire game. Keep all stage compositions, counts,
horizontal speeds, angular periods, radii, floor clearance, steering and platelet motion.
The accepted stage 23 platelet encounter remains intact.

The cosine orbit's slow approach to its lower turn caused prolonged floor skimming. The accepted
trial applies rounded candidate A to plaques only; platelets retain cosine motion. Controlled
no-fire observations reduce floor-band dwell and horizontal travel by 17.4% on a flat floor and
14.4% on a wavy floor. Adaptive routes show mixed pacing, including slower stage-1 and stage-4/5
clears and increased stage-4 low-body fraction. Fixed-center held fire clears stage 1 in both
variants at 32.62 seconds with three lives. The independent experience review accepts this scoped
trial without claiming universal improvement or human enjoyment.

## Chosen design

Trial A only for `kind: "plaque"`; platelets keep the incumbent cosine. The existing target
kind is sufficient selection data. Keep the mathematical owner in `src/motion.ts`, with small
shared normalized position, derivative and inverse helpers used consistently by motion,
creation and reporting. Add no mode field, force integration, timers or configuration surface.

For phase `p`, use `q=(1-asin(k*cos(p))/asin(k))/2`, initially `k=0.90`. With existing
local bounds, `y=top+(bottom-top)*q` and
`vy=(bottom-top)*q'(p)*angularSpeed+floorSlope*vx*q`. The half-orbit inverse is
`acos(sin((1-2*q)*asin(k))/k)`, with ordinary normalized-input roundoff clamping.
The derivative is positive inside the descending half-orbit and zero at either endpoint.
This retains the reachable vertical range, period and smooth turns. On a sloped floor,
total vertical velocity at the lower turn may include floor-following drift; zero speed
refers to the phase-relative component.

Creation retains existing ID-based direction using the matching inverse. Synchronization
uses that inverse and chooses angular direction from requested vertical velocity minus
`floorSlope*vx*q`. Preserve the existing position and direction continuity contract;
arbitrary reflected vertical speed magnitude is already reconstructed, not conserved.
Keep wall-turn recording and 1/120-second swept sublegs. Existing tissue and coalescence
callers continue through this owner; change their source only if an observed integration
defect requires it. Splits and releases continue through `createTarget`.

## Milestones

1. **Implement the coherent orbit.** Complete. Captured a matching source/dist baseline,
   integrated the plaque profile and matching inverse/velocity, updated flat-floor exposure
   estimates, and repaired cosine-specific fixtures. TypeScript, lint, formatting and 70 source
   tests pass. Focused checks cover both kinds and directions, spawn/rephase, flat/wavy bounds,
   partitioning, derivatives, sidewalls and swept consumers. Platelet motion matches the baseline
   in 1,344 exact comparisons.
2. **Assess actual play and rendering.** Complete for scoped local scenarios. Paired actual-key
   routes cover stages 1-5 and platelet control stage 8, including tissue, wavy floor, current and
   merge encounters; fixed-duration no-fire runs isolate stages 1 and 5. Captures and a short
   interactive sequence support shot, turn, contact and escape review. The experience reviewer
   accepts this local trial. This is agent/browser evidence, not a human study or full campaign run.
3. **Review, correct and close.** Complete. Independent source/math, source-quality, experience
   and final integration reviews accept the scoped trial. The latest source gate passes 70 tests,
   full pytest passes 1,344 tests, the local build passes, and all 24 browser checks pass.
   Canonical docs and integration evidence are recorded, including
   `output/lipid_orbit/integration.md`.

## File scope

- `src/motion.ts`, `src/characters.ts`: one kind-selected analytic contract and creation inverse.
- `src/difficulty.ts`: truthful plaque exposure estimates with unchanged measurement schema.
- Existing `tests/test_motion.mjs`, `tests/test_arena.mjs`, `tests/test_simulation.mjs` and
  `tests/test_difficulty.mjs` as needed for meaningful behavior and obsolete fixture repair.
  Existing tissue/coalescence/remix tests supply integrated protection.
- This plan, [DESIGN_DECISIONS.md](../DESIGN_DECISIONS.md),
  [CHANGELOG.md](../CHANGELOG.md), and affected explanation in
  [DIFFICULTY_RUBRIC.md](../DIFFICULTY_RUBRIC.md). Record only human-stated additions in
  [HUMAN_GUIDANCE.md](../HUMAN_GUIDANCE.md).
- `output/lipid_orbit/` for comparison and acceptance evidence; temporary
  implementation checks in ignored `tests/_temp/`. Regenerate descriptive difficulty output
  only where the existing reporting workflow owns it. Local `dist/` build is acceptance
  evidence; remote publication is outside this plan.

## Completion and correction

- The latest source gate passes 70 tests, full repository pytest passes 1,344 tests, the local
  build passes, and the browser suite passes all 24 checks. Logs: `/tmp/plaque_orbit_final_source.log`,
  `/tmp/plaque_orbit_pytest.log`, `/tmp/plaque_orbit_build.log`, and
  `output/lipid_orbit/integration.md`; no human study or enjoyment gate remains.
- Controlled equal-duration, equal-population no-fire observations improve the original low-pass
  objective: floor-band dwell and horizontal travel fall by 17.4% on a flat floor and 14.4% on a
  wavy floor. Adaptive clear routes are mixed, not a universal improvement: candidate stage 1
  takes 43.43 s versus 10.73 s baseline, and stage 4 low-body fraction is 28.09% versus 10.51%.
  The stage-1 fixed-center held-fire route clears both at 32.62 s with three lives. Keep these
  proof lanes separate; the scoped experience reviewer accepts the tradeoff based on visible
  readable turns and ordinary alternative shot access.
- Position continuity, bounds, finite velocity, consistent inverse/derivative and shared
  swept-path behavior hold through the tested interactions. No supported collision regression
  remains. Pacing evidence is mixed and scoped to tested routes; optional human enjoyment feedback
  is not a completion gate. Existing screenshots prove motion presentation only; integrated
  captures and real-control evidence close the scoped gameplay acceptance.
- A correctness failure returns to the analytic owner. If quicker approaches undermine
  opening readability or escape, reduce the one shape constant toward the cosine limit and
  repeat affected comparisons before considering B. Do not compensate with changed levels,
  speeds, enlarged clearances or a separate repulsion system. Report any genuine tool blocker
  precisely; human unavailability never blocks the remaining authorized work.

## Evidence ledger

| Evidence | Result | Limit or status |
| --- | --- | --- |
| `output/lipid_orbit/source_gate.log` | 70 tests pass; TypeScript, lint and format pass | Source checks only |
| `/tmp/plaque_orbit_build.log` | Local Pages build passes | No deployment claim |
| `/tmp/plaque_orbit_browser.log` | 24/24 browser checks pass | Browser regression, separate from play scenarios |
| `output/lipid_orbit/play/ACCEPTANCE.md` | No-fire floor-band dwell/travel: -17.4% flat, -14.4% wavy | Same-seed 14-second observations; endpoint estimates |
| `output/lipid_orbit/play/ACCEPTANCE.md` | Six adaptive encounters clear; candidate has three lives and zero retries | Pacing mixed; stage 1 is 43.43 s vs 10.73 s; stage 4 low-body fraction is 28.09% vs 10.51% |
| Fixed-center held fire, stage 1 | Both variants clear at 32.62 s with three lives | One ordinary-control route; adaptive timing remains mixed |
| `output/lipid_orbit/math_spec.md`, `quality.md` | Independent source/math and quality reviews ACCEPT | Scoped reviews |
| `output/lipid_orbit/experience/ASSESSMENT.md` | Scoped plaque-only trial ACCEPT | No human study or universal difficulty claim |
| `/tmp/plaque_orbit_pytest.log` | 1,344 tests pass | Full repository pytest |
| `output/lipid_orbit/screenshots.md` | 13 WebP screenshots at quality 90; 647,202 bytes | Refreshed from the candidate build |
| `output/lipid_orbit/integration.md` | ACCEPT | Current source and final integrated review |

These ignored output files and `/tmp` logs are local evidence artifacts. Their code paths label
the evidence and are not publication links.
