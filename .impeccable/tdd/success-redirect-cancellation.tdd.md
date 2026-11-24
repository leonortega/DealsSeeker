# TDD evidence — success redirect and stale-timer fix

- **Date**: 2026-11-24
- **Spec**: `APP.SHELL.001.md` R7 (Approved) — new edge case and BDD scenario added before code
- **BDD**: `specs/bdd/app-shell.feature`
- **Constraint honored**: no E2E test added and no E2E run performed.

## Finding

`APP.SHELL.001-R7` (successful Suggestion/Report submission redirects to Offers) was **already implemented** in commit `110070d` as a 900 ms delayed `openTab('offers')`, with unit coverage in `secondaryScreens.test.tsx`. The delay keeps the success confirmation perceivable before the transition, per `APP.ACCESSIBILITY.UX.003-R6`. The earlier "stays on the form" observation was an E2E assertion taken before the delay elapsed, not a missing redirect.

The real defect was that the pending timer was never cancelled: navigating away within 900 ms still yanked the user to Offers. That is what this change fixes.

## User journey

As a user who submits a suggestion or report and immediately navigates elsewhere, I want my chosen destination to stay put so a delayed success redirect does not override my action.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- secondaryScreens.test.tsx` | 1 suite / 2 tests failed: `openTab('offers')` called once after the user had already switched to Reports/Account. |
| GREEN | `npm test` | 56 suites / 330 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (57 files); no dependency violations (72 modules, 243 dependencies). |
| Coverage | `npm run test:coverage` | All files 76.58% statements / 71.71% branches / 71.66% funcs / 76.95% lines (up from 76.41%). |

## Guarantee table

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | A successful suggestion still shows success then redirects to Offers | `secondaryScreens.test.tsx` — existing "submits a trimmed suggestion..." | unit | PASS |
| 2 | A successful report still shows success then redirects to Offers | `secondaryScreens.test.tsx` — existing "submits a report, clears the draft..." | unit | PASS |
| 3 | A failed submission never redirects | `secondaryScreens.test.tsx` — existing failure tests | unit | PASS |
| 4 | Leaving Suggestions before the delay cancels the redirect | `secondaryScreens.test.tsx` — new "cancels the pending Offers redirect..." | unit | PASS |
| 5 | Leaving Reports before the delay cancels the redirect | `secondaryScreens.test.tsx` — new "cancels the pending Offers redirect..." | unit | PASS |

## Implementation notes

- New `useDelayedOffersRedirect(activeTab, screenTab, openTab)` hook owns the 900 ms timer, cancels it when the active tab differs from the screen's tab, and clears it on unmount.
- Both screens call the hook and invoke `redirectAfterSuccess()` instead of scheduling `setTimeout` themselves; no other behavior changed.
- The 900 ms delay is deliberately unchanged so the success message stays perceivable before navigation.

## Coverage and gaps

- Repo-wide coverage remains below the 80% target (76.58%).
- No device verification was performed, per instruction. Whether 900 ms is long enough to perceive the confirmation on a real device is not re-verified here.
- The E2E flows still assert the success message immediately after submit; they were intentionally left untouched.
