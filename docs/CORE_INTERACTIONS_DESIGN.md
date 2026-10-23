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
physical impulse first occurs. That contact switches the target to persistent fluid motion; there is
no inverse-orbit-speed remap. After an impulse, every plaque and platelet experiences the same
vertical restoring acceleration, `a_y = -60 sign(y - 270)`, toward the arena midpoint. Velocity is
continuous at the midpoint. Integrate the constant-acceleration path exactly, splitting at its
midpoint crossing, and reflect at the fixed ceiling, walls, and actual curved floor without changing
speed. Resolved free-flight motion conserves kinetic energy plus `V(y) = 60 |y - 270|`,
subject to the normal-offset tolerance at floor reflections. Settle only an entire vertical orbit
whose amplitude `A = |y - 270| + vy^2 / (2g)` is at most the existing sweep curvature error
`g * (1/120)^2 / 8` (about 0.000521 px), with `g = 60`. Set `y = 270` and `vy = 0`,
retaining `vx`. This invisible settling only removes energy, at most 0.03125 per unit mass per
settling event, and bounds work near equilibrium. Accepted collision chords span at most 1/120 s;
their derivative velocity differs from instantaneous analytic velocity by at most 0.25 px/s, and
their curvature error is at most 0.000521 px. Pair contact uses those chords, so analytic
instantaneous pair-energy exactness is not a contract. The acceleration is bounded and applies
everywhere in impulse mode, independently of firing reach.
Displaced targets return naturally to the lower firing/play region in seconds; representative
encounters must demonstrate useful cleanup through ordinary controls. This is a shared world
behavior, with no stage-specific reachability predicate, last-target correction, or timing gate.
Newborn targets do not enter the current agenda.

Spawn or other nonphysical placement synchronization keeps the authored orbit. Calling
`synchronizeTargetMotion(..., true)` enters persistent impulse motion; once entered, later
synchronization keeps that mode. Sticky plaques retain the active-play wall pause and resume stored
velocity after it ends. This runtime motion contract does not change the save schema.

## Aspirin and clopidogrel

Aspirin permits one active capsule. Held fire can launch the next capsule after the current shot is
consumed and the normal firing interval permits it; ammunition is unlimited.

Aspirin hitting a small platelet target disaggregates it into three tiny platelet targets. Those
children become active on the next tick, then separate before participating in later live contact
events. This conversion awards no score or streak credit. It is an arcade effect, not a clinical
claim.

Aspirin hitting a tiny platelet triggers a local-radius burst. The burst can clear existing active
tiny platelet targets only. It excludes platelet aggregates, plaque targets, and targets born in
the same tick. Resolve removals in deterministic target-ID order and award score and streak once
per removed existing tiny target. Burst removals do not enter the triggering shot's direct-hit
feedback bookkeeping. Do not recurse into new hits or award a target twice. Radius and balance
remain tunable.

Clopidogrel directly deletes platelet targets along its persistent three-target path. Only direct
shot hits contribute to the shot's `THROUGH` feedback; local-burst target IDs do not. Clopidogrel
keeps that feedback while passing through its direct targets. It does not create a fan or area
burst. Stent hits retain the existing plaque size cascade. These
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
