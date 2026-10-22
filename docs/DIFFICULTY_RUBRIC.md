# Campaign difficulty rubric

Status: implementation contract for the 24-stage expansion. The report must read the real
`LEVELS`, ordered `LEVEL_IDS`, target presets, and weapon constants; this document is not a second
hardcoded balance table. See [EXPANSION_PLAN.md](EXPANSION_PLAN.md) for the proposed encounters.

## What the rubric measures

Report difficulty as a vector: **workload, movement pressure, low-bounce pressure, precision, sustained pressure,
and novelty**. Publish raw units and a small normalized summary for browsing. Comparisons within
the same objective/tool block are meaningful; a stent splitting level and a platelet maintenance
level require different skills. A single globally monotonic score would hide these transitions.

| Axis | Computation from actual configuration | Meaning and limitation |
| --- | --- | --- |
| Workload W | Sum complete removal hits over initial and finite targets | Large/medium/small/tiny plaque cost 15/7/3/1; platelets cost one |
| Leaf ceiling L | Sum final live descendants, 8/4/2/1 for plaque and one for platelets | Worst split-family concurrency, not a prediction that all descendants coexist |
| Movement Q | Hit-weighted mean of `horizontalSpeed * speedMultiplier / (2 * radius)` | Target diameters traversed per second; reports size/speed interaction |
| Low-bounce B | Per-size capped rise `min(bounceRise * bounceMultiplier, ARENA_HEIGHT - 2 * radius)`, apex clearance above the player's hitbox, and sampled overlap fraction | Reports how low, fast fragments restrict safe movement; retain tiny-size values even when starting targets are large |
| Precision A | Hit-weighted mean of `ARENA_WIDTH / (2 * radius + weapon.width)` | Horizontal alignment demand; full-height stent trail and drug range still differ |
| Arrival R | Finite scheduled count divided by last scheduled time; maintenance `1 / spawnInterval` | Nominal arrivals per second; finite-wave acceleration means actual timing can be faster |
| Load H | Initial live targets divided by `safeMaximum`, and `R * OVERLOAD_DURATION / safeMaximum` | Maintenance starting occupancy and arrivals during one overload window |
| Exposure E | Maintenance duration, nominal opportunities, and run-sampled actual arrivals | Separates endurance from moment-to-moment pressure |
| Novelty N | Explicit authored tags and teaching/reset explanation | Identifies changed tool, objective, size mix, and entry motif; never awards arbitrary difficulty points |

For plaque Q and A, expand each initial/scheduled plaque's full hit tree by size: one large hit,
two medium hits, four small hits, and eight tiny hits. Averaging only starting targets hides the
fastest precision work. Platelets contribute their actual small/tiny size once. For maintenance,
report initial-target and recurring-entry means separately. If entry variants differ, include the
min/max as well as mean; a cyclic list has a known distribution, while seeded choices do not
guarantee that a short round samples every entry equally.

For low-bounce pressure, the floor contact center is `ARENA_HEIGHT - radius`; at the apex the
circle's bottom is `ARENA_HEIGHT - rise`. Clearance above the player's hitbox is therefore
`rise - PLAYER_HITBOX_HEIGHT`. Positive clearance means the whole circle can pass overhead.
Sample the actual fixed-step integrator between two floor rebounds and report the fraction of
samples whose circle bottom overlaps the player's vertical zone, regardless of horizontal
position. This is a vertical exposure measure, not a collision probability. Keep initial launch
and ceiling contacts separate from steady floor arcs. Horizontal movement Q and B jointly expose
the difficulty of low, fast tiny fragments; speed alone cannot describe their threat.

For dual mode, show both projectile alignment demands and their mean, labelled alternating.
Use a separately labelled ideal throughput ceiling to describe weapon differences:

```text
aspirin: 1 / interval
clopidogrel: targetLimit / interval
dual: (aspirin.targetLimit + clopidogrel.targetLimit) / (2 * DUAL_FIRE_INTERVAL)
stent: 1 / interval, additionally constrained by one live projectile and travel/contact time
```

These ceilings assume perfect useful hits and ignore travel/caps; they are not a player-performance
estimate and must not be used as a guaranteed completion time. W divided by that ceiling is a
labelled optimistic firing-work measure, not a timing promise.

## Count maintenance honestly

