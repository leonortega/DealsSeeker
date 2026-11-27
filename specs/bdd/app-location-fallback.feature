Feature: Honest fallback-location disclosure and recovery
  As a deal hunter on a device without a usable location
  I want to know when results are for an approximate area and be able to retry
  So that I never mistake a fallback city for offers near me

  Scenario: Denied location requires an explicit browse choice
    Given the user has denied location permission
    When the Offers view loads
    Then the area is not labelled as the user's current location
    And a notice explains that an approximate area is available
    And the notice offers a retry action and an explicit browse action
    And no fallback results are displayed before the browse choice

  Scenario: Choosing the approximate area shows its offers
    Given the approximate-area notice is displayed
    When the user chooses to browse the approximate area
    Then offers for that area are displayed
    And the notice is dismissed

  Scenario: Retrying location removes the notice on success
    Given the approximate-area notice is displayed
    When the user selects the retry action
    And device location is obtained
    Then the notice is no longer displayed
    And the area label describes the resolved location

  Scenario: Retrying location reports a failure without changing results
    Given the approximate-area notice is displayed
    When the user selects the retry action
    And device location cannot be obtained
    Then a plain-language failure status is shown
    And the notice and its actions remain available
    And the displayed offers remain browsable

  Scenario: Dismissing the notice keeps the results
    Given the approximate-area notice is displayed
    When the user dismisses the notice
    Then the offers remain displayed
    And the notice is not displayed again for that same location result

  Scenario: Immersive feed discloses the fallback area
    Given the immersive offers feed is active
    And device location cannot be obtained
    When the feed loads
    Then the approximate-area notice and its actions are available

  Scenario: Fallback notice does not expose coordinates
    Given the approximate-area notice is displayed
    When the notice and area label are shown
    Then no raw latitude or longitude value is visible
