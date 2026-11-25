# TDD evidence — rounded embedded map surfaces

- **Date**: 2026-11-25
- **Spec**: `APP.POLISH.UX.001` v1.4, R11 (Approved) — added before code, then refined to require the map to meet the border with no padding gap
- **BDD**: `specs/bdd/app-polish-ux.feature` — "Embedded map uses the panel corner treatment"
- **Scope**: both embedded maps (Offers map and Add Offer mini-map) share `NativeMapPreview`; the fix is applied once in that component plus a panel wrapper for the previously bare Offers map.

## User journey

As a user, I want the map to use the same rounded panel treatment as the other surfaces so it does not look like an unstyled square.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- --runInBand nativeMapPreview presentationMode` | 2 suites / 2 tests failed: `native-map` style had `overflow: 'hidden'` but no `borderRadius`; the Offers `native-map` parent had no style object. |
| GREEN | same command | 2 suites / 11 tests passed. |
| RED (no-gap refinement) | `npm test -- --runInBand presentationMode` | 1 test failed: panel wrapper `padding` was 16, expected 0. |
| GREEN (no-gap refinement) | `npm test -- --runInBand` | 64 suites / 371 tests passed. |
| GREEN | `npm test -- --runInBand` | 64 suites / 371 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (62 files); no dependency violations (80 modules, 256 dependencies). |
| Coverage | `npm run test:coverage -- --runInBand` | 81.79% statements / 74.18% branches / 81.02% funcs / 81.56% lines; `NativeMapPreview.tsx` 100% statements. |

## Guarantee table

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | The map surface is clipped to a 28px structural corner | `nativeMapPreview.test.tsx` — "clips the map surface to structural panel corners" | unit | PASS |
| 2 | The Offers map sits inside a 28px, 1px-bordered panel using the palette, with no padding gap | `presentationMode.test.tsx` — "presents the Offers map inside a bordered panel" | unit | PASS |

## Implementation notes

- `NativeMapPreview.tsx`: added `borderRadius: 28` to the existing clipped container. This rounds both call sites without adding a second border inside the Add Offer panel.
- `OffersScreen.tsx`: wrapped the bare map in the existing `styles.panel` with `palette.card` / `palette.border` inline and `padding: 0`, so the map meets the border without a gap.
- No new style utility or abstraction: the repeated panel recipe is reused as-is per the current convention.

## Coverage and gaps

- Branch coverage (74.18%) is below the 80% target; pre-existing in modules untouched by this change.
- Device E2E was not run (per user instruction: never run E2E). The corner treatment is verified only by unit style assertions.