The existing wave scheduler starts a warning before the nominal interval, stops arrivals at the
duration boundary, and can defer arrivals at capacity. A simple `floor(duration / interval)` does
not exactly reproduce these rules. The report labels that expression a nominal opportunity
estimate. Actual-arrival evidence advances the real fixed-step scheduler for specified seeds with
no firing and records arrivals, capacity deferrals, and cancellations at expiry. Include the seed
and fixed-step settings in the report. Do not invent guaranteed total workload for a mode whose
capacity and ending depend on play.

Capacity acceptance is separate from difficulty: a split must always produce both children,
finite reinforcements must preserve their full configured total, and no deferred spawn can burst
past the warning contract. A maintenance no-fire run may reach the cap; report that fact rather
than interpreting its clipped count as reduced pressure.

## Summaries and ordered comparisons

Normalize each continuous axis to the first stage in its comparable block, so 1.20 means 20%
above that block's introduction. Keep the raw number beside the ratio. An optional geometric mean
of comparable ratios can serve as an advisory index only; report its contributing axes and never
make it the sole ordering test. Novelty and endurance stay separate from that index.

Comparable blocks in the proposed order:

- Stages 1-6: stent clear. W is 7, 15, 18, 37, 45, 60. The first three deliberately use slow, higher arcs; later stages taper that help while speed and leaf pressure rise.
- Stages 7-12: aspirin clear. W is 4, 6, 12, 14, 16, 20. Later rows add arrivals and motifs.
- Stages 13-14: clopidogrel clear. W is 12 then 16; alignment opportunities introduce persistence.
- Stages 15-17: dual clear. W is 18, 20, 26; growing tiny fraction increases precision pressure.
- Stage 18: maintenance teaching bridge, reported separately.
- Stages 19-24: dual maintenance. R rises and safe capacity narrows; E is not the main ordering axis.

Stage 7 resets after the plaque finale to teach a different target and weapon. Stage 13 resets to
teach persistent shots. Stage 15 introduces alternating shots; throughput changes make its raw W
incomparable to clopidogrel-only stages. Stage 18 changes the objective to recoverable control;
stage 19 reinforces it with lower initial occupancy and faster recurring arrivals. Show these
transitions in the report and chapter UI as purposeful introductions, not hidden score inversions.

Within a block, flag an adjacent pair for review if all applicable raw axes fall or if the stated
new challenge is absent from the actual data. A flag requires inspection, not an automatic source
change. A narrow intentional reduction may be accepted only with the real teaching reason recorded.
If order is misleading without that reason, retune targets/rate/speed or move the encounter through
the canonical order; preserve stable IDs and migrate consumers coherently.

## Generated report contract

Produce one row per real stage, in campaign order, containing:

```text
ordinal, stable ID, chapter, name, tool, objective, W or bounded/nominal workload,
leaf ceiling, Q, per-size B and sampled tiny overlap fraction, A, arrival rate, maintenance load, exposure, pattern,
novelty/reset label, comparable block, per-axis ratios, review flags
```

Include a compact explanation of formulas, current constants, and known limits alongside the
table. Keep a deterministic config report reproducible without the browser. Keep timing/capacity
experiments separately labelled, and use browser evidence for control feel and visual readability.
Permanent tests protect formula semantics and progression identity only when justified; avoid
freezing all 24 tuned values in permanent assertions.

## Fun and acceptance evidence

Each new stage must answer a concrete play question: Where should I stand? Which arc should I
split first? Can I catch a column with a persistent shot? When should I move to the next entry?
How do I recover before overload? A changed title or extra seconds alone does not answer one.

Beginner tuning must compare straightforward input patterns (held fire, simple timed movement,
and delayed firing) as well as any state-aware bot. Report sample starts, seeds, survival, damage,
clear counts, and completion time separately. Fewer remaining targets after an early death is not
proof of improved play. Keep mixed results visible and verify that easing persists on descendants
and every floor rebound. Do not make permanent tests freeze the current tuning values.

The acceptance report identifies the representative stages played with real input, all starts
sampled through fixtures, and any normal full-campaign completion separately. Human fun is not
proven by bot completion or monotonic config measurements. If the campaign drags, shorten exposure
or reduce repeated arrivals while retaining motifs. If precision overwhelms readability, adjust
actual target speed/art or composition; do not improve the rubric score without improving play.
