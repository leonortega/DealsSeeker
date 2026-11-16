Feature: Map provider location lookup resilience
  As a user
  I want location lookups to keep working when a map provider fails
  So that I can still find places

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
