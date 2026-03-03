Feature: Map provider modules configured internally
  As a product owner
  I want map provider modules to be configurable
  So that the app can run with different map APIs

  Scenario: Google Maps providers are configured for render and redirect
    Given internal configuration sets map rendering provider to Google Maps API
    And internal configuration sets navigation redirect provider to Google Maps API
    When map-dependent features are initialized
    Then Offers map rendering uses Google Maps provider
    And Add Offer map rendering uses Google Maps provider
    And offer click navigation redirect uses Google Maps provider

  Scenario: Mixed providers are configured
    Given internal configuration sets map rendering provider to OpenLayers API
    And internal configuration sets navigation redirect provider to Google Maps API
    When map-dependent features are initialized
    Then Offers map rendering uses OpenLayers provider
    And Add Offer map rendering uses OpenLayers provider
    And offer click navigation redirect uses Google Maps provider

  Scenario: Configured provider fails to initialize
    Given map rendering or navigation redirect provider is configured
    And provider initialization fails
    When a map-dependent feature is requested
    Then fallback behavior is applied according to configuration
    And app availability is preserved
