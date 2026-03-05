Feature: Compact square offer grid cards
  As a user
  I want offers displayed as consistent square tiles
  So that browsing remains compact and scannable

  Scenario: Offer tiles render in square format
    Given offers are available in the feed
    When the grid is rendered
    Then each offer tile is displayed as a square card
    And card dimensions are consistent across visible tiles

  Scenario: Grid remains square across viewport changes
    Given offers are available
    When the viewport width changes
    Then tile aspect ratio stays 1:1
    And the column count adjusts responsively
