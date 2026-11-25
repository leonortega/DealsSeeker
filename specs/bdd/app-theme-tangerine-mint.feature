Feature: Tangerine and Mint themes
  As a deal hunter
  I want to choose a clean light or cozy dark theme
  So that deals stay readable and cheerful in any lighting

  Scenario: Choosing a theme in My Account
    Given the user is on My Account
    When the user selects the Dark theme option
    Then the dark palette applies immediately
    And the Dark option is marked as selected
    And the preference persists after relaunch

  Scenario: Deal status is not color-only
    Given an offer is promoted or reported
    When its card is rendered
    Then a text label accompanies the status color
    And the text remains readable in both themes

  Scenario: Offer controls have safe touch targets
    Given the Offers view is displayed
    When the user views radius chips and primary action buttons
    Then each target is at least 48x48 units
    And adjacent controls are separated by at least 8 units
