# Spec: `APP.LOCATION.PROVIDER.RESILIENCE.001`

## Metadata
- **Title**: Photon Location Lookup Resilience
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define how the sole geocoding provider, Photon, reports outages, empty results, and cached results.

## Preconditions
- The app API is configured to reach Photon.
- The system can distinguish "provider failure" from "no results found".

## Trigger
- A location lookup request (place text or coordinate reverse lookup).

## Requirements
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R1`: When Photon is unavailable, times out, or returns a failure, the system shall respond with HTTP status `503` using the standard error object shape defined in `APP.VALIDATION.001`.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R2`: The `503` response shall distinguish "provider unavailable" from "no results found".
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R3`: When Photon succeeds but finds nothing, the system shall respond with HTTP status `200` and an empty result collection; this outcome shall not be treated as a provider failure.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R4`: The system shall reuse previously obtained results for an identical lookup for a bounded period, so repeated identical lookups do not generate repeated Photon calls beyond the caching policy.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R5`: A missing Photon configuration shall be reported as a configuration error, and the lookup shall not succeed.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R6`: No alternate geocoding provider or fallback provider shall be attempted.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Photon failure yields a service unavailable response
  Given Photon is unavailable, times out, or returns a failure
  When a location lookup is requested
  Then the system shall respond with HTTP status 503
  And the response body shall use the standard error object shape
  And the error shall report provider unavailability rather than no results

Scenario: Photon succeeds without matches
  Given Photon is available and finds no matching location
  When a location lookup is requested
  Then the system shall respond with HTTP status 200
  And the result collection shall be empty
  And the lookup shall not be reported as a provider failure

Scenario: Identical lookup reuses a previously obtained result
  Given a location lookup for a given query has already been resolved
  When an identical lookup is requested again within the bounded reuse period
  Then the system shall reuse the previously obtained result
  And no additional Photon call shall be generated beyond the caching policy allowance

Scenario: Missing Photon configuration is a configuration error
  Given Photon is not configured for the location lookup
  When a location lookup is requested
  Then the system shall report a configuration error
  And the lookup shall not succeed

Scenario: No alternate provider is attempted
  Given Photon fails
  When a location lookup is requested
  Then no other geocoding service shall be contacted
```

## Example Inputs/Outputs
- Example input: A lookup for `central market` where Photon is unavailable.
- Expected output: HTTP `503` with a standard error object reporting provider unavailability — see `examples/application-shell/app-location-provider.all-failed.json`.
- Example input: A lookup that matches nothing.
- Expected output: HTTP `200` with an empty result collection — see `examples/application-shell/app-location-provider.no-results.json`.

## Edge Cases
- Photon times out rather than returning an explicit failure.
- The identical lookup is repeated after the bounded reuse period has elapsed.
- A cached result exists while Photon is unreachable.
- Photon returns a malformed response.

## Non-Functional Constraints
- Provider failure handling shall not leave the lookup pending indefinitely; the configured timeout bounds the wait.
- A "no results" outcome shall never be surfaced as a provider failure, so clients can distinguish empty results from an outage.

## Related Specs
- `APP.VALIDATION.001`
- `APP.MAP.STACK.001`
- `APP.CONFIG.MAPS.001`
- `APP.LOCATION.QUERY.001`
- `ADD.OFFER.LOCATION.001`
