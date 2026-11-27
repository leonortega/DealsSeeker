# Spec: `APP.VALIDATION.001`

## Metadata
- **Title**: Input Validation and Standard Error Response
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define how invalid input is rejected by the API, the shape of the standard error response, and the system-wide input limits that are enforced.

## Preconditions
- The API is running and able to inspect the incoming request payload.
- Each operation declares its own request contract, including the field-specific limits that apply to it.

## Trigger
- Any request received by the API whose payload or parameters are validated by the system.

## Requirements
- `APP.VALIDATION.001-R1`: The system shall reject a request whose payload violates the declared limits of the request contract with HTTP status `400`.
- `APP.VALIDATION.001-R2`: The error response body shall be a standard error object containing the members `type`, `title`, `status`, `detail` and `errors`.
- `APP.VALIDATION.001-R3`: The `errors` member shall map a field name to a list of human-readable messages, and shall be absent or empty when the failure is not field-specific.
- `APP.VALIDATION.001-R4`: The system shall enforce a maximum size for free-text fields, as declared by the request contract of the affected operation.
- `APP.VALIDATION.001-R5`: The system shall enforce a bounded count for repeated values (such as tags and images), as declared by the request contract of the affected operation.
- `APP.VALIDATION.001-R6`: The system shall enforce bounded numeric ranges, including a coverage radius capped at `50000` metres.
- `APP.VALIDATION.001-R7`: The system shall enforce bounded geographic coordinates, accepting latitude between `-90` and `90` and longitude between `-180` and `180`.
- `APP.VALIDATION.001-R8`: The system shall enforce a maximum total request payload size, so that oversized submissions, including submissions with embedded image data, are rejected rather than accepted.
- `APP.VALIDATION.001-R9`: A validation failure shall perform no work: no data shall be written or changed.
- `APP.VALIDATION.001-R10`: Field-specific limits shall be described by the request contract of the affected operation rather than restated per failure.
- `APP.VALIDATION.001-R11`: Each client text input shall cap typed and pasted text at the maximum declared by the corresponding request contract, so that the user cannot enter text the API would reject.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Payload violating the request contract is rejected
  Given an operation declares a request contract with field limits
  When the caller submits a payload that violates those limits
  Then the system shall respond with HTTP status 400
  And the response body shall be a standard error object

Scenario: Field-specific failure lists the offending field
  Given a request contains a field whose value exceeds the declared maximum size
  When the system validates the request
  Then the response body shall contain an errors entry for that field name
  And the entry shall contain a list of human-readable messages

Scenario: Non field-specific failure carries no field errors
  Given a request fails validation for a reason not tied to a specific field
  When the system responds with the error
  Then the errors member shall be absent or empty
  And the error object shall still contain type, title, status and detail

Scenario: Coverage radius above the cap is rejected
  Given the coverage radius cap is 50000 metres
  When the caller submits a coverage radius greater than 50000 metres
  Then the system shall respond with HTTP status 400
  And the errors entry shall identify the coverage radius field

Scenario: Out-of-range coordinates are rejected
  Given latitude must be between -90 and 90 and longitude between -180 and 180
  When the caller submits a latitude above 90
  Then the system shall respond with HTTP status 400
  And a latitude below -90 or a longitude outside -180 to 180 is rejected in the same way

Scenario: Oversized request payload is rejected
  Given a maximum total request payload size is defined
  When the caller submits a request whose total size exceeds that maximum
  Then the system shall respond with HTTP status 400
  And the oversized request shall not be accepted or partially processed

Scenario: Validation failure performs no work
  Given a request fails validation
  When the system responds with HTTP status 400
  Then no data shall be written or changed

Scenario: Client input stops at the contract maximum
  Given a text input bound to a declared request-contract maximum
  When the user types or pastes text beyond that maximum
  Then the input retains exactly the maximum number of characters
  And the excess text shall not be sent in any request
```

## Example Inputs/Outputs
- Example input: A request with an over-long description field and an out-of-range coverage radius.
- Expected output: HTTP `400` with a standard error object whose `errors` member lists the offending fields — see `examples/application-shell/app-validation.field-errors.json`.

## Edge Cases
- Multiple fields fail validation in the same request.
- A field is missing entirely rather than out of range.
- A value of exactly the declared maximum length or count, which shall be accepted.
- An empty free-text field where a minimum length is declared.
- A payload containing embedded image data that exceeds the maximum total payload size.
- A coordinate expressed with excessive decimal precision but within range, which shall be accepted.

## Non-Functional Constraints
- Validation shall be applied before any data is read or changed for the rejected request.
- Error messages shall be human-readable and free of internal implementation details.

## Related Specs
- `OFFERS.EMPTY.001`
- `APP.RATE.LIMIT.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
- `APP.RESPONSE.CONDITIONAL.001`
