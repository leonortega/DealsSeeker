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
- GREEN (integration): `npm test` → 54 suites / 309 tests passing; `npm run typecheck` clean. Added `appShellNavigation.test.tsx` (immersive Back via native `beforeRemove`) and `appShellNativeTabs.test.ts` (tab destinations).
- Phase 3 RED: `addOfferBack.test.tsx` added a platform-dismiss guard reproducer; test failed because `AddOfferScreen` did not accept `onDismissGuard`. `appShellNativeTabs.test.ts` failed with `Cannot find module .../navigation/tabs`.
- Phase 3 GREEN: modal `beforeRemove` guard vetoes dismissal when the draft is dirty (iOS swipe-down cannot bypass the discard confirmation); native bottom-tabs navigator owns tab state with the branded footer as custom `tabBar`. `APP.SHELL.002-R10` added and Approved with BDD.

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
- **Device build unblocked**: pinning `android.cmakeVersion=3.31.6` (Ninja 1.12.1) in the *user-level* `~/.gradle/gradle.properties` and purging `android/app/.cxx` + `android/app/build` makes `:app:buildCMakeDebug` succeed. No repo config was changed. The dev client installs and launches.
- Device findings fixed: (1) `Invalid hook call` — React Navigation calls `tabBar` as a plain function, so the custom tab bar is now passed as a JSX wrapper and reads the active tab from `props.state` instead of `useNavigationState`; (2) startup landed on My Account because the native tab navigator defaults to its first screen — added `initialRouteName="offers"` with a RED/GREEN test. `ux-help.yaml` and `app-shell-modal-back.yaml` now pass on device.
- Maestro suite optimized: 3 auth flows stay isolated; 11 remaining flows run as `runFlow` subflows under one parent that logs in once. Subflows reset via Offers → Feed → View all → portrait. One API registration and one driver session; suite time dropped from ~10 min to ~5 min. Services launched detached with `Start-Process`. Final device result: 13/14 flows pass; only `offers-comment.yaml` fails (known emulator offer-card gap).
- Native tabs are now used (`@react-navigation/bottom-tabs`) with the branded footer as the custom `tabBar`; visual identity stays identical. `APP.SHELL.002-R1/R10` met at code level, still awaiting device verification.
