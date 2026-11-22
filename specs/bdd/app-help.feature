Feature: Contextual in-product help
  As a first-time deal hunter
  I want a short explanation of the essential flows where I need it
  So that I can get value without leaving the app to ask for help

  Scenario: Help is reachable from the standard Offers header
    Given the standard Offers view is displayed
    When the user views the header
    Then a labelled help control is available

  Scenario: Help is reachable from the immersive feed
    Given the immersive offers feed is displayed
    When the user views the top bar
    Then a labelled help control is available

  Scenario: Help opens without leaving Offers and lists the essential topics
    Given the user is on the Offers view
    When the user selects the help control
    Then a help surface is displayed over the current view
    And it lists finding deals, switching presentation, contributing, reporting, and favorites
    And the Offers view remains mounted underneath

  Scenario: Help can be closed
    Given the help surface is displayed
    When the user selects the close control
    Then the help surface is dismissed
    And the user remains on the Offers view

  Scenario: Help follows theme and localization
    Given the dark theme and Spanish language are active
    When the help surface is displayed
    Then its content uses the dark theme colors and Spanish strings

  Scenario: Help text wraps at large text size
    Given the system text size is set to 200 percent
    When the help surface is displayed
    Then every topic remains readable and no text is clipped
