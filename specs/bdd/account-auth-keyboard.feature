Feature: Keyboard-safe authentication forms
  As a user signing in or creating an account
  So that I can complete the form while the on-screen keyboard is open

  Scenario: Login form uses the platform keyboard strategy
    Given the user is on the Login view on a platform with an on-screen keyboard
    When a text input receives focus
    Then the form shall apply the keyboard-avoidance strategy appropriate to that platform
    And the focused input shall remain visible above the keyboard

  Scenario: Create User form uses the same platform keyboard strategy
    Given the user is on the Create User view on the same platform
    When a text input receives focus
    Then the form shall apply the same keyboard-avoidance strategy as the Login view
    And the focused input shall remain visible above the keyboard

  Scenario: Controls remain operable while the keyboard is open
    Given an authentication form has the keyboard open
    When the user taps the submit action or the view-switch link
    Then the tapped control shall act without a separate keyboard-dismissal tap
    And entered text shall remain available

  Scenario: Keyboard behavior does not alter form semantics or appearance
    Given the keyboard-avoidance strategy is applied to an authentication form
    When validation or submission produces a result
    Then the result shall be shown with the same message, labels and styling as with the keyboard closed
