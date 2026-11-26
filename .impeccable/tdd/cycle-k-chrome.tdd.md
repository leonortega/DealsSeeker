# TDD evidence — Cycle K: palette-derived chrome and authored glyphs (`APP.THEME.001`, `APP.BRAND.001`, `APP.POLISH.UX.001`)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` §10.7 (Cycle K).
- Specs: `APP.THEME.001` v0.4 (R10 chrome colors, R11 status bar), `APP.BRAND.001` v1.12 (R15 authored action glyphs), `APP.POLISH.UX.001` v1.6 (R13 single shadow on both platforms), each with BDD scenarios in the matching feature files.

## User journeys
- As a user switching palette worlds, I want every visible chrome color to follow the active theme.
- As a contributor voting on an offer, I want the action icons to match the rest of the app's glyph language.

## RED / GREEN
- RED: `npm test -- chromePalette.test.ts accountAndOfferCard.test.tsx` → 2 suites failed / 2 tests failed, 21 passed: hardcoded footer icon color, hardcoded white immersive text, and emoji vote icons were present.
- GREEN: same command → both suites pass; full suite `npm test` → 69 suites / 415 tests passed; `npm run typecheck` clean.
- Two test adjustments during GREEN: the vote test now presses by `accessibilityLabel` instead of emoji text; `StatusBar` uses `barStyle` only because `backgroundColor` is Android-only in the shared type.

## What the tests guarantee
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Navigator has no hardcoded footer icon colors | `chromePalette.test.ts:does not hardcode footer icon colors…` | static guard | PASS |
| 2 | Immersive overlay has no hardcoded white text literals | `chromePalette.test.ts:does not hardcode white text literals…` | static guard | PASS |
| 3 | Vote actions render no emoji | `accountAndOfferCard.test.tsx:uses authored glyphs instead of emoji…` | unit | PASS |
| 4 | Vote actions still fire with correct vote type | `accountAndOfferCard.test.tsx:submits positive and negative availability votes` | unit | PASS |
| 5 | Immersive caption styling remains intact | `immersiveChrome.test.tsx` | unit | PASS |

## Implementation
- `AppNavigator.tsx`: tab icon colors from `resolveFooterColors(palette)`.
- `theme.ts`: new fixed-backdrop tokens (`immersiveScrim`, `immersiveDivider`, `immersiveTagSurface`, `immersivePhotoNav`, `immersiveDot`) alongside existing ink tokens.
- `ImmersiveOfferFeed.tsx`, `ImmersiveActionGlyphs.tsx`, `ImmersiveFeedTabs.tsx`, `OfferCard.tsx`, `OfferDetailModal.tsx`: raw literals replaced by tokens.
- `OfferCard.tsx`: emoji votes replaced with the existing `ImmersiveActionIconGlyph` thumbs SVGs; row memoization preserved.
- `OfferCard.tsx`, `CreateOfferFab.tsx`: `elevation: 8` keeps the single soft shadow on Android.
- `App.tsx`: `AppStatusBar` maps the active palette/presentation to RN status-bar style, reviving the previously dead `resolveShellChrome`.

## Checkpoint commits (on `dev`)
1. `855393a` — `test: add RED reproducer for palette-derived chrome and authored glyphs`.
2. `d82cd8e` — `fix: derive chrome colors from the palette and unify action glyphs`.
3. Evidence report commit follows.

## Known gaps
- Native splash background is still static white in config; only the in-app splash and status bar are theme-aware. R11 was scoped to the status bar; a theme-aware native splash needs a platform-specific solution.
- `StatusBar.backgroundColor` is not set (Android-only in the shared type); shell background already supplies the color.
- No E2E and no fresh 150%-text/serif device capture at the user's request.
