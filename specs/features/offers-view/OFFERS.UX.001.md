# Spec: `OFFERS.UX.001`

## Metadata
- **Title**: Recoverable no-results and empty discovery states
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Ensure that an empty discovery result explains why nothing was found and gives the user an immediate next action.

## Preconditions
- User is in the Offers view.
- A search has completed successfully and returned no offers.

## Trigger
- The offer result set is empty after a successful search.

## Requirements
- `OFFERS.UX.001-R1`: When a search returns no offers while a query or a favorites filter is active, the system shall display a message stating that no offers matched and an action to clear the active filters.
- `OFFERS.UX.001-R2`: Selecting the clear-filters action shall reset the query and the favorites filter, keep the current coverage radius, and re-run the search.
- `OFFERS.UX.001-R3`: When a search returns no offers and no query or favorites filter is active, the system shall display an empty-state message and an action to create the first offer.
- `OFFERS.UX.001-R4`: Selecting the create-first-offer action shall open the Add Offer view.
- `OFFERS.UX.001-R5`: The no-results state shall be presented in both the standard Offers view and the immersive feed.
- `OFFERS.UX.001-R6`: The message and action labels shall follow the active theme and localization.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Filtered search with no results offers to clear filters
  Given the user is on the Offers view
  And a query is active
  When a search completes with no matching offers
  Then a message states that no offers matched the current filters
  And an action to clear the active filters is available

Scenario: Clearing filters re-runs the search with the current radius
  Given the no-results state is displayed for an active query
  And the current coverage radius is 1000 meters
  When the user selects the clear-filters action
  Then the query and favorites filter are reset
  And a new search is executed using the 1000 meter radius
  And available offers are displayed

Scenario: No offers at all offers to create the first offer
  Given the user is on the Offers view
  And no query or favorites filter is active
  When a search completes with no offers
  Then an empty-state message is displayed
  And an action to create the first offer is available
  When the user selects that action
  Then the Add Offer view is opened

Scenario: Immersive feed presents the same recoverable empty state
  Given the immersive offers feed is active
  When a search completes with no offers
  Then an empty-state message is displayed in the feed
  And a recovery action is available
```

## Example Inputs/Outputs
- Example input: query `coffee`, search returns zero offers.
- Expected output: "No offers matched the current filters." plus a "Clear filters" action.

## Edge Cases
- Favorites-only filter active with no matching favorites.
- Empty result while the coverage radius is at its maximum.
- Localized labels expand beyond the English text without clipping.
- Empty state is shown while the dark theme is active.

## Non-Functional Constraints
- The recovery action shall be reachable with a single activation on a phone-sized screen.

## Related Specs
- `OFFERS.SEARCH.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.NAV.ADD.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.LOCATION.FALLBACK.001`
- `OFFERS.UX.002`
- `APP.ONBOARD.001`
