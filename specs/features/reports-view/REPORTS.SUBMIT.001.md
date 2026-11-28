# Spec: `REPORTS.SUBMIT.001`

## Metadata
- **Title**: Reports View Generic Submission Flow
- **Version**: `v1.3`
- **Status**: Approved
- **Context/View**: Reports View
- **Priority**: High

## Purpose
Allow an authenticated user to submit a report from a specific offer, choosing a reason and confirming before it is sent, with no machine-generated timestamp shown in user-facing text.

## Preconditions
- User is authenticated.

## Trigger
- User opens `Reports` from an offer's Report action, chooses a reason, or requests to send the report.

## Requirements
- `REPORTS.SUBMIT.001-R1`: The system shall provide a dedicated report overlay for authenticated users, opened only from an offer's Report action.
- `REPORTS.SUBMIT.001-R2`: The report overlay shall not be a navigation destination and shall not be reachable without offer context.
- `REPORTS.SUBMIT.001-R3`: The overlay shall show the offer preview and the prefilled offer identifier from `REPORTS.OFFER.PREFILL.001`.
- `REPORTS.SUBMIT.001-R4`: The Reports view shall attach the current authenticated `userId` and a UTC report date/time value to the payload internally, without presenting either in user-facing text.
- `REPORTS.SUBMIT.001-R5`: The report message shall be required for submission.
- `REPORTS.SUBMIT.001-R6`: The report payload shall submit message, optional offerId, authenticated userId, and report date/time.
- `REPORTS.SUBMIT.001-R7`: After a successful report submission response, the system shall present an explicit completion control that returns the user to `Offers`; it shall not navigate on a timer.
- `REPORTS.SUBMIT.001-R8`: Unauthenticated access to Reports shall redirect to `Login`.
- `REPORTS.SUBMIT.001-R9`: The submit action shall remain visible and operable while the on-screen keyboard is open.
- `REPORTS.SUBMIT.001-R10`: The report message input shall display a live counter in `<current>/120` form and shall accept at most 120 characters, as specified in `APP.TEXTCOUNTER.001`.
- `REPORTS.SUBMIT.001-R11`: The report form shall offer a fixed set of plain-language reason categories, and the user shall select exactly one reason before sending, as defined by `REPORTS.REASONS.001`.
- `REPORTS.SUBMIT.001-R12`: Before the report is sent, the system shall show a confirmation that restates the selected reason, the optional message and the offer context, with explicit Send and Cancel controls; no report shall be sent until Send is selected in that confirmation.
- `REPORTS.SUBMIT.001-R13`: Cancel or system Back from the confirmation shall send nothing and shall return to the form with the selected reason and message preserved, as defined by `REPORTS.REASONS.001`.
- `REPORTS.SUBMIT.001-R14`: No machine-generated UTC timestamp, raw identifier or internal code shall appear in user-facing form, confirmation or success text; such values shall remain in the payload only, as defined by `REPORTS.FORM.002` and `REPORTS.REASONS.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Authenticated user reports an offer
  Given the user is authenticated
  And the user selects Report on an offer
  When the report overlay opens, the user selects a reason, writes a message and confirms Send
  Then the offer preview shall be displayed
  And the payload shall include message, offer identifier, authenticated userId, and report date/time
  And after a successful response the confirmation remains visible and an explicit Done control returns to Offers

Scenario: No standalone Reports entry point
  Given the shared footer is displayed
  When the user views its destinations
  Then no Reports destination shall be present

Scenario: Unauthenticated user selects Report
  Given the user is not authenticated
  When the user selects Report on an offer
  Then the Login view shall be displayed

Scenario: Report message counter tracks typing and stops at 120
  Given the report overlay is open with an empty message
  When the user types 10 characters
  Then the counter shows "10/120"
  When the message reaches 120 characters
  Then the input accepts no further characters
  And the counter shows "120/120"

Scenario: A reason and a confirmation are required before sending
  Given the report overlay is open with a selected reason and a non-empty message
  When the user requests to send
  Then a confirmation shall restate the reason, the message and the offer context
  And no report shall be sent until Send is selected in the confirmation

Scenario: Cancelling sends nothing and keeps the draft
  Given a report confirmation is displayed
  When the user selects Cancel or uses system Back
  Then no report shall be sent
  And the selected reason and message shall remain in the form

Scenario: No machine timestamp appears in user-facing report text
  Given a report is being prepared, confirmed or completed
  When the user reads the report overlay, confirmation and success text
  Then no UTC timestamp, raw identifier or internal code shall be shown
  And the UTC timestamp shall remain in the payload only
```

## Example Inputs/Outputs
- Example input: report message submitted from an offer's Report action after choosing a reason and confirming.
- Expected output: report is accepted with userId and UTC timestamp in the payload, no machine timestamp in any user-facing text, the confirmation stays visible, and an explicit Done control returns to `Offers`.
- Example input: the user selects Cancel at the confirmation.
- Expected output: nothing is sent and the reason and message are still in the form.

## Edge Cases
- Message is blank; submission is rejected and Reports remains visible.
- Offer-prefilled reporting behavior is specified in `REPORTS.OFFER.PREFILL.001` and is the only report flow.
- The user changes the selected reason after the confirmation was shown — the confirmation reflects the new reason before sending.
- The confirmation is dismissed with system Back instead of the Cancel control.
- A report is submitted while the device clock uses a non-UTC time zone — user-facing text still contains no machine timestamp.

## Non-Functional Constraints
- Reports view should be immediately available after navigation from menu or legacy alias.
- Report submission shall follow the shared pending-then-outcome feedback lifecycle defined in `APP.FEEDBACK.001`.
- No raw latitude or longitude value shall appear in report form, confirmation or success text.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `OFFERS.GUEST.001`
- `APP.TEXTCOUNTER.001`
- `APP.SHELL.001`
- `REPORTS.SHEET.001`
- `REPORTS.OFFER.PREFILL.001`
- `REPORTS.FORM.002`
- `ACCOUNT.PROFILE.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.POLISH.UX.001`
- `APP.HAPTICS.001`
- `REPORTS.REASONS.001`
- `APP.VALIDATION.001`
- `APP.FEEDBACK.001`
