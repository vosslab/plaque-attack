# Mobile playability ledger

Approved scope: M1, M2, M14, M15, and M19 of the parent four-game mobile plan. Deliver phone play
while preserving the laptop controls, full arena, campaign, and visual identity. No human gate,
publication, dependency addition, new gameplay, or input redesign is required.

| Item | Status | Result |
| --- | --- | --- |
| M1 baseline | Complete | Lockfile `npm ci`, TypeScript/lint/format, 123 Node tests, distribution build |
| M2 bounded correction | Complete | Preserve existing input; correct demonstrated 568x320 arena collapse and narrow HUD overlap |
| M14 touch verification | Complete | Native simultaneous holds, matching releases/cancel/capture loss, keyboard composition and lifecycle cleanup pass |
| M15 actual play/layout | Complete | First-stage touch clear, ordinary later-tool practice, seven viewport/menu checks, rotation and fullscreen fallback pass |
| M19 closeout | Complete | 32 browser tests, 123 Node/static checks, 593 documentation/hygiene checks, generated distribution and scratch cleanup; parent independent final integration accepted the delivery |

Input ownership stays in `src/input.ts`: a keyboard Set and one pointer Set per action, native
pointer capture, matching release/cancel/lostcapture, active-play gating and explicit cleanup.
ASVS 2.2.1 remains satisfied by the existing allowlisted actions and keys; this work adds no
external input boundary or server-side security claim.

The implementation changes only responsive CSS and the recovery-list target height. The archived
gameplay plans remain evidence, with no mechanical scope expansion. The browser acceptance report
is [mobile_playability_acceptance.md](../active_plans/reports/mobile_playability_acceptance.md); it owns exact
commands, source/build hashes, observed routes and evidence limits. All temporary PNG captures
are converted to WebP quality 90 and removed; final local captures live in ignored `test-results/`.
