# Spec: `SUGGESTIONS.SUBMIT.001`

## Metadata
- **Title**: Suggestions View Submission Flow
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Suggestions View
- **Priority**: Medium

## Purpose
Allow a user to submit product suggestions with a required message and optional contact information.

## Preconditions
- The Suggestions view is available.

## Trigger
- User opens `Suggestions` or submits the suggestion form.

## Requirements
- `SUGGESTIONS.SUBMIT.001-R1`: The system shall provide a dedicated `Suggestions` view with a suggestion message input.
- `SUGGESTIONS.SUBMIT.001-R2`: The Suggestions view shall provide an optional contact input.
- `SUGGESTIONS.SUBMIT.001-R3`: The system shall reject suggestion submission when the message is blank.
- `SUGGESTIONS.SUBMIT.001-R4`: The system shall submit the suggestion message and optional contact details when the form is valid.
- `SUGGESTIONS.SUBMIT.001-R5`: After a successful suggestion submission response, the system shall redirect the user to `Offers`.
- `SUGGESTIONS.SUBMIT.001-R6`: When suggestion submission fails, the system shall keep the user in `Suggestions` and show a recoverable failure state.
- `SUGGESTIONS.SUBMIT.001-R7`: The submit action shall remain visible and operable while the on-screen keyboard is open.
- `SUGGESTIONS.SUBMIT.001-R8`: The suggestion message input shall display a live counter in `<current>/120` form and shall accept at most 120 characters, as specified in `APP.TEXTCOUNTER.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User submits a suggestion with optional contact
  Given the user is on Suggestions view
  When the user submits a non-empty suggestion message
  And the user optionally provides contact details
  Then the suggestion payload shall include the message
  And the contact details shall be included only when provided
  And after a successful response the system shall redirect the user to Offers

Scenario: Blank suggestion is rejected
  Given the user is on Suggestions view
  When the user submits the form with a blank suggestion message
  Then the suggestion submission shall be rejected
  And the Suggestions view shall remain displayed
  And a recoverable failure message shall be shown

Scenario: Suggestion message counter tracks typing and stops at 120
  Given the user is on Suggestions view with an empty message
  When the user types 10 characters
  Then the counter shows "10/120"
  When the message reaches 120 characters
  Then the input accepts no further characters
  And the counter shows "120/120"
```

## Example Inputs/Outputs
- Example input: message `Please add price alerts`, contact `me@example.com`.
- Expected output: suggestion is accepted and the app redirects to `Offers`.

## Edge Cases
- Contact details omitted; submission still succeeds when the suggestion message is valid.
- Submission failure does not clear the current form inputs automatically.

## Non-Functional Constraints
- Submission feedback should be returned promptly and should not require app restart or relaunch.

## Related Specs
- `APP.TEXTCOUNTER.001`
- `APP.SHELL.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.POLISH.UX.001`
- `APP.HAPTICS.001`
