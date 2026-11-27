Feature: Contextual in-product help
  As a first-time deal hunter
  I want a short explanation of the essential flows where I need it
  So that I can get value without leaving the app to ask for help

  # Contextual entry-point scenarios also live in app-help-contextual.feature;
  # they are mirrored here so the help surface stays covered from both entry routes.

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

  Scenario: Contextual entry opens the same surface with the relevant topic first
    Given the user selects a contextual help affordance at an entry point defined in APP.HELP.CONTEXTUAL.001
    When the help surface opens
    Then the same single dismissible surface is used
    And the relevant topic is shown first
    And the five essential topics remain listed
    And the user has not navigated away

  Scenario: Dismissed contextual help returns focus and preserves context
    Given contextual help was opened from an entry point defined in APP.HELP.CONTEXTUAL.001
    When the user dismisses the help surface
    Then focus returns to the control that opened it
    And the invoking context is unchanged
