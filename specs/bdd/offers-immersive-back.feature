Feature: Immersive view back navigation
  As an authenticated user
  I want to return from the immersive offers view to the standard offers view
  So that I can resume normal browsing

  Scenario: User goes back from immersive view
    Given the user is on the immersive offers view
    When the user selects the back control
    Then the immersive offers view closes
    And the standard offers view is displayed
    And the standard application header and bottom navigation are restored

  Scenario: Back control is available in left panel
    Given the user is on the immersive offers view
    When the user views the left panel
    Then a back control is available
    And its label is the shared back label

  Scenario: Context is preserved after back
    Given the user has an active search in the immersive offers view
    When the user selects the back control
    Then the search query and radius remain available in the standard offers view

  Scenario: Back control is available in destinations opened from immersive view
    Given the user is on the immersive offers view
    When the user opens a destination from the left panel
    Then a back control is available in that destination
    And selecting it returns the user to the immersive offers view
```