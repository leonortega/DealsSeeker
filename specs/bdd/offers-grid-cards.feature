Feature: Compact responsive offer grid cards
  As a user
  I want offers displayed as consistent compact cards
  So that browsing remains compact and scannable

  Scenario: Offer tiles render in compact consistent format
    Given offers are available in the feed
    When the grid is rendered
    Then each offer tile is displayed as a compact card with consistent structure
    And the image frame and content layout are consistent across visible tiles

  Scenario: Grid remains visually consistent across viewport changes
    Given offers are available
    When the viewport width changes
    Then image framing stays visually consistent
    And the column count adjusts responsively
