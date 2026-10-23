# Gamewide continuity and readability

**Status: COMPLETE (2026-10-23).** This plan takes up six bounded opportunities left by the
completed [GAMEWIDE_PLAYFUL_PAYOFF.md](GAMEWIDE_PLAYFUL_PAYOFF.md) and the six current-build
reviews. All six implementation tracks have landed. Fresh specification, focused quality, and integration reviews accept all six contracts on the final
build. The ledger records actual practice-result viewport evidence, the full opportunity reassessment,
and the stop rationale.
[GAMEWIDE_CONTINUATION_LEDGER.md](../reports/GAMEWIDE_CONTINUATION_LEDGER.md). That ledger is the evidence
record; this plan is the source of truth for scope, contracts, owners, and gates.

## Goal and decision

Make the same authored patient visibly persist from the first-stage briefing through an actual
terminal clear and the results screen. Clarify hit consequences, give the portrait arena useful
physical scale while keeping its world intact, and refresh the clopidogrel lesson before its first
long return. Promote the existing time-saved/mastery-bonus sentence for early maintenance clears.
Reuse current states, art, mechanics, and controls wherever they meet these contracts.

The six reviews identify these as distinct opportunities. This work does not reopen the completed
seam ownership, display-18 payoff, device-cue, or display-24 work. It does not claim human
enjoyment, usability, learning, or whole-campaign completion. Preserve instructor-authored science and the authored briefing verbatim. Keep its concise core and
show optional detail after Start.

## Review synthesis

| Review | Evidence and limit | This plan's response |
| --- | --- | --- |
| Core | Split and removal are visually similar in sampled play; a fresh source review also flags imminent contact and tool readiness. | Distinguish split from terminal outcomes with shape and motion, including static forms under reduced motion. Do not add captions. Reassess other core opportunities at closeout. |
| Progression | Stage 3 introduces persistent clopidogrel; stages 4-12 omit it before stage 13's 12-target encounter. This is an authored-sequence risk, not measured forgetting. | At stable ID 8, refresh the first three aligned targets, then space the remaining nine arrivals. Preserve the original six-small/six-tiny workload and stage identity. |
| Visual | Ranked findings prioritize phone cue legibility and tissue/result hierarchy; the portrait canvas also shrinks the surgeon and hazards. | Continue one patient's earned state, improve full-world portrait scale, keep readable phone cues, and place the existing earned-result sentence below the result title for qualifying maintenance clears. |
| Experience | Portrait play is physically small despite spare vertical room; landscape guidance and controls are present. | Keep all threats and the full world visible without distortion; reclaim useful width and improve access to existing rotate/fullscreen affordances where they help. Measure remaining limits. |
| Creativity | Player-owned seam work is already complete. Healing through tactical play remains a future opportunity; the patient continuity opportunity is separately ranked by the overall review. | Keep completed seam ownership closed. This plan's continuity work responds to the overall review; it does not claim to complete the future healing/tactical creativity opportunity. |
| Overall | A same-patient pre-play preview and clear-to-result continuity are the highest missed opportunity in the sampled experience. | Own the patient/recovery state through the actual terminal-clear sequence and the saved result, including reduced-motion and practice behavior. |

## Behavioral contracts

- The first-stage briefing uses the exact existing authored brief and shows the same patient and
  current route/territory that the existing recovery model uses. Keep the concise core briefing and
  existing start action; optional detail appears after Start. The terminal clear continues that
  patient's earned territory change into a new result route and settles on the persisted state. Do
  not pre-clear the earned DOM state or occlude gameplay during the clear. Practice does not credit
  or animate campaign recovery. A fixture may select a surgeon or unlock practice, but it must not
  inject completion, health, targets, score, or recovery.
- A split hit visibly communicates that targets continue; a terminal hit visibly communicates
  removal. Use distinct shape and motion through the existing hit/render path. Reduced motion must
  retain the distinction with distinct static forms. Do not add captions. Avoid adding a new general
  effects framework.
