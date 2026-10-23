# Remix asset handoff

Status: authored and standalone-render inspected, 2026-10-22. Actual gameplay integration and
fresh specification/quality review remain manager-owned acceptance work.

## Delivered contracts

| Asset ID | Editable source | Intrinsic size / viewBox | Intended Canvas size |
| --- | --- | --- | --- |
| `flow-switch` | [flow_switch.svg](../../../src/assets/flow_switch.svg) | 48x48 / `0 0 48 48` | 48x48 |
| `support-capsule` | [support_capsule.svg](../../../src/assets/support_capsule.svg) | 32x32 / `0 0 32 32` | 26x26 |
| `restored-flow` | [restored_flow.svg](../../../src/assets/restored_flow.svg) | 960x540 / `0 0 960 540` | arena overlay |

Registered all three in [assets.ts](../../../src/assets.ts) and the `AssetId` union in
[runtime.ts](../../../src/types/runtime.ts). The existing loader preloads them as required images.
No cast sources changed. All artwork is original editable geometry with semantic group IDs,
self-contained fills/strokes, accessible standalone titles/descriptions, and no fonts or external
resources. Runtime Canvas semantics and active/cooling device cues belong to the renderer.

The switch uses a rounded diamond plum housing, broad lateral vanes, and a pale circular hit body.
The support capsule uses a rounded pill body and a contrasting shield/check silhouette, distinct
from a round tablet and irregular hazard clusters. The restoration asset has a transparent
background, sparse broad pearl/rose currents with subtle dark under-strokes, and a smooth lower
lining. It expresses a fictional arcade payoff without anatomical claims.

## Verification evidence

- `npx tsc --noEmit -p tsconfig.json`: exit 0.
- `npx eslint src/assets.ts src/types/runtime.ts`: exit 0.
- `npx prettier --check src/assets.ts src/types/runtime.ts`: exit 0.
- `node output/remix_assets/render.mjs`: exit 0 after approved sandbox escalation. Initial
  sandboxed Chromium launch failed on macOS process-port permission; no artwork defect involved.
- Browser `DOMParser` parses all SVG XML; unique IDs and all `aria-labelledby` references resolve;
  scripts, embedded raster images, and foreign objects are absent. ViewBoxes match contracts.
- Chromium renders the SVGs through `Image` decoding and Canvas `drawImage`, matching the runtime
  image embed boundary. Structural output: `output/remix_assets/structural.json`.
- Inspected `output/remix_assets/proof.webp`, encoded using `cwebp -q 90`. Devices appear at 48px
  and 26px and 4x inspection scale in color and grayscale. Switch target/vanes and capsule shield
  remain distinct. Restoration appears over the existing healed-flow scene at 960x540 and
  320x180, including grayscale. Transparent areas preserve the scene; no clipping found.

The proof script, JSON and final WebP are temporary evidence under `output/remix_assets/`.
The standalone proof does not establish actual scene layering, game state cues, or gameplay
readability during action. Inspect those after renderer integration, including reduced motion.
Use restoration kind to select distinct Canvas treatments across all four finales: opening/fissure,
continuous restored flow, restored lining, and full patient/surgeon payoff. Reveal or animate these
from phase completion, with static equivalents for reduced motion. The source SVG deliberately
keeps those state transitions in the renderer rather than baking one generic finale into the art.

## Construction references

Applied machine-local `/Users/vosslab/.codex/skills/experts/svg-creator-expert/SKILL.md`
workflow: task selection, object illustration, project workflow, local books, and testing/oracles.
The machine-local construction passages inspected were:

- `/Users/vosslab/.codex/skills/experts/svg-creator-expert/references/local-only/object_construction/How_to_Draw_Drawing_and_Sketching_Objects_and_Environments_from_Your_Imagination-2013.md`,
  lines 1812-1824, Working With Volume / Planning Before Perspective: establish simple massing
  before details. Applied as circle-plus-diamond and rounded-body-plus-shield front-view masses.
- `/Users/vosslab/.codex/skills/experts/svg-creator-expert/references/local-only/svg_authoring/Mastering_SVG-2018.md`,
  lines 635-648, viewBox and viewport: stable intrinsic coordinate system and proportional resize.
- `/Users/vosslab/.codex/skills/experts/svg-creator-expert/references/local-only/svg_authoring/Generative_Art_with_JavaScript_and_SVG-2024.md`,
  lines 2349-2372, Grouping and Reusing Elements: semantic editable groups in draw order.

No local book content is copied into the artwork. Changelog/decisions documentation belongs to
the separately assigned documentation owner.
