# Spec: `APP.RATE.LIMIT.001`

## Metadata
- **Title**: Request Rate Limiting
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define the per-caller request allowance applied by the API and the observable rejection behaviour when the allowance is exceeded.

## Preconditions
- The API is running and able to observe the caller's network origin.
- For authenticated callers, the caller's authenticated user identity is resolvable from the request.
- A request allowance (limit and replenishment period) is defined per endpoint category.

## Trigger
- Any request received by the API.

## Requirements
- `APP.RATE.LIMIT.001-R1`: The system shall apply a per-caller request allowance to every API request.
- `APP.RATE.LIMIT.001-R2`: The system shall identify the caller by the caller's network origin and, for authenticated callers, additionally by the authenticated user.
- `APP.RATE.LIMIT.001-R3`: When a caller exceeds its allowance, the system shall reject the request with HTTP status `429`.
- `APP.RATE.LIMIT.001-R4`: The rejection response shall include a `Retry-After` response header stating how long the caller should wait before issuing the next request.
- `APP.RATE.LIMIT.001-R5`: The rejection response body shall use the standard error object shape defined in `APP.VALIDATION.001`.
- `APP.RATE.LIMIT.001-R6`: Requests issued below the caller's allowance shall not be rejected and shall be processed as usual.
- `APP.RATE.LIMIT.001-R7`: The system shall apply tighter allowances to the most expensive operations (offer search and location lookup) than to the remaining API endpoints, so that a single caller cannot monopolise the service.
- `APP.RATE.LIMIT.001-R8`: A rejected request shall perform no work: no data shall be read, created, updated or deleted.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Request exceeding the caller allowance is rejected
  Given a caller has already consumed its request allowance for an endpoint category
  When the caller issues one further request in that category
  Then the system shall respond with HTTP status 429
  And the response shall include a Retry-After header stating how long to wait
  And the response body shall use the standard error object shape

Scenario: Request below the caller allowance is unaffected
  Given a caller is within its request allowance for an endpoint category
  When the caller issues a request in that category
  Then the system shall respond with the normal success response
  And the request shall not be rejected

Scenario: Allowance is applied per caller identity
  Given caller A has exhausted its request allowance
  And caller B is within its request allowance
  When caller A issues a request
  Then the request from caller A shall be rejected with HTTP status 429
  And a request issued by caller B shall not be rejected

Scenario: Expensive operations have a tighter allowance
  Given offer search and location lookup have a tighter request allowance than other API endpoints
  When a caller exceeds the allowance for offer search
  Then the request shall be rejected with HTTP status 429
  And a request from the same caller to a non-expensive endpoint within its allowance shall not be rejected

Scenario: Rejected request performs no work
  Given a caller has exhausted its request allowance
  When the caller issues a request that would create data
  Then the request shall be rejected with HTTP status 429
  And no data shall be written or changed
```

## Example Inputs/Outputs
- Example input: A caller exceeding its allowance on an offer search request.
- Expected output: HTTP `429` with a `Retry-After` header and a standard error object body — see `examples/application-shell/app-rate-limit.rejected.json`.
- Example input: A caller within its allowance on a location lookup request.
- Expected output: HTTP `200` with the normal result collection.

## Edge Cases
- The caller's allowance is exhausted exactly at the moment of the request.
- A caller switches network origin while its allowance is partially consumed.
- An authenticated caller's session expires between allowance accounting and request handling.
- `Retry-After` is expressed in seconds and is always a positive whole number of seconds.
- The allowance period elapses between two requests from the same caller.

## Non-Functional Constraints
- The `Retry-After` header value shall be sufficient to avoid immediate repeated rejection.
- Allowances shall be enforced per caller, so that one caller's excess traffic does not degrade other callers.

## Related Specs
- `APP.VALIDATION.001`
