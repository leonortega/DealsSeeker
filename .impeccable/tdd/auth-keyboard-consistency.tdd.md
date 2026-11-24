# TDD evidence — authentication keyboard consistency

- **Date**: 2026-11-24
- **Source spec**: `specs/features/my-account-view/ACCOUNT.AUTH.KEYBOARD.001.md` (Approved)
- **BDD**: `specs/bdd/account-auth-keyboard.feature`
- **Constraint honored**: no new E2E flow added and no E2E run performed.

## User journeys

1. As a user signing in, I want the focused field to stay visible while the on-screen keyboard is open so I can complete the form.
2. As a user creating an account, I want the same platform-appropriate keyboard behavior as the login form so the app behaves consistently.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- authScreens.test.tsx` | 1 suite / 2 tests failed: auth keyboard views had no stable hook and the helper was never called (hardcoded `behavior="padding"`). |
| GREEN | `npm test` | 55 suites / 320 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (55 files); no dependency violations (70 modules, 236 dependencies). |

## Guarantee table

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Login delegates keyboard strategy to the shared platform policy for iOS | `authScreens.test.tsx` — "delegates Login ... for iOS" | unit | PASS |
| 2 | Create User delegates the same policy for iOS | `authScreens.test.tsx` — "delegates Create User ... for iOS" | unit | PASS |
| 3 | Login delegates the platform policy for Android | `authScreens.test.tsx` — "delegates Login ... for Android" | unit | PASS |
| 4 | Create User delegates the platform policy for Android | `authScreens.test.tsx` — "delegates Create User ... for Android" | unit | PASS |
| 5 | The shared helper itself maps iOS → `padding`, other OS → `height` | `addOfferKeyboard.test.tsx` — existing helper tests | unit | PASS |
| 6 | Validation, submission and messaging remain unchanged | `authScreens.test.tsx` — existing login/register scenarios | unit | PASS |

## Implementation notes

- `LoginScreen` and `RegisterScreen` now call `keyboardAvoidanceBehavior(Platform.OS)`, the same helper used by Add Offer, Suggestions and Reports. No new dependency, no visual change, no new abstraction.
- Temporary testIDs were removed once the tests were switched to verifying the delegation directly with a spy; no dead hooks remain.

## Coverage and gaps

- `npm run test:coverage`: All files 75.76% statements / 71.21% branches / 70.86% funcs / 76.13% lines — unchanged by this fix; the repo-wide 80% target remains an open item.
- Device verification was intentionally skipped per instruction (no new E2E tests or runs).
- Behavior on a real device with a hardware keyboard or a large text scale is covered only by the helper's unit tests and the existing design; it is not claimed as device-verified here.
