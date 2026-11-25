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

## Coverage and gaps

- Branch coverage (74.18%) is below the 80% target; pre-existing in untouched modules.
- Device E2E was not run (per user instruction: never run E2E). Native icon and splash appearance are not verified on a device here.
- The inverse/horizontal/wordmark variants are authored and bundled but not placed in a view; only the symbol mark, reversed square and stacked lockup have a placement today.
