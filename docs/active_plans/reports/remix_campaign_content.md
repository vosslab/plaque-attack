# Remix campaign content

Source: [remix_campaign_plan.md](../../archive/remix_campaign_plan.md).
Ownership: `src/remix_levels.ts`, campaign exposure in `src/constants.ts`, and
`tests/test_remix_campaign.mjs`. The manager owns changelog and durable decisions.
Implementation began only after the manager's `M1_EXPERIENCE_GREEN` release.

## Authored campaign

All 24 stable IDs retain the approved display order. First-three-stage deep comparison against
an immediately pre-edit snapshot passes, including balance, arena, target positions, merge rules,
weapon, speed, briefing, and metadata. The JSON snapshot's omitted undefined `fact` fields were
rehydrated before strict deep comparison. No simulation, engine, controls, renderer or UI changed.

| Display stages | Authored decision and cadence |
| --- | --- |
| 1-3 | Accepted opening data unchanged. |
| 4-6 | Shelter versus firing notch; optional left support; original four large lipid families in two alternating-side pairs. |
| 7-9 | Four-target aspirin introduction; accepted six-target current introduction; arch and optional hazard-pocket risk. |
| 10-11 | Two selectable current lanes in the basin, ten finite targets; shelter versus crossing for right support, ten finite targets. |
| 12 | Switchback surge: left redirect, right reposition, crossing volley. |
| 13-14 | Accepted clopidogrel introduction and current/multi-hit combination. |
| 15-17 | Dual introduction, twelve finite targets; center current versus left support, twelve; shoulder and right gathering lane with twelve small/tiny targets. |
| 18 | Triple-play crescendo: carve an aperture, gather/pierce, cleanup. |
| 19-20 | Maintenance with selectable lanes; six-target finite breather and optional left support. |
| 21-22 | Center-current maintenance; seven-target finite breather with arch shelter. |
| 23-24 | Basin maintenance with optional right support; Restore the rhythm's three finite groups and final patient payoff. |

Optional support appears exactly at display stages 5, 11, 16, 20, 23, 24, one cache each.
Each cache is floor-relative and clears the full surgeon head/feet footprint. Its references
resolve to real tissue cells, and its shell does not overlap regular cover. Right-flank caches
at stages 11, 23, 24 use x828; other caches use x132. The final cache is visible from entry,
so the middle crossing group changes the risk of a choice already visible to the player.

Manager decision D4 selects guaranteed clopidogrel piercing at stage 18; dual resumes at stage 19.
A nine-cell bridge below the center switch supplies a real aperture to carve. The current circle
is reachable after erosion; there is no permanent obstruction or new action. Its floor-relative
placement leaves 18px above the surgeon's head at the flat floor.

Manager decision D4b replaces the legacy hazard pockets and only their linked shells with support
at stages 11, 16, 20, 24. Stage 22 removes its hazard pocket/shell for deliberate finite relief.
Stage 9 retains the optional hazard-risk lesson. Regular shelters remain. This prevents support
from doubling as an unannounced hazard trap and makes the quiet passages finite in practice.

## Finale groups

All groups use the existing phase source of truth: empty `initialTargets`, empty reinforcement
schedule, nonempty `{name, targets}` phases. Existing runtime preserves arena, aid and current
through its warned transition gap; configuration adds no timers.

| Stage | Phase targets and spatial distinction | Restoration |
| --- | --- | --- |
| 6 | Original left two large lipids, then original right two. Original positions/heights unchanged. | artery_opening |
| 12 | Four small left entries x150/210/280/340; four mirrored right x810/750/680/620; six crossing small/tiny x170/300/430/530/660/790. Two switches at x320/640 work around paired shelter. | restored_flow |
| 18 | Three stacked small x450/480/510 at y120/210/300 behind the aperture; six in two x410/550 columns at y100/180/260, including two tiny; three tiny cleanup targets x200/480/760. Center gathering serves guaranteed three-hit clopidogrel. | restored_lining |
| 24 | Four outer opening targets x170/300/660/790; six opposing cross-stream targets x170/290/410/550/670/790; five tiny in a symmetric x160/320/480/640/800 fan. Same shelf/cover arena and two current lanes remain throughout. | patient_recovery |

The counts are finite tuning values, not permanently pinned by tests. The new permanent test
protects all four finale source/initialization/restoration contracts without pinning counts.

## Evidence and limits

- `npx tsc --noEmit -p tsconfig.json`: passes, no diagnostics.
- `npx eslint src/remix_levels.ts src/constants.ts tests/test_remix_campaign.mjs`: passes.
- `npx prettier --check src/remix_levels.ts src/constants.ts tests/test_remix_campaign.mjs`: passes.
- Temporary Node probe: first-three deep equality, all-24 exact order, support presence/references,
  head clearance and nonoverlap, finite breathers, stage18/19 weapon assignment all pass.
- Initial full Node run: 64 tests, 58 pass, six failures in existing fixtures. Five assume stable
  ID10 is maintenance; one assumes every level begins with a clear central lane. Both assumptions
  intentionally change at stage 18. A fresh manager-assigned owner is updating those fixtures to
  maintenance ID11 and a meaningful carveable-aperture property. The new campaign test passes.

The game-design skill references and local book body passages were inspected: Koster 456-472;
Schell 5443-5466 and 6870-6907, editions in the approved plan. These support fresh spatial choices
and alternating pressure/relief; they do not prove enjoyment. No actual-input reachability,
expanded browser playthrough, rendering acceptance, or complete-suite pass is claimed here.
Those remain manager-owned integration evidence against the rebuilt content.
