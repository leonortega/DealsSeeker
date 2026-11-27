Feature: Shared no-position state across Offers and Favorites
  As a deal hunter without a usable position
  I want one honest, recoverable state instead of results for a guessed area
  So that I can tell my location is unavailable and retry when it is ready

  Scenario: Standard Offers shows the no-position state
    Given no usable position can be obtained
    When the standard Offers view loads
    Then one no-position state is displayed in place of results
    And no substitute-area offers are displayed
    And no map center is fabricated

  Scenario: Immersive feed shows the same no-position state
    Given no usable position can be obtained
    When the immersive offers feed loads
    Then the same no-position state is displayed
    And no results are shown for a fabricated coordinate

  Scenario: My Favorites shows no results and the same state
    Given no usable position can be obtained
    When the user opens My Favorites
    Then the no-position state is displayed
    And no saved offers are listed as results for a substitute area
    And the saved set is unchanged

  Scenario: Denied position leads to the state without fabricated coordinates
    Given location permission is denied
    When the app requires a position for discovery
    Then the no-position state is displayed
    And no fallback coordinate or map center is used

  Scenario: Position lookup failure leads to the state
    Given the position lookup fails
    When the app requires a position for discovery
    Then the no-position state is displayed with no results

  Scenario: Retry succeeds in Offers
    Given the no-position state is displayed in the Offers view
    When the user selects the retry action
    And a usable position is obtained
    Then the state is replaced by results for that position

  Scenario: Retry succeeds in My Favorites
    Given the no-position state is displayed in My Favorites
    When the user selects the retry action
    And a usable position is obtained
    Then the state is replaced by the saved offers for that position
    And the saved set is unchanged

  Scenario: Retry fails and the state remains
    Given the no-position state is displayed
    When the user selects the retry action
    And no position can be obtained
    Then a plain-language failure is shown
    And the state and its retry action remain available

  Scenario: State is announced to assistive technology
    Given the no-position state is displayed
    When assistive technology reads the view
    Then it announces that the location is unavailable
    And it exposes the retry action

  Scenario: State exposes no raw coordinates
    Given the no-position state is displayed
    When the state and its actions are shown
    Then no raw latitude or longitude value is visible

  Scenario: Contextual help opens from the state
    Given the no-position state is displayed
    When the user selects the contextual help affordance
    Then the help surface opens with the relevant topic first
    And the user remains in the current view
