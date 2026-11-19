# Spec: `APP.API.CONNECTIVITY.001`

## Metadata
- **Title**: Mobile API Endpoint Configuration
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define how the mobile application obtains the API base address so that a build launched for an emulator or a physical device uses the address the launch tooling resolved, rather than a hard-coded fallback.

## Preconditions
- The API is running and reachable from the device at a known address.
- The launch tooling knows which address is reachable from the selected target.

## Trigger
- The mobile application is built, launched, or starts up.

## Requirements
- `APP.API.CONNECTIVITY.001-R1`: The launch tooling shall pass the resolved API base address to the mobile application build.
- `APP.API.CONNECTIVITY.001-R2`: The mobile application shall use the build-time API base address when one was provided.
- `APP.API.CONNECTIVITY.001-R3`: The mobile application shall accept a runtime environment override for the API base address when no build-time value was provided.
- `APP.API.CONNECTIVITY.001-R4`: On Android, when neither a build-time value nor a runtime override was provided, the application shall use the emulator host alias as the default API base address.
- `APP.API.CONNECTIVITY.001-R5`: The launch tooling shall verify API health over the IPv4 loopback address, so that an API bound only to IPv4 is detected correctly.
- `APP.API.CONNECTIVITY.001-R6`: The application shall log the effective API base address at startup and for every API request.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Emulator build uses the address resolved by the launch tooling
  Given the launch target is an Android emulator
  And the API is reachable at the emulator host alias
  When the application is built and launched
  Then the application shall use the API base address passed at build time
  And login and search requests shall reach the API

Scenario: Device build uses the local network address
  Given the launch target is a physical device on the local network
  When the application is built and launched
  Then the application shall use the local network API base address passed at build time
  And login and search requests shall reach the API

Scenario: No build-time address falls back to the emulator default
  Given no build-time API base address was provided
  And no runtime API base address override exists
  When the Android application starts
  Then it shall use the emulator host alias as the API base address

Scenario: Runtime override is used when no build-time value exists
  Given no build-time API base address was provided
  And a runtime API base address override is set
  When the application starts
  Then it shall use the runtime override as the API base address

Scenario: Launch tooling health check matches an IPv4-only API binding
  Given the API is bound to all IPv4 interfaces
  When the launch tooling checks API health
  Then it shall report the API as healthy without waiting for an IPv6 loopback connection
```

## Example Inputs/Outputs
- Example input: Launch tooling resolves `http://10.0.2.2:5005` for an emulator.
- Expected output: The installed application sends requests to `http://10.0.2.2:5005`.
- Example input: Launch tooling resolves `http://192.168.100.143:5005` for a physical device.
- Expected output: The installed application sends requests to `http://192.168.100.143:5005`.

## Edge Cases
- A stale build-time address remains in the app until the app is rebuilt and redeployed.
- The API is unreachable at the configured address; requests fail and the effective address is visible in the application log.
- The API binds only IPv4; an IPv6 `localhost` health probe fails while an IPv4 probe succeeds.

## Non-Functional Constraints
- Address resolution shall not require user interaction after the launch tooling has resolved the target address.
- The effective address shall be discoverable from application logs for diagnosis.

## Related Specs
- `APP.SHELL.001`
- `APP.LOGGING.001`
