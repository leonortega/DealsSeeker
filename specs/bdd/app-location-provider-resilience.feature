Feature: Photon location lookup resilience
  As a user
  I want location lookups to report failures honestly
  So that I can tell an outage from an empty result

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
