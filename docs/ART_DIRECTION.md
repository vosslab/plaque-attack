# Organic artery art

## Visual contract

The authored sources are the editable SVGs in `src/assets/`. The renderer loads them as
`HTMLImageElement` objects and draws them with Canvas 2D. Each asset is self-contained: native
paths and primitives, semantic groups, namespaced IDs, a title and description, and embedded
fills. The host canvas owns the accessible game description. The standalone SVG descriptions
explain the simplified subject. Visible scenery contains no lettering.

The new scenes use a `960 540` viewBox and preserve the arena aspect ratio. Wall tissue occupies
the upper edge (at most about 78 units) and lower edge (about 510-540); the central lumen stays
dark and open. These scene SVGs are decorative image layers. Gameplay tissue and sloping floors are separate
procedural Canvas geometry owned by the arena model; visible occupied cells match collision, and
cleared cells expose the background. Warm pink
wall cells, muted tan foam cells, lavender adherent platelets, and cool silver mesh distinguish
anatomical materials from bright gold moving targets. Scenes retain restrained center contrast
so player, projectiles, and warning overlays remain easy to see.

The lipid family uses `128 128` viewBoxes centered on `(64, 64)`. The irregular rounded bodies
occupy nearly the full collision disk, with small silhouette indentations and a transparent
outside. Golden fills, a cream rim, fine brown ink contours, upper-left highlights, and simple
fold marks remain readable at a 16-pixel collision radius. The six silhouettes and internal
folds are deliberately different; scaling and rotation use the same circular collision rule.

## Scene and sprite inventory

| Source | Distinguishing anatomy or shape |
| --- | --- |
| `scene-endothelium.svg` | Flattened lining cells and elongated wall cells |
| `scene-fatty-streak.svg` | Subendothelial lipid-laden cells within uneven thickened wall |
| `scene-fibrous-cap.svg` | Bowed pale fibrous cap and aligned spindle cells |
| `scene-stented-lumen.svg` | Cool diamond struts resting along the luminal wall |
| `scene-platelet-adhesion.svg` | Interrupted lining and clustered adherent lavender platelets |
| `scene-healed-flow.svg` | Quiet lumen, continuous surface, subdued retained implant |
| `lipid-amber.svg` | Broad asymmetric pebble with a crescent fold |
| `lipid-pear.svg` | Offset narrower crown and broad lower body |
| `lipid-ruffled.svg` | Soft scallops and a round central inclusion |
| `lipid-lobed.svg` | Larger rounded lobes with branching folds |
| `lipid-dimpled.svg` | Side indentation and three oval dimples |
| `lipid-swirl.svg` | Rounded tilted body and continuous spiral fold |

The hyphenated asset family names match the scene contract supplied for this expansion.

## Original construction

The broad approach is playful biological scenery: bent cell masses, uneven spacing, tapered
ink-like marks, selective overlap, and a few strong highlights. The starting massing alternatives
were a full anatomical tube, a concentric cross-section, and an edge-framed longitudinal
corridor. The corridor preserves the full arcade arena while supporting distinct medical
locations. Detail follows the silhouette, then major cells, then nuclei and small texture marks.

