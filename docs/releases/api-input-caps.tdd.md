# TDD evidence: API-aligned input caps (APP.VALIDATION.001-R11)

## Source
Specs updated before code: `APP.VALIDATION.001` (new R11), `ACCOUNT.AUTH.INPUT.001` (R7-R9), `SUGGESTIONS.SUBMIT.001` (R9), `OFFERS.SEARCH.001` (R14), with matching BDD scenarios in `bdd/app-validation.feature`, `bdd/auth-input-affordances.feature`, `bdd/suggestions-submit.feature` and `bdd/offers-search.feature`. Request schemas for login, register, suggestion and offer-search now declare the `maxLength` values already enforced by the API validators.

## User journeys
- As a user entering credentials, contact details or a search query, I want the input to stop at the API maximum so my submission is never rejected for length.
- As a user pasting text, I want the excess truncated rather than sent to the API.

## RED / GREEN evidence

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- authScreens offersDiscoveryStates accessibilitySurfaces secondaryScreens` | 4 suites failed, 5 tests failed / 44 passed — only the new cap assertions failed |
| GREEN | same command | 4 suites passed, 49 tests passed |
| Full suite | `npm test` | 64 suites, 393 tests passed |
| Typecheck | `npm run typecheck` | passed |
| Coverage | `npm run test:coverage` | All files: 82.03% statements, 74.28% branches, 81.62% functions, 81.82% lines; 393 tests passed |

Checkpoint commits on `dev`:
- `a73b9b4` — `test: add RED reproducer for API input caps (APP.VALIDATION.001-R11)`
- `8d9eccf` — `fix: cap all remaining text inputs at API contract maxima (APP.VALIDATION.001-R11)`

No refactor commit was needed; the implementation is 28 added lines across five files.

## Test guarantees

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | Login email capped at 254 and password at 200 | `authScreens.test.tsx:Authentication input caps > caps login email at 254 and password at 200 characters` | PASS |
| 2 | Register display name 80, email 254, password 200 | `authScreens.test.tsx:Authentication input caps > caps register display name at 80, email at 254 and password at 200 characters` | PASS |
| 3 | Standard Offers search capped at 200 | `offersDiscoveryStates.test.tsx:caps the standard search query at 200 characters` | PASS |
| 4 | Immersive search overlay capped at 200 | `accessibilitySurfaces.test.tsx:caps the immersive search input at 200 characters` | PASS |
| 5 | Suggestion contact capped at 254 | `secondaryScreens.test.tsx:SuggestionsScreen > caps the optional contact at 254 characters` | PASS |

## Coverage and known gaps
- Branch coverage (74.28%) remains below 80% repo-wide and is unchanged by this work.
- The immersive overlay is a controlled input: its cap is asserted via the `maxLength` prop; truncation of its parent state is not unit-tested here.
- No device/E2E run was performed for this change.

## Merge evidence
The RED checkpoint records the five failing tests and the GREEN checkpoint the minimal fix; both are reachable from `HEAD` on `dev`.
