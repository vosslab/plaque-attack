# Remix execution ledger

Date: 2026-10-22. Source of truth:
[remix_campaign_plan.md](../../archive/remix_campaign_plan.md).
This ledger records the remix campaign acceptance from the pre-lipid revision. The earlier
all-24 run and gameplay/runtime/artwork hash comparison below are historical; they do not describe
the current source after the plaque orbit change. Current orbit status and its six matched encounter
checks are tracked in the evidence ledger of
[lipid_floor_turn_plan.md](../../archive/lipid_floor_turn_plan.md#evidence-ledger). The older remix
integration review accepted its own combined evidence; current-source integration is accepted in
the orbit plan's closeout record.

## Milestone status

| Milestone | Status | Evidence and remaining work |
| --- | --- | --- |
| M0 plan/contracts | Recorded and accepted | Approved plan, four shared type contracts, fresh `contract_spec` and `contract_quality` ACCEPT. Required remix state and V4 persistence are implemented. |
| M1 slice | Accepted | Actual-input stages 5/6/8/14 passed. Fresh `slice_spec_recheck`, `slice_quality`, and `slice_experience_recheck` ACCEPT; landscape correction independently rechecked. |
| M2 full scope | Accepted | All 24 stages and four finales, original SVGs, renderer/HUD/event integration and lining correction delivered. Campaign specification/quality and final visual/integration reviews ACCEPT. |
| M3 retry/save | Accepted | Runtime specification recheck and quality ACCEPT, including V4 migration, retry and clear-record persistence. Completed earlier campaign proof also verifies one V4 completion record and all unlocks. |
| M4 acceptance | Accepted on combined evidence | Earlier actual-input 24-stage campaign passed; gameplay/runtime/artwork hashes remain identical after UI-only corrections. Final-build replay reached 22 clears before its 30-minute cap without divergence. Final UI, rendered result and independent integration ACCEPT. |

## Ownership and decisions

The manager owns integration, this ledger, shared changelog and durable decisions. Implementers
and independent reviewers use separate assignments. Delivered owner reports:

- Core/contracts: [remix_contracts.md](remix_contracts.md),
  [remix_core.md](remix_core.md), [remix_current_fix.md](remix_current_fix.md).
- Campaign: [remix_campaign_content.md](remix_campaign_content.md);
  fixture correction: [remix_fixture_fix.md](remix_fixture_fix.md).
- Art/rendering: [remix_assets.md](remix_assets.md),
  [remix_renderer.md](remix_renderer.md), [remix_lining_fix.md](remix_lining_fix.md).
- UI/responsive: [remix_ui.md](remix_ui.md),
  [remix_landscape_fix.md](remix_landscape_fix.md).
- Runtime clear persistence: [remix_clear_fix.md](remix_clear_fix.md).

Campaign content began after `M1_EXPERIENCE_GREEN`. Content, fixture, art, renderer, UI and runtime
owners have delivered their scoped work. The campaign driver owns temporary actual-keyboard
proof; the final visual reviewer and independent integration reviewer retain their acceptance
responsibilities. Final integration accepts the combined evidence below.

| Decision | Current contract and verification |
| --- | --- |
| Lean phases | `{name, targets}` phases own finale groups; legacy initial/reinforcement lists are empty. Transition waits for targets and pending hazard releases, with a 0.75 s gap. Contract and campaign specification reviews accepted. |
| Current | Attract-only horizontal lane; one active current for 4 s, followed by shared 6 s cooldown. A ready switch consumes its shot; active/cooling switches pass it onward. Contract/core reviews accepted. |
| D3 expiry | Restore preset horizontal speed magnitude times level multiplier, preserving a nonzero velocity's sign. Zero velocity falls back toward the active lane, then target-ID parity when centered (even right, odd left). Position and vertical velocity remain intact. No horizontal component is zeroed. Every-preset expiry behavior is tested; fresh specification accepted. |
| Support | Optional, nonstacking contact shield; support never blocks clear. Pending hazard releases must resolve, while sealed optional hazard pockets may remain sealed. |
| Required state and V4 | The transitional optional remix state is now required. Save V4 alias/migration and edition/retry records are complete; runtime focused reviews accepted. |
| D2 browser hook | Optional `?acceptance` exposes readonly `window.__plaqueAcceptance` detached snapshots. Driver planning uses clones and actual keyboard input, with no completion or health injection. |
| D4 campaign choices | Stage 18 guarantees clopidogrel piercing and a carveable aperture; dual resumes at stage 19. D4b replaces linked legacy hazard pockets/shells with support at stages 11/16/20/24 and removes the stage-22 pocket/shell for finite relief. Campaign specification accepted. |

## Historical remix verification snapshot

These checks supported the remix campaign review before the lipid orbit revision. They retain their
original scope and do not establish current-source gate counts or final integration acceptance.

| Evidence lane | Result | Artifact or scope |
| --- | --- | --- |
| Repository checks | PASS: 64 Node tests, both TypeScript checks, lint and formatting | `./check_codebase.sh`; latest `/tmp/plaque_completion_final_gate.log` after completion UI correction |
| Production build | PASS, exit 0 | `./build_github_pages.sh`; `/tmp/plaque_campaign_build.log`; local `dist/` |
| Full Playwright suite | PASS: 24 tests in 2.2 min | Latest `/tmp/plaque_completion_browser.log` after completion UI correction; suite coverage does not replace 24-stage actual-input proof |
| Full pytest | PASS: 1334 tests in 1.76 s | Latest `/tmp/plaque_completion_pytest.log` after current documentation reconciliation; earlier file-mode/shebang alignment for `devel/report_difficulty.mjs` remains in place |
| Documentation checks | PASS: 313 latest focused pytest checks | Markdown links, guidance format and ASCII after plan archive and final reconciliation; previous broader documentation run passed 493 checks |
| Campaign specification | ACCEPT | Fresh `campaign_spec`: all 24 stages/order, opening preservation, finite cadence, support and four finales |
| Campaign quality | ACCEPT | Fresh `campaign_quality`: 33 focused tests plus TypeScript checks |
| Fixtures | PASS: 64 Node tests after correction | Stale maintenance IDs and universal-open-lane assumptions corrected; see owner report |
| Responsive experience | ACCEPT | Fresh `slice_experience_recheck`; `output/remix_recheck/` |
| Lining geometry | PASS, focused Canvas proof | `output/remix_lining/`; flat/wavy floor, normal/reduced motion; earned band follows actual floor |
| Runtime retry/save | ACCEPT, focused | `runtime_spec_recheck`, `runtime_quality`; 18 focused tests; prior runtime browser campaign 4/4 and campaign-retry case passed |
| Earlier full actual-input campaign | PASS: all 24 clears, zero retries/errors | `output/remix_campaign/final_actual_input_24_verified/{report,summary}.json`; precedes final completion UI correction |
| Completion UI source specification | ACCEPT | `output/remix_completion_ui/spec_recheck.md`; correct finite/final titles, desktop/portrait Pause placement, and persistent landscape Pause row |
| Completion UI quality | ACCEPT | `output/remix_completion_ui/quality.md`; independent source/image review of final HUD, actual keyboard/touch receipt, and six completion-copy fixtures |
| Final build actual-input replay | Partial: 22 clears; 30-minute cap | `output/remix_campaign/final_ui_tick_replay_verified/report.json`; 6146 of 6303 exact inputs, stage 23 tick 2774, zero errors/divergence, stable source/build; not a second full campaign |
| Final visual review | ACCEPT with heading finding closed | `output/remix_final_visual/assessment.md` accepts finale art, touch and reduced-motion presentation; the pre-lipid remix integration review accepts the corrected rendered heading fixture |
| Final rendered result | PASS, labeled presentation fixture | `output/remix_campaign/final_result_ui_fixture/`; the then-current UI renders the original earned terminal/save data as `Circulation restored!`; not additional earned completion |
| Remix integration review | ACCEPT on pre-lipid combined evidence | `output/remix_final_integration/review.md`; its all-24 and unchanged gameplay/runtime/artwork hash evidence predates the plaque orbit revision |

At 844x390, the independently rechecked landscape Canvas is about 508.8x318, touch controls are
46px high, and pause is 44px high. Desktop 1280x800 and portrait 320x568 presentation is preserved.
Keyboard/touch, focus and pause have scoped responsive evidence in `output/remix_recheck/`;
the remix integration acceptance at that pre-lipid snapshot is recorded in M4 above.

The earlier completed route in `output/remix_campaign/final_actual_input_24_verified/` uses a
fresh 1280x800 browser and actual keyboard inputs guided by detached read-only snapshots. It
clears all 24 stages with 237000 points, three lives, zero retries/errors, 6303 input records,
872.85 simulated seconds and 652.479 wall seconds. Every clear has zero remaining mandatory
work. Save V4 contains one completion record, all 24 cleared IDs and stable-ID 15 unlocked.
The run is source-stable; its report records exact source/build/input hashes. It does not
exercise shield collection/absorption; M1 supplies separate collection evidence.

That route predates the completion-copy, persistent-Pause and plaque-orbit revisions. The earlier
integration comparison verifies that gameplay, runtime, input, persistence and artwork hashes
remained identical across the UI-only correction at that time; it does not compare the current
lipid-orbit source. The final-build exact-input replay cleared 22 stages and
consumed 6146 of 6303 inputs before its 30-minute wall cap during stage 23, tick 2774. It has
zero browser errors or trace divergence and stable source/build hashes. This partial route
supports build consistency at that pre-lipid snapshot; it does not establish a new full 24-stage
clear. The earlier remix integration review accepted the complete campaign route and the separate
corrected UI evidence. The preceding escalated attempt ended with the temporary
harness assertion `Clear retains mandatory pockets`; its partial evidence remains historical.
The corrected driver checks pending mandatory releases while allowing sealed optional pockets.

## Historical remix delivery provenance

At the pre-lipid remix delivery snapshot, the 13 documentation screenshots totaled 647912 bytes.
Its `dist/main.js` SHA-256 was
`e948ea04d05bcb35e2edfb56b638f3bfd7d29471c2d20cd77bc0b5cfe9025e81`.
The matching historical `dist/index.html` SHA-256 was
`3a09fedaaffdcb0ad492a0aac7cf2a61b7c51145cc73f5e3953eb2c935831086` and `dist/style.css` as
`a8d32af17a00e1d22aa2dbf07e02898ffa5982cfe3f7f1be064b027058d5d139`. These hashes and the
replay evidence above describe the pre-lipid remix snapshot. The current screenshot manifest records
the candidate build separately. A successful local build establishes local Pages-ready output, not
remote deployment.

## Historical scoped evidence

- Pre-implementation baseline repository checks and browser smoke passed; logs:
  `/tmp/plaque_baseline_check.log`, `/tmp/plaque_remix_baseline.log`.
- M1 actual-input fixture cleared stages 5/6/8/14 with 1387 inputs in 155.873 s wall time,
  zero retries/errors and stable source hash. Stage 5 collected support; stage 6 changed phases;
  stages 8/14 activated currents. This is the four-stage slice, not the final campaign.
- The original landscape review requested revision for a roughly 210x132 Canvas at 844x390.
  The later correction and fresh experience ACCEPT supersede that open finding.
- The original restored-lining clip stopped above the floor stroke. The delivered correction
  adds an earned floor-following mask, verified on flat/wavy profiles with identical normal and
  reduced-motion static geometry. It supersedes the deferred clipping finding.
- Earlier core, asset and runtime checks were scoped evidence. Current campaign checks above
  supersede their source-gate counts; standalone SVG acceptance does not close final Canvas review.

## Remix closeout record

The pre-lipid remix integration ACCEPT closed M4 on its combined evidence, preserving the final
replay's partial scope. The remix plan is archived at
[remix_campaign_plan.md](../../archive/remix_campaign_plan.md). The final result fixture proves
presentation at that snapshot only; the earlier actual-input route supplies
all-24 completion and V4 finalization. A further creative iteration belongs in a separate plan.
No commit or remote deployment belongs to this plan.
