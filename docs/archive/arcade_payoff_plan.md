# Stage 23 arcade payoff

**Status:** Complete; final integration accepted with the evidence limits below.

**Goal:** Give stage 23 a readable midpoint choice: gather on the left as the upcoming stream
approaches, then either cross right to gather new entries or remain left and carve shelter.
Keep both switches usable throughout. This is a focused player-visible fun hypothesis; automated
reachability cannot establish human enjoyment.

**Decision:** Add one optional entry shift to the existing maintenance objective at display stage
23 (stable level ID 24). Retain its 50-second duration and all 23 other stages, first-three
balance, existing switches, cover, scoring, warnings, and left/right/fire controls. Keep the normal
warning and spawn path: never drop or teleport an announced arrival. Do not force a crossing,
relocate switches, reset cooldowns, or add motion, collision, or overload rules.

The selected idea makes an existing spatial choice more legible. Option B, a shield pulse, adds
motion, collision, and overload balance rules while the existing shield already has a clear role.
Option C, chain feedback, adds little because multi-hit and NTHROUGH feedback already exist.
The selection follows the remix design rationale that consequential spatial choices and distinct
moments matter more than added counts or speed; see [remix_campaign_plan.md](remix_campaign_plan.md#design-evidence-and-hypothesis).

## Milestones

1. **Minimal objective content and contract.** Inspect the objective, wave, warning, input, and
   rendering owners. Add the smallest optional maintenance-entry shift needed for this one authored
   event, with implementation shape chosen by the owner. Author a left-biased opening for stage 23;
   every other stage retains its opening pattern. Keep stable behavior for every other objective.
   At about 25 seconds, shift eligible new
   entries toward the right. Derive warning lead from crossing distance and speed; about three
   seconds is a plausible starting point for implementer verification. Tune content from play,
   not permanent tests.
2. **Readable cue.** Show the coming right-side stream in the world before the midpoint, with a
   concise HUD cue that explains the choice. Preserve existing arrival warnings and make the cue
   readable with muted audio and reduced motion. Keep the cue subordinate to hazard readability.
3. **Route and integration check.** Exercise actual keyboard play through stage 23 by staying left
   to carve shelter and by crossing right to gather new entries. Confirm both switches remain
   usable, both routes remain viable through completion, and crossing visibly gathers the shifted
   entries. Check normal retry through stages 22-24. Record focused behavior checks plus fresh
   specification, quality, and integration reviews against the integrated result. Describe this as
   a tested design hypothesis, not a claim that human fun has been proven.

## File scope

- Stage 23 objective content and its owning wave/simulation types or logic, only as needed for the
  optional entry shift.
- Existing world and HUD cue owners for the forecast and midpoint cue.
- Focused tests for the stable optional-shift contract. Use temporary probes for tunable timing and
  route playability; verify normal retry through stages 22-24 without adding a retry abstraction.
- This plan remains the scope and decision record. Update repository changelog and design records
  only when implementation establishes the corresponding change or decision.

## Completion checks

- Display position 23 (stable ID 24) remains a 50-second maintenance stage; all other maintenance
  stages retain their current behavior and entry rhythms.
- The right stream is visibly forecast before the midpoint. Arrivals continue through existing
  warning and spawn handling without being dropped or teleported.
- Actual-input stay-left and cross-right routes can each finish the stage; the crossing route
  visibly gathers new right-side entries. Switch use remains available throughout.
- Cue meaning survives mute and reduced motion, and existing shield, cover, score, input, and
  cooldown behavior remains intact.
- Focused checks and fresh specification, quality, and integration reviews accept the final source
  and build. No full 24-stage replay is required for this isolated optional change; broaden checks
  if integration exposes campaign-wide effects.

Questions and challenges are welcome, especially about whether the forecast is legible, the
crossing is worthwhile, and the stay-left shelter route remains a real choice.

## Current evidence

- Core and presentation source specification reviews accept the optional shift and derived cue.
  Integrated quality review accepts gameplay/presentation, with the descriptive difficulty-pattern
  omission corrected at its owner. Fresh metadata/documentation review accepts that correction;
  final integration accepts all three milestones and completion checks. Seven accepted route
  reports match current runtime and distribution hashes; only the reporting-only
  `src/difficulty.ts` source-map changed afterward. The final repository gate passed 67 source
  tests, pytest passed 1,343 tests, and the browser suite passed 24 tests.
- Actual-keyboard left and right routes finish at 50 seconds with three lives and two hazards,
  in normal and reduced motion with muted audio. The right route visibly gathers new arrivals.
  An actual stage 23 failure, ordinary retry and subsequent clear pass. Adjacent stage 22/24
  practice smokes clear with three lives; these are separate runs, not campaign traversal.
- Detailed receipts are in local `output/arcade_payoff/ACCEPTANCE.md`, `core_spec.md`,
  `presentation_spec.md`, `quality.md`, `metadata_spec.md`, `docs_metrics.md`, and
  `integration.md`. The thirteen verified quality-90 WebP screenshots total 649,182 bytes.
  Automated play establishes bounded route feasibility; human discoverability, reaction time
  and enjoyment remain untested. Practice-unlock fixtures, readonly observation, and accelerated
  RAF time support the actual-keyboard route evidence; those routes do not measure ordinary human
  play. The separate floor-skimming experiment remains outside this accepted plan.
