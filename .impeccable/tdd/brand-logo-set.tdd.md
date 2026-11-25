# TDD evidence — brand logo set and placement

- **Date**: 2026-11-25
- **Spec**: `APP.BRAND.001` (Approved) — added before code
- **BDD**: `specs/bdd/app-brand.feature`
- **Scope**: all eight supplied SVGs copied into `assets/brand/`; transparent PNGs rasterized from them and applied to splash, login, immersive top bar, native app icon, Android adaptive layers, native splash image and favicon.

## User journey

As a user, I want one consistent authored logo in every app surface instead of placeholder brand imagery.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- --runInBand presentationComponents authScreens immersiveChrome` | 3 tests failed: no `brand-mark` element on splash, login or immersive top bar; login and splash still rendered the `DS` glyph. |
| GREEN | same command | 3 suites / 25 tests passed. |
| GREEN | `npm test -- --runInBand` | 64 suites / 373 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (62 files); no dependency violations (80 modules, 258 dependencies). |
| Coverage | `npm run test:coverage -- --runInBand` | 81.79% statements / 74.18% branches / 81.02% funcs / 81.56% lines; LoginScreen and SplashScreen 100%. |

## Guarantee table

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Splash shows the authored symbol mark with localized name and CTA | `presentationComponents.test.tsx` — "shows the brand mark, title and call to action" | unit | PASS |
| 2 | Login shows the authored symbol mark, localized name, and no `DS` glyph | `authScreens.test.tsx` — "shows the authored brand mark beside the localized app name" | unit | PASS |
| 3 | Immersive top bar shows the authored symbol mark | `immersiveChrome.test.tsx` — "renders the authored brand mark in the top bar" | unit | PASS |

## Asset mapping

| Source SVG | Use |
|---|---|
| `dealsseeker-icon-color.svg` | Symbol mark in splash, login, immersive top bar; Android adaptive foreground; monochrome silhouette source |
| `dealsseeker-reversed.svg` | Native app icon, favicon (filled green square, white lockup) |
| `dealsseeker-stacked-color.svg` | Native startup splash image |
| `dealsseeker-color.svg`, `dealsseeker-horizontal-color.svg`, `dealsseeker-wordmark-color.svg`, `dealsseeker-inverse.svg`, `dealsseeker-mono.svg` | Copied into `assets/brand/` as the authored source set (PNG previews generated for each) |

- Android adaptive background is the brand sage `#719377` in `app.json`.
- PNGs were rasterized with headless Chrome at transparent background; no new dependency was added.

## Follow-up: mark beside the map-view presentation switch

- **Spec**: `APP.BRAND.001` v1.1, R8 (Approved); BDD scenario added to `specs/bdd/app-brand.feature`.
- **RED**: `npm test -- --runInBand presentationMode` — 1 test failed: no `brand-mark` in the standard Offers view.
- **GREEN**: 5/5 in that suite; 64 suites / 374 tests overall; `typecheck` and `test:arch` clean.
- The 32px symbol mark is rendered as the first child of the `headerControls` row, immediately before the feed/map switch; the switch itself is unchanged.

## Follow-up: map-view controls mirror the feed top bar

- **Spec**: `APP.BRAND.001` v1.2, R9 (Approved); BDD scenario added.
- **RED**: `npm test -- --runInBand presentationMode` — 1 test failed: controls row lacked `space-between`, 12/8 padding, rounded 40px icon tile and absolute top placement.
- **GREEN**: 6/6 in that suite; 64 suites / 375 tests overall; `typecheck` clean.
- The standard Offers view now pins a top bar at the same position as the immersive feed, with the rounded symbol tile at the left, presentation switch centered via `space-between`, and help at the right; scroll content gets a 56px top inset so nothing hides under it.

## Follow-up: exact feed-view alignment

- **Spec**: `APP.BRAND.001` v1.3, R10 (Approved); BDD assertion added.
- **RED**: `npm test -- --runInBand presentationMode` — 1 test failed: top bar lacked the -16 horizontal margin needed to escape the shell's 16px content padding.
- **GREEN**: 6/6 in that suite; 64 suites / 375 tests overall; `typecheck` clean.
- The immersive feed runs edge-to-edge (`paddingHorizontal: 0`), while the standard screen inherits 16px. The pinned controls row now cancels that padding, so the logo, switch and help sit at the same screen coordinates in both presentations.

## Follow-up: shared feed header structure with hidden search

- **Spec**: `APP.BRAND.001` v1.5, R11 (Approved); BDD scenario added.
- **RED**: `npm test -- --runInBand presentationMode` — 2 tests failed: no `modeSlot` / `topActions` wrappers and no reserved search footprint in the map view.
- **GREEN**: 7/7 in that suite; 64 suites / 376 tests overall; `typecheck` and `test:arch` clean.
- The standard Offers top bar now uses the feed's slot structure: mark → optional title → `modeSlot` (switch) → `topActions` (44px reserved search slot + help). The search button is not rendered, but its footprint keeps the switch at the feed's x-position. `NARROW_BREAKPOINT` is exported from `ImmersiveOfferFeed` so both presentations use the same viewport rule.

## Coverage and gaps

- Branch coverage (74.18%) is below the 80% target; pre-existing in untouched modules.
- Device E2E was not run (per user instruction: never run E2E). Native icon and splash appearance are not verified on a device here.
- The inverse/horizontal/wordmark variants are authored and bundled but not placed in a view; only the symbol mark, reversed square and stacked lockup have a placement today.
