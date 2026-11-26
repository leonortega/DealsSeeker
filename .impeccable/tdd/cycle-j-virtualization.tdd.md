# TDD evidence — Cycle J: recycled offer lists (`APP.LIST.VIRTUALIZATION.001`)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` §10.6 (Cycle J).
- Spec: new approved `APP.LIST.VIRTUALIZATION.001` v1.0 with BDD `app-list-virtualization.feature`, traceability row, bidirectional links in `OFFERS.FEED.STABILITY.001`, `OFFERS.GRID.CARDS.001`, `ACCOUNT.PROFILE.001`, `OFFERS.FAVORITES.001`.
- No contracts/examples: rendering behavior with no data shape.

## User journeys
- As a user with many nearby offers, I want the list to stay smooth while I scroll.
- As a contributor managing my offers, I want removal of one row to leave the others unchanged.

## RED / GREEN
- RED: `npm test -- presentationMode.test.tsx secondaryScreens.test.tsx accountAndOfferCard.test.tsx` → 3 suites failed / 4 tests failed, 49 passed:
  - `offers-scroll` had no `data`/`renderItem` (it was a `ScrollView`).
  - `account-scroll` had no `data`/`renderItem`.
  - `favorites-scroll` did not exist.
  - `OfferCard` had no `react.memo` marker.
- GREEN: same command → 3 suites / 53 tests passed.
- Full suite: `npm test` → 68 suites / 412 tests passed; `npm run typecheck` clean.

## What the tests guarantee
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Standard Offers collection renders through a recycling list | `presentationMode.test.tsx:renders standard offers through a recycling list` | unit | PASS |
| 2 | Favorites collection renders through a recycling list with stable offer id | `secondaryScreens.test.tsx:renders favorites through a recycling list` | unit | PASS |
| 3 | Account owned offers render through a recycling list | `accountAndOfferCard.test.tsx:renders owned offers through a recycling list` | unit | PASS |
| 4 | OfferCard is memoized | `accountAndOfferCard.test.tsx:memoizes the row…` | unit | PASS |
| 5 | Existing scroll styling, title clearance and list actions still hold | same suites' pre-existing tests | unit | PASS |

## Implementation
- `OffersScreen.tsx`: `SectionList` with `sections` (promoted, feed), `ListHeaderComponent` for fallback notice/search/map/state panel, `ListFooterComponent` for status, `renderSectionHeader`/`renderItem`. `partitionOffers` and `combinedOffers` are memoized; `combinedOffers` is computed before the immersive early return so hook order stays stable.
- `FavoritesScreen.tsx`, `AccountScreen.tsx`: `ScrollView` → `FlatList` with `ListHeaderComponent`, `ListFooterComponent`, `keyExtractor` and `renderItem`; testIDs preserved.
- `OfferCard.tsx`: implementation renamed to `OfferCardRow`, exported as `memo(OfferCardRow)`.

## Checkpoint commits (on `dev`)
1. `19c0ce7` — `test: add RED reproducer for recycled offer lists`.
2. `aa0a3a4` — `fix: recycle long offer lists and memoize the offer card`.
3. Evidence report commit follows.

## Known gaps
- `AppContext` still rebuilds its provider value each render; global status changes can re-render all consumers. Not addressed in this cycle (would require a careful dependency audit of 12+ callbacks).
- Base64 photo capping in `AddOfferScreen` (up to 8 full-size images) was not implemented; deferred.
- No device scroll-performance measurement and no E2E at the user's request.
- Cosmetic indentation drift inside AccountScreen's `ListHeaderComponent`; behavior and types are unaffected.
