# Spec: `REPORTS.SUBMIT.001`

## Metadata
- **Title**: Reports View Generic Submission Flow
- **Version**: `v1.0`
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
- `REPORTS.SUBMIT.001-R1`: The system shall provide a dedicated `Reports` view for authenticated users.
- `REPORTS.SUBMIT.001-R2`: The Reports view shall support the standard Reports entry point and the legacy Complaints entry point as the same reporting flow.
- `REPORTS.SUBMIT.001-R3`: When Reports is opened without offer-prefilled context, the view shall omit the offer preview and still allow report submission.
- `REPORTS.SUBMIT.001-R4`: The Reports view shall prefill the current authenticated `userId` and a UTC report date/time value.
- `REPORTS.SUBMIT.001-R5`: The report message shall be required for submission.
- `REPORTS.SUBMIT.001-R6`: The report payload shall submit message, optional offerId, authenticated userId, and report date/time.
- `REPORTS.SUBMIT.001-R7`: After a successful report submission response, the system shall redirect the user to `Offers`.
- `REPORTS.SUBMIT.001-R8`: Unauthenticated access to Reports shall redirect to `Login`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Authenticated user submits a generic report
  Given the user is authenticated
  And the user opens Reports directly without offer context
  When the user submits a non-empty report message
  Then no offer preview shall be required
  And the payload shall include message, authenticated userId, and report date/time
  And after a successful response the system shall redirect the user to Offers

Scenario: Unauthenticated user opens Reports
  Given the user is not authenticated
  When the user opens Reports
  Then the Login view shall be displayed

Scenario: Reports supports legacy Complaints entry point
  Given the user is authenticated
  When the user opens the legacy Complaints entry point
  Then the Reports submission flow shall be displayed
  And submitting a valid report shall use the same report behavior as Reports
```

## Example Inputs/Outputs
- Example input: generic report message with no offer selected.
- Expected output: report is accepted with userId and UTC report timestamp, then the app redirects to `Offers`.

## Edge Cases
- Message is blank; submission is rejected and Reports remains visible.
- Offer-prefilled reporting behavior is specified separately and augments, rather than replaces, this generic report flow.

## Non-Functional Constraints
- Reports view should be immediately available after navigation from menu or legacy alias.

## Related Specs
- `APP.SHELL.001`
- `REPORTS.OFFER.PREFILL.001`
- `ACCOUNT.PROFILE.001`
