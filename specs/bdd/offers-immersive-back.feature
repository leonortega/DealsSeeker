Feature: Immersive view navigation to the standard offers view
  As an authenticated user
  I want to return from the immersive offers view to the standard offers view
  So that I can resume normal browsing

  Scenario: System Back closes the immersive view
    Given the user is on the immersive offers view
    When the user activates the system Back action
    Then the immersive view closes
    And the standard offers view is displayed
    And the app stays in the foreground

  Scenario: User returns from immersive view to the standard offers view
    Given the user is on the immersive offers view
    When the user selects the map mode option
    Then the immersive offers view closes
    And the standard offers view is displayed
    And the bottom navigation and the platform-native header are restored

  Scenario: No back control is shown in the immersive left panel
    Given the user is on the immersive offers view
    When the user views the left panel
    Then a back control is not available

  Scenario: Context is preserved after returning
    Given the user has an active search in the immersive offers view
    When the user selects the map mode option
    Then the search query and radius remain available in the standard offers view

  Scenario: Destinations opened from immersive view have no back control
    Given the user is on the immersive offers view
    When the user opens a destination from the footer
    Then a back control is not available in that destination
    And the shared bottom footer remains visible
