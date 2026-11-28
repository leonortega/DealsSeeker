Feature: Input validation and standard error response
  As a client developer
  I want invalid requests rejected with a standard error object
  So that I can present actionable feedback to the user

  Scenario: Payload violating the request contract is rejected
    Given an operation declares a request contract with field limits
    When the caller submits a payload that violates those limits
    Then the system shall respond with HTTP status 400
    And the response body shall be a standard error object

  Scenario: Field-specific failure lists the offending field
    Given a request contains a field whose value exceeds the declared maximum size
    When the system validates the request
    Then the response body shall contain an errors entry for that field name
    And the entry shall contain a list of human-readable messages

  Scenario: Non field-specific failure carries no field errors
    Given a request fails validation for a reason not tied to a specific field
    When the system responds with the error
    Then the errors member shall be absent or empty
    And the error object shall still contain type, title, status and detail

  Scenario: Coverage radius above the cap is rejected
    Given the coverage radius cap is 50000 metres
    When the caller submits a coverage radius greater than 50000 metres
    Then the system shall respond with HTTP status 400
    And the errors entry shall identify the coverage radius field

  Scenario: Out-of-range coordinates are rejected
    Given latitude must be between -90 and 90 and longitude between -180 and 180
    When the caller submits a latitude above 90
    Then the system shall respond with HTTP status 400
    And a latitude below -90 or a longitude outside -180 to 180 is rejected in the same way

  Scenario: Oversized request payload is rejected
    Given a maximum total request payload size is defined
    When the caller submits a request whose total size exceeds that maximum
    Then the system shall respond with HTTP status 400
    And the oversized request shall not be accepted or partially processed

  Scenario: Validation failure performs no work
    Given a request fails validation
    When the system responds with HTTP status 400
    Then no data shall be written or changed

  Scenario: Client input stops at the contract maximum
    Given a text input bound to a declared request-contract maximum
    When the user types or pastes text beyond that maximum
    Then the input retains exactly the maximum number of characters
    And the excess text shall not be sent in any request

  Scenario: Invalid input is flagged while the user types
    Given a client text input with a field-level rule
    When the user types a value that violates the rule
    Then an inline indication shall appear next to the field immediately
    And the indication shall explain how to correct the value in plain language

  Scenario: Inline indication clears when the value is corrected
    Given an inline indication is shown for a field
    When the user corrects the value so that it satisfies the rule
    Then the indication shall clear without any further input

  Scenario: Inline indication is associated with its field
    Given an inline indication is shown for a field
    When assistive technology reads that field
    Then the indication shall be announced with the field
    And focus shall not move because of the indication

  Scenario: Submission still applies authoritative validation
    Given a client input shows no inline indication for its current value
    When the user submits the value and the API rejects it under R1
    Then the standard error response shall be shown
    And no data shall be written or changed
