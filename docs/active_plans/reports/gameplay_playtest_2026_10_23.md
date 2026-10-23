# Gameplay playtest

Independent gameplay assessment, 2026-10-23. Scope is the current local built game against
[PLAYTEST_RUBRICS.md](../../PLAYTEST_RUBRICS.md) and [GAME_SPEC.md](../../GAME_SPEC.md).
No production changes were made. This is agent assessment, not measured human enjoyment.

## Build and method

- Served existing `dist` at `http://127.0.0.1:8150` with the existing static server.
- `dist/main.js` SHA-256:
  `7bd8bc2518e5ca3d1cead433ccd28092ffa343ebc12b963e9652871abb909b8a`.
  The evidence manifest is authoritative if this manually transcribed value differs.
- `source_map_check.json` compares all 32 bundled source-map contents with current disk source:
  zero mismatches. Each run hashes every source and dist file before/after; all three manifests
  report unchanged source/dist. No build or source mutation occurred during play.
- Headless Chromium, 1280x800, actual Playwright keyboard presses/releases. Pointer activates
  practice/briefing buttons. Sound is muted. Screenshots were opened and visually inspected.
- Each route starts a fresh practice context with surgeon Alex selected, seed 1, empty recovery,
  no completed tutorials, and practice unlock only. No lives, targets, score, phase or completion
  state was injected. Display stages differ from stable IDs: unlock 24 exposes display stage 23;
  unlock 15 exposes the final stage. An initial attempt to select locked display stage 24 timed
  out; the separate finale run corrects that fixture mistake. This is a probe error, not game failure.
- The simple route stands at center and holds Space after the ready countdown. A separate
  wall-clock route moves right while firing for the first two simulation seconds, releases
  movement, and continues firing until 7.1 seconds. It runs about ten wall seconds including
  countdown; it establishes ordinary rendered control response, not a winning human strategy.
- Other routes use a freshly bundled version of the existing planner. Every 300 virtual ms,
  detached read-only acceptance telemetry guides left/right/hold plus Space. The planner simulates
  candidate actions in detached copies and has information unavailable to an ordinary player.
  Virtual clock acceleration and predictive pursuit do not establish human fun or accessibility.
- A bounded second stage-23 replay captures 22-27 seconds because the first route's screenshot
  budget filled before the shift. It repeats the same actual controls and ends at 27.28 seconds.

## Played outcomes

Times exclude the ready countdown. Shot counts are `nextProjectileId - 1`, the allocated projectile
count, including shots spent on tissue/current/support and misses; they are not successful hits.

| Display stage | Route | Endpoint | Seconds | Lives | Shots | Observation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Wall-clock right then stationary fire | Bounded play | 7.10 | 3 | 10 | Movement stops after release; plaque splits; upward mesh remains at firing lane |
| 1 | Stationary held fire | Clear | 32.62 | 3 | 44 | No target pursuit is needed for this seed |
| 2 | Stationary held fire | Clear | 32.47 | 3 | 45 | Two starting families resolve without movement |
| 3 | Planner keyboard | Clear | 13.52 | 3 | 24 | Repositioning intercepts fragments rather than waiting at center |
| 5 | Planner keyboard | Clear | 24.10 | 3 | 52 | Carved support, collected shield and followed floor |
| 8 | Planner keyboard | Clear | 4.95 | 3 | 22 | Shot activated gathering current, then aspirin removed six hazards |
| 6 | Planner keyboard | Game over | 41.93 | 0 | 91 | Entered second phase, failed with two targets remaining |
| 23 | Planner keyboard | Maintenance clear | 50.00 | 1 | 143 | One live hazard remains, correctly below safe maximum five |
| 24 | Planner keyboard | Practice clear | 22.07 | 3 | 64 | Three finite phases completed; shield collected and consumed |

Stage 6 damage was sampled at 8.68, 21.60 and 41.93 seconds. The first damage capture visibly
places a large plaque beside the surgeon and shows contact invulnerability. The run ended after
substantial productive play, not a stalled route. One predictive policy failure does not establish
that the stage is unfair or too hard. Retry was visible and its reset explanation readable, but was
not activated in this gameplay sample.

## Rubric findings

