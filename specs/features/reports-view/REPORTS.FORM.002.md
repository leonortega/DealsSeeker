# Spec: `REPORTS.FORM.002`

## Metadata
- **Title**: Contributor-Facing Report Fields
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Reports View
- **Priority**: Medium

## Purpose
Keep internal identifiers out of the report form while preserving the existing submission payload.

## Preconditions
- User is authenticated and in the Reports view.
- `REPORTS.SUBMIT.001` and `REPORTS.OFFER.PREFILL.001` remain in force.

## Trigger
- The Reports view is rendered with or without offer-prefilled context.

## Requirements
- `REPORTS.FORM.002-R1`: The Reports view shall not display a raw user identifier as a form field or label.
- `REPORTS.FORM.002-R2`: The Reports view shall not require the user to type an offer identifier; offer context shall come only from the offer-driven Report action defined in `REPORTS.OFFER.PREFILL.001`.
- `REPORTS.FORM.002-R3`: When no offer context is available, the report shall be submitted without an offer identifier, as defined in `REPORTS.SUBMIT.001-R3`.
- `REPORTS.FORM.002-R4`: The authenticated user identifier and UTC timestamp shall still be attached to the payload internally, without being presented as editable user input.
- `REPORTS.FORM.002-R5`: The report reason shall be required in addition to the message, per `REPORTS.REASONS.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Generic report hides internal identifiers
  Given an authenticated user opens Reports directly without offer context
  When the report form is rendered
  Then no raw user identifier shall be displayed
  And no offer identifier input shall be displayed
  And the report message shall be the only required input

Scenario: Generic report still carries internal context
  Given an authenticated user opens Reports directly without offer context
  When the user submits a non-empty report message
  Then the payload shall include the authenticated user identifier and a UTC timestamp
  And the payload shall omit the offer identifier

Scenario: Prefilled report keeps its offer context without exposing the identifier
  Given the user opened Reports from an offer
  When the report form is rendered
  Then the offer preview shall be displayed
  And no raw offer identifier input shall be displayed
  And the submitted payload shall include that offer's identifier
```

## Example Inputs/Outputs
- Example input: open Reports directly and enter "Closed down".
- Expected output: form shows only the message; payload carries `userId`, UTC timestamp, and no `offerId`.

## Edge Cases
- Localized labels for internal fields are removed from both supported languages.
- Long user identifiers no longer wrap or affect form height.
- Editing an offer draft must not reintroduce an identifier field.

## Non-Functional Constraints
- Removing the fields shall not change validation, submission or redirect behavior.

## Related Specs
- `REPORTS.SUBMIT.001`
- `REPORTS.OFFER.PREFILL.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.LOCALIZATION.001`
