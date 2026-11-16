Feature: Conditional and reusable read responses
  As a client developer
  I want unchanged read responses to be reused
  So that repeated reads are cheap and never leak another caller's content

  Scenario: Read response exposes a validator
    Given a read operation returns user-independent content
    When the client requests that content
    Then the response shall include a validator value identifying the exact representation served

  Scenario: Matching validator yields a not modified response
    Given the client holds a representation of a read response together with its validator
    When the client repeats the read request presenting that validator
    Then the system shall respond with HTTP status 304
    And the response shall have no body
    And no data retrieval shall be performed for the represented content

  Scenario: Validator changes when content changes
    Given the client holds a validator for the current representation of a read response
    And the underlying content changes
    When the client repeats the read request presenting the previous validator
    Then the validator for the new representation shall differ from the previous one
    And the system shall respond with the updated representation

  Scenario: Caller-specific content is never shared
    Given a read response depends on the authenticated caller
    When two different authenticated callers request the same read operation
    Then neither caller shall receive a representation belonging to the other caller

  Scenario: Compressed responses remain correct under conditional reuse
    Given a read response carries compressed content
    And the client holds the matching validator
    When the client repeats the read request presenting that validator
    Then the system shall respond with HTTP status 304 and no body
    And the representation the client already holds shall remain correct when decompressed

  Scenario: Mismatched validator yields the current representation
    Given the client presents a validator that does not match the current representation
    When the client requests the read operation
    Then the system shall respond with the current representation and its current validator
