# Remix difficulty measurement

The report now reads the authoritative clear-phase groups introduced by the
[remix contracts](remix_contracts.md). Changes are confined to `src/difficulty.ts`,
`tests/test_difficulty.mjs`, and this handoff. No balance or runtime changes were made.

## Measurement ownership

- `initialTargetCount` and `initial` describe the first phase when phases are present.
  Otherwise they describe the existing initial-target list.
- `finiteAndInitial`, nominal workload, mandatory hit bounds, and hit-weighted movement
  and precision include every finite phase, including non-first groups.
- `pattern.entries` retains the original named phase groups in authored order. Its order
  description identifies clear-gated transitions. These groups have no fixed arrival rate;
  zero nominal scheduled arrivals does not describe their actual release timing.
- `finiteAndInitial.leafCeiling` and `mechanics.allAuthoredLeafCapacity` describe total
  authored potential across all groups. They do not imply simultaneous occupancy.
- `maximumPhaseLeafCeiling` and the phased leaf axis use the largest individual phase's
  leaf ceiling. `mechanics.maximumPlaqueLeafCapacity` uses the largest phase's plaque
  leaves plus all optional hazard-pocket plaque leaves, a conservative concurrent bound.
  Unphased capacity behavior is preserved. Merges conserve plaque leaf mass.
- Optional support pockets add no target workload. Their shell cells already belong to
  `arena.tissue`, so cover geometry and carving bounds include those cells once.

The documentation owner should apply these semantics to `docs/DIFFICULTY_RUBRIC.md`,
including replacing obsolete single-group finale claims. Metrics remain descriptive;
they do not establish fun, survival, or completion time.

## Focused verification

All commands exited 0 on 2026-10-22:

```text
npx tsc --noEmit -p tsconfig.json
node --import tsx --test tests/test_difficulty.mjs
npx eslint src/difficulty.ts tests/test_difficulty.mjs
npx prettier --check src/difficulty.ts tests/test_difficulty.mjs
```

The focused Node suite passed 9/9 tests. One added fixture covers non-first-phase
workload, first-group occupancy, named order, separate total potential and phase density,
and support shell geometry without locking campaign tuning counts.

This verification does not constitute full-suite, rebuilt-browser, campaign-completion,
or publication evidence. No shared build was run.
