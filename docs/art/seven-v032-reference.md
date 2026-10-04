# Seven-character reference and model review

**Correction, 2026-10-04 (v0.33 investigation):** the v0.32 standalone gallery loaded the bundled Three source string without executing it and silently used the Garden renderer. Its label and `rendererName` field incorrectly said Three.js. The displayed geometry was real WebGL, but was not the production Three lighting. The production game comparison and campaign browser tests used the actual Three loader and are unaffected. The gallery now executes and asserts the requested renderer; use the v0.33 comparison evidence for current art review.

2026-10-04 / v0.32 working tree, based on `c1e89d90285f7c9c78209a627d0d39a61f13e9c1`.

[Generated concept](seven-v032-concept.png) · [Exact prompt](seven-v032-prompt.txt) · [Previous models](seven-v032-before.png) · [Actual revised models](seven-v032-actual.png) · [Silhouettes](seven-v032-silhouettes.png)

The concept was generated with the built-in image generation tool, using the previous seven-model gallery as a costume and palette reference. It is design reference only; the game does not load this image or use image textures. The illustration is more detailed than the implemented models.

The implemented pass keeps the seven identities and colors. Toru now has a softer cheek and jaw, button nose, gentle smile, neat side part, modest jacket fullness, crease details and a loose pointed tie. All seven have small open eyes with pupils and upper lids fitted to the face planes. Sumi and Nagi have more shaped temple locks, bangs and hair tips. Sleeves have sloped shoulders; Sumi and Saku's upper sleeves were reduced after the first Chrome review. Sokichi's beard and vest, Sumi's waist knot, and Luka's coat panels have shaped facets.

All original joint pivots, foot contact calculations and pose logic are retained. The shadow still derives the exact selected character geometry. The existing limits of 64 meshes and 2,000 triangles per character are retained.

| Character | Visible meshes | Triangles |
| --- | ---: | ---: |
| Toru | 54 | 1,864 |
| Saku | 47 | 1,224 |
| Sokichi | 52 | 1,396 |
| Sumi | 61 | 1,736 |
| Nagi | 53 | 1,688 |
| Kota | 49 | 1,104 |
| Luka | 48 | 1,428 |

`node tests/characters-v030.cjs` passed 112 contact checks, face feature attachment, finite geometry/normals, pose restoration and identical shadow geometry. `npm run test:motion` passed camera continuity and planted-foot checks. [Geometry results](seven-v032-geometry.json).

`node tests/characters-art-v030.cjs after-v032` rendered 14 full-body/portrait views on Chrome / Apple M4 Metal with no WebGL error. [Gallery results](seven-v032-gallery.json). The game comparison test also passed 18 before/after captures at 390×844 and 844×390. [Game review](seven-v032-game-review.json), [kick sample](seven-v032-kick.png), [close sample](seven-v032-close.png). The comparison test now serves the actual local MP3 files instead of returning HTML for their requests.

The full gallery and the two game samples were visually reviewed. The small in-game view limits facial detail, and the close sample includes the game's LISTEN overlay. These are automated Mac rendering checks, not iPhone/iPad interaction, audible voice acceptance or human preference approval.
