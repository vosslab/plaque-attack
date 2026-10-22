# Recovery and roster acceptance

Status: accepted, 2026-10-22. R1-R9 are complete. This report covers the six cosmetic surgeons,
persistent recovery map, gentler stages 4/5, 16:10 presentation and compact dialogs defined in
[RECOVERY_ROSTER_PLAN.md](RECOVERY_ROSTER_PLAN.md). Fresh specification, quality and final
integration reviews accept the delivery with no blockers. A local build does not publish changes.

Review update, 2026-10-22: [REQUEST_REVIEW.md](REQUEST_REVIEW.md) records the subsequent
prior-request audit, presentation corrections and fresh artifact verification. The hashes and
captures below describe the earlier accepted build; they do not identify the later review build.

## Final gates and artifact

The final `./check_codebase.sh` passes lint, format, TypeScript and all 47 Node tests.
`./build_github_pages.sh` passes. The final production build hashes are:

```text
main.js efe5f1e832768352eba635cb99f8d022e01828ecc21a0b0e91a239d0e7fef2a0
style.css b315da25d1c473dcd13d6c08bbfd561d0cca405d3ac8be6f33f02b8927062fbf
```

Final documentation verification passes 220/220; `git diff --check` passes:

```bash
source source_me.sh && python3 -m pytest -q tests/test_ascii_compliance.py tests/test_markdown_links.py tests/test_readme_first_paragraph.py
```

Fresh roster specification, corrected-layout quality, recovery specification/quality and final
integration reviews accept the source, built artifact and bounded evidence. The earlier desktop
roster name/selection overlap was corrected and independently rechecked at 1280, 390 and 320 pixels.
Local production measurements are in `output/roster_layout_recheck/production-report.json`.

## Browser and rendered evidence

The full browser command `npx playwright test --reporter=list`, with preview port 4179, completed
with 11 passes and one failure in 1.7 minutes. The movement/Continue journey still expected the old
result flow and did not dismiss the new recovery dialog. A test-only correction dismisses that
modal before Continue. Its focused rerun passes 1/1 in 16.0 seconds (exit 0); focused TypeScript,
ESLint and Prettier also pass. Product hashes remain unchanged. This is 11 unchanged full-run
passes plus one corrected focused pass, not a clean 12-test single-run result.

Retained logs are `output/roster_browser/final_browser.log` and `browser_recheck.log`.
The companion `REPORT.md` separates normal selection/start controls from recovery save fixtures.
Browser journeys cover six choices and reload, selected arena identity, campaign-only recovery,
idempotent clears, map state and practice behavior.

Final README captures match the hashes above: roster 560x696, recovery 1040x620 and tissue
1536x960, each below 300 KB. The recovery image uses an explicitly labeled eight-route
illustration fixture. Tissue carving uses actual stage-4 practice movement/fire controls.
Desktop, mobile and short-screen popup checks keep Close in the viewport; no browser errors
were collected. All three inspected play viewport ratios are 1.6, with uniform world scaling.
The recovery header and Close footer remain visible while the map scrolls internally; all 24
stages need not fit at once. Earlier draft captures are not final-layout acceptance evidence.

Asset-level validation decoded and rasterized all six original surgeon SVGs at 72x96 gameplay
and 288x384 portrait sizes. Local contact sheets are in `output/roster_art/`. The editable cardiac
art has five patient-tier symbols; map fixtures separately exercise empty, partial and complete
states. Isolated SVG checks and fixture captures do not constitute won campaign progress.

## Opening simulation evidence

Temporary evidence under `output/opening_balance/` reads actual configuration.
`config-verification.json` records canonical IDs `1, 16, 2, 3, 4, 5`, mandatory hit work
`7, 10, 15, 25, 37, 60`, and speeds `0.55, 0.60, 0.65, 0.75, 0.85, 1.00`. The first three source
blocks remain byte-identical to the captured baseline. Focused simulation, motion, difficulty
and arena tests passed 34/34. The report and probe commands are:

```bash
node devel/report_difficulty.mjs output/opening_balance/difficulty
node --import tsx output/opening_balance/probe.mjs
```

The generated report covers 24 rows with no opening review flags. `acceptance-summary.json`
records one deterministic state-aware assisted simulation using ordinary left/right/fire inputs:
seed 1729, six clears, three ending lives, zero damage and 229.50 simulated seconds. Source hashes
stayed unchanged during that run. This proves one feasible opening route through normal rules.

## Persisted progression contract

- Six typed surgeon identities contain presentation data only; shared gameplay owns all abilities.
- V3 saves selected surgeon and canonical `completedLevelIds`. Malformed and unknown save data
  retain their original bytes; invalid cosmetic IDs default to Maya without losing valid progress.
- A successful campaign clear adds its stable ID once. Practice, failed runs, retries and repeated
  clears preserve the existing recovery set. Reload retains progress without resuming a live run.
- V1 migration uses historical classic progress. V2 unlock-only inference is limited to classic
  IDs; expanded records prove prior canonical stages. Inserted stages require expanded proof.
- Menu/results open the map; a newly cleared route opens restoration feedback. Available map
  stages launch clearly labeled unranked practice. Patient posture advances at total-clear
  milestones 6, 12, 18 and 24, as arcade narrative rather than a clinical health measurement.

Focused recovery/save tests passed 11/11 before the final 47-test source gate.

## Proof limits

Fixture captures establish rendering of known states. The opening assisted simulation establishes
one feasible six-stage route; neither establishes human enjoyment or fresh all-24 completion.
The earlier 24-stage completion/replay in [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md)
remains historical mechanics evidence before stage-4/5 tuning. No remote deployment is claimed.
