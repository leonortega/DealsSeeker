# Spec: `APP.LOGGING.001`

## Metadata
- **Title**: Configurable Logging with Serilog, File Sink, and Database Sink
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Define runtime logging behavior with configurable log level and persistent sinks.

## Preconditions
- API runtime configuration is available.
- Logging sinks are initialized during application startup.

## Trigger
- Application startup and runtime log event emission.

## Requirements
- `APP.LOGGING.001-R1`: The system shall use Serilog as the preferred logging pipeline.
- `APP.LOGGING.001-R2`: The default minimum log level shall be configurable via internal configuration.
- `APP.LOGGING.001-R3`: The system shall persist logs to rolling log files.
- `APP.LOGGING.001-R4`: The system shall persist logs to database storage.
- `APP.LOGGING.001-R5`: Database logging shall support a configurable minimum level independent of global minimum level.
- `APP.LOGGING.001-R6`: Each persisted log record shall include timestamp, level, message, and optional exception/properties payload.
- `APP.LOGGING.001-R7`: If one sink fails, logging to other configured sinks shall continue when possible.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Startup applies configured minimum level
  Given API logging is configured with Serilog
  And minimum log level is configured in internal configuration
  When the API starts
  Then the configured minimum log level shall be applied to log event filtering

Scenario: Logs are persisted to file and database
  Given API logging is configured with file and database sinks
  When runtime log events are emitted
  Then log events at or above configured levels shall be written to log files
  And log events at or above database sink level shall be written to the logs table
```

## Example Inputs/Outputs
- Example input: `Serilog:MinimumLevel:Default=Warning`.
- Expected output: `Information` logs are filtered out by default.
- Example input: `LoggingPersistence:MinimumLevel=Error`.
- Expected output: database sink stores only `Error` and above; file sink still follows Serilog default/override.

## Edge Cases
- Invalid configured log level string shall fall back to safe default (`Information`).
- Database sink write failure shall not crash the API process.

## Non-Functional Constraints
- Log persistence should not materially block request processing on normal workloads.

## Related Specs
- `APP.SHELL.001`
