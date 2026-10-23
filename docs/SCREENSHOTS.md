# Refresh game screenshots

All final documentation screenshots use WebP encoded at quality 90. The current set is in
[screenshots/manifest.json](screenshots/manifest.json), including capture time, browser version,
production build hashes, dimensions, byte sizes, image hashes and scene provenance.

## Current surgeon polish snapshot

The 2026-10-23 surgeon anatomy refresh replaces all thirteen managed views with quality-90
WebPs from the current local production build. The set totals 659,266 bytes. The
[screenshots/manifest.json](screenshots/manifest.json) records Chromium 156.0.8078.4, screenshot
hashes, build hashes, source/delivered surgeon asset hashes and exact capture provenance.
The manifest SHA-256 is
`6f34d51ff65faf30fb066166b47ebd491ac47afd446e08c6ea7e41bdde167e42`.

The README chooser and production-renderer cast sheet show the delivered larger individual
heads, connected arms, clearer hands, and varied uniforms and applicators. All six idle, walking
and victory figures fit the cast sheet, including their full feet. The managed clear montage
shows an earned first-stage victory and the production celebration camera. Capture completed
with no browser errors or retained PNG intermediates. The current JavaScript hash matches the
previous corrected stage-24 build because this pass changes external SVG assets; the manifest's
surgeon asset hashes identify the new art.

The capture used a freshly bundled equivalent of the canonical harness with an explicit workspace
root, preserving the no-Git-command scope. Separate local verification in
`output/surgeon_polish/delivery/` covers every cast member in staged idle, walk, firing and
victory poses, with native-size and enlarged color, grayscale and silhouette views, in normal
and reduced motion. Those fixtures isolate actual production renderer draws; staged poses do
not represent earned campaign progress. Separate ordinary-control captures cover representative
Maya movement, firing and an earned first-stage celebration. The existing roster, recovery and
clear-flow browser regressions pass (9 tests). This verifies this artwork delivery and selected
runtime flows; it is not an exhaustive campaign run.

## Previous production UI snapshot

The 2026-10-23 refresh replaced all thirteen managed views with quality-90 WebPs from the
production build recorded in [screenshots/manifest.json](screenshots/manifest.json). This is the
previous documented screenshot snapshot, not the gameplay-variety build. The set
totals 652,986 bytes, with no capture/browser errors or PNG intermediates. The capture owner
inspected the encoded menu, chooser, recovery comparison, gameplay, terrain and clear-sequence views
for coherence and readability. The build includes the playtest fixes for opening guidance, streak HUD
refresh and pointer-cancel cleanup. Its gameplay frame shows the opening guide and HUD.
Staged-save and fixture
descriptions remain separate from actual-input play provenance.

The manifest SHA-256 is
`e45fdca0bdc171ede187358904d9a9acae95483575ba2cce9c457f1e84ab10d3`.
The refresh used a bundled equivalent of the command below, with an explicit workspace root
to preserve the no-Git-command scope. Its exact execution is recorded in the manifest, including
`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/plaque-attack-playwright-browsers`; no rebuild intervened.
A screenshot refresh does not prove all-stage completion or the full browser suite. The initial
gameplay-variety build `7ae15fbcf1d94fd759e0477a004cbe83db7cf103a55a7747e9a87502aad50bc0` has
separate actual-control captures in `output/gameplay_variety/play/`, including
`stage4-outcome.webp`, `stage5-heavy.webp`, `stage6-combination.webp`, `stage9-seam-intact.webp`,
`timed-9-true-pulse.webp`, and `combination-retry.webp`. The corrected stage-24 build
`f64a28d20b61c97cbd3b7b8af111ff554afcbb5d03850365d3caaaf13eba41b2` has its own actual-control
captures in `output/gameplay_variety/finale_fix/`, including `stage24-opening.webp` and
`stage24-approach-pulse.webp`. These captures document specific browser states and are not the
managed thirteen-view corpus. The stage-9 timed pulse and restart captures demonstrate useful
removal and reset on their recorded build; the corrected stage-24 approach capture shows one
target cleared before a deliberate fire input. Mobile reduced-motion evidence is present in the
initial gameplay report. Fresh integration acceptance is recorded in the local gameplay-variety
report. Integrated
acceptance belongs to
[active_plans/reports/remix_execution_ledger.md](active_plans/reports/remix_execution_ledger.md).

