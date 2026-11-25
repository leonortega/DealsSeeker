Feature: Google Maps credential configuration
  As a product owner
  I want the single native map stack to read one credential
  So that map display and directions behave identically everywhere

  Scenario: Native map uses the configured Google credential
    Given the environment supplies a Google Maps credential
    When map-dependent features are initialized
    Then Offers map rendering uses the native Google Maps view
    And Add Offer map rendering uses the native Google Maps view
    And offer click navigation redirect opens Google Maps

  Scenario: No provider switching is available
    Given the app is fully initialized
    When map display, geocoding, or redirect settings are looked for
    Then no alternative provider selection is applied

  Scenario: Missing credential is a configuration error
    Given no usable Google Maps credential is supplied
    When a map-dependent feature is requested
    Then the failure is reported as a configuration error
    And no fallback map surface is rendered
