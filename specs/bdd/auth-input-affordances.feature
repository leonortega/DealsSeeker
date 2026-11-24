Feature: Authentication input affordances
  As a user signing in or registering
  I want the email and password fields to tell me how to use them
  So that I can enter credentials confidently on a phone

  Scenario: Email input uses the email keyboard
    Given the user is on Login or Register
    When the email input is rendered
    Then it shall use the device email keyboard
    And automatic capitalization shall be disabled

  Scenario: Password starts hidden and can be revealed
    Given a password has been entered
    When the user selects the password visibility control
    Then the characters shall become visible
    And the control shall announce that it hides the password
    When the user selects it again
    Then the characters shall be masked again

  Scenario: Revealing does not change submission
    Given a valid email and password are entered
    When the user reveals the password and submits
    Then authentication shall behave as with a masked password
