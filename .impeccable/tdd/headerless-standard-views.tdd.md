# TDD evidence — headerless standard views

- **Date**: 2026-11-25
- **Spec**: `APP.SHELL.005` (Approved) — global application header removed from standard views
- **BDD**: `specs/bdd/app-shell-headerless.feature`
- **Scope decision**: only the shared `StandardHeader` was removed; the immersive feed's top bar, its controls, and the Offers mode/help controls remain unchanged.

## User journey

As an authenticated user, I want each view to show only its own heading and content, so navigation is cleaner and less redundant.

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- --runInBand presentationMode secondaryScreens accountAndOfferCard addOfferScreen presentationComponents` | 4 suites / 5 tests failed: `queryByText('app.title')` found the Georgia 28 brand `Text` rendered by `StandardHeader` in Offers, Favorites, Suggestions, Account and Add Offer. |
| GREEN | same command | 5 suites / 44 tests passed. |
| GREEN | `npm test -- --runInBand` | 64 suites / 369 tests passed. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | Naming conventions OK (62 files); no dependency violations (80 modules, 256 dependencies). |
| Coverage | `npm run test:coverage -- --runInBand` | 81.79% statements / 74.18% branches / 81.02% funcs / 81.56% lines. |

## Guarantee table

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Standard Offers view has no brand header and keeps its mode/help controls | `presentationMode.test.tsx` — "offers Feed and Map options in the Offers view" | unit | PASS |
| 2 | Favorites view has no brand header and keeps its own title and list | `secondaryScreens.test.tsx` — "loads and lists favorite offers..." | unit | PASS |
| 3 | Suggestions view has no brand header and keeps its form | `secondaryScreens.test.tsx` — "submits a trimmed suggestion..." | unit | PASS |
| 4 | Account view has no brand header and keeps its settings controls | `accountAndOfferCard.test.tsx` — "shows a change affordance on each settings control" | unit | PASS |
| 5 | Add Offer view has no brand header and keeps its own title and form | `addOfferScreen.test.tsx` — "shows the add-offer form with its required sections" | unit | PASS |

## Implementation notes

- Deleted `src/components/StandardHeader.tsx` and its six render sites across the five standard screens.
- Removed obsolete `jest.mock(...StandardHeader...)` stubs from seven screen test files; those tests now exercise the real view top-level layout.
- Reconciled every spec/BDD/decision reference that asserted a standard or branded header: the immersive floating header and the Offers local controls remain as specified.
- Native navigation headers were already hidden via `shellOptions.ts`; that remains unchanged.

## Coverage and gaps

- Branch coverage (74.18%) is below the 80% target; this is pre-existing in modules untouched by this change.
- Device E2E was not run (per user instruction: never run E2E). The Maestro flows contain no header assertions, so app-shell-headerless BDD scenarios are covered only at unit level here.
- Historical docs under `docs/plans/` and `.impeccable/tdd/` still mention `StandardHeader` as a past design decision; they were intentionally left as dated records.
