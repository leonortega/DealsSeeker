# RED → GREEN evidence (Android conformance pass)

## Scope of code changes (file ownership respected)

Production (owned):
- `src/DealsSeeker.ReactNative/src/utils/theme.ts`
- `src/DealsSeeker.ReactNative/src/components/FirstRunSheet.tsx`
- `src/DealsSeeker.ReactNative/src/navigation/AppNavigator.tsx`

Tests (owned):
- `test/unit/dealsseeker.reactnative/shellChrome.test.ts`
- `test/unit/dealsseeker.reactnative/onboarding.test.tsx`
- `test/unit/dealsseeker.reactnative/appShellPlatformBehavior.test.tsx`

No dependency was added; no commit was created.

## Spec requirements implemented

| Requirement | Change |
|---|---|
| `APP.ACCESSIBILITY.UX.001-R12`, `APP.ACCESSIBILITY.UX.002-R10`, `APP.THEME.001-R17` | `contrastRatio` + `auditPaletteContrast` measure 17 role pairings per palette/appearance; `resolveFooterColors` now lifts the night-footer accent/border/ink to a measured floor instead of hardcoding raw literals. |
| `APP.PLATFORM.CHROME.001-R14` | `materialTypeScale` (Headline/Title/Body/Label roles, scalable sp units) introduced; FirstRunSheet uses it instead of per-screen font sizes. |
| `APP.PLATFORM.CHROME.001-R5`, `APP.ACCESSIBILITY.UX.001-R1` | FirstRunSheet action has a square 48 dp floor (`minWidth` added to existing `minHeight`). |
| `APP.PLATFORM.CHROME.001-R11` | AppNavigator applies the reported navigation-bar inset to shell content and adds `testID="app-shell-content"` for verification. |
| `APP.PLATFORM.CHROME.001-R7`, `APP.THEME.001-R11` | Shell root background now follows `resolveRouteChrome` for the rendered route (immersive → backdrop, standard → background) instead of always using `palette.background`. |

## RED

Command (from `src/DealsSeeker.ReactNative`):

```
npm test -- --runInBand shellChrome.test.ts onboarding.test.tsx appShellPlatformBehavior.test.tsx
```

Result before implementation:

```
FAIL appShellPlatformBehavior.test.tsx
  ● applies the navigation-bar inset and follows the rendered route background
    Unable to find an element with the testID: app-shell-content
FAIL onboarding.test.tsx
  ● maps guidance text to Material type roles and keeps a square touch floor
    TypeError: Cannot read properties of undefined (reading 'headlineSmall')
FAIL shellChrome.test.ts
  ● computes the WCAG contrast ratio instead of estimating it
    TypeError: (0 , _theme.contrastRatio) is not a function
  ● golden light and dark roles meet the measured thresholds
  ● market light and dark roles meet the measured thresholds
  ● tangerine light and dark roles meet the measured thresholds
    TypeError: (0 , _theme.auditPaletteContrast) is not a function
Test Suites: 3 failed, 3 total
Tests:       6 failed, 18 passed, 24 total
```

First GREEN attempt exposed a real implementation defect: `routeChrome` was computed before
`immersiveFeedVisible` was initialized, so the immersive route rendered the standard background.
That intermediate run reported `Expected: "#121417" / Received: "#f4efe6"` (1 failed, 23 passed).
The computation was moved after the flag declaration.

## GREEN

Same command after the fix:

```
Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Time:        5.52 s
```

Measured contrast output from the production helper (`auditPaletteContrast`):

```
golden  light: 17 pairs, min 3.00 (footer accent on night surface), 0 failures
golden  dark : 17 pairs, min 3.15 (border on card),                  0 failures
market  light: 17 pairs, min 3.40 (border on background),            0 failures
market  dark : 17 pairs, min 3.73 (border on card),                  0 failures
tangerine light: 17 pairs, min 3.44 (border on background),          0 failures
tangerine dark : 17 pairs, min 3.31 (border on card),                0 failures
goldenLight footer accent: #b0512c -> #b45a37 (measured lift to 3:1 on night surface)
```

Full JSON: `16-contrast-audit.json`.

## Regression check / concurrent work

`npm test` (full suite) after the change:

```
Test Suites: 4 failed, 76 passed, 80 total
Tests:       7 failed, 565 passed, 572 total
```

The failing suites are `actionFeedback.test.tsx`, `secondaryScreens.test.tsx`,
`addOfferDraftRecovery.test.tsx` and `helpSheet.test.tsx` — all outside this subagent's file
ownership and changed concurrently by the parent session (e.g. HelpSheet search returning
`help.noResults` for `feed`). They were not modified here.

`npm run typecheck` reports three pre-existing errors in files outside ownership
(`OfferReportSheet.tsx:147`, `AddOfferScreen.tsx:995`, `AddOfferScreen.tsx:1109`, all
`RefObject<...>` → `Ref<ReactNativeElement>` mismatches). None of the owned files appear in
typecheck errors.
