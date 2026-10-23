# Independent usability playtest, 2026-10-23

Reviewer: independent HCI expert inspection using the final
[playtest rubrics](../../PLAYTEST_RUBRICS.md), criteria U1-U6. This is a task walkthrough by an
agent already familiar with the specification, not an unprimed novice session or human enjoyment
study. The intended user is a casual keyboard or phone player trying to start, understand, and
recover from an arcade round without medical knowledge.

## Build and method

- Served the current `dist/` over `http://127.0.0.1:8151/`; Chromium version is recorded in
  `output/rubric_playtest/usability/browser.json`.
- Main bundle SHA256: `7bd8bc2518e5ca3d1cead433ccd28092ffa343ebc12b963e9652871abb909b8a`.
- CSS SHA256: `a8d32af17a00e1d22aa2dbf07e02898ffa5982cfe3f7f1be064b027058d5d139`.
- HTML SHA256: `3a09fedaaffdcb0ad492a0aac7cf2a61b7c51145cc73f5e3953eb2c935831086`.
- All 32 bundled source-map contents match their current source files byte for byte.
  `output/rubric_playtest/usability/provenance.json` records individual source/build hashes.
- Fresh browser contexts start with empty storage. No unlock save, presentation fixture, hidden
  simulation mutation, or programmatic win is used. The `?acceptance` hook supplies detached,
  read-only state solely to identify screens and explain outcomes.
- Actual controls: native button clicks, Tab/Enter/Space, left/right arrows, P, and Escape.
  Playwright's controlled clock advances real game frames; reported simulation times are not human
  reaction times. Mobile runs use keyboard and pointer in resized desktop Chromium, not physical
  touch hardware.
- Viewports: 1280x800 desktop, 844x390 short landscape, 390x844 portrait. A separate 1280x800
  context enables `prefers-reduced-motion: reduce` before page load.
- Evidence is ignored output beneath `output/rubric_playtest/usability/`. Screenshot names below
  refer to WebP review copies; JSON preserves text, focus, measurements, and observed snapshots.

## Task model and findings

The task sequence is: choose a surgeon, identify campaign play, read the briefing, start, move and
fire, pause/resume, recognize a clear, and continue to the next briefing. Recovery separately
attempts a loss, retry, and return from practice. Completion proof is the visible destination plus
read-only state; a pictured control alone does not establish successful activation.

