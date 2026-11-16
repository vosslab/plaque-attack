# Mobile playability acceptance

Status: implementation and required gates complete within the evidence scope below.
Owner: Plaque Attack implementation workstream; parent manager owns independent acceptance.

## Implementation and baseline

The unchanged input controller supports independent touch holds and keyboard composition.
The only production correction extends the existing short-landscape sidebar to 568x320 and stacks
its life/time rows below 621 pixels. A measured 0x0 arena on the baseline demonstrates the need.
The 844x390 layout retains its 260-pixel sidebar. Recovery-list buttons increase from 42 to 44
CSS pixels. World geometry, physics, bindings, saves, and dependencies remain unchanged.

`npm ci --cache /Users/vosslab/.cache/npm` uses the existing lockfile. The default npm cache failed
with EPERM; using the permitted writable cache completes installation without package changes.
Baseline `./check_codebase.sh` passes TypeScript, ESLint, Prettier and 123 Node tests;
`./build_github_pages.sh` passes. Logs: `/private/tmp/plaque_mobile_baseline_check.log` and
`/private/tmp/plaque_mobile_baseline_build.log`.

## Actual-control evidence

The served `dist/` build is tested over HTTP. `chooseFirstSurgeonIfNeeded` passes through the
ordinary first-run chooser. Chromium CDP dispatches real simultaneous contacts at visible,
reachable controls; detached `?acceptance` snapshots only observe gameplay.

- Touch-only held Fire clears the first campaign stage and reaches the normal next-stage action.
- Three simultaneous native Chromium contacts hold direction twice and Fire once. Releasing one
  direction preserves the other; releasing both stops movement while Fire continues. Keyboard
  releases do not cancel touch. Native touch cancellation stops shooting. The test observes actual
  browser pointer IDs, activates capture, releases it and waits for native lostpointercapture;
  movement and fire stop. Injected blur and hidden-page events pause, and ordinary Resume requires
  fresh holds. No live simulation writes or hidden controls are used.
- A permitted pre-boot legacy completed-progress fixture unlocks the ordinary practice menu.
  Stages 7, 13 and 24 create aspirin, clopidogrel and dual-drug shots through visible Fire.
  Restart practice clears the held contact and does not shoot again without a fresh press.
- Seven viewport checks cover 320x568, 390x844, 480x800, 568x320, 844x390, 768x1024 and 1280x800.
  Instructions, settings, surgeon roster, recovery, scores, briefing medicine and pause dialogs
  keep their heading and primary footer action visible while content scrolls. The complete 16:9
  arena, movement, Fire and Pause fit the viewport; gameplay targets measure at least 44x44 CSS
  pixels. Fresh screenshots are retained as local WebP captures in ignored `test-results/`.
- All visible dialog buttons and checkbox labels measure at least 44x44 CSS pixels across all
  seven sizes. The final narrow screenshot shows distinct life and time rows. At 844x390, the
  original 556x313 arena and 44-46-pixel control height are preserved.
- A pre-boot denied Fullscreen API request renders the actionable fallback, reenables Larger arena,
  and leaves actual touch movement, pause/resume and portrait/landscape resizing usable.

## Final verification

| Command/check | Result | Evidence |
| --- | --- | --- |
| `npm ci --cache /Users/vosslab/.cache/npm` | Pass; existing lockfile, no dependency changes | `/private/tmp/plaque_mobile_npm.log` |
| `./check_codebase.sh` | Pass; both TypeScript configs, ESLint, Prettier, 123 Node tests | `/private/tmp/plaque_mobile_final_check.log` |
| `./build_github_pages.sh` | Pass; tracked distribution regenerated | `/private/tmp/plaque_mobile_final_build.log` |
| `./run_playwright_tests.sh --build` | Pass; 32 Chromium cases, 2.9 minutes | `/private/tmp/plaque_mobile_final_browser.log` |
| Final dialog target/layout checks | Pass; seven viewports, every visible button/checkbox label at least 44x44 | `/private/tmp/plaque_mobile_targets.log` |
| Final native touch checks | Pass; three cases including both dual drug kinds | `/private/tmp/plaque_mobile_final_touch.log` |
| Python documentation/hygiene lane | Pass; 593 checks, one advisory | `/private/tmp/plaque_mobile_hygiene.log` |
| `git diff --check` | Pass | No whitespace errors |

