# Spec: `APP.LOCATION.PROVIDER.RESILIENCE.001`

## Metadata
- **Title**: Map Provider Location Lookup Resilience
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define the behaviour of the map-provider location lookup when the configured provider fails, when no results exist, and when provider configuration is missing.

## Preconditions
- A map provider for the location lookup is configured, together with an optional fallback provider.
- The system is able to distinguish "provider failure" from "no results found".

## Trigger
- A location lookup request (for example, a place or address text lookup, or a coordinate reverse lookup).

## Requirements
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R1`: When the configured map provider is unavailable, times out, or returns a failure, the system shall attempt the configured fallback provider.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R2`: When the fallback provider succeeds, the location lookup shall succeed and the response shall be indistinguishable from a direct provider success.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R3`: When every configured provider fails, the system shall respond with HTTP status `503` using the standard error object shape defined in `APP.VALIDATION.001`.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R4`: The `503` response shall distinguish "provider unavailable" from "no results found".
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R5`: When a provider succeeds but finds nothing, the system shall respond with HTTP status `200` and an empty result collection; this outcome shall not be treated as a provider failure.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R6`: The system shall reuse previously obtained results for an identical lookup for a bounded period, so that repeating an identical lookup does not generate repeated provider calls beyond what the caching policy allows.
- `APP.LOCATION.PROVIDER.RESILIENCE.001-R7`: A missing provider configuration shall be reported as a configuration error, and the lookup shall not succeed.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Configured provider failure triggers the fallback provider
  Given a primary map provider and a fallback provider are configured
  And the primary provider is unavailable, times out, or returns a failure
  When a location lookup is requested
  Then the system shall attempt the fallback provider

Scenario: Fallback provider success is indistinguishable from direct success
  Given the primary provider fails
  And the fallback provider returns results
  When a location lookup is requested
  Then the system shall respond with HTTP status 200 and the results
  And the response shall be indistinguishable from a direct provider success

Scenario: All configured providers failing yields a service unavailable response
  Given a primary map provider and a fallback provider are configured
  And both providers fail
  When a location lookup is requested
  Then the system shall respond with HTTP status 503
  And the response body shall use the standard error object shape
  And the error shall report that the provider is unavailable rather than that there are no results

Scenario: Provider succeeds without matches
  Given the configured map provider is available
  And the provider finds no matching location
  When a location lookup is requested
  Then the system shall respond with HTTP status 200
  And the result collection shall be empty
  And the lookup shall not be reported as a provider failure

Scenario: Identical lookup reuses a previously obtained result
  Given a location lookup for a given query has already been resolved
  When an identical location lookup is requested again within the bounded reuse period
  Then the system shall reuse the previously obtained result
  And no additional provider call shall be generated beyond the caching policy allowance

Scenario: Missing provider configuration is a configuration error
  Given no map provider is configured for the location lookup
  When a location lookup is requested
  Then the system shall report a configuration error
  And the lookup shall not succeed
```

## Example Inputs/Outputs
- Example input: A location lookup for a place text where every configured provider fails.
- Expected output: HTTP `503` with a standard error object reporting provider unavailability — see `examples/application-shell/app-location-provider.all-failed.json`.
- Example input: A location lookup for a place text that matches nothing.
- Expected output: HTTP `200` with an empty result collection — see `examples/application-shell/app-location-provider.no-results.json`.

## Edge Cases
- The fallback provider is not configured at all; the failure is reported directly.
- The primary provider fails but the fallback provider returns an empty result collection.
- The provider times out rather than returning an explicit failure.
- The identical lookup is repeated after the bounded reuse period has elapsed.
- A missing provider configuration combined with an otherwise valid lookup.

## Non-Functional Constraints
- Provider failure handling shall not leave the lookup pending indefinitely; the configured timeout bounds the wait.
- A "no results" outcome shall never be surfaced as a provider failure, so clients can distinguish empty results from an outage.

## Related Specs
- `APP.VALIDATION.001`
- `APP.CONFIG.MAPS.001`
- `ADD.OFFER.LOCATION.001`
