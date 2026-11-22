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
