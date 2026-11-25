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

## Refactor: one shared top-bar component

- **Boundary**: extracted the duplicated top-bar markup from `ImmersiveOfferFeed.tsx` and `OffersScreen.tsx` into `OfferTopBar.tsx`. No behavior change; spec-first is not required because the observable output is unchanged.
- **Preserved**: slot order (mark → title → switch → actions), the search button in feed and its hidden 44px footprint in map view, viewport rule via shared `NARROW_BREAKPOINT`, accessibility labels, testIDs, and the absolute top position / screen-edge alignment in the standard view.
- **Proof after refactor**: 64 suites / 376 tests passed; `typecheck` clean; `test:arch` clean (63 files, no dependency violations).

## Follow-up: title clearance and unclipped controls

- **Spec**: `APP.BRAND.001` v1.6, R12 (Approved); BDD scenario added.
- **RED**: `npm test -- --runInBand presentationMode` — 2 tests failed: screen root still used the old edge offset and title padding was 56 instead of 68.
- **GREEN**: 8/8 in that suite; 64 suites / 377 tests overall; `typecheck` clean.
- Final structure: `screenRoot` carries the -16 edge compensation, `topBar` stays inside it (no margin), scroll content re-adds 16px horizontal padding and uses 68px top padding. Control coordinates stay at the feed positions while the bar no longer overhangs its parent.

## Follow-up: no scrollbars, unclipped tiles

- **Spec**: `APP.POLISH.UX.001` v1.5, R12 (Approved) — standard Offers view has no scroll indicators; `APP.BRAND.001` R10/R12 already require unclipped controls.
- **RED**: `npm test -- --runInBand presentationMode` — 1 test failed: scroll indicators were not disabled.
- **GREEN**: 9/9 in that suite; 64 suites / 378 tests overall; `typecheck` and `test:arch` clean.
- The clip came from the shell's 16px-padded content wrapper cutting the overhanging bar. The Offers tab now runs edge-to-edge at the shell level (`offersContent`), and the scroll view re-adds its 16px inset. A device screenshot confirmed both the logo tile and help button render as full circles; control positions are unchanged.

## Follow-up: stacked splash lockup with black copy

- **Spec**: `APP.BRAND.001` v1.7, R13 (Approved); BDD scenario added.
- **RED**: `npm test -- --runInBand presentationComponents` — 1 test failed: separate `app.title` text was still rendered and splash copy was themed, not black.
- **GREEN**: 4/4 in that suite; 64 suites / 378 tests overall; `typecheck` clean.
- The in-app splash now renders `logo-stacked.png` (symbol + wordmark) instead of the DS glyph plus a separate title text; subtitle and CTA are fixed black, per request.

## Follow-up: splash subtitle removed

- **Spec**: `APP.BRAND.001` v1.8, R13 (Approved) — splash has no application-subtitle line.
- **RED**: `npm test -- --runInBand presentationComponents` — 1 test failed: `app.subtitle` was still rendered.
- **GREEN**: 4/4 in that suite; 64 suites / 378 tests overall; `typecheck` clean.
- Splash now shows only the stacked lockup and the black CTA text.

## Follow-up: immediate startup loading state

- **Spec**: `APP.SHELL.001` v2.2, R30 (Approved); BDD scenario added to `app-shell.feature`.
- **RED**: `npm test -- --runInBand presentationMode` — 1 test failed: no `app.loading` while the initial search was pending.
- **GREEN**: 11/11 in that suite; 64 suites / 380 tests overall; `typecheck` clean.
- `LoadingOverlay` now accepts an optional `visible` override; `OffersScreen` starts with a local `initialLoading` flag and clears it in a `finally`, so the blocking spinner is visible from the first rendered frame through location resolution and the initial search. It is rendered in both the map and feed presentations.
- Device observation confirmed the remaining white gap before JS startup is the Expo dev-client bundle download / native splash, not an in-app empty state.

## Follow-up: no empty-state card

- **Specs**: `OFFERS.UX.001` v1.1 (R3 rewritten, R4 retired), `OFFERS.FEED.IMMERSIVE.001` v2.2 (R13), `OFFERS.LAYOUT.001` edge case; BDD updated in `offers-ux.feature` and `offers-immersive-feed.feature`.
- **RED**: `npm test -- --runInBand presentationMode` — 1 test failed: `offers.emptyTitle` was rendered on an empty unfiltered result.
- **GREEN**: 64 suites / 381 tests overall; `typecheck` clean.
- `renderStatePanel` no longer returns the empty card. The Offers controls, map and footer remain; filtered no-results and search-error panels are unchanged.

## Follow-up: single stable feed loading indicator

- **Spec**: `APP.SHELL.001` v2.3, R31 (Approved); BDD scenario added.
- **RED**: `npm test -- --runInBand presentationMode` — 2 tests failed: two indicators were present at startup (`app.loading` overlay + `offers.loading` banner), and the progress banner was in normal flow.
- **GREEN**: 64 suites / 383 tests overall; `typecheck` clean.
- The inline feed progress banner is suppressed while the blocking initial load is active, and is now absolutely positioned above the footer so showing/hiding it never shifts the feed controls.

## Coverage and gaps

- Branch coverage (74.18%) is below the 80% target; pre-existing in untouched modules.
- Device E2E was not run (per user instruction: never run E2E). Native icon and splash appearance are not verified on a device here.
- The inverse/horizontal/wordmark variants are authored and bundled but not placed in a view; only the symbol mark, reversed square and stacked lockup have a placement today.
