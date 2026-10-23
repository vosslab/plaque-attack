# Current expiry correction

D3 restores ordinary horizontal drift at the active-to-cooldown boundary in
`src/remix_mechanics.ts`. Each target resumes its size preset speed times the level speed
multiplier. Nonzero horizontal velocity preserves its sign; zero velocity chooses the direction
toward the active lane, then stable target-ID parity when centered (even right, odd left).
The helper adds no persistent state and leaves the four-second current, six-second cooldown,
vertical orbit, floor solver, and swept movement paths unchanged.

`tests/test_remix.mjs` adds one behavior test covering every target size, both existing velocity
directions, both lane-offset directions from zero, and centered zero velocity for both ID
parities. It verifies restoration occurs only at expiry, pauses freeze an expiring current,
positions and vertical velocity are preserved, and later cooldown ticks do not restore again.
The existing steering and floor-bound test remains intact.

## Verification

- `npx tsc --noEmit -p tsconfig.json`: exit 0, no diagnostics.
- `node --import tsx --test tests/test_remix.mjs tests/test_motion.mjs
  tests/test_simulation.mjs tests/test_arena.mjs`: 35 tests, 35 pass, 0 fail.
- `npx eslint src/remix_mechanics.ts tests/test_remix.mjs`: exit 0.
- `npx prettier --check src/remix_mechanics.ts tests/test_remix.mjs`: exit 0.

Changed ownership: `src/remix_mechanics.ts`, `tests/test_remix.mjs`, and this report. Ownership is
released for fresh specification review. The manager owns changelog and decision documentation.
This correction does not claim browser acceptance or complete M1 acceptance.
