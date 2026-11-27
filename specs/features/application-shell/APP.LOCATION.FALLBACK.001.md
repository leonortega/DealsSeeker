# Spec: `APP.LOCATION.FALLBACK.001`

## Metadata
- **Title**: No location-bound search without a usable position
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
When no usable device position and no explicit developer override exist, do not search a substitute area or fabricate a map center; show only the honest no-position state defined in `APP.LOCATION.UNAVAILABLE.001`.

## Supersedes / scope note
Version 2.0 removes the former approximate-area fallback and its explicit "browse this area" choice. There is no substitute area to disclose, keep, or browse. This spec owns the prohibition on a location-bound search and on fabricated location context; the shared presentation of the no-position condition is owned by `APP.LOCATION.UNAVAILABLE.001`.

## Preconditions
- The user is on the Offers view.
- No usable device position can be obtained.
- No explicit developer override from `APP.LOCATION.DEV.001` is configured.

## Trigger
- The Offers view resolves the user's position before running a location-bound search.

## Requirements
- `APP.LOCATION.FALLBACK.001-R1`: When neither a usable device position nor an explicit developer override is available, the system shall not run a location-bound offers search.
- `APP.LOCATION.FALLBACK.001-R2`: Under the same condition, the system shall not fabricate, select, cache, or display any fallback map center or substitute coordinate.
- `APP.LOCATION.FALLBACK.001-R3`: Under the same condition, the system shall present exactly one no-position state, as defined in `APP.LOCATION.UNAVAILABLE.001`, with a retry action and no option to browse a substitute area.
- `APP.LOCATION.FALLBACK.001-R4`: Permission denial, a disabled provider, a lookup failure, and a timeout shall each lead to that same no-position state; no distinct approximate-area state shall exist.
- `APP.LOCATION.FALLBACK.001-R5`: When a usable device position or an explicit developer override becomes available, the system shall run the location-bound search with that position in place of the no-position state.
- `APP.LOCATION.FALLBACK.001-R6`: If a retry does not obtain a position, the system shall remain in the no-position state, show a plain-language failure, and keep the retry action available.
- `APP.LOCATION.FALLBACK.001-R7`: No area label shown during the no-position state shall describe a substitute or approximate area as the user's current location.
- `APP.LOCATION.FALLBACK.001-R8`: Raw coordinate values shall not appear in the no-position state or in any associated area label.
- `APP.LOCATION.FALLBACK.001-R9`: The behavior shall be identical in the standard and immersive Offers presentations.
- `APP.LOCATION.FALLBACK.001-R10`: The no-position state and its retry action shall be localizable and shall hold in both themes.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Denied permission runs no location-bound search
  Given the user has denied location permission
  And no developer location override is configured
  When the Offers view resolves the location
  Then no location-bound offers search is run
  And no approximate-area or substitute-area results are shown

Scenario: Lookup failure runs no location-bound search
  Given location permission is granted
  And the position lookup fails
  When the Offers view resolves the location
  Then no location-bound offers search is run
  And the single no-position state of APP.LOCATION.UNAVAILABLE.001 is displayed

Scenario: No fallback map center is displayed
  Given no usable position can be obtained
  When the Offers view prepares its map context
  Then no fallback map center is fabricated or displayed
  And no substitute coordinate is used for the map or the search

Scenario: No action offers to browse a substitute area
  Given the no-position state is displayed
  When the user reviews its actions
  Then a retry action is available
  And no action to browse an approximate or substitute area is available

Scenario: Retry obtains a position and the search runs
  Given the no-position state is displayed
  When the user selects the retry action
  And a usable device position is obtained
  Then a location-bound offers search runs with that position
  And the no-position state is replaced by the results

Scenario: Retry still fails and the no-position state remains
  Given the no-position state is displayed
  When the user selects the retry action
  And no position can be obtained
  Then a plain-language failure is shown
  And the no-position state and its retry action remain available
  And no results for a substitute area are displayed

Scenario: Explicit developer override is still honored
  Given an explicit developer location override is configured
  And the device cannot provide a position
  When the Offers view resolves the location
  Then a location-bound search runs with the override
  And the no-position state is not displayed

Scenario: Presentation change keeps the same behavior
  Given the no-position state is displayed in the standard Offers view
  When the user switches to the immersive feed
  Then no location-bound search is run
  And no fallback map center is displayed
  And the same no-position state is shown

Scenario: No raw coordinates are exposed
  Given no usable position can be obtained
  When the no-position state and its area label are displayed
  Then no raw latitude or longitude value is visible
```

## Example Inputs/Outputs
- Example input: location permission denied, no developer override configured.
- Expected output: no offers search issued, no map center drawn, one "Location unavailable" state with a Try again action and no numeric coordinates.
- Example input: the user retries and a device position becomes available.
- Expected output: a location-bound search runs for the resolved position and the no-position state is replaced by results.

## Edge Cases
- The position lookup fails after permission was granted.
- A previously cached or remembered position exists but is not usable as a current position.
- The explicit developer override is configured while the device has no position.
- The presentation mode changes while the no-position state is displayed.
- The localized retry label is longer than the source text.
- Large text scaling on a phone-sized screen.

## Non-Functional Constraints
- No substitute coordinate shall be persisted or reused for a later search.
- No "approximate area" or "browse this area" wording shall be presented.
- The no-position state shall not block navigation to other destinations.

## Related Specs
- `APP.LOCATION.UNAVAILABLE.001`
- `OFFERS.GUEST.001`
- `APP.LOCATION.QUERY.001`
- `APP.RESILIENCE.UX.001`
- `APP.LOCATION.DEV.001`
- `APP.LOCATION.DEVICE.001`
- `APP.SHELL.001`
- `APP.LOCALIZATION.001`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.SEARCH.001`
- `OFFERS.UX.001`
- `APP.ONBOARD.001`
