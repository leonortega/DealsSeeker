Feature: Report bottom sheet matching comments
  As a contributor reporting an offer
  I want the report sheet to behave like the comments sheet
  So that the overlay feels like one consistent system

  Scenario: Report opens as the same sheet as comments
    Given an offer is visible
    When the user selects Report
    Then a native bottom sheet opens with the comments sheet's surface and title treatment
    And the offer name is shown above a multiline report input
    And no separate Close button is rendered

  Scenario: Submitting a report from the sheet
    Given the report sheet is open with a non-empty message
    When the user selects the primary action
    Then the payload includes the offer context per REPORTS.SUBMIT.001
    And confirmable feedback is shown
    And the sheet closes and the app returns to Offers

  Scenario: Dismissing the report sheet
    Given the report sheet is open with a partially written message
    When the user swipes the sheet down
    Then the sheet closes without submitting
    And the offer list remains unchanged
