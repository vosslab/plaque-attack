# Restored lining mask correction

The `restored_lining` clip previously stopped at y=490, but the floor-following Canvas stroke
is centered at `floorY - 5` (y=535 on a flat y=540 floor). The stroke was therefore fully clipped.
The mask now retains the existing y=425..490 earned region and adds a narrow band that follows
the actual floor profile from `floorY - 12` through `floorY + 2`. Its horizontal extent is the
earned progress extent. The gathered-column rounded rectangle remains a separate clip subpath.
No simulation state or gameplay behavior changed.

## Temporary Canvas proof

`node output/remix_lining/capture.mjs` bundled the actual renderer helper, served the source SVG
from `src/assets/restored_flow.svg`, and drew it into a browser Canvas at 960x540. The temporary
fixture used partial earned progress (25%) and both a flat floor at y=540 and a wavy floor profile.
It captured normal and reduced-motion variants for each profile:

- `output/remix_lining/flat_normal.png`
- `output/remix_lining/flat_reduced.png`
- `output/remix_lining/wavy_normal.png`
- `output/remix_lining/wavy_reduced.png`

Canvas pixel samples at five positions along the earned floor stroke were the expected visible
lining color (`rgba(217, 255, 238, 255)`) for all four cases. The unearned area retained its
background pixel, the gathered-column region differed from the background, and the actual source
SVG loaded with 960x540 intrinsic dimensions. Normal and reduced-motion pixel digests matched for
each floor profile (`1651846454` flat, `3065365161` wavy), confirming identical static geometry.
The screenshots were visually inspected; the wavy-floor image shows the revealed surface path
tracking the authored floor profile.

## Checks

- `npx tsc --noEmit -p tsconfig.json`: passed.
- `npx tsc --ignoreConfig --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --lib ES2022,DOM --strict output/remix_lining/harness.ts`: passed.
- `npx eslint src/remix_rendering.ts`: passed.
- `npx prettier --check src/remix_rendering.ts output/remix_lining/harness.ts output/remix_lining/capture.mjs output/remix_lining/index.html`: passed after formatting.
- `node output/remix_lining/capture.mjs`: passed all four Canvas cases with no browser errors.

These are focused renderer and temporary Canvas results; they do not claim full M2 acceptance.
