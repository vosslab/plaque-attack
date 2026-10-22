# Recovery map and surgeon roster delivery plan

Status: completed delivery ledger, 2026-10-22. This document turns the requested six-surgeon roster, patient
recovery payoff, and opening-curve correction into one complete implementation scope. Every
milestone has an implementation owner, automated evidence, and independent review; none needs a
player, approval session, or subjective playtest to close.

## Product contract

Plaque Trouble gains six selectable cardiovascular surgeons. They differ in appearance, never in
movement, collision, shot timing, projectile configuration, score,
or progression. The selection UI says that plainly: **Same abilities for every surgeon.** A
player may change selection from the menu before a run, and the local save remembers it.

Campaign clearing also restores an original heart-and-coronary recovery map. Each stable campaign
level ID maps to one fixed coronary territory; a cleared territory changes from plaque-burdened to
restored, its connecting vessel segment gains flow when both endpoints are restored, and each six-route milestone makes the patient portrait visibly
more comfortable and active. The treatment metaphor remains light and arcade-forward: it does not
claim that the game models clinical treatment. The map uses a separate, editable SVG composition
of branching coronary vessels, myocardium, plaque deposits, and blood-flow detail. It must not
reuse Bad Cell Day's full-body cutaway, site geometry, asset identifiers, or recovery artwork.

The persistence rule is deliberately narrow:

- Only a successful **campaign** stage completion earns recovery for that stable ID.
- Practice completion, a loss, retry, and a repeated clear do not add or remove recovery.
- Recovery IDs are a set, so repeated campaign clears are idempotent.
- Existing unlock behavior remains for practice; recovery does not create campaign-resume rules.
- Save version 3 stores canonical-order `completedLevelIds`. Duplicate or unknown completion IDs
  reject the malformed save; unknown versions retain their original bytes.
- Version-1 migration restores classic IDs before its historical unlock, and all classic IDs for a
  completed classic record. Version-2 unlock-only migration restores the canonical prefix filtered
  to classic IDs. Expanded records prove their prior canonical stages, or all 24 on completion;
  classic completed records restore classic IDs only. Unlock-only state never awards inserted IDs.

## Implementation ledger

Each row closes against current evidence in
[RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md), with fresh independent reviews.

| Milestone | Concrete result and owner boundary | Verification | Status |
| --- | --- | --- | --- |
| R1: Typed roster | `src/surgeons.ts` and `src/types/surgeon.ts` define six complete stable identities with presentation fields only. Shared gameplay owns abilities; no simulation character branches. | Type-check, roster tests and independent source review of movement, hitbox, muzzle and weapons. | Complete |
| R2: Six original figures | Six editable `surgeon_*.svg` assets share viewBox and anchors; distinct skin, hair/head covering, facial cues and scrubs. | SVG decode and fixed-size rendered contact sheet, including actual arena scale. | Complete |
| R3: Choice and rendering | Accessible six-preview chooser saves selection; selected figure appears in arena, with the same full chooser accessible from menu, briefing, results and settings. Equal-ability cue is visible. | Browser selection/reload journeys and unchanged keyboard/touch controls. | Complete |
| R4: Save and migration | `src/save_load.ts` owns V3 `completedLevelIds` and selected surgeon; conservative V1/V2 migration follows the contract above. Malformed or unknown bytes remain intact. | Save tests cover roster values, malformed and duplicate IDs, v1 partial/full, ambiguous v2, classic and expanded records, and reload. | Complete |
| R5: Heart recovery map | `src/recovery.ts`, CSS and `cardiac_recovery.svg` provide 24 stable territories, connected restored routes, available/current/locked state, chapter progress and five patient tiers. | Exhaustive mapping plus 0/partial/chapter/full rendered views and reduced-motion checks. | Complete |
| R6: Recovery transitions | Campaign success adds/persists its ID once and opens new-route feedback. Practice, replay, failure and retry preserve earned recovery. | Focused tests and browser journeys for clear, repeat clear, practice, failure and reload. | Complete |
| R7: Opening curve | Stage 4 / stable ID 3 changes large+medium+large at 0.80 to large+medium+small at 0.75 (37 to 25 hits; 20 to 14 leaves). Stage 5 / ID 4 changes three large at 0.90 to large+medium+large at 0.85 (45 to 37 hits; 24 to 20 leaves). First three unchanged; stage 6 retains 60 hits and four large with bounded merging. | Generated report `7, 10, 15, 25, 37, 60`; byte-equal first-three baseline; six-stage ordinary-input assisted simulation with 3 lives and no damage. | Complete |
| R8: Independent acceptance | Final type/lint/format/repository/source/build/browser checks, 16:10 uniform-scale play view and compact viewport-bounded dialogs, rendered keyboard/touch layouts, recovery reload, all assets and six-stage report. Fresh specification, quality and integration reviewers. | Exact commands, counts, screenshots and limitations in the bounded acceptance report. | Complete |
| R9: Documentation closeout | README, game spec, rubric/review, art direction, decisions, changelog, this ledger and acceptance report match final source. | Markdown/ASCII/link checks and source consistency review. | Complete |

## Territory and patient model

A ruby heart and branching vessels sit beside a patient portrait in an original editable composition.
The map has literal stable-ID slots; campaign order determines labels and route connections only.
Reordering stages therefore cannot repaint a healed territory under another identity.

| Chapter zone | Stable IDs in canonical campaign order | Restoration cue |
| --- | --- | --- |
| Plaque Patrol | 1, 16, 2, 3, 4, 5 | Restored territory brightens; connecting routes gain flow when both endpoints are restored. |
| Platelet Pop | 6, 17, 7, 18, 19, 20 | Restored territories and connected routes brighten. |
| Pulse Partners | 8, 21, 9, 22, 23, 10 | Restored territories and connected routes brighten. |
| Flow State | 11, 12, 13, 14, 24, 15 | The final routes fill in; posture and expression progress through the last patient tier. |

Five reusable patient symbols represent fewer than 6, 6-11, 12-17, 18-23, and all 24 cleared routes:
tired/resting, upright, open posture, raised arms, and celebration. These are total-clear milestones,
not a clinical health percentage or a guarantee that a particular chapter has been completed.
Newly restored feedback is one-time campaign feedback; the map remains readable without animation.
Artwork must remain original and distinct from Bad Cell Day's full-body cutaway and geometry.

## Acceptance limits

Automation can establish selection persistence, equal mechanics, map correctness, safe migration,
controls and asset rendering. It cannot establish representation for every player or human enjoyment.
These are product limits, not hidden completion gates. Optional future player research starts from
the completed artifact and does not block this delivery. Current six-stage simulation evidence is
separate from the earlier 24-stage completion/replay, which predates stage-4/5 tuning.

## Delivery closeout

R1-R9 are complete. Fresh specification, quality and final integration reviews accept the final
source/build and bounded evidence. [RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md)
records 47 passing Node checks, the 11-plus-1 browser result, final build hashes, matching compact
captures, opening-six assisted simulation and explicit proof limits. This completes local delivery;
remote publication remains separate.