- Damage feedback uses the actual `DamageEvent` from lives-zero contact or overload, passed directly
  through `finish` to `showResult` to produce one actionable cause sentence. Keep it event-local: no
  retained state, save-schema change, generic tips, or new simulation state. Retry clears the event
  naturally.
- On an actual early maintenance clear, show the existing time-saved/mastery-bonus sentence directly
  below the result title. Keep its qualifying condition; hide or clear it on every other result. Move
  no other result copy, action, score, recovery state, or simulation behavior.
- Stage 13 (stable level ID 8) preserves the original workload of six small plus six tiny targets.
  It starts with three vertically aligned small targets, then schedules three more small and six tiny
  targets across nine arrival slots. The first three real shots take about 0.9 seconds; the shot lifetime is 1.5 seconds. Configure
  2.5-second arrival intervals through 24 seconds. Existing empty-wave behavior may expedite the next
  wave when the opening three targets clear; browser evidence records the observed arrival time. Preserve
  meaningful lane work, the total of 12, and current switch, tissue, weapon, scoring rules, unlock,
  and restoration contracts. The exact score may change as the schedule changes. No permanent test
  fixes authored coordinates or exact timings.
- The authoritative world is 960x540 (16:9). Keep it visible and undistorted with uniform fit; do
  not crop, pan, or hide threats. The previous 8:5 ratio came from decorative CSS margins and test
  history, not simulation geometry. The renderer fit rule stays unchanged. On height-limited landscape,
  matching the 16:9 presentation is expected to increase width from 441.5px to 490.6px (about
  11.1%). Portrait keeps 386px width with 217.125px world height. Use a compact arena/control layout
  and modest width increase where available, keep controls reachable, and make existing
  fullscreen/rotate access useful when supported. Clearly request fullscreen landscape with an
  honest fallback when unavailable. Report remaining physical screen limits in pixels and ratios at
  measured viewports; responsive layout cannot remove the device's aspect-ratio constraint.
- Keep the completed playful-payoff behavior and source authority intact. If one of these changes
  exposes a direct regression in that completed contract, record it and coordinate with its
  owner; do not expand this plan into reimplementation of that work.

## Milestones and ownership

Owners may coordinate overlapping files before editing. Each milestone records exact files,
build identity, and evidence in the continuation ledger.

1. **Continuity implementation - `continuity` owner.** Own recovery state and briefing/result
   wiring in `src/ui.ts`, recovery/types, `src/main.ts`, and narrowly scoped CSS. Preserve
   instructor-authored briefing prose; improve generic agent-written copy when evidence supports
   it. Land a same-patient briefing, actual clear sequence, saved result state, and practice
   unchanged behavior with reduced-motion handling.
2. **Hit outcomes - `hit_outcomes` owner.** Own the hit module and renderer. Make split and terminal
   hit feedback distinct in silhouette and motion; retain static distinctions under reduced motion
   and do not add captions.
3. **Portrait presentation - `portrait` owner.** Own responsive CSS and presentation changes, with
   `src/main.ts` input/fullscreen/rotate wiring only where needed. Keep the full world visible and
   undistorted, improve effective arena scale using compact layout and width, and document
   remaining limits for each viewport.
4. **Stage-13 reacquisition - `reacquisition` owner.** Own stage-13 authored constants (stable ID
   8) and focused behavior tests. Preserve 12 targets; align the first three and schedule the
   remaining nine with a readable gap after the persistent-shot demonstration.
5. **Damage cause - `damage_cause` owner.** Own the lives-zero contact/overload event boundary in
   `src/main.ts`; pass the actual `DamageEvent` directly through `finish` to `showResult` and show
   one actionable cause sentence. Keep cause data transient and let retry clear it naturally. Do not
   add generic tips or alter simulation/save schemas.
6. **Earned-result hierarchy - `mastery_summary` owner.** Own the result presentation in `src/ui.ts`,
   its markup in `src/index.html`, and narrowly scoped CSS. Move only the existing earned-time/mastery
   sentence directly below the title for actual early maintenance clears. Clear/hide it on all other
   result paths. Do not change scoring, recovery, simulation state, or actions.
