Feature: Serilog configuration and persistent sinks
  As an operator
  I want configurable log levels and persistent sinks
  So that runtime diagnostics are captured consistently

  Scenario: Configurable minimum level is applied
    Given the API uses Serilog
    And minimum log level is configured in internal configuration
    When the API starts
    Then log filtering follows the configured minimum level

  Scenario: Log events are persisted to file and database
    Given file sink and database sink are enabled
    When the API emits log events
    Then matching events are written to rolling log files
    And matching events are written to the database logs table
