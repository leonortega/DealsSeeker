Feature: Explicit Feed/Map presentation switch
  As a deal hunter
  I want to choose the feed or map presentation from the Offers header
  So that switching views never feels like navigating somewhere else

  Scenario: Switch from Feed to Map
    Given the immersive offer feed is active
    When the user selects the Map option in the Offers header
    Then the standard offers view is displayed
    And the map is shown for the current offers and location context

  Scenario: Switch from Map to Feed
    Given the standard offers view is active
    When the user selects the Feed option in the Offers header
    Then the immersive offer feed is displayed

  Scenario: Switching mode preserves active filters
    Given the current query is "coffee" with a 1000 meter radius and favorites only enabled
    When the user switches presentation mode
    Then the query, radius, and favorites filter remain active
    And the results reflect the same filters in the new presentation

  Scenario: Mode persists within the session
    Given the user selected the Map presentation
    When the user navigates to another destination and returns to Offers
    Then the Map presentation is still selected

  Scenario: Cold start defaults to Feed
    Given the application starts with an authenticated session
    When the Offers view is first displayed
    Then the Feed presentation is selected

  Scenario: Mode control is accessible
    Given the Offers header is displayed
    When the mode control is rendered
    Then each option exposes its role and selected state to assistive technology
