Feature: Immersive search sheet keyboard avoidance
  As a deal hunter typing in the immersive search sheet
  I want my input and search action to stay visible and tappable
  So that the keyboard never hides what I am doing

  Scenario: Search input and primary action stay above the keyboard
    Given the immersive search sheet is open
    And the on-screen keyboard is open
    When the search input is focused
    Then the input remains visible above the keyboard
    And the primary search action remains visible above the keyboard

  Scenario: Taps reach sheet controls while the keyboard is open
    Given the immersive search sheet is open with the keyboard visible
    When the user taps a visible sheet control
    Then the tap is delivered to that control
    And no tap is swallowed by keyboard avoidance

  Scenario: Keyboard avoidance preserves sheet behavior and styling
    Given the immersive search sheet is open
    When the keyboard appears and the sheet adjusts
    Then the sheet keeps its resting snap points
    And its brand palette, type, shapes and copy are unchanged

  Scenario: Search submission still works with the keyboard open
    Given the user typed a query in the immersive search sheet
    When the user activates the visible primary search action
    Then validation and submission behave as with the keyboard closed
    And results refresh through the normal search path

  Scenario: Dismissal stays reachable with the keyboard open
    Given the immersive search sheet is open with the keyboard visible
    When the user dismisses the sheet through its normal affordance
    Then the sheet closes through its normal dismissal path
    And the keyboard does not block the handle or gesture

  Scenario: A tall keyboard with a suggestion strip on a short viewport
    Given the viewport is short and the keyboard shows a suggestion strip
    When the search input is focused
    Then the input and primary action remain visible
    And no visible control is skipped by a tap

  Scenario: A platform that does not resize the content window
    Given the platform keeps the content window size when the keyboard opens
    When the search input is focused
    Then the input and primary action are still clear of the keyboard
    And they remain tappable

  Scenario: Character limit still applies with the keyboard open
    Given the immersive search input is focused with the keyboard open
    When the user pastes 250 characters
    Then the input holds exactly 200 characters
