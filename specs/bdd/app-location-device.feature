Feature: Platform location provider access on Android
  As a deal hunter on Android or an emulator
  I want the app to use the device's platform location
  So that discovery reflects the position I actually set

  Scenario: Android uses the platform provider position
    Given the user is on Android with foreground location granted
    And the platform provider has a current position
    When the Offers view resolves the location
    Then the platform position is used for search and map context
    And no fallback notice is displayed

  Scenario: Emulator-injected position is used
    Given the Android emulator has a position set through its location controls
    When the user selects the location retry action
    Then the injected position is used for search and map context
    And the area label describes the resolved location

  Scenario: Provider request times out
    Given the platform provider has no fresh position and produces no update
    When the user selects the location retry action
    Then a plain-language failure status is shown within the bounded time
    And the approximate-area results remain browsable

  Scenario: Permission denied on Android
    Given foreground location permission is denied
    When the user selects the location retry action
    Then the denial is handled as a recoverable location failure
    And no raw coordinate is displayed
