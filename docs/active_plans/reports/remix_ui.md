# Remix HUD and briefing handoff

Owned files: `src/ui.ts`, `src/index.html`, `src/style.css`. Implementation began only after
the manager's `CORE_GATE_GREEN` message. Main runtime, dialogs, rendering and artwork remain
with their assigned owners. The manager owns canonical changelog and decision updates.

## Implemented requirements

- Briefings add conditional, scannable tactics for any-tool switch activation, four-second
  current and shared six-second cooldown, shot passthrough, optional carve/walk collection,
  nonstacking one-contact shield and overload bypass. Phase introductions name authored groups.
  A conditional caption marks these mechanics as arcade fiction.
- HUD phase text comes from the authored objective and runtime phase index. The transition
  names the upcoming group. Flow shows ready, active lane with seconds, or cooldown seconds;
  outlined, dashed/dotted and shield-border shapes supplement text and color.
- Shield support/released/armed state and positive run retry counts appear only when relevant.
  The opening stages receive no new tactical strip unless a retry makes it relevant.
- A separate live status changes only when meaningful state text changes. Visual countdowns,
  elapsed time and target counts do not enter that live message. The existing visual warning
  retains overload timing without its former per-frame live region.
- Failed campaign action is `Retry this stage`; its Enter/Space hint names the same action.
  The result explains entry-score rollback, three lives, same opening, added retry count and
  no record on failure. `Run ended`, final `Play again`, practice `Retry practice`, and all
  existing control selectors are preserved. Runtime owns the behavior behind these controls.
- Existing HUD rules use fluid minimum widths and closer spacing, with a compact mobile grid.
  Touch controls and pause keep their existing 56px minimum. Mute and reduced-motion rules
  are preserved. No tool, cast ability, jump action, or first-three-stage balance changed.

## CSS and HCI evidence

CSS route: existing stylesheet layout/composition; no layers or theme rewrite. The owning
surface is `.game_hud`, `.hud_tactics`, `.tactic_badge`, `.briefing_tactics` and the existing
620px mobile rules. The phase badge can use the full mobile width while other tactical badges
share compact rows. The arena still receives the remaining viewport height through the existing
flex/grid layout.

HCI method: expert cognitive walkthrough and guideline inspection, without participant claims.
Task model: read stage tactics, recognize ready switch, fire, recognize active/cooling state;
carve optional aid, walk to collect, recognize a one-contact shield; observe upcoming group;
recover from failure with the primary retry action. Acceptance requires visible state labels,
no new memorized controls, keyboard recovery and reachable touch controls at all target sizes.

Skills read: CSS creative expert and human interaction expert, including task selection,
project workflow, topic index and testing references. The local CSS Grid guide's sizing section
supports fluid minimum tracks. The referenced HCI book was absent, so the guideline route used
[W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
[MDN minmax](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/minmax)
was consulted for grid sizing support. Stable state announcements follow the W3C guidance to
communicate meaningful changes without unnecessary interruption.

## Verification and open acceptance

- `npx tsc --noEmit -p tsconfig.json`: exit 0, no diagnostics.
- `npx eslint src/ui.ts`: exit 0.
- `npx prettier --check src/ui.ts`: exit 0 after formatting the owned TypeScript file.
- No shared `dist/` rebuild was performed, per the batch gate.
- Actual built-game screenshots, layout measurement, keyboard/touch walkthrough, reduced-motion
  inspection and responsive acceptance at 1280x800, 844x390 and 320x568 are pending the shared
  integration build. Static compilation is not rendered acceptance.
- Full campaign acceptance and independent specification/quality review remain manager gates.
