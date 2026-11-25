Feature: Sunshine Market visual world
  As a deal hunter
  I want a cheerful amber, plum and mint interface
  So that finding an offer feels bright and welcoming

  Scenario: Main colors are amber and plum
    Given any theme is active
    When a view is rendered
    Then primary actions use amber with deep plum text
    And secondary panels use mint
    And offer highlights use coral with deep plum text

  Scenario: Night navigation stays consistent
    Given either theme is active
    When the shared footer is rendered
    Then it uses the fixed night-plum surface and hairline
    And only its active tile uses the amber family

  Scenario: Contrast floors hold
    Given any theme is active
    When text, chips and controls are rendered
    Then body text keeps at least 4.5:1 contrast
    And control boundaries keep at least 3:1 contrast
