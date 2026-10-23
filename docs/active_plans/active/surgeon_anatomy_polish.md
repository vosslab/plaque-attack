# Surgeon anatomy polish

**Goal:** Improve the anatomy and pose readability of all six surgeons while preserving their
individual identities, shared gameplay abilities, and chunky arcade charm.

**Status:** Complete. The manager and independent study assessment selected Maya's moderate 10%
head increase and Jules's stronger 25% increase from `output/surgeon_polish/studies.png`. This was
an execution decision, not a human approval gate.

## Scope and constraints

Deliver six editable idle SVGs and six matching victory SVGs. Keep the shared `surgeon.svg` as the
active landing-page illustration. Preserve each surgeon's identity and current personality.
Prioritize arm and hand anatomy, individual head scale, and varied clothing and equipment. Avoid
applying one uniform head enlargement across the cast. Keep all six surgeons on the same movement,
collision, weapon, and ability contracts.

The current renderer draws at 44 by 60 logical pixels from 96 by 128 SVGs. It crops the upper
100 source rows as the body and articulates the two 48 by 28 leg regions; victory art is drawn as a
full sprite. Before finalizing studies, inspect the renderer's crop, foot baseline, and applicator
muzzle binding and carry those constraints into the assets. Do not change renderer behavior as part
of this artwork pass unless a specific source constraint makes that necessary; record any such need
for the manager.

## Milestones

1. **Study and select.** Record the current cast's visual identity and renderer constraints. Create
   two or three anatomy and proportion studies that emphasize expressive, larger individual heads,
   cleaner tapered arms and hands, plus clothing and equipment variation. Render each at native
   44 by 60 and at larger grayscale and silhouette sizes. The manager selects the study direction
   from this evidence and records the settled decision in [DESIGN_DECISIONS.md](../../DESIGN_DECISIONS.md).
2. **Implement the cast.** Apply the selected direction to all six idle and six victory assets.
   Preserve identity, pose continuity, anchors, dimensions, editable SVG source, and equal abilities.
   Keep the existing legacy asset only if a current consumer needs it. Update asset bindings only
   when required by the final asset set.
3. **Review integrated rendering.** Independently render and inspect every asset, then inspect
   actual idle, firing, and victory states in the browser at gameplay size and larger proof sizes.
   Resolve crop, feet, muzzle, anatomy, or identity defects at their owning boundary. Run the
   existing regression checks, build locally, refresh the relevant documentation screenshots, and
   record exact evidence and remaining limits below.

## File scope

- `src/assets/surgeon_*.svg`: six idle and six victory character illustrations.
- `src/assets/surgeon.svg`: shared landing-page surgeon illustration.
- `src/assets.ts`: asset bindings only if the selected deliverable requires them.
- `src/renderer.ts` and related renderer files: inspect constraints; edit only if evidence proves
  a necessary integration change and record the reason.
- `docs/HUMAN_GUIDANCE.md`: preserve only human-stated cast preferences relevant to this work.
- `docs/DESIGN_DECISIONS.md`: add the settled visual direction after study selection.
- `docs/CHANGELOG.md`: record the delivered art changes and evidence.
- `docs/active_plans/active/surgeon_anatomy_polish.md`: maintain the status and evidence ledger.
- Existing documentation screenshots and their canonical capture sources: refresh screenshots
  affected by the final character art.

## Completion evidence

| Milestone | Status | Evidence |
| --- | --- | --- |
| Study and select | Complete | Manager and independent study assessment selected Maya at +10% head scale and Jules at +25% from `output/surgeon_polish/studies.png`; connected arm-first sleeves through forearms and wrists with compact gloves; bespoke head scale for each other surgeon |
| Implement the cast | Complete | Astra delivered the twelve roster SVGs plus the active landing-page `surgeon.svg`; all thirteen parse and pass structural checks, with original face geometry and leg groups preserved. `output/surgeon_polish/ART_HANDOFF.md` records per-character head scales, construction, and native-size, grayscale, silhouette, and bounds evidence |
| Review integrated rendering | Complete | Independent final visual review ACCEPT; corrected native full-body lineup and normal/reduced-motion roster captures inspected; Maya idle, walk, fire and earned victory captured in both motion modes; 9 browser regressions pass; 13 managed WebP screenshots refreshed; TypeScript, lint, format, 80 Node tests, and 1,394 pytest tests pass |

The integrated delivery built a GitHub Pages-ready `dist/` and passed the focused browser suite
(9 tests), TypeScript, lint, formatting, 80 Node tests, and 1,394 pytest tests. Browser review
confirmed the complete six-character roster at 44x60 in color, grayscale, and silhouette, plus
normal and reduced-motion captures. Actual ordinary-control runs earned a stage 1 clear with Maya
in both motion modes and captured idle, walk, fire, and zoomed victory. The capture manifest
records browser 156.0.8078.4 with no page errors. Thirteen managed documentation WebP screenshots
were refreshed; the delivery report records source/dist hash agreement for all thirteen SVGs and
quality-90 screenshot output. See
`output/surgeon_polish/final_visual_review.md`,
`output/surgeon_polish/integration.md`,
`output/surgeon_polish/delivery/REPORT.md`,
`output/surgeon_polish/delivery/browser_regressions.log`,
`output/surgeon_polish/delivery/render_manifest.json`, and
`output/surgeon_polish/delivery/capture_docs.log`.

The independent final visual review accepts the bounded delivery. Its corrected crop replaced an
initial review-fixture framing error; no asset or renderer correction was needed. The review covers
all six characters in staged production states and Maya in earned-clear ordinary-control runs.
It is an independent agent assessment, not evidence of human preference or enjoyment. Static
captures establish sampled poses and presentation, not temporal behavior; equal gameplay abilities
remain supported by implementation and regression checks. No remote deployment or human playtest
is required.
