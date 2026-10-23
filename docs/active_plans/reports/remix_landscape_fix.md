# Short landscape arena correction

## Visual contract

At 844x390, prioritize the playable arena while keeping stage, lives, score, elapsed time,
objective, equipped tool, current/shield/phase status, and pause readable. Keep touch controls
at least 44px high. Preserve portrait, desktop, menu, briefing, results, and dialog behavior.

## Implementation

Only [src/style.css](../../../src/style.css) changed. The existing landscape media query
(minimum width 621px, maximum height 500px) owns the composition. During gameplay, decorative
header/footer give way to a 216px HUD sidebar alongside the arena and its touch-control row.
Explicit grid placement keeps the existing DOM and accessible names. The sidebar allows
vertical scrolling if content grows; all representative statuses fit without scrolling.
Existing menu, briefing, result, and dialog selectors retain their presentation.

The CSS creative expert route was layout: existing global component rules and the existing
short-landscape query were inventoried; no new breakpoint, markup, theme, or feature was added.
The established grid/flex primitives and existing container-width arena constraint were retained.

## Browser evidence

Temporary scripts, JSON measurements, and WebP quality-90 captures live in
`output/remix_landscape/`. The isolated server uses the current source CSS with existing built
HTML/JavaScript on port 8129. Final joint-build acceptance belongs to the manager.

| Viewport | Canvas before | Canvas after | Touch height | Pause height |
| --- | --- | --- | --- | --- |
| 844x390 | 210.5x131.6 | 508.797x318 | 46 | 44 |
| 1280x800 | 787.188x492 | 787.188x492 | 56 | 56 |
| 320x568 | 241.422x150.891 | 241.422x150.891 | 56 | 56 |

Landscape geometry: canvas x279.594/y8; HUD x8/y6, 216x372; pause 194x44;
left/right controls 151.703x46 and 151.719x46; fire 210.578x46. The arena has about
5.84 times its former visible area. Screenshots were inspected at their original 844x390 size.

- `844x390-active.webp`: current indicator and target interaction visible.
- `phase.webp`: stage 6, phase 1/2 label readable.
- `shield.webp`: stage 5, shield state readable.
- `tactics.webp`: stage 14, flow-ready state readable.
- Briefing, ready, active, and paused captures exist at all three named viewports.
- Stage 5/6/14 sidebar clientHeight and scrollHeight both 370; document extent exactly 844x390.
- Actual simultaneous touch movement/fire moved player x480 to x690 over 42 ticks and
  advanced nextProjectileId from 1 to 2. Pause held tick 101; resume advanced to tick 119.
- Keyboard movement/fire, visible pause, and frozen simulation ticks passed at all three sizes.
- No page errors occurred during the three-viewport walk.

These are practice fixtures with unlocked saves for responsive acceptance; they are not campaign
completion evidence. Stage/current/shield/phase status was observed, without mutating live state.

## Checks

- `git diff --check -- src/style.css`: passed.
- `node_modules/.bin/tsc --noEmit`: passed.
- Chromium required the ordinary macOS sandbox escalation; browser checks then completed.
- No permanent tests were added for this bounded presentation change.
