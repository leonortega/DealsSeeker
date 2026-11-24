# TDD evidence — native shell platform behavior parity

- **Date**: 2026-11-24
- **Source plan**: `docs/plans/2026-11-22-mobile-native-shell-plan.md` §3 / §9.4 (behavior-only OS adaptation)
- **Specs**: `specs/features/application-shell/APP.SHELL.002.md` (R7, R8), `specs/bdd/app-shell-native-behavior.feature`
- **Requirements implemented**: `APP.SHELL.002-R7` (safe-area/window insets), `APP.SHELL.002-R8` (Reduce Motion changes transitions only)

## User journeys

1. As a user on a device with a notch, cutout or gesture bar, I want the branded shell to clear system UI so the header and footer stay fully visible and unstyled by the OS.
2. As a user who has enabled Reduce Motion / Remove animations, I want navigation transitions minimized so movement is reduced while the DealsSeeker UI stays identical.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- appShellPlatformBehavior.test.tsx` | 1 suite / 3 tests failed: `stackScreenOptions` received no Reduce Motion flag (2 calls with `[]`); `modalScreenOptions` received no flag; no `app-shell-root` element / top inset. |
| RED | `npm test -- appShellNavigationOptions.test.ts` | 1 suite / 2 tests failed: reduced-motion option objects lacked `animation: 'fade'`. |
| GREEN | `npm test` | 55 suites / 316 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (55 files); no dependency violations (70 modules, 234 dependencies). |

## Guarantee table

| # | Guarantee | Test | Type | Result |
|---|---|---|---|---|
| 1 | A minimized native animation (`fade`) is requested for stack and modal screens when Reduce Motion is enabled | `appShellNavigationOptions.test.ts` — "minimizes native stack transitions..." / "minimizes native modal transitions..." | unit | PASS |
| 2 | Default transition options are unchanged when Reduce Motion is off | `appShellNavigationOptions.test.ts` — existing default-option tests | unit | PASS |
| 3 | `AppNavigator` forwards the OS setting into stack and modal option builders | `appShellPlatformBehavior.test.tsx` — "passes Reduce Motion into native stack and modal transition options" | integration | PASS |
| 4 | Absence of the OS setting keeps default option calls | `appShellPlatformBehavior.test.tsx` — "does not alter transition options when Reduce Motion is disabled" | integration | PASS |
| 5 | The authenticated shell applies the platform-reported top inset without changing brand styling | `appShellPlatformBehavior.test.tsx` — "applies the reported top safe-area inset to the authenticated shell" | integration | PASS |

## Implementation notes

- `shellOptions.ts` adds an optional `reduceMotion` flag; when true it adds `animation: 'fade'`, otherwise the option objects are byte-for-byte unchanged (so `formSheet` / `modal` presentation and swipe-down dismissal keep their native behavior).
- `AppNavigator.tsx` calls `useReduceMotion()` and `useSafeAreaInsets()` and applies `paddingTop: insets.top` to the branded shell root (`testID="app-shell-root"`). Native stack chrome stays hidden; `StandardHeader` and the night footer remain the only visible navigation surfaces.
- No visual restyle, no HIG/M3 adaptation, no new dependency (per §3 and §9.1).

## Coverage and gaps

- `npm run test:coverage`: All files 75.76% statements / 71.21% branches / 70.86% funcs / 76.13% lines. `shellOptions.ts` is 100% on all measures; `AppNavigator.tsx` is 75.71% statements. The repo-wide 80% target is not yet met and is tracked separately; this change does not lower it.
- Device check: the Android emulator was inspected through the device accessibility tools after the change (standard shell rendered normally, branded header visible). Maestro E2E was not re-run: its Android driver is currently stuck and clearing it requires an emulator reboot, which is out of scope per user instruction.
- iOS-specific behavior (edge swipe, form-sheet swipe-down) remains covered by native navigation primitives plus the existing Add Offer dismiss guard; it has not been re-verified on a simulator in this increment.
- Remaining §9.4 items not changed here because no Approved spec requires a code change: lifecycle/background-foreground handling, screen-reader focus on navigation (focus return/announcements already exist for dialogs and status), auth-screen keyboard behavior. These need their own spec decision before code.
