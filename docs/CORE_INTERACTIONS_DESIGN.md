# Core interactions design

This document gives the event-level contract for the accepted core interaction revision. The
current gameplay specification remains [GAME_SPEC.md](GAME_SPEC.md); the decision rationale is in
[DESIGN_DECISIONS.md](DESIGN_DECISIONS.md). Implementation and evidence status is tracked by the
[active plan](active_plans/active/core_interactions_revision.md) and its
[ledger](active_plans/reports/core_interactions_revision_ledger.md).

## Target contact

Every active target responds physically when it contacts another target, regardless of size or
kind. This includes tiny targets, mixed-size plaque pairs, and platelet hazards. Contact redirects
motion through a visible bounce and applies its impulse to the remaining movement; ordinary
contact does not remove, split, or merge a target.

Only same-size plaque pairs below large are merge candidates. A merge roll requires genuine
approach into a new contact entry and remains subject to the authored probability, cooldown, and
per-level success budget. Initial overlap is not an entry. Separation is required before another
entry can roll. A projectile-caused split never triggers a merge. Newborn fragments activate on the
next tick and must separate before any later live collision can qualify.

## Chronological contacts

The simulation builds one chronological `target_contacts` agenda for target, tissue, pair,
projectile, weapon, and session contacts. The weapon boundary
`beginProjectileContacts(state, dt, events, tissue)` returns `{ next(after): { time, commit } | undefined,
finish }`; agenda consumption asks for and commits the next event by time, then finishes the
projectile-contact phase. Resolve the earliest event first. On an exact-time tie, resolve the
projectile event before the target-pair event. This preserves a projectile contact at time 0.1
ahead of a merge at time 0.8 in the same tick. The event may redirect, remove, split, merge, or
create targets; later events in that tick must use the resulting live state.

When an event changes motion, rewrite the affected swept path suffix from the event time. Collision
consumers, player-contact checks, and rendering use the corrected piecewise paths, so visuals and
later contacts agree with the resolved impulse. Targets follow their authored analytic orbit until a
physical impulse first occurs. That contact switches the target to persistent free-fluid velocity;
there is no inverse-orbit-speed remap. Impulse motion reflects velocity at the fixed ceiling, walls,
and curved floor while preserving speed. Floor sweeps split at smoothstep knots and gap-derivative
roots before locating contact, so curved-floor reflection follows the actual boundary. Newborn
targets do not enter the current agenda.

Spawn or other nonphysical placement synchronization keeps the authored orbit. Calling
`synchronizeTargetMotion(..., true)` enters persistent impulse motion; once entered, later
synchronization keeps that mode. Sticky plaques retain the active-play wall pause and resume stored
velocity after it ends. This runtime motion contract does not change the save schema.

## Aspirin and clopidogrel

Aspirin hitting a small platelet target disaggregates it into three tiny platelet targets. Those
children become active on the next tick, then separate before participating in later live contact
events. This conversion awards no score or streak credit. It is an arcade effect, not a clinical
claim.

Aspirin hitting a tiny platelet triggers a local-radius burst. The burst can clear existing active
tiny platelet targets only. It excludes platelet aggregates, plaque targets, and targets born in
the same tick. Resolve removals in deterministic target-ID order and award score and streak once
per removed existing tiny target. Do not recurse into new hits or award a target twice. Radius and
balance remain tunable.

Clopidogrel directly deletes platelet targets along its persistent three-target path. It does not
create a fan or area burst. Stent hits retain the existing plaque size cascade. These
weapon contracts keep the arcade actions distinct without implying medication advice.

## Campaign authoring

Displayed stage 2 introduces aspirin with one small platelet aggregate. The encounter is authored
to demonstrate the three-tiny fan and subsequent small-target interactions while keeping the total
hazard workload controlled. Later chapter, dual-tool, finale, and maintenance encounters rebalance
their authored counts so the added fan does not simply triple total work. The aspirin fan sends all
nonzero upward shots into a safe three-piece spread; its exact trajectory and encounter tuning remain
subject to play review. Help explains "break the cluster, then sweep" and audio reserves earning
tones and milestones for positive-point hits. Difficulty reporting uses source-derived workload
units: aspirin's unbatched upper bound counts four contacts (one cluster break and three singles),
while clopidogrel and dual direct-removal each count one; dual players may choose aspirin. Local-burst
savings are excluded, and these values are measured workload estimates rather than exact shot counts.