| ID | Rating | Evidence lane | Observation and reproduction | Player impact | Priority |
| --- | --- | --- | --- | --- | --- |
| G1 | Not observed | Fresh controls; read-only telemetry | Movement, release, repeat fire and ordinary active rendering worked in stage 1; later controls reached all sampled endpoints. Pause/resume and retry activation were not exercised by this reviewer, so the full anchor is unobserved. Replay `run.mjs`. | Core action is supported; complete control acceptance needs the other reviewer or a focused check. | No defect priority |
| G2 | Meets | Fresh controls; inspected rendering | Stage-6 first damage has an adjacent visible plaque; tiny gold fragments remain distinct against the arena. Stage-23 forecast labels the right stream and bracket before it changes. See `6-planner-2.png` and `shift/23-planner-0.png`. No repeated hidden or unavoidable threat was demonstrated. | Sampled threat and response are readable. This is not broad fairness proof. | No defect priority |
| G3 | Meets | Fresh controls; inspected rendering | Stage 5 shell releases at 5.68s and capsule collects at 6.88s; walking beneath it changes HUD to `Shield: 1 contact` and adds a visible shield. Stage 8 shot changes ready switch into a labeled gathering lane at 0.28s. See `5-planner-4.png`, `5-planner-6.png`, `8-planner-2.png`. | Positioning and firing change routes and optional protection; later action has consequences beyond chasing score. | No defect priority |
| G4 | Meets | Fresh controls; telemetry; expert judgment | Gentle opening fragmentation changes into tissue/support positioning at 5 and aspirin plus current at 8. Stage 6 alternates two finite groups; 24 combines three groups, current lanes, tissue and support. Finale phase indexes advance at 11.08s and 19.48s. See finale manifest and final render. | These are distinct actions and spatial tasks, not just added speed/count. The skipped stages and final campaign payoff remain unassessed. | No defect priority |
| G5 | Concern | Simple keyboard route; read-only telemetry; expert judgment | In stage 1, score remains 600 and target count two at 2.98, 8.98 and 14.98s: at least 12s without a hit, with no tissue/current/support task and no merge observed (budget remains one). At 20.98 and 26.98s the same one target remains, score 1750. Held fire continues. Replay stationary route seed 1. | A passive beginner can wait safely but receive sparse progress feedback. Movement can improve pace; stage 3 planner clears in 13.52s. This is localized friction in a deliberately easy opening, not a blocked route or a reason by itself to raise difficulty. | P3 |
| G6 | Concern | Fresh controls; inspected terminal render | Splits, carving, shield pickup, current state and phase labels provide explicit feedback. Stage-23 clear at elapsed 50s still renders `REMAINING 00:01` while footer says `Stage clear! Nice work.` See `23-planner-end.png`. Floating-point state is 49.999999999998444s. | One-second terminal display makes maintenance expiry slightly ambiguous despite a correct clear. Full result/recovery celebration was not followed here. | P3 |

## Interpretation and limits

The stronger sampled moments are support changing from carved shell to falling collectible to
visible shield, and the current turning a shot into a clear gathering lane. The three-phase finale
is short and productive under predictive control. A stage-8 assisted clear in 4.95 seconds shows a
brief introduction, not evidence that an ordinary new player understands the mechanic that fast.
The stage-23 right-stream forecast is visible at about 22.18 seconds with `Right-side arrivals in 3s`
and a bracket over the right ceiling; it remains visible at about 24.58 seconds with `in 1s`.
The bounded replay ends with three lives. In the full 50-second route, subsequent losses occur
without invalidating completion. This supports actionable warning presentation, not a controlled
comparison of left/right tactics.

Stage 1 stationary score samples establish a 12-second minimum no-hit interval. The approximately
six-second sampling cadence cannot locate its exact endpoints or produce an exact maximum.
Maintenance survival scoring advances independently of hits, so its score is not used as a
no-progress oracle. No claim is made about a maximum idle interval in the other stages.

The opening was reached through practice fixtures, not a fresh campaign menu. No campaign
continuation, saved recovery increment, full campaign, phase-2 screenshot sequence, reduced-motion
path, audio, narrow/touch play, or full success-result sequence is established here. Stage 24 is a
practice clear, not a campaign-complete claim. G1 is intentionally incomplete. G6 concerns only the
visible feedback inspected, and does not accept the unplayed recovery payoff.

## Reproduction artifacts

All temporary evidence is ignored under `output/rubric_playtest/gameplay/`:

- `run.mjs`, `planner.mjs`, `report.json`: main routes, complete entry states, hashes, event changes,
  samples and captures. The final locked-stage timeout is retained transparently.
- `finale/run.mjs`, `finale/report.json`: corrected unlock and successful stage-24 route.
- `shift/run.mjs`, `shift/report.json`: bounded forecast replay and captures.
- `source_map_check.json`: bundled-source comparison and authoritative main bundle hash.

Commands from the repository root:

```bash
REMIX_PORT=8150 node output/arcade_payoff/serve.mjs
npx esbuild output/lipid_orbit/play/candidate_planner.mjs --bundle --platform=node --format=esm --outfile=output/rubric_playtest/gameplay/planner.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/rubric_playtest/gameplay/run.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/rubric_playtest/gameplay/finale/run.mjs
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers node output/rubric_playtest/gameplay/shift/run.mjs
```

Browser launch required sandbox escalation on macOS. The owning local server is stopped after
assessment. Findings are observations for manager triage; no tuning or production repair is made.
