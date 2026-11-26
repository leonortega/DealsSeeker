# TDD evidence — Cycle G: sheet/footer occlusion and predictive Back (`APP.BOTTOM_SHEET.001`, `APP.SHELL.004`)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` §10.3 (Cycle G).
- Specs: `APP.BOTTOM_SHEET.001` v1.4 (R12), `APP.SHELL.004` v1.2, related `APP.SHELL.002` link.
- BDD: `specs/bdd/app-bottom-sheet.feature`, `specs/bdd/app-shell-native-behavior.feature`.
- No contracts/examples added: the behavior is visual/interactional, with no data shape to describe.

## User journeys
- As a user viewing offer comments, I want the sheet's Publish control visible and tappable so I can post a comment without the navigation chrome covering it.
- As an Android user, I want the system predictive Back gesture available so navigation matches the platform while the brand UI stays unchanged.

## RED / GREEN
- RED: `npm test -- appShellNavigation.test.tsx predictiveBackConfig.test.ts` → 2 suites failed / 2 tests failed, 3 passed:
  - `hides the branded footer while a sheet is open (APP.BOTTOM_SHEET.001-R12)` — expected `null`, received `<View testID="app-footer-bar" />`.
  - `enables the Android predictive Back gesture` — expected `true`, received `false`.
  - Failure causes were the intended business-logic gaps; pre-existing tests in the same suites stayed green.
- GREEN: same command → 2 suites passed / 5 tests passed.
- Full suite: `npm test` → 66 suites / 405 tests passed (twice: after the fix and after refactor).
- Typecheck: `npm run typecheck` → clean.
- Coverage: `npm run test:coverage` → 82.24% statements, 74.53% branches, 81.79% functions, 82.04% lines. The branch figure is a pre-existing global gap, not introduced by this cycle.

## What the tests guarantee
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | The branded footer (and its Create action) is not displayed while a bottom sheet is open | `appShellNavigation.test.tsx:hides the branded footer while a sheet is open` | unit | PASS |
| 2 | The footer is displayed again when no sheet is open | same test, first assertion | unit | PASS |
| 3 | Android predictive Back is enabled in the native config | `predictiveBackConfig.test.ts:enables the Android predictive Back gesture` | config unit | PASS |
| 4 | Existing shell Back behavior and natural-tab behavior are unchanged | `appShellNavigation.test.tsx` (3 pre-existing tests) | unit | PASS |

## Implementation
- `src/navigation/AppNavigator.tsx`: `BrandedTabBar` returns `null` when `sheetCount > 0`; the redundant per-FAB `visible` condition was removed in the refactor commit so one guard owns sheet occlusion.
- `app.json`: `android.predictiveBackGestureEnabled` changed from `false` to `true`.
- `NativeBottomSheet.tsx` untouched: no Close button added, per `APP.BOTTOM_SHEET.001-R9` / `APP.SHELL.003-R7`.

## Manual native verification (emulator-5554, 1080×1920)
- Native rebuild: `npx expo run:android --no-bundler -d emulator-5554` (Metro/API already running; no second instance started), `adb reverse` mappings re-established. Build successful.
- Baseline bug reproduced before the fix: Comments sheet opened with the footer painted over the composer; `0/120` counter clipped and Publish hidden (`impeccable-baseline.png` from the review pass).
- After the fix (`cycle-g-comments.png`): footer absent while the sheet is open; `Write a comment…`, `0/120` and the amber **Publish** control are visible.
- After dismissal (`cycle-g-restored.png`): footer returns with My Account / Suggestions / Offers / Create.
- No hardware-device verification; gesture feel for predictive Back was not exercised manually (config + unit assertion only).

## Checkpoint commits (all on `dev`)
1. `7f31bbb` — `test: add RED reproducer for sheet footer occlusion and predictive Back` (specs/BDD + failing tests).
2. `85079f8` — `fix: keep sheets above the footer and enable Android predictive Back` (GREEN).
3. `f249299` — `refactor: use one sheet-visibility guard in the branded footer`.

## Known gaps
- Device E2E (Maestro) was intentionally not run at the user's request. Temporary harness workarounds for the Expo dev-menu onboarding shown by the fresh dev build were reverted; no E2E files remain modified.
- Branch coverage 74.53% is below the 80% target and predates this cycle; not changed here.
- Incidental observation during verification: in the immersive feed's no-results state, `OffersStatePanel` renders above the absolute top bar (`cycle-g-restored.png`). Outside Cycle G scope; track in a later cycle (likely H/L) with its own spec.
- Publish sits near the bottom edge at the 65% sheet snap point; it is visible and tappable but a taller snap or scrollable sheet body would be safer. Not blocking R12.
