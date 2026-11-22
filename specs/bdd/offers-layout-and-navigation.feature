Feature: Offers layout and navigation to Add Offer
  As a user
  I want complete Offers screen layout and quick add navigation
  So that I can browse and create offers

  Scenario: Offers view contains required layout blocks
    Given the user is authenticated
    And the user opens the Offers section
    When the Offers view is rendered
    Then a search bar is visible
    And a coverage radius control below the search textbox is visible
    And no plus button near the search bar is visible
    And a map component is visible
    And an offers feed area below the map is visible

  Scenario: Initial load can show promoted offers section
    Given promoted offers are available
    And the user has not executed a search
    When the Offers view is rendered
    Then a promoted offers section is visible above standard offers

  Scenario: Recovery actions have an unobstructed tap area
    Given the standard Offers view shows a recovery action such as Clear filters
    When the user taps the action
    Then the action is activated
    And the shared create control does not cover its tap area

  Scenario: Create action opens Add Offer view
    Given the user is authenticated
    And the user is in Offers view
    When the user selects the create-offer floating action button
    Then the Add Offer view is displayed
    And no offer identifier is associated with the view

  Scenario: Create action opens Add Offer view from the immersive feed
    Given the user is authenticated
    And the user is on the immersive offers feed
    When the user selects the create-offer floating action button
    Then the Add Offer view is displayed
