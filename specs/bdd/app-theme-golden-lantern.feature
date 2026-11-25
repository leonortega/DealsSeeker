Feature: Golden Hour and Lantern palettes
  As a deal hunter
  I want a warm, optimistic interface in both themes
  So that finding a deal feels inviting

  Scenario: Light theme feels like golden hour
    Given the light theme is active
    When a view is rendered
    Then surfaces use warm paper and cream tones
    And primary actions use deep terracotta with white text
    And promoted offers use the honey highlight with dark ink text

  Scenario: Dark theme feels like a lantern
    Given the dark theme is active
    When a view is rendered
    Then surfaces use deep pine and soft sage tones
    And primary actions use bright ember with dark forest ink text
    And the footer keeps its fixed night surface

  Scenario: Contrast floors hold in both themes
    Given any theme is active
    When text, controls and badges are rendered
    Then body text keeps at least 4.5:1 contrast
    And control boundaries keep at least 3:1 contrast
