Feature: User avatar configuration
  As an authenticated user
  I want to choose a preset avatar
  So that my comments are recognizable across devices

  Scenario: User selects an avatar in settings
    Given an authenticated user opens the settings section
    When the user selects one of the preset avatars
    Then the selected avatar shall be saved on the user profile
    And the settings section shall show the selected avatar as active

  Scenario: Selected avatar is shown with the user profile
    Given an authenticated user selected an avatar
    When the user opens My Account
    Then the selected avatar shall be shown in the account header

  Scenario: Selected avatar survives a new session
    Given an authenticated user selected an avatar
    When the user signs out and signs in again
    Then the previously selected avatar shall still be shown

  Scenario: Unknown avatar selection is rejected
    Given an authenticated user opens the settings section
    When an avatar outside the preset set is submitted
    Then the avatar shall not be saved
    And the previously saved avatar shall remain selected

  Scenario: Avatar selection fails
    Given an authenticated user opens the settings section
    And the avatar choice cannot be saved
    Then the previously saved avatar shall remain selected
    And a recoverable error state shall be shown
