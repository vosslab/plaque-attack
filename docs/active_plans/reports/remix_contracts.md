# Remix shared contracts

Source of truth: [remix_campaign_plan.md](../../archive/remix_campaign_plan.md).

Contract-only verification: `npx tsc --noEmit -p tsconfig.json` exits 0 without diagnostics
before and after these declarations. Prettier formatted the four changed TypeScript files.
No runtime behavior is implemented by this handoff.

## Configuration imports

Import from `src/types/level.ts`:

- `FlowSwitchDefinition`: `id`, logical `position`, logical `laneX`. All switches attract
  horizontally. The visible circular hit body, four-second activation and shared six-second
  cooldown are fixed runtime rules, not repeated configuration.
- `SupportPocketDefinition`: `id`, `shellCells`, `breachCells`, `releasePosition`. It contains
  no hazard targets. `ArenaLayout.supportPockets` is optional for stages without support.
- `FinalePhase`: `name`, finite `targets`. `ClearObjective.phases` is an optional nonempty tuple.
  When present, it owns every group including the first; `LevelConfig.initialTargets` and
  `ClearObjective.reinforcements` must both be empty. The configuration owner enforces this
  invariant. There is no duplicate initial group or phase reinforcement schedule.
- `RestorationKind`: `artery_opening`, `restored_flow`, `restored_lining`, `patient_recovery`.
  `ClearObjective.restoration` selects the authored payoff.

`LevelConfig.flowSwitches` is optional for stages without switches. Stable level IDs, order,
controls, and first-three-stage configuration remain unchanged.

## Runtime imports

Import from `src/types/simulation.ts`:

- `FlowState`: discriminated `ready`, `active` (`switchId`, `remaining`) or `cooldown`
  (`remaining`). Ready switch shots are consumed; active/cooling shots pass through.
- `RuntimeSupportPocket`: `id`, `status` (`sealed`, `released`, `collected`),
  `capsulePosition`. Release descends into the walking area; player contact collects.
- `FinaleState`: `phaseIndex`, `transitionRemaining`. Runtime uses a 0.75-second warned gap
  after all targets and pending hazard releases clear. Arena occupancy, flow and shield persist.
  Restoration progress derives from phase index/count and transition state.
- `StageRetryState`: `entrySeed: RandomSeed`, `retryCount`. Existing `levelStartScore` owns
  score rollback. Retry restores three lives; no duplicate checkpoint score/lives are stored.
- `RemixState`: `flow`, `supportPockets`, `contactShield`, `finale`, `retry`. Shield does not
  expire or stack; it absorbs one ordinary contact, preserves streak, and uses normal contact
  invulnerability. Overload bypasses it. Optional aid never blocks stage/phase completion.

`SimulationState.remix` is temporarily optional to preserve the contract-only compilation gate.
The core owner must make it required atomically with initialization for every state, including
practice. This is a handoff stage, not a permanent optional runtime contract.

## Events and save imports

`src/types/events.ts` adds named `FlowActivatedEvent`, `SupportReleasedEvent`,
`ShieldCollectedEvent`, `ShieldAbsorbedEvent`, and `FinalePhaseStartedEvent` variants to the
existing `SimulationEvent` union. Position fields are logical coordinates. Phase-start payload
contains `name`, `phaseIndex`, `phaseCount`; rendering can announce the actual authored phase.

`src/types/save.ts` exports `RemixCampaignRecord` (`campaign: "remix"`, `retryCount` plus
existing record fields), `CampaignRecordV4` (old records or remix records), and `SaveFileV4`.
Older `CampaignRecord` and `SaveFileV1` through `SaveFileV3` retain their validated shapes.
`SaveFile` deliberately remains `SaveFileV3` until the persistence owner atomically activates
V4 with migration, validation, ranking and record callers. V4 stores five records per edition;
legacy records do not acquire invented retry history.

No new function signatures, assets, brands, casts, framework, validators or runtime adapters were
introduced. Existing `RandomSeed` and logical-coordinate brands remain authoritative.

## Affected implementation owners

- Core: initialize required remix state, first phase targets, phase transitions, current/shield
  rules, stage entry seed, carried run retry count, and deterministic retry reconstruction.
- Rendering: consume new state/events and derive restoration progress; coordinate asset IDs
  with the art owner before adding them to the asset contract.
- Persistence: activate `SaveFileV4` and use `CampaignRecordV4` without weakening old validators.
- UI: retry/finalize displayed attempts through those owning boundaries exactly once.

Changed files: `src/types/level.ts`, `src/types/simulation.ts`, `src/types/events.ts`,
`src/types/save.ts`, and this report. The documentation owner records changelog and decisions.
