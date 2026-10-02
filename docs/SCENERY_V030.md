# Kyoto scenery v0.30

`scenery/kyoto-scenes.js` exports the final native GardenGL string patch
`otoPatchSceneryV030(html)`. It replaces the placeholder court geometry and
keeps the existing `frontSceneryV022` / `backSceneryV022` visibility contract.
The origins are z=0 and z=-8. No textures, models, web requests or copied game
assets are required. Read-only runtime inspection: `kemari.getScenery()`.

## Scene pairs

- JINGU: wide vermilion torii and shrine → raked white sand and distant shrine
- 33GENDO: long timber hall exterior → dim raised rows of 69 original low-poly Kannon silhouettes; no statues outside
- CHION: great bronze bell, striker and monk → giant weeping cherry tree and bounded drifting petals
- SANJO: steps, railings, city windows → water, bridge and a clear canal-side performance lane
- SHINKYOGOKU: curved yellow canopy, blue sign, left airplane sculpture, red neighboring shop and utility wires → CRT cabinets and loading bay
- MILLION: crossing, bicycles, boards, bronze statue and bus → empty lecture hall, blackboard, lectern and tiered benches
- GION: lantern strings and a wheeled festival float → wet machiya alley
- KYOTO STATION: open steel lattice, faceted glass, deliberately misplaced tower and white office building; used by `intro=1` and the default title route without `stage` or `view=garden`

The arcade reference `IMG_4900.jpeg` was inspected as pixels. The scene adapts
its signature canopy and airplane sculpture to a late-night palette rather
than incorporating the daylight photo as a texture.

## Geometry and rendering

Each scenic module has a static batch and, where applicable, a separate unlit
batch. The maximum scene pair is GENDO (5,616 / 81,240 vertices). Modules are
volumetric; a camera-dependent foreground cutaway protects the performance
lane when the camera orbits behind architecture. Scenic vertical proportions
are intentionally compressed to the fixed orthographic gameplay framing.
Ground, characters, ball and gameplay are not changed by the cutaway.

Stage sky and radial fog replace the renderer's former fixed green fog. Fog
origin tracks the current court. Environmental pools are allocated once;
pause and reduced-motion mode freeze their clock, and decorative petals/rain
are hidden with effects disabled. Geometry does not alter timing or damage.

## Verification

`node tests/scenery-v030.cjs` verifies eight scene pairs, finite geometry,
bounded batches/pools, 360-degree cutaway states, route aliases, scene origin,
required arcade features, no front Kannon statues, and pause/reduced motion.

`node tests/scenery-v030.cjs --render` additionally needs `pngjs` and writes
software geometry review PNGs into `../feg-evidence/scenery/`. These images
use the real mesh geometry and camera projection, with approximate per-face
lighting/fog. They are clearly named `*-software.png`: they are not WebGL,
browser screenshots, proof of touch behavior, or physical-device evidence.

`node tests/assemble.cjs` passed after integration. Local Chromium launch was
blocked by the execution environment's socket restriction, including after a
sandbox escalation attempt. Actual WebGL shader output, full animated camera
transitions and iPhone/iPad Safari remain to be verified in a capable browser.
