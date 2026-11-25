Feature: Theme world selection
  As a deal hunter
  I want to choose between three complete palette worlds
  So that the app matches the mood I prefer

  Scenario: Selecting a theme world
    Given the user is on My Account
    When the user selects the Sunshine Market world
    Then its light or dark palette applies according to the appearance mode
    And the option is marked as selected
    And the choice persists after relaunch

  Scenario: Appearance mode works within a world
    Given the Tangerine & Mint world is selected
    When the user selects Dark appearance
    Then the Cozy Dark palette applies
    And the System option still follows the device appearance

  Scenario: World change recolors the shell
    Given any world is selected
    When the user chooses another world
    Then the footer and immersive backdrop update with the same palette family
    And no surface keeps colors from the previous world
