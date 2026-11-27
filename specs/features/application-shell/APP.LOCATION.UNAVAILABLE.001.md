# Spec: `APP.LOCATION.UNAVAILABLE.001`

## Metadata
- **Title**: Shared no-position state across Offers and Favorites
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (standard and immersive presentations), My Favorites
- **Priority**: High

## Purpose
Give one honest, recoverable state when no usable position exists, so no view shows results or a map center for a place the user did not choose.

## Preconditions
- No usable device position can be obtained and no explicit developer override is configured.
- The user is in the Offers view or in My Favorites.
- No location-bound results are available to display.

## Trigger
- The app requires a position to present location-bound content and cannot obtain one.

## Requirements
- `APP.LOCATION.UNAVAILABLE.001-R1`: When no usable position is available, the system shall present one no-position state stating that the current location is unavailable, in place of results.
- `APP.LOCATION.UNAVAILABLE.001-R2`: While that state is active, the system shall show no offers as if they were results for the user's area or for a substitute area.
- `APP.LOCATION.UNAVAILABLE.001-R3`: The system shall not fabricate, display, or persist any fallback map center or substitute coordinate while that state is active.
- `APP.LOCATION.UNAVAILABLE.001-R4`: The state shall offer a single recovery action that retries obtaining the position.
- `APP.LOCATION.UNAVAILABLE.001-R5`: The same state shall be used in the standard Offers view, the immersive feed, and My Favorites.
- `APP.LOCATION.UNAVAILABLE.001-R6`: In My Favorites, the system shall show no results instead of a substitute set while the state is active, and shall leave the saved set unchanged.
- `APP.LOCATION.UNAVAILABLE.001-R7`: The state and its recovery action shall be announced to assistive technology, including that the location is unavailable and that a retry is available.
- `APP.LOCATION.UNAVAILABLE.001-R8`: The state shall not expose raw `lat` or `lng` values.
- `APP.LOCATION.UNAVAILABLE.001-R9`: The state and its action shall follow the active theme and localization.
- `APP.LOCATION.UNAVAILABLE.001-R10`: When a retry obtains a usable position, the system shall leave the state and display the results for that position in the current view.
- `APP.LOCATION.UNAVAILABLE.001-R11`: If a retry does not obtain a position, the system shall keep the state, show a plain-language failure, and keep the retry action available.
- `APP.LOCATION.UNAVAILABLE.001-R12`: The state shall offer a contextual help affordance that opens the relevant help topic as defined in `APP.HELP.CONTEXTUAL.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Standard Offers shows the no-position state
  Given no usable position can be obtained
  When the standard Offers view loads
  Then one no-position state is displayed in place of results
  And no substitute-area offers are displayed
  And no map center is fabricated

Scenario: Immersive feed shows the same no-position state
  Given no usable position can be obtained
  When the immersive offers feed loads
  Then the same no-position state is displayed
  And no results are shown for a fabricated coordinate

Scenario: My Favorites shows no results and the same state
  Given no usable position can be obtained
  When the user opens My Favorites
  Then the no-position state is displayed
  And no saved offers are listed as results for a substitute area
  And the saved set is unchanged

Scenario: Denied position leads to the state without fabricated coordinates
  Given location permission is denied
  When the app requires a position for discovery
  Then the no-position state is displayed
  And no fallback coordinate or map center is used

Scenario: Position lookup failure leads to the state
  Given the position lookup fails
  When the app requires a position for discovery
  Then the no-position state is displayed with no results

Scenario: Retry succeeds in Offers
  Given the no-position state is displayed in the Offers view
  When the user selects the retry action
  And a usable position is obtained
  Then the state is replaced by results for that position

Scenario: Retry succeeds in My Favorites
  Given the no-position state is displayed in My Favorites
  When the user selects the retry action
  And a usable position is obtained
  Then the state is replaced by the saved offers for that position
  And the saved set is unchanged

Scenario: Retry fails and the state remains
  Given the no-position state is displayed
  When the user selects the retry action
  And no position can be obtained
  Then a plain-language failure is shown
  And the state and its retry action remain available

Scenario: State is announced to assistive technology
  Given the no-position state is displayed
  When assistive technology reads the view
  Then it announces that the location is unavailable
  And it exposes the retry action

Scenario: State exposes no raw coordinates
  Given the no-position state is displayed
  When the state and its actions are shown
  Then no raw latitude or longitude value is visible

Scenario: Contextual help opens from the state
  Given the no-position state is displayed
  When the user selects the contextual help affordance
  Then the help surface opens with the relevant topic first
  And the user remains in the current view
```

## Example Inputs/Outputs
- Example input: permission denied while opening My Favorites.
- Expected output: one "Location unavailable" state with a Try again action, no listed results, no map center, and an assistive-technology announcement of the unavailable location and retry.
- Example input: the user retries and a position is obtained.
- Expected output: the state is replaced by the results for that position in the same view.

## Edge Cases
- The lookup fails after permission was granted.
- Several consecutive retries fail.
- The presentation mode changes while the state is displayed.
- Contextual help is opened from the state and then dismissed.
- Localized state and retry labels are longer than the source text.
- Large text scaling on a phone-sized screen.

## Non-Functional Constraints
- The state shall be visible without scrolling through an empty list.
- The retry action shall be reachable with a single activation.
- No substitute coordinate shall be cached for later use by this state.

## Related Specs
- `APP.LOCATION.FALLBACK.001`
- `APP.RESILIENCE.UX.001`
- `APP.LOCATION.DEVICE.001`
- `APP.LOCATION.DEV.001`
- `OFFERS.GUEST.001`
- `OFFERS.FAVORITES.001`
- `OFFERS.EMPTY.001`
- `OFFERS.SEARCH.001`
- `APP.HELP.CONTEXTUAL.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.LOCALIZATION.001`
