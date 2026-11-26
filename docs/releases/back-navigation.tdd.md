# TDD evidence: system Back precedence and exit confirmation (APP.SHELL.001-R17/R18)

## Source
Specs updated before code (and re-approved): `APP.SHELL.001` v2.7, `APP.SHELL.004` v1.1 and `APP.BOTTOM_SHEET.001` v1.3, with matching BDD scenarios in `bdd/app-shell.feature`, `bdd/app-shell-native-behavior.feature` and `bdd/app-bottom-sheet.feature`. The previous requirements that root Back uses platform default without confirmation were replaced by explicit exit confirmation.

## User journeys
- As a user with an overlay open, Back closes that overlay and leaves the underlying view unchanged.
- As a user on any non-Offers view, Back returns to Offers with its state preserved.
- As a user on Offers with nothing open, Back asks whether to exit and exits only on confirmation.

## RED / GREEN evidence

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- backNavigationHandler nativeBottomSheet` | 2 suites failed: new handler suite could not resolve its module; the new sheet Back test failed |
| GREEN | same command | 2 suites passed, 12 tests passed |
| Full suite | `npm test` | 65 suites, 403 tests passed |
| Typecheck | `npm run typecheck` | passed |
| Coverage | `npm run test:coverage` | All files: 82.31% statements, 74.6% branches, 81.81% functions, 82.12% lines; 403 tests passed |

Checkpoint commits on `dev`:
- `fd18b8d` — `test: add RED reproducer for system Back precedence and exit confirmation`
- `00bd2d1` — `fix: add system Back precedence and exit confirmation (APP.SHELL.001-R17/R18)`

No refactor commit was needed.

## Test guarantees

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | An overlay closes before navigation or exit | `backNavigationHandler.test.tsx:closes an overlay before navigating or asking to exit` | PASS |
| 2 | Add Offer dismissal stays with its own discard guard | `backNavigationHandler.test.tsx:leaves Add Offer dismissal to its own discard guard` | PASS |
| 3 | Report sheet closes first | `backNavigationHandler.test.tsx:closes the report sheet before navigating or asking to exit` | PASS |
| 4 | Immersive feed closes before exit | `backNavigationHandler.test.tsx:closes the immersive feed before asking to exit` | PASS |
| 5 | Non-Offers view returns to Offers | `backNavigationHandler.test.tsx:returns to Offers from another view` | PASS |
| 6 | Offers asks confirmation, exit only on confirm | `backNavigationHandler.test.tsx:asks for confirmation on Offers and stays open on cancel`, `...exits only after the user confirms` | PASS |
| 7 | Visible bottom sheet closes on Back | `nativeBottomSheet.test.tsx:closes on system Back while visible` | PASS |

## Coverage and known gaps
- Branch coverage (74.6%) remains below 80% repo-wide and is not caused by this change.
- E2E/device verification was not run; the existing Maestro flow only covers Add Offer's discard-on-Back behavior, whose unit test still passes.
- Favorites overlay dismissal via the root handler closes state only; native stack synchronization remains as before.

## Merge evidence
The RED and GREEN checkpoints are reachable from `HEAD` on `dev`.
