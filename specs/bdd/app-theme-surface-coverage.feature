Feature: Full surface coverage in dark theme
  As a user who prefers dark theme
  I want every surface to follow the theme
  So that no bright gaps break the experience

  Scenario: Dark theme has no white content gaps
    Given the dark theme is active
    When the user opens My Account, Suggestions, Reports, Favorites, Add Offer or Offers
    Then the scrollable content area uses the dark theme background
    And the gaps between cards are dark

  Scenario: Theme switch repaints existing surfaces
    Given the user is on a standard view in the light theme
    When the user switches to the dark theme
    Then the content area and card gaps update without a restart

  Scenario: Cards keep their own surfaces
    Given the dark theme is active
    When a card or panel is displayed
    Then it keeps its card, panel or panel-alt color role
    And text keeps its theme ink color
