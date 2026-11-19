Feature: Mobile API endpoint configuration
  As a developer running the mobile app
  I want the app to use the API address resolved by the launch tooling
  So that login and search reach the API on any target

  Scenario: Emulator build uses the address resolved by the launch tooling
    Given the launch target is an Android emulator
    And the API is reachable at the emulator host alias
    When the application is built and launched
    Then the application uses the API base address passed at build time
    And login and search requests reach the API

  Scenario: Device build uses the local network address
    Given the launch target is a physical device on the local network
    When the application is built and launched
    Then the application uses the local network API base address passed at build time
    And login and search requests reach the API

  Scenario: No build-time address falls back to the emulator default
    Given no build-time API base address was provided
    And no runtime API base address override exists
    When the Android application starts
    Then it uses the emulator host alias as the API base address

  Scenario: Runtime override is used when no build-time value exists
    Given no build-time API base address was provided
    And a runtime API base address override is set
    When the application starts
    Then it uses the runtime override as the API base address

  Scenario: Launch tooling health check matches an IPv4-only API binding
    Given the API is bound to all IPv4 interfaces
    When the launch tooling checks API health
    Then it reports the API as healthy without waiting for an IPv6 loopback connection
