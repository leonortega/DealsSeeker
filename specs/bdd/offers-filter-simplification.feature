Feature: Single coverage-distance control
  As a deal hunter choosing how far to search
  I want one clear control for coverage distance
  So that I can decide quickly without scanning five options

  Scenario: One coverage control replaces the chip row
    Given the Offers view is displayed in either presentation
    When the filter controls are rendered
    Then one control shows the current coverage distance
    And the five supported distances are not shown simultaneously

  Scenario: Changing the distance applies immediately
    Given the current coverage distance is 1500 m
    When the user opens the control and selects 500 m
    Then the control shows 500 m
    And offers are searched with the new distance

  Scenario: Other filters stay reachable
    Given the standard Offers view is displayed
    When the filter panel is rendered
    Then the query input and Favorites-only control remain directly visible

  Scenario: Assistive technology reads the current distance
    Given a coverage distance is selected
    When the control is focused
    Then its accessible name includes the current distance
    And its selected state is announced
