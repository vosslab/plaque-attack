# Campaign difficulty rubric

Status: source-derived measurement contract for the 24-stage remix. `src/difficulty.ts` reads
exposed `LEVELS`, ordered `LEVEL_IDS`, target presets and weapon constants. This document is not a
second hardcoded balance table. Content is authored across `src/constants.ts` and
`src/remix_levels.ts`. The current opening is defined in
[active_plans/active/early_weapon_discovery.md](active_plans/active/early_weapon_discovery.md);
the broader remix contract remains in [archive/remix_campaign_plan.md](archive/remix_campaign_plan.md).
[EXPANSION_PLAN.md](EXPANSION_PLAN.md) retains the historical expansion matrix.

## What the rubric measures

Report difficulty as a vector: **workload, movement pressure, vertical exposure, precision, sustained pressure,
and novelty**, with arena geometry and optional-work bounds reported separately. Publish raw units
and a small normalized summary for browsing. Comparisons within
the same objective/tool block are meaningful; a stent splitting level and a platelet maintenance
level require different skills. A single globally monotonic score would hide these transitions.

| Axis | Computation from actual configuration | Meaning and limitation |
| --- | --- | --- |
| Workload W | Sum complete removal hits over initial and finite targets | Large/medium/small/tiny plaque cost 15/7/3/1; platelets cost one |
| Leaf ceiling L | Plaque leaves 8/4/2/1, platelets one; phased density uses largest group | Total authored potential and concurrent phase bounds are separate |
| Movement Q | Hit-weighted mean of `horizontalSpeed * speedMultiplier / (2 * radius)` | Target diameters traversed per second; reports size/speed interaction |
| Vertical exposure B | Per-size center sweep, sampled player-zone overlap fraction over one complete fluid period, and mean speed in diameters per second | Measures actual shared fluid trajectories; retain tiny-size values even when starting targets are large |
| Precision A | Hit-weighted mean of `ARENA_WIDTH / (2 * radius + weapon.width)` | Horizontal alignment demand; full-height stent trail and drug range still differ |
| Arrival R | Finite scheduled count / last scheduled time; maintenance `1 / spawnInterval` | Clear-gated phases have no fixed arrival rate; zero scheduled rate does not mean no later groups |
| Load H | Initial live targets divided by `safeMaximum`, and `R * OVERLOAD_DURATION / safeMaximum` | Maintenance starting occupancy and arrivals during one overload window |
| Exposure E | Maintenance duration, nominal opportunities, and run-sampled actual arrivals | Separates endurance from moment-to-moment pressure |
| Geometry G | Floor relief, maximum smoothstep slope, occupied tissue cells, projected open-lane widths | Starting geometry, before erosion; lanes are raw gaps before projectile-width/player-bound trimming |
| Optional O | Hazard-pocket hit trees/leaves, separate from mandatory targets | Support adds no target workload; opened pending hazards must resolve |
| Merge M | Probability, cooldown, stage budget, and at most one extra hit per successful merge | Finite added removal work, not expected merges or expected time |
| Novelty N | Explicit authored tags and teaching/reset explanation | Identifies changed tool, objective, size mix, and entry motif; never awards arbitrary difficulty points |

For plaque Q and A, expand each initial/scheduled plaque's full hit tree by size: one large hit,
two medium hits, four small hits, and eight tiny hits. Averaging only starting targets hides the
fastest precision work. Platelets contribute their actual small/tiny size once. For maintenance,
report initial-target and recurring-entry means separately. If entry variants differ, include the
min/max as well as mean; a cyclic list has a known distribution, while seeded choices do not
guarantee that a short round samples every entry equally.

For vertical exposure, sample the actual floor-aware `advanceTarget` motion for one complete
fluid orbit at the fixed simulation step. Plaques use the rounded analytic profile; platelets
retain their original cosine profile. Both use a shared 24-pixel wall inset on flat floors and
phase advances at `FLUID_ANGULAR_SPEED * speedMultiplier` radians per second. Count samples whose
circle bottom overlaps the player hitbox height, regardless of horizontal position. Also report
mean actual speed in target diameters per second. These are exposure and tracking measures, not
collision probabilities. On varying floors use the local floor envelope and compare against
`playerSupportY` at the same x. These samples omit
tissue reflection and merges and are not integrated arena trajectories. On flat floors the circle
stays 24 pixels off the ceiling and floor; its lowest edge still overlaps the 46-pixel player
hitbox by 22 pixels. Both kinds sweep the available height with smooth turns; small fragments do
not inherit a special low orbit. Horizontal movement Q and sampled vertical exposure B jointly
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

