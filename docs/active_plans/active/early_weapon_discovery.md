# Early weapon discovery plan

**Status: COMPLETE (2026-10-23).** The specification, quality, and final integration reviews
accept the sampled delivery within the evidence limits below.

## Goal and evidence

The player should encounter the stent, aspirin, and clopidogrel during the first few stages.
Before this plan, six plaque displays preceded aspirin and six more displays preceded clopidogrel.
That pacing lets a player quit before seeing two of the three tools. The player's reported
frustration is: "one frustration I have is that one can play 6 levels, give up, and never see the
new weapons."

Use the learning principle in *A Theory of Fun for Game Design* (2013), lines 456-500: introduce
novelty at a pace players can absorb. The manager borrows the reduced-pressure tool introduction
analogy from SteroidQuest: teach a tool with a manageable first encounter, then vary its use while
retaining stable controls.
The book source is `/Users/vosslab/nsh/MARKDOWN_BOOKS/game_design/A_Theory_of_Fun_for_Game_Design-2013.md`.

The current campaign has 24 displays in four chapters. Stable IDs are content identities and must
remain in the existing order `[1,16,2,3,4,5,6,17,7,18,19,20,8,21,9,22,23,10,11,12,13,14,24,15]`.
The stage-one configuration stays unchanged. Saves, records, unlocks, recovery progress, and all
four existing finales remain compatible. Preserve the gentle feel of the current opening while
replacing its long wait for new tools.

## Approved direction

- Display 1 (stable ID 1) remains the unchanged, gentle stent introduction.
- Display 2 (ID 16) introduces aspirin against two separated small platelets.
- Display 3 (ID 2) introduces clopidogrel against three vertically aligned small platelets, so one
  persistent shot can inactivate all three.
- Displays 4-6 (IDs 3-5) introduce and practice the existing special lipid discoveries.
- Chapter 1 is First Response. Chapters 2 and 3 are mastery: reuse existing currents, seams,
  support, and dual-tool play. Stages 7 and 13 continue mastery rather than introducing a tool.
  Keep the existing four finales at displays 6, 12, 18, and 24.
- Keep left/right/fire as the controls. Teach through brief authored briefings and play, with no
  new tutorial gate or added system.

The sequence adopts early access to all three tools; it does not require exact preservation of the
old plaque content at displays 2-3. Source authors two separated aspirin targets and a three-target
clopidogrel column with the existing tools. Verify their gentle feel against the integrated build.
Reuse current encounter mechanics; do not add broad infrastructure to support the progression change.

## Milestones

1. **Verify and author the opening.** Trace stable IDs, chapter labels, tool compatibility,
   records/unlocks, finale boundaries, and any test assumptions. Implement displays 1-6 in the
   approved order, preserving stage 1 exactly and keeping displays 2-3 gentle. Confirm the three
   tools are visible and usable by the end of display 3.
2. **Rebalance mastery through display 24.** Place existing current, seam, support, and dual-tool
   encounters so chapters 2-3 practice and combine learned skills. Keep the existing four finales,
   their authored phases and rewards, all 24 stable IDs, and progression/save semantics. Resolve
   incompatibilities where the owning level content is authored.
3. **Verify the integrated campaign and close out.** Complete source/configuration checks and
   relevant regressions. Use actual left/right/fire controls for displays 1-3, then representative
   later mastery and finale routes. Exercise failure and retry so weapon, stage, and saved progress
   remain correct. Repair observed defects and obtain independent content, quality, and integration
   reviews. Record exact evidence and limits here before marking complete.

## File scope and ownership

- `src/constants.ts` and `src/remix_levels.ts`: authored campaign order, chapter labels, tools,
  briefings, targets, and existing encounter placements, after source-contract review.
- Existing progression, save, unlock, and record owners: edit only if source review finds a real
  compatibility dependency; retain stable IDs and current data formats.
- Existing focused simulation/campaign tests and browser journeys: update only assertions that
  encode superseded content; preserve contracts for ordering, compatible targets, retries, saves,
  and finale completion.
