# Refresh game screenshots

All final documentation screenshots use WebP encoded at quality 90. The current set is in
[screenshots/manifest.json](screenshots/manifest.json), including capture time, browser version,
production build hashes, dimensions, byte sizes, image hashes and scene provenance.

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

## Latest verification

The 2026-10-22 refresh captured all thirteen views without browser errors. The encoded images
were visually inspected, and all decoded dimensions, file hashes and build hashes match the
manifest. No PNGs remain in the documentation screenshot directory. The thirteen WebPs total
609,258 bytes. The revised cast, first-run chooser, curved stents and surgeon celebration
close-up are included. The latest capture uses a bundled equivalent with an explicit workspace
root to respect the user's no-Git-command scope; the manifest records this execution detail.
Focused Markdown-link and ASCII checks pass (269 tests); the changed capture scripts pass
ESLint and Prettier. The final camera build passes both real-clear browser journeys and 50
source tests. Independent source-renderer checks cover all six surgeons at center and edges,
small viewports, reduced motion, paused pixels and normal-camera reset.
The landing illustration has explicit local layers. Separate Chromium/WebKit desktop, Retina
and mobile captures retain the intended appearance, but did not reproduce the user's original
clipping defect; confirmation in that browser remains outstanding.
[ART_DIRECTION.md](ART_DIRECTION.md#scientist-cast-verification) records the accompanying game
verification and evidence limits.