For phased stages, `initialTargetCount` and `initial` describe the first group only.
`finiteAndInitial`, mandatory hit bounds, nominal workload, and hit-weighted movement/precision
include every authored finite phase. `pattern.entries` keeps the named groups in authored order
and identifies clear-gated transitions. Later groups are not initial concurrent occupancy.

Report mandatory hit work W separately from optional hazard-pocket work O. With merge budget B,
removal work is bounded by W+B, or W+O+B with all hazard pockets opened. The budget is shared.
Stage 6 retains four large plaques across two groups: W=60 and 32 total authored leaves;
each individual two-large group has 16 leaves. Current merge budget is five extra hits.
Report probability and cooldown without estimating guaranteed merges or completion time.

`finiteAndInitial.leafCeiling` and `mechanics.allAuthoredLeafCapacity` sum total potential across
all groups. `maximumPhaseLeafCeiling` and the phased leaf axis use the largest individual group.
`mechanics.maximumPlaqueLeafCapacity` adds all optional hazard-pocket plaque leaves to the largest
phase, a conservative concurrent bound. Merges conserve leaf mass. Unphased capacity semantics
remain unchanged; platelet admission remains a runtime matter. Support shells are already in
`arena.tissue`, so count their cells once in geometry and carving bounds. Support capsules add
no hit work. Maintenance workload is play-dependent, not a guaranteed finite total.

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

Comparable encounters in campaign order:

- Stage 1: gentle stent introduction; display 2 is a two-hit aspirin encounter and display 3 is a
  three-target clopidogrel alignment that one persistent shot can clear.
- Stages 4-6: stent clear, practicing sticky/heavy/unstable plaque and ending in a two-group finale.
- Stages 7-12: aspirin mastery; currents, lane selection and a three-group finale change position.
- Stages 13-14: clopidogrel mastery with persistent piercing and gathering.
- Stages 15-17: dual clear combines alternating shots with shelter, support and floor choices.
- Stage 18: finite clopidogrel finale; compare its aperture/gather/pierce task separately.
- Stages 19/21/23: dual maintenance; compare occupancy, arrivals, safe capacity and duration.
- Stages 20/22: finite dual breathers; stage 24 is a three-group finite finale.

Read actual counts and rates from the generated report. Displays 2 and 3 introduce antiplatelet
tools. Stages 7 and 13 continue mastery, and stage 15 introduces alternating shots. Stage 18 guarantees piercing
for its authored column; the final chapter alternates maintenance pressure with finite relief.
These are deliberate changes in task and cadence. Neither an increasing global scalar nor an
uninterrupted rise in workload is an acceptance requirement.

Within a block, flag an adjacent pair for review if all applicable raw axes fall or if the stated
new challenge is absent from the actual data. A flag requires inspection, not an automatic source
change. A narrow intentional reduction may be accepted only with the real teaching reason recorded.
If order is misleading without that reason, retune targets/rate/speed or move the encounter through
the canonical order; preserve stable IDs and migrate consumers coherently.

## Generated report contract

Produce one row per real stage, in campaign order, containing:

```text
ordinal, stable ID, chapter, name, tool, objective, W or bounded/nominal workload,
first-phase occupancy, total authored leaves, maximum-phase leaves, Q, per-size B and sampled tiny overlap fraction, A, arrival rate, maintenance load, exposure, pattern,
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

The stage-4/5 correction and before/after evidence are recorded in
[DIFFICULTY_REVIEW.md](DIFFICULTY_REVIEW.md). Its six-stage assisted simulation is a separate
proof lane from historical 24-stage completion evidence.

The later basin, shelf and shoulder variants, rendered evidence and geometry/completion checks
are recorded in [FLOOR_VARIATION.md](FLOOR_VARIATION.md).

The pre-lipid remix campaign ledger at
[active_plans/reports/remix_execution_ledger.md](active_plans/reports/remix_execution_ledger.md)
is historical and does not report current source status. The current plaque-orbit implementation,
gate counts and scoped encounter evidence are tracked in
[archive/lipid_floor_turn_plan.md](archive/lipid_floor_turn_plan.md).
That report describes challenge; it does not assign a fun score or establish survival, enjoyment
or completion time. Historical before/after runs remain evidence of their original snapshots.

The current categorical gameplay and usability review, including its bounded follow-up
reassessment, is recorded in [PLAYTEST_RESULTS.md](PLAYTEST_RESULTS.md), with criteria and evidence rules in
[PLAYTEST_RUBRICS.md](PLAYTEST_RUBRICS.md). It is a bounded agent assessment, not a difficulty
score or a claim about human enjoyment.
