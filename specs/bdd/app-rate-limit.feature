Feature: Request rate limiting
  As a service operator
  I want per-caller request allowances
  So that a single caller cannot monopolise the API

  Scenario: Request exceeding the caller allowance is rejected
    Given a caller has already consumed its request allowance for an endpoint category
    When the caller issues one further request in that category
    Then the system shall respond with HTTP status 429
    And the response shall include a Retry-After header stating how long to wait
    And the response body shall use the standard error object shape

  Scenario: Request below the caller allowance is unaffected
    Given a caller is within its request allowance for an endpoint category
    When the caller issues a request in that category
    Then the system shall respond with the normal success response
    And the request shall not be rejected

  Scenario: Allowance is applied per caller identity
    Given caller A has exhausted its request allowance
    And caller B is within its request allowance
    When caller A issues a request
    Then the request from caller A shall be rejected with HTTP status 429
    And a request issued by caller B shall not be rejected

  Scenario: Expensive operations have a tighter allowance
    Given offer search and location lookup have a tighter request allowance than other API endpoints
    When a caller exceeds the allowance for offer search
    Then the request shall be rejected with HTTP status 429
    And a request from the same caller to a non-expensive endpoint within its allowance shall not be rejected

  Scenario: Rejected request performs no work
    Given a caller has exhausted its request allowance
    When the caller issues a request that would create data
    Then the request shall be rejected with HTTP status 429
    And no data shall be written or changed
