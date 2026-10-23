# Remix fixture correction

The pre-edit focused command reproduced six failures in 32 tests. Five used maintenance
properties from stable IDs 10 or 15, which are now approved finite finales. The sixth required
every authored central lane to start open, contradicting stage 18's carveable aperture.
These were stale test assumptions rather than observed source defects.

Changed only `tests/test_remix.mjs`, `tests/test_simulation.mjs`, `tests/test_arena.mjs`, and
this report. No gameplay, content, or balance source changed.

- Maintenance mechanics use retained stable ID 11. The expiry test explicitly supplies its
  maintenance objective to final stable ID 15, preserving campaign completion, run-end
  idempotence, spawn cancellation, survival cap, and overload assertions.
- Authored cover keeps every surgeon clearance check across the sampled slopes. Each stage
  additionally fires its actual tool through the simulation at a stationary compatible target
  above cover. Legal cooldowns, projectile travel, switch consumption, and tissue erosion
  determine whether the target becomes reachable. A finite bound based on destructible cover
  and switch counts prevents hanging; player bounds and lives remain checked. There is no
  stage-specific exception. Stationary hazards isolate geometry access from encounter balance.
- The every-preset current-expiry test now creates large and medium plaque targets instead of
  invalid platelet sizes. Every preset, velocity/direction case, pause, position, and drift
  assertion remains.

Verification after correction:

- `node --import tsx --test tests/test_remix.mjs tests/test_simulation.mjs tests/test_arena.mjs`:
  32 passed, 0 failed.
- `node --import tsx --test 'tests/test_*.mjs'`: 64 passed, 0 failed.
- `npx tsc --noEmit -p tsconfig.json`: passed.
- `npx tsc --noEmit -p tsconfig.lint.json`: passed.
- `npx eslint --max-warnings 0 tests/test_remix.mjs tests/test_simulation.mjs tests/test_arena.mjs`:
  passed.
- `npx prettier --check tests/test_remix.mjs tests/test_simulation.mjs tests/test_arena.mjs`:
  passed after formatting the owned files.

These checks establish fixture and Node mechanic coverage. They do not establish browser
campaign completion or presentation acceptance. The manager owns shared changelog updates.
