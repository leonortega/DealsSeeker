# Spec: `APP.RESPONSE.CONDITIONAL.001`

## Metadata
- **Title**: Conditional and Reusable Responses for Read Operations
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Define validator-based reuse of read responses so that unchanged content is not transferred or recomputed, without ever serving one caller's content to another.

## Preconditions
- The request targets a read operation.
- The response representation can be identified by a validator value.

## Trigger
- A read request is received, optionally presenting a validator for a representation the client already holds.

## Requirements
- `APP.RESPONSE.CONDITIONAL.001-R1`: A read operation that returns user-independent content shall return a validator value identifying the exact representation served.
- `APP.RESPONSE.CONDITIONAL.001-R2`: When a client repeats a read request presenting a validator that matches the current representation, the system shall respond with HTTP status `304` and no body.
- `APP.RESPONSE.CONDITIONAL.001-R3`: A response answered with `304` shall perform no data retrieval for the represented content.
- `APP.RESPONSE.CONDITIONAL.001-R4`: The validator value shall differ when the underlying content differs.
- `APP.RESPONSE.CONDITIONAL.001-R5`: Responses that depend on the authenticated caller shall never be shared between callers, and shall never be answered with a representation belonging to a different caller.
- `APP.RESPONSE.CONDITIONAL.001-R6`: A response carrying compressed content shall remain correct when the client presents a matching validator.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Read response exposes a validator
  Given a read operation returns user-independent content
  When the client requests that content
  Then the response shall include a validator value identifying the exact representation served

Scenario: Matching validator yields a not modified response
  Given the client holds a representation of a read response together with its validator
  When the client repeats the read request presenting that validator
  Then the system shall respond with HTTP status 304
  And the response shall have no body
  And no data retrieval shall be performed for the represented content

Scenario: Validator changes when content changes
  Given the client holds a validator for the current representation of a read response
  And the underlying content changes
  When the client repeats the read request presenting the previous validator
  Then the validator for the new representation shall differ from the previous one
  And the system shall respond with the updated representation

Scenario: Caller-specific content is never shared
  Given a read response depends on the authenticated caller
  When two different authenticated callers request the same read operation
  Then neither caller shall receive a representation belonging to the other caller

Scenario: Compressed responses remain correct under conditional reuse
  Given a read response carries compressed content
  And the client holds the matching validator
  When the client repeats the read request presenting that validator
  Then the system shall respond with HTTP status 304 and no body
  And the representation the client already holds shall remain correct when decompressed

Scenario: Mismatched validator yields the current representation
  Given the client presents a validator that does not match the current representation
  When the client requests the read operation
  Then the system shall respond with the current representation and its current validator
```

## Example Inputs/Outputs
- Example input: A repeated read request presenting the validator of the representation already held.
- Expected output: HTTP `304` with an empty body — see `examples/application-shell/app-response-conditional.not-modified.json`.

## Edge Cases
- The client presents a validator that matches content of a different caller; the caller's own content is returned.
- The client presents a malformed or unknown validator; the current representation is returned.
- The content changes between the original request and the repeated request.
- The representation is large and compressed.
- The read operation has no validator because its content depends on the caller.

## Non-Functional Constraints
- The `304` response shall carry no body content.
- Validator values shall be stable for unchanged content so that repeated reads remain reusable.

## Related Specs
- `APP.VALIDATION.001`
- `OFFERS.SEARCH.001`
