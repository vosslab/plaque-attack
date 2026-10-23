# Remix clear departure correction

Source of truth: [remix_campaign_plan.md](../../archive/remix_campaign_plan.md).

## Delivered behavior

`src/main.ts` now commits campaign recovery and the next unlock at the actual terminal
clear, immediately before entering the interruptible celebration. Previously this happened
in `finish()` after 2.2 seconds, so a confirmed departure during celebration discarded earned
recovery. The final clear also finalizes its completed campaign record at this boundary,
persisting the final recovery and record together through the existing exactly-once finalizer.

Completed routes are only added when absent; ordinary clears only persist changed progress.
`finish()` now presents the result without repeating progress mutation. The newly restored
route remains available for its result note and recovery dialog, and resets when entering
another stage or retry. Practice never enters the campaign clear-credit boundary.

Changed files owned by this correction: `src/main.ts`,
`tests/playwright/remix_clear_departure.spec.ts`, and this report. The manager owns the shared
changelog, source build, full acceptance, and fresh specification recheck.

## Verification

- `npx tsc --noEmit -p tsconfig.json`: exit 0.
- `npx tsc --noEmit -p tsconfig.lint.json`: exit 0.
- `npx eslint src/main.ts tests/playwright/remix_clear_departure.spec.ts`: exit 0.
- Prettier check/write on these two files: formatted and clean.
- Manager built the shared `dist/` after source readiness, then this agent ran:
  `source source_me.sh && PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers PW_PORT=4187 npx playwright test tests/playwright/remix_clear_departure.spec.ts --workers=1 --output=output/playwright_clear_departure`.
  Result: **1 passed (15.1 seconds)**.

The browser test clears stage 1 using ordinary keyboard fire and reads detached acceptance
snapshots. It proves recovery `[1]` and the canonical next stable ID `16` are already saved
while celebration is visible, canceling departure resumes the same cleared stage and score,
confirmed departure creates one remix ended record, and further clock advancement and reload
preserve that record and recovery. No simulation write hook or injected clear was introduced.

This focused regression does not claim to play all 24 stages or exercise the final-stage
completion branch in a browser. Final-route acceptance remains with the manager's full
campaign lane; existing clear-flow coverage owns the normal result presentation journey.

The initial sandbox browser launch failed before test execution with macOS MachPort
permission denial. The approved escalation ran Chromium successfully. The first executed
run exposed a test-only assumption that stage 2 used stable ID `2`; the corrected test reads
the canonical next ID because campaign positions and stable content IDs differ.
