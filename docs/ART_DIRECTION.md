# Plaque Attack art direction

## Current identity pass

Build a tangible, playful illustrated world with six memorable surgeon personalities, artery
settings that feel like places, and a patient whose recovery feels earned. Preserve clear
silhouettes at gameplay size and enough quiet space to read targets, shots and warnings.
Use shape, posture, expression, material and light to establish identity. Preserve the current
chunky arcade style the user calls pixel art: bold contours, simple masses and readable small
figures. The editable implementation remains SVG rendered through Canvas.

This pass revises twelve base/victory surgeon SVGs, six artery scenes and the cardiac recovery
composition. Existing viewBoxes, feet/tool anchors, collision geometry, semantic IDs and recovery
symbols remain the runtime contracts. Character choice stays cosmetic. Recovery keeps its
stable-ID routes and existing milestones; make its visual payoff legible across progress states.

At the actual 44x60 gameplay size, height, body mass, face, hair, posture and accessories must
separate the cast through grayscale and solid silhouettes as well as color. Larger chooser
portraits and personality copy make the same-ability choice meaningful. Individual idle and
victory cadences express personality; reduced motion presents static poses.

The settled direction draws on the user's art request and forwarded commentary from another
project. That commentary is an inspiration source, not a new set of verbatim human rules.
[DESIGN_DECISIONS.md](DESIGN_DECISIONS.md#art-identity-and-recovery) records that provenance.

[active_plans/active/art_identity.md](active_plans/active/art_identity.md) owns this pass's
task and acceptance status. The asset and rendering evidence below describes earlier deliveries;
it does not establish acceptance of the current pass.

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

The asset family includes the twelve expansion assets above, the original seven baseline
sources, six roster SVGs, six victory variants, and the cardiac recovery composition. Tissue arches and membrane shells
use rounded cellular silhouettes inside their occupied 12x12 cells. Draw floor scallops inside
the solid floor silhouette, with an uninterrupted walking surface. Neither decorative anatomy
nor strokes may fill a carved firing lane.

Show sealed pocket contents with a distinct thin shell; warn visibly before committed release.
Use text as well as color for optional/releasing status. Cover, shots, hazards and the surgeon
need separate silhouettes at tiny and narrow-mobile scales.
[MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md) records the accepted integrated mechanics
captures and their limits. The following art evidence predates that delivery and covers the
assets separately.

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

## Surgeon and recovery art

Six editable `surgeon_*.svg` figures and their six victory variants share a `96 128` viewBox,
foot baseline at y123, upward tool anchor at x77, upper-body articulation seam at y100 and
leg split at x48. Runtime draws them at 44x60. The shared mint PPE, navy contours and common
applicator unify the cast; stature, mass and gesture carry identity independently of ethnicity.
None changes physics, collision, movement or weapon configuration. The selected portrait appears
in the roster and Canvas arena. Briefing and results open the same full roster chooser.

The six concepts have visible personality consequences:

| Surgeon | Personality | Shape and reaction |
| --- | --- | --- |
| Maya Chen | Calm anchor | Compact rounded figure, round cap, small thumbs-up and calm nod |
| Jules Okafor | Quiet lookout | Tall narrow upright mass, small head and curls, quiet salute and slow acknowledgment |
| Imani Patel | Thoughtful planner | Narrow pointed berry drape, careful two-hand grip, open palm and precise dip |
| Leo Rivera | Determined closer | Low broad square stance, blue cap and beard, fist pump and compact bounce |
| Samira Haddad | Bold pathfinder | Tilted head, diagonal shoulders and wide hip stance, open wave and confident sway |
| Alex Morgan | Curious inventor | Spiky hair, round glasses and tucked elbow, two-finger sign and double take |

The chooser's portrait and trait text describe personality, with an explicit same-abilities
statement. `src/surgeon_motion.ts` owns cosmetic timing, `src/renderer.ts` owns articulation,
and `src/artery_art.ts` owns the organic procedural frame/floor presentation. The underlying
floor and tissue geometry remain authoritative for collision and carved openings.

Owner evidence is in `output/art_identity/`: `roster_refine/recognition.png` contains
the native 44x60 color, grayscale and silhouette lineups; `chooser/REPORT.md` covers chooser
fixtures, superseded for layout by `chooser_compact/REPORT.md` and its three viewport captures;
`scenes/REPORT.md` covers six settings and target readability; `recovery/REPORT.md`
covers five patient poses and real-consumer fixtures. `roster_refine/REPORT.md` records the repair
of Maya/Jules stature and Imani/Samira silhouette separation; `roster_refine/SPEC_REVIEW.md`
accepts the corrected native-size recognition, crop and stride evidence. These refined images
supersede the initial `roster/` delivery for the current cast.
`runtime/REPORT.md` records source-renderer checks, motion fixtures and geometry boundaries.
The final combined build, independent visual quality and final integration are accepted in
[active_plans/active/art_identity.md](active_plans/active/art_identity.md). The complete review
chain and evidence limits are recorded in `output/art_identity/INTEGRATION_REVIEW.md`.

Recovery retains one person through seated rest, upright reaching, first steps, walking with
a seedling and a broad final stride/greeting. The chair and limb negative spaces change with
pose; the face, forelock/silver lock, teal jacket and coral shirt preserve identity. The existing
heart/map overlay remains the owner of restored coronary territories. These fictional milestones
show a return to activity without a new claim about disease cure.

## Current rendered evidence

The local production rebuild and final capture probe pass. The final source check passes all
49 Node tests; all 32 SVGs pass structural validation and source/build byte parity. The full
browser run has 16 passes and two outdated copy assertions; after correction, the affected
rerun passes 2/2. This is a full-suite execution plus focused confirmation, rather than a new
all-green full-suite run. `output/art_identity/verification/REPORT.md` retains exact commands,
build hashes, receipts and harness-failure provenance.

The durable images show the final consumers:

- [art_identity_roster.webp](screenshots/art_identity_roster.webp): six production-renderer
  figures at native 44x60, including grayscale and silhouette rows. Poses are staged fixtures.
- [art_identity_recovery.webp](screenshots/art_identity_recovery.webp): actual recovery UI with
  staged 0/12/24-route saves, decoded patient/heart art and route overlays; progress is not earned.
- [art_identity_game.webp](screenshots/art_identity_game.webp): current first-stage campaign
  gameplay from an empty progress save, using ordinary menu input. The earlier before/after
  comparison remains historical evidence under `output/art_identity/verification/`.

All thirteen documentation screenshots are refreshed together with quality-90 WebP encoding.
[SCREENSHOTS.md](SCREENSHOTS.md) describes the capture command and current provenance manifest.

The final probe verifies six selections surviving reload, title/Done visibility at three
viewports, reachable final choice, a 1.6 canvas aspect ratio, and frozen paused gameplay pixels.
All six renderer identities animate with changing play time and stay static for unchanged
state and reduced motion. The later organic practice view uses a staged unlock save. No
remote deployment is claimed.

## Historical roster evidence

Six editable victory variants accompany the base roster:
[surgeon_maya_victory.svg](../src/assets/surgeon_maya_victory.svg),
[surgeon_jules_victory.svg](../src/assets/surgeon_jules_victory.svg),
[surgeon_imani_victory.svg](../src/assets/surgeon_imani_victory.svg),
[surgeon_leo_victory.svg](../src/assets/surgeon_leo_victory.svg),
[surgeon_samira_victory.svg](../src/assets/surgeon_samira_victory.svg), and
[surgeon_alex_victory.svg](../src/assets/surgeon_alex_victory.svg). Each preserves its surgeon's
identity, 96 by 128 viewBox, palette, feet and leg geometry. Raised arms, a raised applicator,
crescent eyes and curved mask folds signal success. The runtime presents the final pop before
the victory pose; the celebration is cosmetic and reduced motion uses a static pose.

The local asset evidence in `output/clear_flow/art/art_report.md` records the SVG references
actually read, XML/reference validation, preserved geometry and inspected contact sheets at
48 by 64, 72 by 96 and 288 by 384. It includes Drawing Mentor lines 640-662 on simplified
silhouettes and Mastering SVG lines 635-675 on viewBox coordinates. These are asset-level checks;
[CLEAR_FLOW.md](CLEAR_FLOW.md) owns integrated sequencing, motion and continuation acceptance.
Its [clear_celebration.webp](screenshots/clear_celebration.webp) montage shows the actual final hit,
selected victory pose and result; final normal/reduced-motion capture evidence is retained in
`output/clear_flow/visual/acceptance.md`.

`cardiac_recovery.svg` supplies an original ruby-heart and branching-vessel composition, with
reusable patient symbols for recovery tiers. `src/recovery.ts` owns fixed stable-ID map slots
and the text/state overlays. Restored territory, available/locked stage state, current stage
and newly restored feedback use text and control state as well as color. The patient becomes
more active at the four six-route milestones. The biological setting remains an arcade story.

This artwork does not reuse Bad Cell Day's full-body layout, geometry or asset identifiers.
[RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md) owns new rendered evidence and
its limits; the historical twelve-asset checks above do not prove these additions.

The later basin, shelf and shoulder variants, rendered evidence and geometry/completion checks
are recorded in [FLOOR_VARIATION.md](FLOOR_VARIATION.md).