Browser commands use `PLAYWRIGHT_BROWSERS_PATH=/Users/vosslab/.cache/ms-playwright` and reserved
local ports. Chromium requires execution outside the macOS process sandbox; the sandboxed launch
failed at MachPortRendezvous registration before application execution. Final validation uses the
normal browser without changing launch security settings.

The final dialog run adds 44-pixel assertions to the seven layout cases after the complete suite;
it changes no production code. The final touch run additionally observes both drug kinds in dual
practice. These focused checks compose with the full-suite pass on the same production hashes.
All seven PNG intermediates are converted with `cwebp -q 90` and removed. Routine screenshot
writes are removed from the permanent tests; final local captures are `test-results/mobile_*.webp`.
No new temporary test files remain. The documentation lane is
`source source_me.sh && python3 -m pytest -q tests/test_markdown_links.py`
plus `tests/test_ascii_compliance.py`, `tests/test_source_file_line_limit.py`, and
`tests/test_pytest_hygiene.py`. The sole advisory concerns the existing large design-decisions
document, now 990 lines; the source-size gate passes. This is not a full repository pytest run.

## Independent browser matrix

The parent shared sweep verifies the same final production files in Chromium 156.0.8078.4 and
WebKit 27.2: 22/22 ordinary cases pass, covering 11 viewport sizes per engine (568x320, 667x375,
844x390, 320x568, 390x844, 480x900, 768x1024, 1024x768, 1280x720, 1440x900 and 1920x1080).
Native entry and Pause/Resume remain reachable; world/control geometry fits. Both shared lifecycle
journeys and both injected fullscreen-denial cases also pass. These add WebKit coverage without
claiming Safari or physical-device validation.

Parent-owned evidence lives outside this repository at
`/Users/vosslab/nsh/TYPESCRIPT/NOT_MOBILE/tests/mobile/MOBILE_CROSS_BROWSER_ACCEPTANCE.md`;
the adjacent `results/plaque-attack.json` records the three matching production hashes and shared
identity `a9fa2e90a94343b210612a809659966adafb9e0cf4518a12092f35a8f3674f26`.
Final named entry/play/pause WebP captures and `results/plaque-attack_webkit_grid.webp` accompany
that JSON. `results/recovery.json` and `results/fullscreen.json` record the separate integration
checks. Independent source/quality/integration review is coordinated by the parent manager.

## Build identity

SHA-256 of the generated final production files:

| File | SHA-256 |
| --- | --- |
| `dist/main.js` | `530926bed1f967b0c5e36b7351b91457adf1d01c12222fe9b7dca0fe0b5b7aca` |
| `dist/style.css` | `d389cae8e02b4f6c1a580810ad6759e997b4353a31eda654a4d63ff31de784a5` |
| `dist/index.html` | `eb06a53a9e87e513a4b96b251f3c9d0352ad5f486edffb4857682b6cefc050dc` |

Relevant source identities: `src/style.css` and `src/index.html` match their distribution hashes
above. Unchanged `src/input.ts` hashes to
`e5e59fcd91a6aa6877db3e37cb7da3117de4f3a563495c1b902bd0849c1a97c4`;
unchanged `src/gameplay_presentation.ts` hashes to
`f14375f20b54848eb7dcf18ad57572b9f2c6420bc2e8887eaad2ccc85af3e4a3`.
The unchanged lockfile hashes to
`85e6eb8d3430bf9002204741f8d17f60a5db64e9116a0780fc7638226d30e95a`.

## Evidence limits

These are headless browser emulations, not physical phone or human enjoyment studies. Injected
blur/hidden lifecycle events and pre-boot fullscreen permission denial exercise recovery without
claiming real OS backgrounding, notches, browser chrome, orientation-lock permission, or device
fullscreen validation. The normal viewport meta tag retains browser safe-area accommodation;
no edge-to-edge `viewport-fit=cover` opt-in is added. Later tool checks establish reachable touch
interaction and restart cleanup, not complete later-stage touch clears or exhaustive balance.