The [Barnsy sketchworks reference](https://www.barnsyink.com/sketchworks-sept) was inspected as
actual raster artwork, including the expressive creature drawing identified by Wix media ID
`33cbd2_d6f70a853e6f4eeea47e59e54c1160b7`. Weighted contours, bent masses, and sparse short ink
accents informed the broad visual direction. All delivered contours, compositions, anatomy,
and palettes are original; no reference artwork is embedded or traced.

Local drawing passages used:

- `Drawing_Mentor_1-3_Drawing_Materials_Lines_and_Shapes_Perspective_and_3D_Shapes-2013.md`,
  lines 646-656: construct recognizable silhouettes from simple shapes before adding depth.
- `Mastering_SVG-2018.md`, lines 635-659, "viewBox and viewport in SVG": retain fixed source
  coordinates while scaling the display viewport.
- `A_Handbook_of_Biological_Illustration-1988.md`, lines 284-294, shading and perspective:
  use a common upper-left light and stronger near contours while reducing distant detail.

These machine-local references live under
`/Users/vosslab/.codex/skills/experts/svg-creator-expert/references/local-only/` in their
`drawing_fundamentals`, `svg_authoring`, and `scientific_illustration` directories respectively.

## Medical source ledger

The scenery is conventional simplified longitudinal anatomy, with inferred cell arrangements
and fictional colors. Cell sizes, wall thickness, and arcade scale are artistic choices.
The floating golden globules are arcade representations of lipid material rather than literal
LDL particles or a claim that established arterial plaque normally floats through the lumen. Tissue carving
and plaque size coalescence are explicit arcade abstractions; the artwork does not imply drugs
destroy real tissue.

- [NHLBI: Atherosclerosis](https://www.nhlbi.nih.gov/health/atherosclerosis): plaque accumulates
  in artery walls and may narrow the passage. This grounds wall-attached deposits.
- [NHLBI: Stents](https://www.nhlbi.nih.gov/health/stents): coronary stents are typically metal
  mesh devices that hold the passage open. The wall implant remains after visual recovery.
- [Primary primate lesion ultrastructure study](https://pubmed.ncbi.nlm.nih.gov/7115459/):
  smooth muscle layers form the cap, while lipid-filled cells and extracellular material
  occur in the core. This grounds spindle-shaped cap cells and droplet-filled wall cells.
- [Endothelial cell dysfunction and atherosclerosis](https://www.ahajournals.org/doi/10.1161/CIRCRESAHA.115.306301):
  endothelial integrity and platelet interactions ground the interrupted lining scene.

Scene names describe arcade settings. Their order does not claim that all lesions follow one
inevitable sequence or that stenting removes the underlying disease.

## Gameplay geometry presentation

The complete asset family currently has 19 editable SVGs: the twelve expansion assets above and
seven existing surgeon, tool, plaque, platelet and scene assets. Tissue arches and membrane shells
use rounded cellular silhouettes inside their occupied 12x12 cells. Draw floor scallops inside
the solid floor silhouette, with an uninterrupted walking surface. Neither decorative anatomy
nor strokes may fill a carved firing lane.

Show sealed pocket contents with a distinct thin shell; warn visibly before committed release.
Use text as well as color for optional/releasing status. Cover, shots, hazards and the surgeon
need separate silhouettes at tiny and narrow-mobile scales. Integrated captures for the new
mechanics remain acceptance work; the following art evidence predates them.

## Historical asset verification

Chromium decoded all twelve SVG images and rendered the family at 480-pixel scene width,
960-pixel scene width, 128-pixel sprite width, and actual 32/64-pixel sprite widths. Visual
inspection confirmed clear center space, unclipped highlights, readable target silhouettes,
strong gold/background separation, and differentiated edge anatomy. After the first render,
cell widths, spacing, and angles were varied and the endothelial lining was moved over the
thickened fatty-streak region. The revised render was inspected at full arena size.

Local evidence is in `output/expansion_art/`: `montage.html`, `montage.png`, full-size scene
PNGs, and `validation.json`. The browser XML check reports zero parser errors, duplicate IDs,
unresolved paint references, or external image/script dependencies across all twelve assets.
These are asset-level checks; integrated gameplay acceptance belongs to the renderer workflow.

The actual Canvas draw path also measured the lipid silhouette pixels. All six opaque contours
fit within a 60-unit radius around the source center (maximum measured radius 59.85 units).
The ruffled sprite was tightened by three percent after the first measurement. Results are
recorded in `output/expansion_art/collision_visual_bounds.json`; the existing 64-unit image
square leaves a small antialiasing margin around the silhouette.
