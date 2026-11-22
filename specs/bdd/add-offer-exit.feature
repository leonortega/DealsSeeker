Feature: Safe exit from the Add Offer view
  As a community contributor
  I want to leave the Add Offer view without silently losing my work
  So that an interrupted contribution can be resumed or discarded deliberately

  Scenario: Cancel an empty draft
    Given the user opened the Add Offer view
    And the draft contains no user-entered content
    When the user activates Cancel
    Then the view closes without a confirmation step

  Scenario: Cancel a draft with content asks for confirmation
    Given the draft contains user-entered content
    When the user activates Cancel
    Then a confirmation asks whether the draft should be discarded

  Scenario: Confirming discard leaves the view
    Given the discard confirmation is shown
    When the user confirms the discard
    Then the view closes
    And the draft is discarded

  Scenario: Declining discard keeps the draft
    Given the discard confirmation is shown
    When the user chooses to keep editing
    Then the view stays open
    And the draft content is unchanged

  Scenario: Confirmation is accessible and privacy-safe
    Given the discard confirmation is shown
    When assistive technology is active
    Then the confirmation and its controls are announced
    And no raw latitude or longitude values are shown

  Scenario: System Back acts as Cancel
    Given the user is on the Add Offer view
    When the user activates the system Back action
    Then the view is treated as cancelled
    And the app does not leave the Add Offer flow
    And a draft with content asks for confirmation before discarding
