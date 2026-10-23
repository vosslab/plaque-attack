# Playtest rubrics

Use these rubrics for independent agent reviews of the integrated game. The game targets casual
players and biology learners; no medical knowledge should be needed. Reviewers assess the current
built experience against [GAME_SPEC.md](GAME_SPEC.md) and use [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md)
for descriptive configuration measures. These rubrics assess observable experience, not a numeric
fun score.

## Rating scale

Rate every criterion `Meets`, `Concern`, `Fail`, or `Not observed`. Use `Not observed` when the
scenario or evidence needed to judge it was unavailable; do not infer success from a fixture or
configuration report. A `Fail` contradicts a stated player-facing contract or blocks the task. A
`Concern` is a reproducible friction or unclear design choice that does not block the task. `Meets`
requires observed evidence for the listed anchor. Each rating must include evidence and a concise
rationale; a reviewer may report more than one finding per criterion.

## Gameplay design rubric

Use actual browser controls for play claims. Reviewers may inspect read-only telemetry to explain
what happened, but telemetry alone cannot establish fairness, good pacing, or enjoyment.

| ID | Criterion | Meets | Concern | Fail |
| --- | --- | --- | --- | --- |
| G1 | Control response | Left/right movement, firing, release, pause, and retry respond as cued in the sampled play; no stuck input or unexplained delay changes the outcome. | A reproducible input ambiguity, delay, or awkward transition causes a recoverable mistake. | A promised input is unavailable or unreliable, held input changes a later screen/run, or control failure prevents play or recovery. |
| G2 | Fairness and readability | In the sampled encounter, target motion, collision danger, and safe response are visible in time to act; a hit or loss has an observable cause. | One event is difficult to read or appears surprising, but a replay or cue makes the cause recoverable. | Repeated unavoidable or visually unjustified damage, or a materially hidden threat, decides the encounter. |
| G3 | Meaningful choices | Position, firing timing, target priority, tissue lanes, currents, or support create at least one visible choice whose consequence can be observed in play. | A stated choice exists but one option dominates or its consequence is hard to perceive. | The encounter's promised choice is absent, or the objective can only be completed by an unexplained or arbitrary action. |
| G4 | Novelty and progression | Compared with the sampled prior encounter, a new mechanic changes the player's action or decision, and the next encounter gives it a legible use or payoff. | The change is present but feels like a minor variation, arrives without useful setup, or repeats without adding a decision. | A promised mechanic is missing or progression repeats the same action without the stated change in task. |
| G5 | Cleanup and pacing | The encounter reaches its clear or maintenance endpoint without a long interval of unproductive waiting; shifts between action, warnings, and recovery are understandable. | Repetition, waiting, or pressure briefly overwhelms the encounter's rhythm but play remains productive. | A normal route stalls, becomes an unproductive grind, or ends without a clear explanation of the objective/result. |
| G6 | Feedback and payoff | Hits, splits, current/support effects, phase transitions, loss, and success produce feedback that identifies the event and gives the player a satisfying next beat. | Feedback is delayed, repetitive, or ambiguous in one state, but the result can be understood. | Feedback contradicts the state, hides a consequential transition, or success/loss presentation does not communicate the outcome. |

## Usability and presentation rubric

Run task scenarios from a clean page load where feasible. Record the viewport, input method, start
state, and whether an action was performed or only inspected. Use keyboard and narrow layouts as
separate paths; a desktop pointer run does not establish their usability.

| ID | Criterion | Meets | Concern | Fail |
| --- | --- | --- | --- | --- |
| U1 | First-run tasks | A new player can identify the primary action and start the first round, then identify the next action after a clear, using visible cues without outside explanation. | The task completes after a wrong turn, pause, or rereading; the needed cue is present but easy to miss. | The player cannot start or continue from the visible interface, or the primary action is not discoverable. |
| U2 | Objective and mechanic cues | Briefing/HUD identify the current objective and equipped tool; sampled current, support, tissue, or phase cues explain relevant state before it requires a decision. | A cue is present but its meaning or timing requires trial-and-error. | The displayed objective/tool/state is absent or misleading enough to cause a wrong required action. |
| U3 | Failure and retry | A loss explains the outcome and offers a discoverable retry or return path; retry starts the same stage cleanly and does not consume or corrupt saved progress. | Recovery is available but its label, consequence, or reset is unclear. | The player cannot recover through the interface or retry preserves broken active state / corrupts progress. |
| U4 | Keyboard and focus | Tab reaches visible native controls in a sensible order; Enter/Space activates the focused control; gameplay shortcuts yield to focused controls and dialogs. | Focus or shortcut behavior is inconsistent but a pointer path remains clear. | A required action is keyboard-inaccessible, focus is invisible/lost, or a gameplay shortcut unexpectedly activates while using a focused control/dialog. |
| U5 | Responsive readability | At desktop and a narrow portrait or short-landscape viewport, objective, status, dialogs, and required controls remain readable and usable without clipping or arena cropping that hides required information. | A nonessential label or cue becomes cramped, or a usable control needs extra scrolling/resizing. | A required cue/control is clipped, obscured, too small to operate, or responsive scaling hides necessary play information. |
| U6 | Reduced motion | With reduced motion enabled, the sampled gameplay and clear/result path preserve state feedback and meaning while avoiding nonessential celebration/motion specified as reduced. | A nonessential animation remains or a static cue is less clear, without blocking understanding. | Reduced-motion behavior removes essential feedback or still presents a prominent motion effect the spec says should be static. |

