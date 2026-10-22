# Plaque Trouble implementation ledger

**Goal:** Implement the complete 15-level Plaque Trouble campaign in `docs/GAME_SPEC.md`,
including browser-ready presentation and acceptance evidence. The spec is the source of truth;
its colorful vector arcade direction is sufficient to begin without a separate UI decision.

**Status:** Active. **Current stage:** A0 shared contracts. **Updated:** 2026-10-22.

## Execution rules

- Keep dependencies serialized: no dependent implementation starts before its contracts and
  previous batch gates pass.
- Assign an explicit owner to every file before each batch. Owners report evidence and blockers;
  the manager integrates at batch boundaries.
- After **every batch**, require all four gates: `npx tsc --noEmit -p tsconfig.json`,
  `./check_codebase.sh`, the repository build, and the batch's Playwright smoke. Record the exact
  commands, outcomes, and artifact or browser evidence below. Any failure stops progression until
  repaired and the gates rerun.
- Complete all 15 levels. The five-level first playable is an intermediate milestone only.
- Before quality review, reread `docs/GAME_SPEC.md` against the implementation. Use fresh agents
  for the independent quality review and final integration review.

## Stages

| Stage | Scope and ownership | Status | Evidence / pending work |
| --- | --- | --- | --- |
| A0. Contracts | Contracts agent owns importable shared types and contract notes. Establish player/input, simulation, levels/objectives, events, and versioned save shapes; inspect real TypeScript configuration and retain strictness. | In progress | No implementation dispatch until contracts are complete and reviewed. Record contract paths, owner, and review decision here. |
| Batch 1. Foundation | Foundation owner scaffolds the application, configuration/state transitions, and bootable shell against accepted contracts. | Pending | Then run all four execution gates and record results. |
| Batch 2. Presentation and utilities | Isolated owners: editable SVG/render assets; CSS/HTML shell; runtime utilities (input, timing, persistence). No overlapping file ownership. | Pending | Build the isolated lanes against contracts, integrate, then run all four gates and record results. |
| Batch 3. Simulation and integration | Simulation owner implements campaign mechanics; integration owner implements `main` and UI composition. Respect dependency direction and single simulation-state ownership. | Pending | Integrate all 15 level configurations, gameplay and menu flows; then run all four gates and record results. |
| Batch 4. Advanced coverage and acceptance | Owners complete advanced campaign paths, durable behavior coverage, and gaps found during full-campaign validation. | Pending | Run all four gates, then validate the complete 15-level campaign, failure/recovery paths, rendered states, and production artifact. |
| Fresh spec review | Fresh reviewer checks the full implementation against every requirement in `docs/GAME_SPEC.md`; route findings to file owners. | Pending | Record findings, repairs, and a clean spec review before quality review. |
| Quality review | Fresh independent quality reviewers assess code and product evidence after the spec review is clean. | Pending | Record findings and resolutions; distinguish focused checks from full acceptance. |
| Final integration | Fresh integration reviewer checks the merged result and final evidence; manager records the canonical disposition. | Pending | Complete only when all gates and full 15-level acceptance evidence are recorded. |

## Batch gate record

Copy this record for each batch, preserving failures and reruns as evidence.

| Batch | `tsc --noEmit` | `check_codebase.sh` | Build | Playwright smoke | Owner / artifact / decision |
| --- | --- | --- | --- | --- | --- |
| Batch 1 | Pending | Pending | Pending | Pending | Pending |
| Batch 2 | Pending | Pending | Pending | Pending | Pending |
| Batch 3 | Pending | Pending | Pending | Pending | Pending |
| Batch 4 | Pending | Pending | Pending | Pending | Pending |

## Decisions and open work

- **Source of truth:** `docs/GAME_SPEC.md`; the supplied 15-level campaign is required.
- **Visual direction:** Use the spec's colorful vector-art and browser-arcade direction. No extra
  UI-preference decision is needed before implementation.
- **Workflow:** Use `html-game-parallel-builder`, with concrete contracts first, exclusive file
  ownership, serialized batch gates, and real browser evidence.
- **Model routing:** Use `gpt-6-luna` for bounded documentation work and `gpt-6.1-sol` for strict
  game implementation complexity. Spark was requested by repo documentation but is unavailable in
  the live model catalog; record any changed routing decision here.
- **Pending:** Finish A0 review, assign batch owners, and update this ledger with evidence and
  decisions after each boundary.

## Final status

**Disposition:** Not complete. **Reason:** A0 is in progress; implementation and acceptance gates
remain pending. Update this line only from final integration evidence. **Evidence:** None yet.
