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

  Scenario: Theme change from My Account applies instantly
    Given the app is currently using light theme
    When the user selects dark theme from the My Account theme control
    Then the app switches to dark theme immediately

  Scenario: Surfaces share the active theme colors
    Given the app is using dark theme
    When the user views the immersive offer chrome, the bottom footer navigation, and the offers views
    Then every surface uses the active theme colors and the shared button styles

  Scenario: Immersive metadata stays legible in the light theme
    Given the app is using the light theme
    When the immersive offer feed displays availability counts on the fixed backdrop
    Then the counts use a light foreground that remains legible
    And the same foreground is used when the dark theme is active

  Scenario: Chrome colors follow the active palette
    Given the app uses any palette world in light or dark mode
    When an immersive offer, footer and status message are rendered
    Then their colors come from the active palette or its documented fixed-backdrop tokens
    And no unthemed literal is used for chrome

  Scenario: Startup surface follows system appearance
    Given the device is set to dark appearance
    When the native startup surface is shown
    Then it uses a dark background variant
    And the light appearance keeps its own background

  Scenario: Status bar follows the presentation
    Given the app is in a light, dark or immersive presentation
    When the surface is rendered
    Then the status bar content stays legible against that surface
