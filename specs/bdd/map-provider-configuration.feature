Feature: Map provider modules configured internally
  As a product owner
  I want map provider modules to be configurable
  So that the app can run with different map APIs

  Scenario: Google Maps provider is configured
    Given internal configuration sets map provider to Google Maps API
    When map-dependent features are initialized
    Then Offers map rendering uses Google Maps provider
    And Add Offer location search uses Google Maps provider

  Scenario: OpenLayers provider is configured
    Given internal configuration sets map provider to OpenLayers API
    When map-dependent features are initialized
    Then Offers map rendering uses OpenLayers provider
    And Add Offer location search uses OpenLayers provider

  Scenario: Configured provider fails to initialize
    Given a map provider is configured
    And provider initialization fails
    When a map-dependent feature is requested
    Then fallback behavior is applied according to configuration
    And app availability is preserved
