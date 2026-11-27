# Spec: `APP.RESILIENCE.UX.001`

## Metadata
- **Title**: Visible and recoverable offers search failure
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Ensure that a failed offers search is visible where the user is working and can be retried without leaving the view.

## Preconditions
- User is in the Offers view.
- A search request has been issued.

## Trigger
- The offers search request fails or the device has no network connectivity.

## Requirements
- `APP.RESILIENCE.UX.001-R1`: When an offers search fails, the system shall display an error message in the active view, near the search controls, stating that the search failed and advising the user to check connectivity.
- `APP.RESILIENCE.UX.001-R2`: The error message shall be presented in both the standard Offers view and the immersive feed.
- `APP.RESILIENCE.UX.001-R3`: The error state shall provide a Retry action that re-runs the search with the current query, coverage radius, and favorites filter.
- `APP.RESILIENCE.UX.001-R4`: A successful search after a failure shall clear the error message.
- `APP.RESILIENCE.UX.001-R5`: The error message shall use plain language and shall not expose an internal status code as the primary message.
- `APP.RESILIENCE.UX.001-R6`: The error message and Retry label shall follow the active theme and localization.
- `APP.RESILIENCE.UX.001-R7`: Feedback about other failed actions, such as favorites or votes, shall remain distinct from the search-failure state.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Failed search shows an actionable error near the search controls
  Given the user is on the Offers view
  When the offers search request fails
  Then an error message is displayed near the search controls
  And the message states that the search failed and advises checking connectivity
  And a Retry action is available

Scenario: Retry re-runs the search and clears the error on success
  Given the search-failure error is displayed
  And the current query is "coffee" with a radius of 1500 meters
  When the user selects the Retry action
  Then a new search is executed with that query and radius
  And when the search succeeds the error message is cleared

Scenario: Immersive feed presents the search failure
  Given the immersive offers feed is active
  When the offers search request fails
  Then an error message and a Retry action are displayed in the feed

Scenario: Search failure message uses plain language
  Given the offers search request failed
  When the error message is displayed
  Then no internal status code is shown as the primary message

Scenario: Favorite failure does not display the search-failure state
  Given the offers search succeeded
  When changing a favorite fails
  Then a favorite-specific message is displayed
  And the search-failure error state is not displayed
```

## Example Inputs/Outputs
- Example input: search request rejected due to offline device.
- Expected output: "Offers search failed." with hint "Check your connection and try again." and a "Retry" action.

## Edge Cases
- Failure while a previous successful result set is still visible.
- Repeated failures across multiple retries.
- Error message text expanded by localization.
- Dark theme active during the error state.

## Non-Functional Constraints
- The error state shall be visible without scrolling through the full offer list.

## Related Specs
- `OFFERS.EMPTY.001`
- `APP.API.CONNECTIVITY.001`
- `APP.SEARCH.INTERACTION.001`
- `OFFERS.SEARCH.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.UX.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.LOCATION.FALLBACK.001`
- `APP.LIFECYCLE.001`
