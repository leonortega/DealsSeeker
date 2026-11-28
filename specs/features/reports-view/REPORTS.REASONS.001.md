# Spec: `REPORTS.REASONS.001`

## Metadata
- **Title**: Report Reason Categories and Send Confirmation
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Reports View
- **Priority**: Medium

## Purpose
Make reporting predictable by offering fixed reason categories and a clear confirmation before sending, without exposing machine-generated timestamps or identifiers.

## Preconditions
- The user is authenticated and the report overlay is open with optional offer context, as defined by `REPORTS.SUBMIT.001`.
- The report has not yet been sent.

## Trigger
- The report form is rendered; the user selects or changes a reason; the user requests to send; the user confirms or cancels.

## Requirements
- `REPORTS.REASONS.001-R1`: The report form shall present a fixed set of plain-language reason categories from which the user selects exactly one reason.
- `REPORTS.REASONS.001-R2`: A reason shall be required before the report can be sent, in addition to the required message defined by `REPORTS.SUBMIT.001-R5`; the send action shall be unavailable until both are provided.
- `REPORTS.REASONS.001-R3`: The selected reason shall be visible in the form and shall be repeated in a confirmation before the report is sent.
- `REPORTS.REASONS.001-R4`: Before sending, the system shall show a confirmation that restates the selected reason, the optional message and the offer context, with explicit Send and Cancel controls; the report shall be sent only when Send is selected in that confirmation.
- `REPORTS.REASONS.001-R5`: Cancel shall return to the form with the selected reason and message preserved and shall send nothing.
- `REPORTS.REASONS.001-R6`: System Back or an equivalent escape action taken from the confirmation shall behave as Cancel and shall send nothing.
- `REPORTS.REASONS.001-R7`: No machine-generated UTC timestamp, raw identifier or internal code shall appear in user-facing form, confirmation or success text; such values shall remain in the payload only, as defined by `REPORTS.FORM.002`.
- `REPORTS.REASONS.001-R8`: Reason categories and the confirmation shall be labelled and announced to assistive technology in the active language, and the selected reason's state shall be announced.
- `REPORTS.REASONS.001-R9`: Changing the selected reason before confirming shall update the confirmation so that it always restates the current reason.

## Acceptance Criteria (BDD)
```gherkin
Scenario: A reason is required before sending
  Given the report overlay is open with a non-empty message
  When no reason has been selected
  Then the send action shall be unavailable
  And plain-language reason categories shall be offered

Scenario: Confirmation restates the report before sending
  Given a reason and a non-empty message have been provided
  When the user requests to send
  Then a confirmation shall restate the selected reason, the message and the offer context
  And no report shall be sent until Send is selected in the confirmation

Scenario: Confirming sends the report once
  Given a confirmation restates the selected reason and message
  When the user selects Send
  Then the report shall be sent once
  And the success feedback shall follow APP.FEEDBACK.001

Scenario: Cancelling sends nothing and preserves the draft
  Given a report confirmation is displayed
  When the user selects Cancel
  Then no report shall be sent
  And the reason and message shall remain in the form

Scenario: System Back behaves as cancel
  Given a report confirmation is displayed
  When the user performs system Back
  Then no report shall be sent
  And the form shall return with the reason and message preserved

Scenario: No machine timestamp appears in user-facing report text
  Given a report is being prepared, confirmed or completed
  When the user reads the form, the confirmation and the success text
  Then no UTC timestamp, raw identifier or internal code shall be shown
  And the UTC timestamp shall remain in the payload only

Scenario: Changing the reason updates the confirmation
  Given a confirmation restates a selected reason
  When the user goes back and selects a different reason and confirms again
  Then the confirmation shall restate the new reason
```

## Example Inputs/Outputs
- Example input: the user selects the reason "Closed down", writes a message and requests to send.
- Expected output: a confirmation shows "Closed down", the message and the offer preview; nothing is sent until the user selects Send in the confirmation.
- Example input: the user selects Cancel at the confirmation.
- Expected output: no report is sent and the reason and message are still in the form.
- Example input: the user reads the confirmation with a UTC timestamp in the payload.
- Expected output: no timestamp or identifier appears in the visible or announced text.

## Edge Cases
- Long localized reason labels at 200 percent text size.
- A report opened without offer context — the confirmation omits the offer line but still requires a reason and shows no timestamp.
- System Back pressed twice in quick succession — no duplicate send and the draft is not lost.
- A reason selected, then the app backgrounded before confirming — the reason is still selected on return.
- Two reasons appear similar in translation — each announces its own label and selected state distinctly.
- A confirmation shown while the on-screen keyboard is open — Send and Cancel stay reachable.

## Non-Functional Constraints
- Reason categories shall be a fixed set rather than free-form text.
- The UTC timestamp and raw identifiers shall be attached to the payload only.
- No raw latitude or longitude value shall appear in the report form or confirmation.

## Related Specs
- `REPORTS.SUBMIT.001`
- `REPORTS.FORM.002`
- `APP.VALIDATION.001`
