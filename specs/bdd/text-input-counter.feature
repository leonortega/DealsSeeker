Feature: Live character counter on free-text inputs
  As a user writing text in the app
  I want to see how many characters I have used
  So that I know the limit before I reach it and cannot exceed it

  Scenario: Typing updates the counter
    Given a bounded free-text input with a maximum of 120 characters
    When the user types 10 characters
    Then the counter shows "10/120"

  Scenario: Input stops at the maximum
    Given a bounded free-text input already holding 120 characters
    When the user types one more character
    Then the input still holds 120 characters
    And the counter shows "120/120"

  Scenario: Removing text decreases the counter
    Given a bounded free-text input holding 10 characters
    When the user removes 3 characters
    Then the counter shows "7/120"

  Scenario: Prefilled text starts the counter at its length
    Given a bounded free-text input prefilled with 52 characters
    Then the counter shows "52/120"

  Scenario: Pasting beyond the maximum is truncated
    Given a bounded free-text input with a maximum of 120 characters
    When the user pastes 200 characters
    Then the input holds exactly the first 120 characters
    And the counter shows "120/120"
