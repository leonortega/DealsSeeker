# TDD evidence — P4 OS capabilities (completion pass)

- **Date**: 2026-11-24
- **Specs**: `APP.CONTEXT_MENU.001`, `APP.BOTTOM_SHEET.001`, `APP.NATIVE_MAP.001` — all Approved with BDD + traceability before code
- **Earlier P4 item**: haptics (`APP.HAPTICS.001`) already shipped in `894af16`

## Capabilities delivered

| Capability | Approach | Dependency justification |
|---|---|---|
| Contextual menu | Long-press on offer card opens the existing detail/action surface via `onLongPress`; no new visuals | None — RN `Pressable` already exposes long-press |
| Bottom sheets | `NativeBottomSheet` wrapper over `@gorhom/bottom-sheet` with two snap points, pan-down dismissal and brand palette; HelpSheet migrated to it | Sheet drag/snap/dismiss is not exposed by RN; needs the sheet library + reanimated (babel plugin added) |
| Native map | `NativeMapPreview` uses `react-native-maps` with markers, coverage circle, user/pin markers and tap-to-pin; Offers and Add Offer call sites switched; WebView map retained only as documented fallback | OS map rendering is not available to JS without a native map module |

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED (context menu) | `npm test -- accountAndOfferCard.test.tsx` | long-press test failed: `onOpenDetail` called 0 times |
| RED (map) | `npm test -- nativeMapPreview.test.tsx` | module absent / WebView fallback import failed |
| GREEN | `npm test` | 59 suites / 350 tests pass |
| GREEN | `npm run typecheck` | clean |
| GREEN | `npm run test:arch` | clean (60 files, 78 modules) |
| Coverage | `npm run test:coverage` | 82.43% statements / 82.23% lines |

## Guarantee table

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | Long press opens offer actions exactly once; tap unchanged | `accountAndOfferCard.test.tsx` | PASS |
| 2 | Sheet exposes two snap points, pan-down dismissal, brand card surface | `nativeBottomSheet.test.tsx` | PASS |
| 3 | Native map renders markers, coverage, user marker and pin | `nativeMapPreview.test.tsx` | PASS |
| 4 | Marker selection and tap-to-pin callbacks preserved | `nativeMapPreview.test.tsx` | PASS |
| 5 | Existing haptics, help and map tests still pass after migration | full suite | PASS |

## Caveats / follow-ups

- **Dev-client rebuild required** for `@gorhom/bottom-sheet`, `react-native-reanimated` and `react-native-maps` to be present on a device. Not performed (emulator/app left as-is).
- Bottom-sheet adoption is currently HelpSheet only; offer detail, comments and search overlays still use their existing branded modals. The capability and shared component exist, but full migration is a follow-up.
- `APP.CONFIG.MAPS.001` still describes web map providers; with the native map, those settings no longer drive the primary map surface. A spec cleanup to retire OpenLayers display configuration is needed.
- No device verification of the new native modules (emulator unchanged, no iOS simulator).
- No new E2E flows added or run.