| Criterion | Rating | Lane and observation | Reproduction / evidence | Player impact / priority |
| --- | --- | --- | --- | --- |
| U1 First-run tasks | Meets | Fresh actual controls plus expert judgment: first-run chooser explicitly says all surgeons have the same abilities; selecting Maya enables Continue. The prominent Play campaign action leads to a briefing with Start stage. Actual held fire clears Stage 1; the result says Plaque cleared!, Route restored, and Press Enter or Space for the next stage. Enter reaches Stage 2: Little trouble. | Empty context; Tab to Maya, Enter, six Tabs to Continue, Enter; Tab to Play campaign, Enter; Enter starts; hold Space until clear; Enter. `recovery.json`, `keyboard_00_continue.webp` through `keyboard_04_next.webp`; `03_briefing.webp`, `09_result.webp`. | The sampled beginning and continuation tasks complete using visible cues. This establishes expert task completion, not novice comprehension. No issue priority. |
| U2 Objective and mechanic cues | Meets | Fresh controls plus observed DOM: Stage 1 briefing explicitly says fire upward and split every fragment, identifies Coronary stent, and explains smaller/faster fragments and merging. HUD shows plaque count, tool, lives, score, and elapsed time; a visible tutorial changes from movement instructions to Smaller fragments move faster after movement/fire. Stage 2 briefing introduces crossing currents. | `03_briefing.webp`, `04_live.webp`, `05_move_fire.webp`, `keyboard_04_next.webp`; text in `observations.json` and `recovery.json`. | Sampled opening objective and tool remain identifiable. Tissue, support, late-shift forecast, and finale phase cues are not evaluated here. No issue priority. |
| U3 Failure and retry | Meets | Actual Stage 1 practice, alternating left/right without firing, loses all three lives at 63.82 seconds of simulation. Run ended identifies Practice / Unranked, explains retry with 3 lives and entry score 0, and says failure saves no record. Clicking Retry practice returns the same Stage 1 with 3 lives, elapsed 0, score 0, and Retries: 1. P then Main menu returns to menu. Loss, retry, and departure save bytes are identical; compared with the start snapshot, only the earned move tutorial marker is added. Unlock level, records, and completed levels stay unchanged. | `loss.json`, `loss_00_start.webp` through `loss_03_departure.webp`. | The sampled practice recovery path completes cleanly without changing unlock/recovery/score records. Campaign loss/retry and earned-progress preservation after a campaign loss remain unobserved here. No issue priority. |
| U4 Keyboard and focus | Meets | Actual keyboard-only first-run/start/clear/continue completes. Tab reaches surgeon cards in displayed order and then Continue. Focused Back to menu activated with Space returns to menu rather than starting gameplay. Space on the focused paused Music checkbox keeps the game paused. Escape returns focus to the arena. | `keyboard_first_run.json`, `recovery.json`, `focus.json`, `keyboard_visible_focus.webp`. Focused Back/menu/input controls have a measured 3px gold outline with 5px offset; arena outline uses -5px offset. | Tested control/dialog shortcuts respect focused native controls. No screen-reader or exhaustive accessibility claim. No issue priority. |
| U5 Responsive readability | Concern | Fresh actual controls and measured layout: all three viewports retain the complete 16:10 arena, visible objective/status, usable pause and touch buttons, and no horizontal page overflow. Portrait HUD tool is 10.4px and objective is 10.88px; these remain legible in the captured frame but require finer reading than the stage/lives/score hierarchy. This is essential HUD text, distinct from decorative canvas labels. | `layouts.json`; `landscape_03_live.webp`, `portrait_03_live.webp`, `landscape_04_pause.webp`, `portrait_04_pause.webp`, and both `*_05_end.webp` result views. Portrait arena: 358x223.75 at x16/y227.42; landscape: 475.14x296.97 at x296.42/y8. Controls are 56px high portrait and 46px landscape. | Localized small-text friction on portrait; no observed clipping or blocked action. P3. |
| U6 Reduced motion | Meets | Actual Stage 1 firing reaches celebration and result under reduced motion. Three arena samples 500ms apart during celebration are identical, while the visible message says Stage clear! Nice work. The result retains Plaque cleared!, Route restored, recovery count, and Next: Stage 2. | `motion.json`, `motion_celebration_0.webp` through `motion_celebration_2.webp`, `motion_result.webp`. All three PNG capture SHA256 values are `20fd0b3b51144939f1078e1bc7117ed7baab246753bd3b5c79e4b00281b14fa5`; no active CSS animations are listed on the reduced-motion result. | Static sampled victory preserves event meaning. This does not establish every later effect's reduced-motion behavior. No issue priority. |

## Measured checks and scope limits

Measured foreground/background pairs use browser-computed foreground colors and the solid HUD
background `#211e34`: tool teal has 8.91:1 contrast; objective text has 13.57:1. Dark Fire text against
its teal fill measures 9.87:1. Gold focus against the HUD background measures 10.50:1. These are
specific pair checks, not an assertion about every gradient, illustration, or WCAG requirement.

Desktop pointer play, keyboard navigation, narrow-layout play/pause, opening clear/results, and
reduced-motion victory are independently observed. No tissue/support encounter, phase finale,
late maintenance shift, assistive-technology session, physical touch device, 200% zoom session, or
representative human study is included. No aggregate usability or enjoyment score is assigned.

The first desktop runner reports no page errors or error-level console messages. A temporary
recovery runner initially timed out waiting for Leave campaign because its controlled clock had
not advanced the deferred dialog step; that harness outcome is not scored as a product failure.
The corrected practice-only recovery run uses ordinary inputs, reaches an actual loss, retries,
and returns to the menu successfully; its complete evidence is `loss.json`.