## Capture the current game

Use the normal Node/npm setup and installed Playwright Chromium described in
[PLAYWRIGHT_USAGE.md](PLAYWRIGHT_USAGE.md). Install the WebP command-line tools so `cwebp`
is on PATH (`brew install webp` on macOS or `apt install webp` on Debian).
From the repository root:

```bash
./build_github_pages.sh
node tests/playwright/capture_docs_screenshots.mjs
```

Use `PLAYWRIGHT_BROWSERS_PATH` only when browsers were installed outside Playwright's usual
cache. The command owns a temporary loopback server and fresh browser contexts, then closes
them. It refuses stale build sources or assets. Screenshot PNG buffers stay in memory;
`cwebp -q 90` writes the final WebP directly. After all thirteen captures succeed, the command
removes their replaced PNGs and writes the manifest. It does not stage, commit or deploy files.

The capture code lives in [capture_docs_screenshots.mjs](../tests/playwright/capture_docs_screenshots.mjs),
with [capture_gameplay_screenshots.mjs](../tests/playwright/capture_gameplay_screenshots.mjs)
and [capture_roster_fixture.mjs](../tests/playwright/capture_roster_fixture.mjs) supplying
gameplay and native-size cast views. Refresh the complete set when artwork or interface changes.

## What the images prove

- The chooser opens automatically on first visit, with no surgeon selected. Menu and Settings
  follow a real Maya selection and Continue action; campaign progress remains empty.
- The recovery dialog uses a staged eight-route save. Its comparison uses staged 0/12/24-route
  saves; these screenshots demonstrate appearance, not earned campaign completion.
- Floor and tissue examples use staged unlocks only to open Practice. Movement and shots use
  ordinary controls; terrain, targets, health and physics are not assigned by the harness.
- Streak feedback and the final-pop/celebration/results sequence come from ordinary first-stage
  held-fire play. The current game scene is a single current view, not a before/after comparison.
- The surgeon sheet uses the current production renderer with staged poses at native 44x60 size.
  Grayscale and silhouette rows are presentation filters, not alternate character assets.

Inspect each encoded WebP at its intended display size, especially captions, small figures and
the patient/heart artwork. Update links and captions when a view changes. Historical ignored
capture runs retain their original provenance; they are not the current documentation corpus.

## Historical pre-remix verification

The 2026-10-22 refresh captured all thirteen views without browser errors. The encoded images
were visually inspected, and all decoded dimensions, file hashes and build hashes match the
manifest. No PNGs remain in the documentation screenshot directory. The thirteen WebPs total
609,634 bytes. The revised cast, first-run chooser, curved stents, lower tissue shields and surgeon celebration
close-up are included. The latest capture uses a bundled equivalent with an explicit workspace
root to respect the user's no-Git-command scope; the manifest records this execution detail.
Focused Markdown-link and ASCII checks pass (271 tests); the changed capture scripts pass
ESLint and Prettier. The lower-shield build passes all 19 browser tests and 51 source tests.
Independent source-renderer checks cover all six surgeons at center and edges,
small viewports, reduced motion, paused pixels and normal-camera reset.
The landing illustration has explicit local layers and one container rotation, with no child
rotations or drop-shadow filters. Native Firefox 158.0.1 and Chromium desktop/mobile captures
show the simplified composition intact. Clean-profile Firefox also rendered the previous CSS
correctly, while the user's session remained broken. These captures verify the mitigation's
appearance, not a reproduced root cause; confirmation in the affected session remains outstanding.
[ART_DIRECTION.md](ART_DIRECTION.md#historical-scientist-cast-verification) records the accompanying game
verification and evidence limits.
