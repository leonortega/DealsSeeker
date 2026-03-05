Feature: Theme behavior with system default and override
  As a user
  I want the app theme to follow my device with optional override
  So that readability and preference are respected

  Scenario: App follows system theme by default
    Given the device theme preference is dark
    And no manual app theme override exists
    When the app starts
    Then the app uses dark theme

  Scenario: User override takes precedence
    Given device theme preference is dark
    And user selected light theme in app settings
    When the user opens the app
    Then the app uses light theme

  Scenario: User resets to system theme
    Given a manual theme override is currently active
    When the user selects use system theme
    Then app theme follows the current OS preference

  Scenario: Theme change from menu applies instantly
    Given the app is currently using light theme
    When the user selects dark theme from the menu theme control
    Then the app switches to dark theme immediately
