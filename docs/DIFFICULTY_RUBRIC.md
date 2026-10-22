# Campaign difficulty rubric

Status: source-derived measurement contract for the 24-stage campaign and new arena mechanics. The report must read the real
`LEVELS`, ordered `LEVEL_IDS`, target presets, and weapon constants; this document is not a second
hardcoded balance table. See [EXPANSION_PLAN.md](EXPANSION_PLAN.md) for the target/wave matrix and
[STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md#stage-placement-matrix) for mechanics placement.

## What the rubric measures

Report difficulty as a vector: **workload, movement pressure, vertical exposure, precision, sustained pressure,
and novelty**, with arena geometry and optional-work bounds reported separately. Publish raw units
and a small normalized summary for browsing. Comparisons within
the same objective/tool block are meaningful; a stent splitting level and a platelet maintenance
level require different skills. A single globally monotonic score would hide these transitions.

| Axis | Computation from actual configuration | Meaning and limitation |
| --- | --- | --- |
| Workload W | Sum complete removal hits over initial and finite targets | Large/medium/small/tiny plaque cost 15/7/3/1; platelets cost one |
| Leaf ceiling L | Sum final live descendants, 8/4/2/1 for plaque and one for platelets | Worst split-family concurrency, not a prediction that all descendants coexist |
| Movement Q | Hit-weighted mean of `horizontalSpeed * speedMultiplier / (2 * radius)` | Target diameters traversed per second; reports size/speed interaction |
| Vertical exposure B | Per-size center sweep, sampled player-zone overlap fraction over one complete fluid period, and mean speed in diameters per second | Measures actual shared fluid trajectories; retain tiny-size values even when starting targets are large |
| Precision A | Hit-weighted mean of `ARENA_WIDTH / (2 * radius + weapon.width)` | Horizontal alignment demand; full-height stent trail and drug range still differ |
| Arrival R | Finite scheduled count divided by last scheduled time; maintenance `1 / spawnInterval` | Nominal arrivals per second; finite-wave acceleration means actual timing can be faster |
| Load H | Initial live targets divided by `safeMaximum`, and `R * OVERLOAD_DURATION / safeMaximum` | Maintenance starting occupancy and arrivals during one overload window |
| Exposure E | Maintenance duration, nominal opportunities, and run-sampled actual arrivals | Separates endurance from moment-to-moment pressure |
| Geometry G | Floor relief, maximum smoothstep slope, occupied tissue cells, projected open-lane widths | Starting geometry, before erosion; lanes are raw gaps before projectile-width/player-bound trimming |
| Optional O | Pocket target hit trees and leaf counts, separate from mandatory targets | Sealed contents are optional; opened pending contents must be released and resolved |
| Merge M | Probability, cooldown, stage budget, and at most one extra hit per successful merge | Finite added removal work, not expected merges or expected time |
| Novelty N | Explicit authored tags and teaching/reset explanation | Identifies changed tool, objective, size mix, and entry motif; never awards arbitrary difficulty points |

For plaque Q and A, expand each initial/scheduled plaque's full hit tree by size: one large hit,
two medium hits, four small hits, and eight tiny hits. Averaging only starting targets hides the
fastest precision work. Platelets contribute their actual small/tiny size once. For maintenance,
report initial-target and recurring-entry means separately. If entry variants differ, include the
min/max as well as mean; a cyclic list has a known distribution, while seeded choices do not
guarantee that a short round samples every entry equally.

For vertical exposure, sample the actual floor-aware `advanceTarget` motion for one complete fluid orbit
at the fixed simulation step. On constant-height flat floors its circle center follows
`y = ARENA_HEIGHT/2 - (ARENA_HEIGHT/2 - radius - FLUID_WALL_INSET) * cos(phase)`
with a shared 24-pixel wall inset, and phase advances at
`FLUID_ANGULAR_SPEED * speedMultiplier` radians per second. Count samples whose circle bottom
overlaps the player hitbox height, regardless of horizontal position. Also report mean actual
speed in target diameters per second. These are exposure and tracking measures, not collision
probabilities. On varying floors use the local floor envelope and compare against `playerSupportY`
at the same x;
the analytic overlap formula applies only to constant-height flat floors. These samples omit
tissue reflection and merges and are not integrated arena trajectories. On flat floors the circle
stays 24 pixels off the ceiling and floor; its lowest edge still
overlaps the 46-pixel player hitbox by 22 pixels. All sizes sweep the available height with smooth turns; small fragments do not
inherit a special low orbit. Horizontal movement Q and sampled vertical exposure B jointly
describe a target's movement demands.

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

## Arena and work bounds

The report reads floor, tissue, pocket and merge configuration from the real level. Floor relief
is the max/min control-point height difference; maximum slope uses the smoothstep curve's actual
maximum derivative. The current authored limits are 48 pixels relief and slope <=0.20. Project
occupied 12-pixel cell spans onto x, union them, and report the complementary open firing lanes.
These are untrimmed starting gaps; productive firing and hazard erosion change them during play.

For N occupied tissue cells, report full-removal productive-shot bounds [ceil(N/3), N], assuming
1-3 occupied cells per impact and no hazard erosion. This is not required stage work: players can
use open lanes, hazards carve cover, and misses or redundant impacts have no finite bound. Keep
tissue carving out of target-hit workload and score estimates.

Report mandatory clear-stage hit work W separately from optional pocket work O. With merge budget
B, mandatory removal hits are bounded by W+B; if all pockets open, the bound is W+O+B. The same
budget is shared across targets. Current stage 6 remains four large plaques: W=60, leaf ceiling=32,
and merge-extra-hit bound=1. Report probability/cooldown without estimating a guaranteed merge.
Plaque capacity sums all initial, scheduled and optional split leaves; merges conserve leaf mass.
Platelet capacity remains a runtime admission matter. Maintenance work is play-dependent, so these
finite clear-stage bounds do not become a guaranteed maintenance total.

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

Comparable blocks in campaign order:

- Stages 1-6: stent clear. W is 7, 10, 15, 37, 45, 60. The first three deliberately use slower fluid drift; later stages add cover, floor variation, then bounded merging. The listed W excludes optional and merge work.
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
floor relief/slope, tissue cells, full-removal productive-shot bounds, raw open-lane widths,
optional pocket workload/leaves, merge rule and extra-hit bound, mandatory/all-open hit bounds,
plaque leaf-capacity bound, novelty/reset label, comparable block, per-axis ratios, review flags
```

Include a compact explanation of formulas, current constants, and known limits alongside the
table. Keep a deterministic config report reproducible without the browser. Keep timing/capacity
experiments separately labelled, and use browser evidence for control feel and visual readability.
Permanent tests protect formula semantics and progression identity only when justified; avoid
freezing all 24 tuned values in permanent assertions.

## Fun and acceptance evidence

Each new stage must answer a concrete play question: Where should I stand? Which drifting family should I
split first? Can I catch a column with a persistent shot? When should I move to the next entry?
How do I recover before overload? A changed title or extra seconds alone does not answer one.

Beginner tuning must compare straightforward input patterns (held fire, simple timed movement,
and delayed firing) as well as any state-aware bot. Report sample starts, seeds, survival, damage,
clear counts, and completion time separately. Fewer remaining targets after an early death is not
proof of improved play. Keep mixed results visible and verify that easing persists on descendants
and every vertical circulation. Do not make permanent tests freeze the current tuning values.

The acceptance report identifies the representative stages played with real input, all starts
sampled through fixtures, and any normal full-campaign completion separately. Human enjoyment is not
proven by bot completion or monotonic config measurements. Optional feedback never blocks completion. If the campaign drags, shorten exposure
or reduce repeated arrivals while retaining motifs. If precision overwhelms readability, adjust
actual target speed/art or composition; do not improve the rubric score without improving play.
