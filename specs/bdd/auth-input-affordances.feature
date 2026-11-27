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

  Scenario: Authentication inputs stop at their contract maxima
    Given the user is on Login or Register
    When the user pastes an email longer than 254 characters
    Then the email input shall hold exactly 254 characters
    When the user pastes a password longer than 200 characters
    Then the password input shall hold exactly 200 characters
    When the user is on Register and pastes a display name longer than 80 characters
    Then the display name input shall hold exactly 80 characters

  Scenario: Auth inputs expose autofill metadata
    Given the user is on Login or Register
    When the email and password inputs are rendered
    Then the email input exposes username autofill metadata
    And the password input exposes current-password or new-password metadata as appropriate

  Scenario: Contextual help is reachable at the sign-in guard
    Given a guest attempts a contribution
    When the user asks why an account is required
    Then the single help surface opens with the account topic first
    And the guest remains in the current context
