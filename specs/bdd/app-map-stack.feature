Feature: Single map and geocoding stack
  As a product owner
  I want one map and geocoding stack everywhere
  So that the app stays consistent and stays within Photon fair use

  Scenario: All map surfaces use the single native stack
    Given the app renders an Offers map and an Add Offer mini map
    When both map surfaces are displayed
    Then both shall use the native Google Maps view
    And no web-based map renderer shall be present

  Scenario: Places and coordinates are resolved by Photon only
    Given the user searches for a place or picks a point on a map
    When the lookup is issued
    Then it shall be served by Photon through the app API
    And no other geocoding service shall be called

  Scenario: Directions always open Google Maps
    Given an offer, a marker, or a detail action offers directions
    When the user opens directions
    Then Google Maps shall be opened with the selected destination and travel mode

  Scenario: No provider switches are exposed
    Given the user opens application settings
    When map, geocoding, or redirect provider options are looked for
    Then no such options shall be available

  Scenario: Native map cannot be initialized
    Given the native map or its credential is unavailable
    When a map surface is requested
    Then the app shall report the failure
    And no alternate map surface shall be shown
