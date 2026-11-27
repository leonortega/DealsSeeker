Feature: No location-bound search without a usable position
  As a deal hunter without a usable device position
  I want the app to stop instead of guessing where I am
  So that I am never shown offers or a map center for a place I did not choose

  Scenario: Denied permission runs no location-bound search
    Given the user has denied location permission
    And no developer location override is configured
    When the Offers view resolves the location
    Then no location-bound offers search is run
    And no approximate-area or substitute-area results are shown

  Scenario: Lookup failure runs no location-bound search
    Given location permission is granted
    And the position lookup fails
    When the Offers view resolves the location
    Then no location-bound offers search is run
    And the single no-position state of APP.LOCATION.UNAVAILABLE.001 is displayed

  Scenario: No fallback map center is displayed
    Given no usable position can be obtained
    When the Offers view prepares its map context
    Then no fallback map center is fabricated or displayed
    And no substitute coordinate is used for the map or the search

  Scenario: No action offers to browse a substitute area
    Given the no-position state is displayed
    When the user reviews its actions
    Then a retry action is available
    And no action to browse an approximate or substitute area is available

  Scenario: Retry obtains a position and the search runs
    Given the no-position state is displayed
    When the user selects the retry action
    And a usable device position is obtained
    Then a location-bound offers search runs with that position
    And the no-position state is replaced by the results

  Scenario: Retry still fails and the no-position state remains
    Given the no-position state is displayed
    When the user selects the retry action
    And no position can be obtained
    Then a plain-language failure is shown
    And the no-position state and its retry action remain available
    And no results for a substitute area are displayed

  Scenario: Explicit developer override is still honored
    Given an explicit developer location override is configured
    And the device cannot provide a position
    When the Offers view resolves the location
    Then a location-bound search runs with the override
    And the no-position state is not displayed

  Scenario: Presentation change keeps the same behavior
    Given the no-position state is displayed in the standard Offers view
    When the user switches to the immersive feed
    Then no location-bound search is run
    And no fallback map center is displayed
    And the same no-position state is shown

  Scenario: No raw coordinates are exposed
    Given no usable position can be obtained
    When the no-position state and its area label are displayed
    Then no raw latitude or longitude value is visible
