# TDD evidence: Google Maps directions preview mode (APP.MAP.STACK.001-R8)

## Source
Specs updated before code: `APP.MAP.STACK.001` v1.1 (R8), `OFFERS.MAP.001` v1.9 (R8/R9), `APP.NAVIGATION.MODE.001` v0.2 (R5), with matching BDD scenarios in `bdd/app-map-stack.feature`, `bdd/app-navigation-mode.feature` and the inline acceptance criteria of `OFFERS.MAP.001`.

## User journeys
- As a user who selected Pedestrian, I want directions to open Google Maps with a walking route preview instead of starting driving navigation.
- As a user who selected Car, I want the same preview with driving mode.

## RED / GREEN evidence

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- maps.test` | 1 suite failed, 3 tests failed / 2 passed — Android and iOS still used auto-navigation deep links |
| GREEN | same command | 1 suite passed, 5 tests passed |
| Full suite | `npm test` | 65 suites, 403 tests passed |
| Typecheck | `npm run typecheck` | passed |
| Coverage | `npm run test:coverage` | All files: 82.23% statements, 74.49% branches, 81.79% functions, 82.03% lines; 403 tests passed |

Checkpoint commits on `dev`:
- `b6996e4` — `test: add RED reproducer for Google Maps directions preview mode (APP.MAP.STACK.001-R8)`
- `57d56b8` — `fix: open Google Maps directions preview in the selected travel mode (APP.MAP.STACK.001-R8)`

No refactor commit was needed; the implementation is 15 lines shorter than before.

## Test guarantees

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | Pedestrian opens `travelmode=walking` URL | `maps.test.ts:opens the Google Maps directions URL for pedestrian mode` | PASS |
| 2 | Android uses the preview URL, not `google.navigation:` | `maps.test.ts:opens the directions preview in walking mode on Android without auto-navigation` | PASS |
| 3 | Car opens `travelmode=driving` URL on Android | `maps.test.ts:opens the directions preview in driving mode on Android for car` | PASS |
| 4 | iOS uses Google Maps URL, not `maps://` | `maps.test.ts:opens the Google Maps directions URL on iOS instead of a native maps app URL` | PASS |
| 5 | Retired redirect-provider setting is ignored | `maps.test.ts:ignores an alternate redirect provider setting` | PASS |

## Coverage and known gaps
- Branch coverage (74.49%) remains below 80% repo-wide; unchanged by this work.
- Whether Android resolves the HTTPS URL to the installed Google Maps app depends on the device's app links; a browser fallback is acceptable per `OFFERS.MAP.001-R9`.
- No E2E/device verification was run for the external app launch.

## Merge evidence
The RED and GREEN checkpoints are reachable from `HEAD` on `dev`.
