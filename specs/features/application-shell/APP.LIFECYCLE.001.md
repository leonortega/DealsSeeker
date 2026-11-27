# Spec: `APP.LIFECYCLE.001`

## Metadata
- **Title**: Application Lifecycle Behavior
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Define how the application preserves user work and navigation state when it moves between foreground and background, without changing the brand UI or duplicating navigation state.

## Preconditions
- The application is installed on iOS or Android and is running in the foreground.
- The user has an active view with observable state, such as a search query, a radius, a form draft or a scroll position.

## Trigger
- The operating system moves the application to the background, returns it to the foreground, or recreates a view after a low-memory event.

## Requirements
- `APP.LIFECYCLE.001-R1`: When the application moves to the background, the system shall preserve the current destination and its view state.
- `APP.LIFECYCLE.001-R2`: When the application returns to the foreground, the system shall restore the prior destination and its view state without an unexpected restart.
- `APP.LIFECYCLE.001-R3`: An unsaved form draft shall survive a background/foreground transition and shall remain subject to its existing discard confirmation.
- `APP.LIFECYCLE.001-R4`: Transient input state that is no longer meaningful on return, such as an open on-screen keyboard, may be dismissed, but no entered data shall be lost.
- `APP.LIFECYCLE.001-R5`: A request that is in flight when the application is backgrounded shall resolve once; its result shall be applied or safely discarded without double-handling on return.
- `APP.LIFECYCLE.001-R6`: If the user's session is no longer valid on return, the system shall move to authentication with a clear message and shall not present a stale protected view.
- `APP.LIFECYCLE.001-R7`: Lifecycle handling shall not duplicate the navigation state or back stack owned by the native navigation behavior.
- `APP.LIFECYCLE.001-R8`: Lifecycle transitions shall not alter the brand UI, and no platform-specific visual adaptation shall be introduced.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Background and restore a search
  Given the user is on Offers with a query and a coverage radius
  When the application is moved to the background and then returned to the foreground
  Then Offers shall be visible again
  And the query and radius shall be restored

Scenario: Background with an unsaved draft
  Given the user has entered an unsaved Add Offer draft
  When the application is moved to the background and returned
  Then the draft content shall still be present
  And discarding the draft shall still require confirmation

Scenario: Return after the session is no longer valid
  Given the application was backgrounded with a valid session
  And the session is no longer valid on return
  When the application returns to the foreground
  Then an authentication view shall be shown
  And a clear message shall explain why
  And no stale protected view shall be displayed

Scenario: In-flight request across a lifecycle transition
  Given a save request is in progress
  When the application is backgrounded and returned before the request resolves
  Then the request shall be handled exactly once
  And the result shall not be applied twice
```

## Example Inputs/Outputs
- Example input: Offers with query `coffee`, radius `1000 m`, backgrounded and resumed.
- Expected output: Offers is shown with `coffee` and `1000 m`; no extra back entry is created.
- Example input: Add Offer with a typed description, backgrounded and resumed.
- Expected output: the description is still present and Cancel still opens the discard confirmation.

## Edge Cases
- Rapid repeated background/foreground transitions shall not duplicate state restoration.
- Backgrounding while a modal is open shall return to the same modal with its content intact.
- A localized message produced after a long suspension shall use the active language.
- Large text or a changed orientation during suspension shall not discard entered data.
- The device reports no lifecycle event (for example, a brief loss of focus) — no state shall be cleared.

## Non-Functional Constraints
- Lifecycle handling shall use the operating system's standard lifecycle signals.
- No new dependency shall be added solely for lifecycle state preservation.
- Full restoration after a low-memory process restart is out of scope here; it needs durable storage of view state and is deferred to a separate capability spec.

## Related Specs
- `APP.HELP.CONTEXTUAL.001`
- `APP.SHELL.001`
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.ACCESSIBILITY.UX.004`
- `APP.RESILIENCE.UX.001`
- `ADD.OFFER.EXIT.001`
