# TDD evidence — lifecycle and destination focus

- **Date**: 2026-11-24
- **Source specs**: `specs/features/application-shell/APP.LIFECYCLE.001.md`, `specs/features/application-shell/APP.ACCESSIBILITY.UX.004.md` (both Approved)
- **BDD**: `specs/bdd/app-lifecycle.feature`, `specs/bdd/app-navigation-focus.feature`
- **Constraint honored**: no new E2E flow added and no E2E run performed.

## Validation changes made before approval

- `APP.LIFECYCLE.001`: removed the low-memory process-restart requirement. Full view-state restoration needs durable storage beyond the session/preferences already persisted, which is a separate capability spec (YAGNI for this increment).
- `APP.ACCESSIBILITY.UX.004`: removed overlay focus confinement/return requirements; they already belong to `APP.ACCESSIBILITY.UX.003`. This spec is now scoped to destination changes only. Also narrowed Back focus return to "destination heading or container", because the OS exposes no API to read the currently focused element.

## User journeys

1. As a user returning to the app after it was suspended, I want an expired session to be detected so I am not shown a stale protected view.
2. As a screen-reader user, I want each destination change to be announced and focus moved to that destination so I always know where I am.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- appContext.test.tsx` | 1 suite / 2 tests failed: `AppState` `active` triggered no session check; invalid session was not detected on resume. |
| RED | `npm test -- appDestinationFocus.test.tsx` | Test suite failed to run: `useDestinationFocus` module did not exist. |
| GREEN | `npm test` | 56 suites / 328 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (56 files); no dependency violations (71 modules, 240 dependencies). |

## Guarantee table

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Returning to the foreground revalidates the session | `appContext.test.tsx` — "revalidates the session when the app returns to the foreground" | unit | PASS |
| 2 | A no-longer-valid session returns to login, clears storage and exposes a localized notice | `appContext.test.tsx` — "returns to login with a message when the foreground session is no longer valid" | unit | PASS |
| 3 | A network failure during revalidation does not discard a valid session | `appContext.test.tsx` — "keeps the session when the foreground check cannot reach the API" | unit | PASS |
| 4 | Destinations map to localized labels, including overlays | `appDestinationFocus.test.tsx` — "maps destinations to their localized labels" | unit | PASS |
| 5 | A destination change is announced | `appDestinationFocus.test.tsx` — "announces the destination when it changes" | unit | PASS |
| 6 | Back to a previous destination is announced | `appDestinationFocus.test.tsx` — "announces the restored destination when Back returns to Offers" | unit | PASS |
| 7 | Re-activating the same destination produces no duplicate announcement | `appDestinationFocus.test.tsx` — "does not repeat an announcement for the same destination" | unit | PASS |
| 8 | Focus moves to the destination container | `appDestinationFocus.test.tsx` — "moves focus to the destination container" | unit | PASS |

## Implementation notes

- `AppProvider` subscribes to `AppState` only while bootstrapped and authenticated, using the raw API client (not the cached `api.getMyProfile`) so the check reaches the server. A `null` profile means unauthorized; a thrown error is ignored so offline use keeps the session.
- The unauthorized path sets a translation-key notice (`account.sessionExpired`) that `LoginScreen` renders with a polite live region.
- `useDestinationFocus` announces the localized destination and moves focus to the shell container via `AccessibilityInfo`, guarded against duplicate announcements. A handle resolver is injectable only to make focus placement testable; production uses `findNodeHandle`.

## Coverage and gaps

- `npm run test:coverage`: All files 76.41% statements / 71.54% branches / 71.47% funcs / 76.76% lines — up from 75.76% statements, still below the repo-wide 80% target.
- No device verification was performed, per instruction. TalkBack/VoiceOver behavior on a real device remains unverified.
- `APP.SHELL.001-R7` (successful contribution redirect) and the two tracked E2E gaps are unchanged by this work.
- Low-memory process restoration and full originating-control focus return are explicitly out of scope per the validation notes above and need their own specs.
