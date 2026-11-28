Feature: Report reason categories and send confirmation
  As a community contributor
  I want to choose a reason and confirm before a report is sent
  So that I send the right report and never see machine-generated details

  Scenario: A reason is required before sending
    Given the report overlay is open with a non-empty message
    When no reason has been selected
    Then the send action shall be unavailable
    And plain-language reason categories shall be offered

  Scenario: Confirmation restates the report before sending
    Given a reason and a non-empty message have been provided
    When the user requests to send
    Then a confirmation shall restate the selected reason, the message and the offer context
    And no report shall be sent until Send is selected in the confirmation

  Scenario: Confirming sends the report once
    Given a confirmation restates the selected reason and message
    When the user selects Send
    Then the report shall be sent once
    And the success feedback shall follow APP.FEEDBACK.001

  Scenario: Cancelling sends nothing and preserves the draft
    Given a report confirmation is displayed
    When the user selects Cancel
    Then no report shall be sent
    And the reason and message shall remain in the form

  Scenario: System Back behaves as cancel
    Given a report confirmation is displayed
    When the user performs system Back
    Then no report shall be sent
    And the form shall return with the reason and message preserved

  Scenario: No machine timestamp appears in user-facing report text
    Given a report is being prepared, confirmed or completed
    When the user reads the form, the confirmation and the success text
    Then no UTC timestamp, raw identifier or internal code shall be shown
    And the UTC timestamp shall remain in the payload only

  Scenario: Changing the reason updates the confirmation
    Given a confirmation restates a selected reason
    When the user goes back and selects a different reason and confirms again
    Then the confirmation shall restate the new reason
