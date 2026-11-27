# Spec: `APP.LOCATION.QUERY.001`

## Metadata
- **Title**: Location Query Debounce, Caching, and Reverse-Geocode Timing
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, Add Offer location, Offers map
- **Priority**: High

## Purpose
Keep Photon fair-use friendly by debouncing place search, reusing results, and resolving addresses only when a gesture finishes.

## Preconditions
- The user can type into a location input or move a mini map that supports pin placement.

## Trigger
- Typing in a location input, tapping a map, ending a map drag, or receiving an initial device position.

## Requirements
- `APP.LOCATION.QUERY.001-R1`: A place search shall start only after a short quiet period following the last input, as defined by `APP.SEARCH.INTERACTION.001`.
- `APP.LOCATION.QUERY.001-R2`: Search results shall be cached for a bounded period so that repeating an identical query does not call Photon again during that period; this applies on the device and at the app API.
- `APP.LOCATION.QUERY.001-R3`: An in-flight lookup for a superseded query shall be abandoned and its result shall never be displayed.
- `APP.LOCATION.QUERY.001-R4`: Reverse geocoding shall occur only on discrete completion events: the initial device position, a completed map tap, a completed map drag, and an explicit center-pin action.
- `APP.LOCATION.QUERY.001-R5`: Intermediate region changes during a continuous drag shall not issue reverse-geocode requests.
- `APP.LOCATION.QUERY.001-R6`: Reverse-geocode results shall be cached for a bounded period keyed by the resolved coordinate.
- `APP.LOCATION.QUERY.001-R7`: A lookup failure shall be recoverable and shall leave the current draft location unchanged.
- `APP.LOCATION.QUERY.001-R8`: Raw coordinates shall not be exposed in any user-facing label produced by this flow.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Search waits for a quiet period
  Given the user types a location name character by character
  When characters arrive faster than the quiet period
  Then no lookup is issued until typing stops
  And only one lookup is issued for the final text

Scenario: Repeated identical queries reuse cached results
  Given a place search for a query has already returned results
  When the user searches for the same query again within the cache period
  Then the previously returned results are shown
  And no additional Photon call is made

Scenario: Superseded result is discarded
  Given a lookup is in flight for an earlier query
  When the user changes the query
  Then the earlier result is never shown
  And the current query is looked up after the quiet period

Scenario: Reverse geocoding follows gesture completion
  Given the Add Offer mini map is visible
  When the user drags the map and keeps moving
  Then no reverse-geocode request is issued during the drag
  When the drag ends
  Then one reverse-geocode request is issued for the final center

Scenario: Reverse geocode on a completed tap
  Given the user taps a point on the mini map
  When the tap completes
  Then the pin is placed and one reverse-geocode request is issued for that point

Scenario: Initial position is resolved once
  Given the device position arrives when Add Offer opens
  When the label has been resolved
  Then no further reverse-geocode request is issued until a gesture completes

Scenario: Failed lookup keeps the draft location
  Given a location is selected for the draft
  When the geocoding service fails
  Then an error with a retry path is shown
  And the draft location is unchanged
```

## Example Inputs/Outputs
- Example input: The user types `cof`, then `coff`, then `coffee` quickly, then repeats `coffee` later.
- Expected output: One Photon call for `coffee` after the quiet period; the later repeat is served from cache.

## Edge Cases
- Empty or very short input.
- Identical query repeated after the cache period elapses.
- A tap arriving while a previous reverse lookup is in flight.
- A drag that ends at the same coordinate as an already cached reverse lookup.
- Cached result present while Photon is unavailable.

## Non-Functional Constraints
- Search and reverse caching shall be bounded in size and lifetime so stale addresses do not persist indefinitely.

## Related Specs
- `APP.LOCATION.UNAVAILABLE.001`
- `APP.SEARCH.INTERACTION.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
- `APP.MAP.STACK.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.LOCATION.002`
- `ADD.OFFER.LOCATION.003`
- `APP.LOCATION.FALLBACK.001`