- `docs/GAME_SPEC.md`, `docs/HUMAN_GUIDANCE.md`, `docs/DESIGN_DECISIONS.md`, and
  `docs/CHANGELOG.md`: update through their documentation owners after the implementation settles.
- This plan and its ledger: `docs/active_plans/active/early_weapon_discovery.md`.
- Temporary checks and captured play evidence: repository `tests/_temp/` and the existing
  `output/` convention; retain only evidence needed to support closeout.

## Completion checks

- All 24 displays remain reachable in the existing stable-ID order; stage 1's configuration,
  save shape, record labels, unlocks, recovery IDs, and four finale boundaries remain intact.
- The authored opening exposes stent, aspirin, and clopidogrel by display 3. Displays 2-3 are
  gentle introductions, and every weapon targets only compatible hazards.
- Later chapters provide practice and combinations using existing systems without adding controls
  or tutorial gates. Each finale remains playable and preserves its established completion and
  failure behavior.
- Automated source checks and relevant regressions pass. Actual-control evidence covers displays
  1-3, representative mastery and finale play, and failure/retry. Independent reviews accept the
  final authored flow. Claims are limited to sampled agent play; no human enjoyment claim is made.

## Decision and task ledger

| Item | Status | Evidence or next action |
| --- | --- | --- |
| Player problem and pacing direction | Decided | Earlier exposure to all three tools; preserve gentle entry and teach through play |
| Opening tool order | Decided | Display 1 stent, 2 aspirin, 3 clopidogrel; source content authored |
| Display 4-6 discoveries | Approved direction | Reuse the existing sticky, heavy, and unstable lipid discoveries; verify final placements |
| Chapters 2-3 mastery and finales | Approved direction | Compose existing mechanics through display 24; preserve four finales |
| Source and dependency review | Complete | Stable ID order, stage 1, chapter labels, and weapon/target compatibility checked |
| Opening implementation | Complete | Source authors the three tools in displays 1-3 and preserves stage 1 |
| Mastery implementation | Complete | Later stage order, dual-tool timing, and finale placements retained in source |
| Automated checks and regression review | Complete | Source/configuration review, specification recheck, quality review, and integration review ACCEPT. After the merge-configuration correction, 26 focused campaign/arena/difficulty tests, both TypeScript checks, scoped ESLint, scoped Prettier, and 81 Node tests pass. The 1,395-test pytest run and original 25-test browser lane predate the correction. The later focused streak browser journey passes 1/1; it is a separate rerun, not a passing 25-test suite. |
| Actual-control play and failure/retry | Complete for sampled routes | Corrected build `f99fb7d2d4dc3a5ff7b8fab578cbd08e0dc1ad88995e9c393460628334633590`: `final.json` clears display 2 in 7.283 seconds and display 3 in 1.083 seconds, each with three lives. The route in `final.mjs` fires one clopidogrel projectile after the ready interval and does not fire again; `final.json` records the three-target clear. `center-return.json` clears display 4 in 63.0 seconds with one life; the lookahead-assisted keyboard route in `finale-assisted.json` clears both display-6 finale phases in 102.433 seconds with three lives. `retry.json` is from the prior build `72978ad2188f581d024a4e9e32ccf4f0cbfb88975ca70bcdd68b0465947663aa`: it records stage-2 contact loss, retry with aspirin and three lives, then clear in 5.8 seconds. These routes establish sampled reachability, not ordinary unaided player performance. |
| Independent reviews and documentation | Complete | Specification recheck, quality review, and integration review ACCEPT within sampled scope. `GAME_SPEC.md`, `HUMAN_GUIDANCE.md`, `DESIGN_DECISIONS.md`, `CHANGELOG.md`, and README reflect the accepted decision; the README 2x2 gallery is preserved. |
| Closeout | Complete | Final production hash `f99fb7d2d4dc3a5ff7b8fab578cbd08e0dc1ad88995e9c393460628334633590`; integration acceptance and exact evidence boundaries are recorded in `output/early_weapons/integration.md` and `output/early_weapons/play/REPORT.md`. The prior-build campaign and retry routes are labeled; no full 24-stage replay, every-finale replay, human playtest, learning-gain, or universal-clearability claim is made. |
