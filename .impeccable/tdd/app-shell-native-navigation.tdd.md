# TDD evidence — native shell navigation (`APP.SHELL.002/003/004`)

## Source
- Plan: `docs/plans/2026-11-22-mobile-native-shell-plan.md` (Phase 2).
- Specs: `APP.SHELL.002`, `APP.SHELL.003`, `APP.SHELL.004`.

## User journeys
- As a signed-in user, I want system Back/gestures handled by the OS so navigation behaves natively while the app still looks like DealsSeeker.
- As a contributor, I want Add Offer to open as a native modal with my draft protected when I dismiss it.
- As a user, I want native modal behavior without a platform-specific visual restyle.

## RED / GREEN
- RED: `npm test -- appShellNavigationOptions.test.ts` → `Cannot find module '../../../src/DealsSeeker.ReactNative/src/navigation/shellOptions'` (1 suite failed, 0 tests run). This is compile-time RED for the missing navigation-options module.
- GREEN (options): `src/navigation/shellOptions.ts` added; same command → 1 suite passed, 3 tests passed.
- GREEN (integration): `npm test` → 53 suites / 305 tests passing; `npm run typecheck` clean. Added `appShellNavigation.test.tsx` to cover immersive Back via the native stack's `beforeRemove` listener (replaces the old `BackHandler` unit test in `offersFindings.test.tsx`).

## What the tests guarantee
| # | Guarantee | Test | Type | Result |
|---|---|---|---|---|
| 1 | Stack screens hide native chrome | `appShellNavigationOptions.test.ts:stackScreenOptions` | unit | PASS |
| 2 | Tab screens hide native chrome, brand footer stays | `appShellNavigationOptions.test.ts:tabScreenOptions` | unit | PASS |
| 3 | iOS modal uses `formSheet`, Android uses `modal`, both gesture-dismissible | `appShellNavigationOptions.test.ts:modalScreenOptions` | unit | PASS |

## Implementation so far
- Native navigation dependencies installed (`@react-navigation/native`, `native-stack`, `bottom-tabs`, `react-native-screens`, `react-native-gesture-handler`).
- `AppNavigator.tsx` adds a root native stack (`Main`, `AddOffer` modal, `Favorites`) with branded `MainView` chrome; overlay state in `AppContext` is synced to navigation and `beforeRemove` syncs platform dismissal back to the context.
- `App.tsx` delegates the authenticated shell to `AppNavigator`; auth/splash stay outside the stack.

## Known gaps
- Native tabs are not yet used: the branded footer is retained as the only tab surface, so tab state still lives in `AppContext`. Further work needed for `APP.SHELL.002-R1` tab-state conformance.
- Platform dismissal with unsaved Add Offer edits still needs verification against `APP.SHELL.003-R4`.
- **Device verification blocked by the environment**: installing `react-native-screens` requires rebuilding the Expo dev client. Every rebuild fails in `:app:buildCMakeDebug[x86_64]` with `ninja: ... Filename longer than 260 characters` for the `react-native-safe-area-context` codegen object. Attempts that did NOT help: Windows `LongPathsEnabled=1`, an 8.3 short working path, a `C:\ds` junction, moving `node_modules` to `C:\dsnm`, a Gradle clean, and `newArchEnabled=false` (ignored since RN 0.82). All temporary changes were reverted. The SDK's `ninja.exe` is not long-path aware; a newer CMake/Ninja or a physically shorter repository path would be needed.
- Native tabs are not yet used — tab state stays in `AppContext` and the branded footer remains the only tab surface. `APP.SHELL.002-R1` tab-state conformance is therefore only partially met and needs a follow-up decision (brand footer vs. native tab bar).
