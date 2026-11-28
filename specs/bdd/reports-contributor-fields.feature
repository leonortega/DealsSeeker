Feature: Contributor-facing report fields
  As a community contributor
  I want to write a report without handling internal identifiers
  So that reporting stays quick and hard to get wrong

  Scenario: Generic report hides internal identifiers
    Given an authenticated user opens Reports directly without offer context
    When the report form is rendered
    Then no raw user identifier shall be displayed
    And no offer identifier input shall be displayed
    And the report reason and message shall both be required

  Scenario: Generic report still carries internal context
    Given an authenticated user opens Reports directly without offer context
    When the user submits a non-empty report message
    Then the payload shall include the authenticated user identifier and a UTC timestamp
    And the payload shall omit the offer identifier

  Scenario: Prefilled report keeps its offer context without exposing the identifier
    Given the user opened Reports from an offer
    When the report form is rendered
    Then the offer preview shall be displayed
    And no raw offer identifier input shall be displayed
    And the submitted payload shall include that offer's identifier
