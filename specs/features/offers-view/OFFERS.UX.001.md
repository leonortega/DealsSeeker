# Spec: `OFFERS.UX.001`

## Metadata
- **Title**: Recoverable no-results and empty discovery states
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Keep an empty discovery result quiet in the unfiltered case, while still explaining filtered no-results and offering a way to clear them.

## Preconditions
- User is in the Offers view.
- A search has completed successfully and returned no offers.

## Trigger
- The offer result set is empty after a successful search.

## Requirements
- `OFFERS.UX.001-R1`: When a search returns no offers while a query or a favorites filter is active, the system shall display a message stating that no offers matched and an action to clear the active filters.
- `OFFERS.UX.001-R2`: Selecting the clear-filters action shall reset the query and the favorites filter, keep the current coverage radius, and re-run the search.
- `OFFERS.UX.001-R3`: When a search returns no offers and no query or favorites filter is active, the system shall not display an empty-state card; the Offers controls and map shall remain usable without a creation prompt.
- `OFFERS.UX.001-R5`: The filtered no-results state shall be presented in the standard Offers view; the immersive feed shall keep its own uncluttered empty surface.
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

Scenario: No offers at all shows no empty-state card
  Given the user is on the Offers view
  And no query or favorites filter is active
  When a search completes with no offers
  Then no empty-state message or creation prompt is displayed
  And the Offers controls and map remain usable

Scenario: Immersive feed keeps an uncluttered empty surface
  Given the immersive offers feed is active
  When a search completes with no offers
  Then no empty-state message is displayed in the feed
```

## Example Inputs/Outputs
- Example input: query `coffee`, search returns zero offers.
- Expected output: "No offers matched the current filters." plus a "Clear filters" action.

## Edge Cases
- Favorites-only filter active with no matching favorites.
- Empty result while the coverage radius is at its maximum.
- Localized labels expand beyond the English text without clipping.
- An unfiltered empty result leaves no message in either presentation.

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
