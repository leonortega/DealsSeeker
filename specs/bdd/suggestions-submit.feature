Feature: Suggestions submission flow
  As a user
  I want to submit product suggestions
  So that I can share improvement ideas with the app team

  Scenario: User submits a suggestion with optional contact
    Given the user is on Suggestions view
    When the user submits a non-empty suggestion message
    And the user optionally provides contact details
    Then the suggestion payload includes the message
    And the contact details are included only when provided
    And the app redirects to Offers after a successful response

  Scenario: Submit action works with the keyboard open
    Given the user is on Suggestions view
    And the on-screen keyboard is open in the message field
    When the user taps the submit action
    Then the suggestion is submitted
    And the tap is not captured by the keyboard

  Scenario: Blank suggestion is rejected
    Given the user is on Suggestions view
    When the user submits the suggestion form with a blank message
    Then the suggestion submission is rejected
    And the Suggestions view remains shown
    And a recoverable failure message is shown

  Scenario: Suggestion message counter tracks typing and stops at 120
    Given the user is on Suggestions view with an empty message
    When the user types 10 characters
    Then the counter shows "10/120"
    When the message reaches 120 characters
    Then the input accepts no further characters
    And the counter shows "120/120"

  Scenario: Optional contact stops at its contract maximum
    Given the user is on Suggestions view
    When the user pastes 300 characters into the contact input
    Then the contact input holds exactly 254 characters

  Scenario: Suggestion inputs use labelled Material 3 fields
    Given the user is on Suggestions view
    When the message and contact inputs are rendered
    Then each shall show a persistent label and a helper or error text line
    And the message field shall keep its live counter

  Scenario: The suggestion form uses a Material 3 card and button
    Given the user is on Suggestions view
    When the form is rendered
    Then it shall be presented on a Material 3 card pattern
    And the submit action shall follow a Material 3 button pattern and stay operable with the keyboard open

  Scenario: A long localized helper line stays inside its field
    Given a localized helper or error line longer than the field width
    When the inputs are rendered
    Then the line shall wrap within its own field
    And the submit action shall remain visible and tappable