## Representative scenarios

Use this bounded set to sample different contracts. It does not require replaying all 24 stages.
Start each gameplay scenario in a fresh campaign/practice state as appropriate. Use ordinary inputs
and describe them; do not silently rely on a scripted win. If a route cannot be reached reasonably,
mark the affected criterion `Not observed` and note the reason. Fixtures may establish presentation
of a rare state, but cannot replace actual-input evidence for reachability or play feel.

| Scenario | Start and task | Observe |
| --- | --- | --- |
| Opening: stages 1-3 | Start a fresh campaign. Play each of the preserved opening stages with movement and fire, then continue through the result/briefing transition. | First action discoverability, control response, objective cues, early rhythm, result-to-next-stage flow. Note whether a new player can tell what caused a split and what to do next. |
| Tissue and support: stages 4-5 | Play stage 4 to encounter tissue, then stage 5 to encounter floor/support. Try firing through a tissue barrier and observe the optional support path if it is reasonably reachable. | Lane choice, projectile blocking, floor following, support visibility/optionality, cue timing, whether support is mistaken for required progress. |
| Phase finale: stage 24 | Enter the final finite finale through practice or normal progression. Play through the visible phase transitions; inspect the phase/result presentation if the full route is impractical. | Whether groups and transitions are legible, warnings give time to respond, state carries across phases as cued, and the final payoff communicates completion. Clearly label any fixture-only observations. |
| Late shift: stage 23 | Enter stage 23 and observe the maintenance task before and after its forecast right-side entry shift at 25 seconds. Use ordinary movement/fire; if a full 50-second run is impractical, inspect a read-only state or fixture separately. | Whether the shift is forecast, its cue is visible and actionable, the occupancy objective remains clear, and the shift does not read as an unexplained spawn or unfair trap. |
| Completion presentation | Reach a successful clear and follow the result/continue flow; if reaching it is impractical, inspect a presentation fixture separately. Also inspect reduced-motion completion when available. | Last-hit/result order, frozen gameplay during celebration, surgery/recovery illustration and saved recovery cue, primary next action, and reduced-motion equivalent feedback. State what was played versus fixture-rendered. |

## Evidence and findings

Keep evidence lanes separate. An agent may combine lanes in one report but must label each claim.

| Evidence lane | It can establish | It cannot establish by itself |
| --- | --- | --- |
| Fresh actual controls | Observed input behavior, reachable interaction, sampled route, visible feedback, and reproducible friction in the current build. | General player enjoyment, broad fairness, or behavior in unplayed encounters. |
| Read-only telemetry | State, counters, timing, phase transitions, or why a sampled event occurred. | That a player can discover/reach the event, that it feels fair, or that it is enjoyable. |
| Fixture presentation | How a supplied state is rendered, including rare result/phase states. | Normal reachability, control behavior, pacing, or route completion. |
| Historical evidence | Behavior of the explicitly named earlier build/snapshot. | Acceptance of the current build. |
| Expert judgment | A reasoned design/usability concern tied to a criterion and inspected evidence. | A measured human reaction or population-level finding. |
| Human enjoyment | What the named human participant reported or did in the stated session. | Results for other players, unless supported by a suitable broader study. |

For each finding, record: criterion ID; rating; evidence lane; scenario and build/commit; viewport
and input method when relevant; concrete observation; reproduction steps or evidence path; player
impact; and priority. Use `P1` for blocked or materially misleading play/task completion, `P2` for
recurrent friction or a weakened intended choice/payoff, and `P3` for a localized polish issue.
These priorities order follow-up; they do not replace the rating. Distinguish direct observation
from interpretation, and state the sample limits. Do not average ratings into a total score.

Optional report template:

```text
Reviewer:
Build/commit:
Scenarios completed:
Evidence lanes used:
Criterion | Rating | Lane | Finding / evidence | Reproduction | Impact | Priority
Unobserved criteria and reason:
Sample limits:
```