7. **Fresh specification review - `spec` owner.** After all six implementations, independently compare
   source and the observed behavior to the contracts in this plan. Record ACCEPT or specific
   findings and evidence in the ledger; do not rely on the implementation agent's description.
8. **Fresh quality review - `quality` owner.** After specification acceptance and any corrections,
   run focused correctness checks and the applicable project checks against the final source/build.
   Report commands, outcomes, and failures without broadening into unrelated historical issues.
9. **Fresh integration review - `integration` owner.** After quality acceptance, verify cross-seam
   ownership, integrated browser journeys, artifact provenance, screenshots, and remaining review
   opportunities. This is the final gate and records the stop rationale. The five-contract baseline has
   passed this gate; rerun it against the sixth contract before closeout.

The manager serializes implementation on shared modules and may parallelize only isolated owners.
The review order is strict: implementation, fresh spec, corrections if needed, fresh quality,
corrections if needed, then fresh integration. A failed gate returns to the responsible owner and
is rerun by a fresh reviewer. No gate may be reported as complete without its own ledger evidence.

## Acceptance evidence

- **Continuity:** Fresh actual-control campaign route from the first-stage briefing through a real
  terminal clear and results. Capture briefing, terminal-clear transition, and settled result for
  the same patient and credited territory. Separately verify practice leaves saved recovery
  unchanged. Repeat the observable transition with reduced motion. Use localStorage only for
  disclosed setup such as surgeon selection/unlock; no injected play state or success.
- **Damage cause:** Trigger lives-zero contact and overload outcomes in actual gameplay. Confirm the
  sentence names the actionable cause in results, the actual event supplies it, and retry removes
  the prior cause without retained state. Keep ordinary controls and disclose any setup fixture.
- **Hit outcome:** Trigger both a genuine split and a genuine terminal removal in browser gameplay.
  Capture both at normal play scale, then repeat with reduced motion. Confirm the static forms still
  distinguish outcomes. Do not add captions or make simulation effects depend on captions.
- **Portrait:** Capture at 390x844, 844x390, and desktop at least 1280px wide. At phone and landscape sizes,
  measure canvas CSS dimensions, world-to-CSS scale, surgeon dimensions, control bounds, and
  threat/world-edge visibility. For desktop, a final >=1280px capture plus the authoritative
  960x540 world and uniform renderer-fit source correspondence may establish the same full-world
  contract when standalone numeric capture is unavailable; disclose this as equivalent evidence.
  Exercise movement, fire, pause, retry, and available fullscreen/rotate controls. Record the
  full-world fit constraint and remaining small-object limits with measured values where available.
- **Stage 13:** Use real keyboard controls to observe the persistent projectile pass through the
  aligned opening and the transition to spaced arrivals. Record projectile travel interval,
  first arrival spacing, target count, and a representative active-control segment. Confirm all 12
  authored targets remain reachable and later stages are unchanged. A trace may supplement the
  route, but does not replace browser evidence.
- **Evidence integrity:** Final screenshots are quality-90 WebP. Record viewport, browser, route,
  setup fixture, reduced-motion state, build fingerprint, and whether each frame is actual play or
  a labeled detached observation. Never describe injected or fixture-driven state as an earned
  play result. Keep unverified claims and human-study questions explicit.
- **Closeout:** Reassess the remaining opportunities in all six source reports against the
  completed behavior and current evidence. For each, weigh likely player impact, evidence strength,
  and implementation complexity; name it addressed, still worthwhile with an owner and rationale,
  or deferred with evidence limits. Identify worthwhile next safe work. Passing the five contracts
  and fresh gates does not by itself require stopping. Do not add a quota, arbitrary score, or
  whole-campaign/human-fun gate.

## Out of scope

Do not rewrite authored briefings, retune overall difficulty, add stages or mechanics, change the
campaign order or patient recovery rules, add an adaptive camera that hides world state, or
redesign the completed seam/device work. Do not claim a human usability, learning, enjoyment, or
whole-campaign result from scripted browser evidence. Any newly discovered defect outside these
contracts is recorded for separate prioritization.
