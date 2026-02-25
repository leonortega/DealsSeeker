Feature: Offers layout and navigation to Add Offer
  As a user
  I want complete Offers screen layout and quick add navigation
  So that I can browse and create offers

  Scenario: Offers view contains required layout blocks
    Given the user opens the Offers section
    When the Offers view is rendered
    Then a search bar is visible
    And a plus button near the search bar is visible
    And a map component is visible
    And a distance indicator below the map is visible
    And an offer list below the map is visible

  Scenario: Plus button opens Add Offer view
    Given the user is in Offers view
    When the user presses the plus button
    Then the Add Offer view is displayed

