Feature: Native map surface
  As a user viewing offers or placing a pin
  So that the map behaves like a native map without changing the DealsSeeker look

  Scenario: Map renders natively with markers and coverage
    Given the Offers map presentation is selected
    When the map surface is rendered
    Then a native map view displays the businesses and coverage radius
    And no embedded web view is used for the map

  Scenario: Marker selection is preserved
    Given business markers are visible
    When the user selects a marker
    Then the same offer selection behavior runs as before

  Scenario: Tap to pin is preserved
    Given the Add Offer map allows pin placement
    When the user taps a map coordinate
    Then the pin is set at that coordinate

  Scenario: Theme follows the app palette
    Given the active theme changes
    When the map is rendered
    Then map accents continue to use the brand palette roles

  Scenario: No alternate map renderer is bundled
    Given the device cannot render a native map
    When a map surface is requested
    Then the failure is reported
    And no web-based or alternate map surface is shown
