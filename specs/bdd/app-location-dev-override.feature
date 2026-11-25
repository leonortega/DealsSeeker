Feature: Developer location override for emulators
  As a developer testing on an emulator without a location provider
  I want to configure a development position
  So that location-dependent discovery can still be exercised

  Scenario: Emulator uses the configured developer location
    Given a valid developer location is configured
    And the device cannot provide a position
    When the Offers view loads
    Then the configured location is used for search and map context
    And the approximate-area notice is not displayed
    And the area label describes the resolved location

  Scenario: Malformed override falls back to device location
    Given the developer location value is malformed
    When the Offers view loads
    Then the override is ignored
    And device geolocation is attempted

  Scenario: Override does not change discovery behavior
    Given a valid developer location is configured
    When the user changes the coverage radius or runs a search
    Then results and map markers follow the configured location and selected radius
    And no raw coordinate value is displayed
