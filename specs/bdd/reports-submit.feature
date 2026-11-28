Feature: Offer-scoped report submission
  As a community contributor
  I want to report a problem with a specific offer
  So that the report is always tied to the right offer

  Scenario: Authenticated user reports an offer
    Given the user is authenticated
    And the user selects Report on an offer
    When the report overlay opens, the user selects a reason, writes a message and confirms Send
    Then the offer preview is displayed
    And the payload includes message, offer identifier, authenticated userId, and report date/time
    And after a successful response the confirmation remains visible and an explicit Done control returns to Offers

  Scenario: No standalone Reports entry point
    Given the shared footer is displayed
    When the user views its destinations
    Then no Reports destination is present

  Scenario: Unauthenticated user selects Report
    Given the user is not authenticated
    When the user selects Report on an offer
    Then the Login view is displayed

  Scenario: Report message counter tracks typing and stops at 120
    Given the report overlay is open with an empty message
    When the user types 10 characters
    Then the counter shows "10/120"
    When the message reaches 120 characters
    Then the input accepts no further characters
    And the counter shows "120/120"

  Scenario: A reason and a confirmation are required before sending
    Given the report overlay is open with a selected reason and a non-empty message
    When the user requests to send
    Then a confirmation shall restate the reason, the message and the offer context
    And no report shall be sent until Send is selected in the confirmation

  Scenario: Cancelling sends nothing and keeps the draft
    Given a report confirmation is displayed
    When the user selects Cancel or uses system Back
    Then no report shall be sent
    And the selected reason and message shall remain in the form

  Scenario: No machine timestamp appears in user-facing report text
    Given a report is being prepared, confirmed or completed
    When the user reads the report overlay, confirmation and success text
    Then no UTC timestamp, raw identifier or internal code shall be shown
    And the UTC timestamp shall remain in the payload only
