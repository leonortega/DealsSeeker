# Spec: `REPORTS.SUBMIT.001`

## Metadata
- **Title**: Reports View Generic Submission Flow
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Reports View
- **Priority**: High

## Purpose
Allow an authenticated user to submit a generic report from the Reports section, with or without offer-prefilled context.

## Preconditions
- User is authenticated.

## Trigger
- User opens `Reports` or submits the report form.

## Requirements
- `REPORTS.SUBMIT.001-R1`: The system shall provide a dedicated report overlay for authenticated users, opened only from an offer's Report action.
- `REPORTS.SUBMIT.001-R2`: The report overlay shall not be a navigation destination and shall not be reachable without offer context.
- `REPORTS.SUBMIT.001-R3`: The overlay shall show the offer preview and the prefilled offer identifier from `REPORTS.OFFER.PREFILL.001`.
- `REPORTS.SUBMIT.001-R4`: The Reports view shall prefill the current authenticated `userId` and a UTC report date/time value.
- `REPORTS.SUBMIT.001-R5`: The report message shall be required for submission.
- `REPORTS.SUBMIT.001-R6`: The report payload shall submit message, optional offerId, authenticated userId, and report date/time.
- `REPORTS.SUBMIT.001-R7`: After a successful report submission response, the system shall redirect the user to `Offers`.
- `REPORTS.SUBMIT.001-R8`: Unauthenticated access to Reports shall redirect to `Login`.
- `REPORTS.SUBMIT.001-R9`: The submit action shall remain visible and operable while the on-screen keyboard is open.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Authenticated user reports an offer
  Given the user is authenticated
  And the user selects Report on an offer
  When the report overlay opens and the user submits a non-empty message
  Then the offer preview shall be displayed
  And the payload shall include message, offer identifier, authenticated userId, and report date/time
  And after a successful response the system shall close the overlay and redirect to Offers

Scenario: No standalone Reports entry point
  Given the shared footer is displayed
  When the user views its destinations
  Then no Reports destination shall be present

Scenario: Unauthenticated user selects Report
  Given the user is not authenticated
  When the user selects Report on an offer
  Then the Login view shall be displayed
```

## Example Inputs/Outputs
- Example input: report message submitted from an offer's Report action.
- Expected output: report is accepted with userId and UTC report timestamp, then the app redirects to `Offers`.

## Edge Cases
- Message is blank; submission is rejected and Reports remains visible.
- Offer-prefilled reporting behavior is specified in `REPORTS.OFFER.PREFILL.001` and is the only report flow.

## Non-Functional Constraints
- Reports view should be immediately available after navigation from menu or legacy alias.

## Related Specs
- `APP.SHELL.001`
- `REPORTS.SHEET.001`
- `REPORTS.OFFER.PREFILL.001`
- `REPORTS.FORM.002`
- `ACCOUNT.PROFILE.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.POLISH.UX.001`
- `APP.HAPTICS.001`
