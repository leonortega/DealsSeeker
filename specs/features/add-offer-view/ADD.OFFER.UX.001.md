# Spec: `ADD.OFFER.UX.001`

## Metadata
- **Title**: Field-Level Validation and Explicit Success Completion
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Let a contributor fix an invalid offer at the offending field and decide when to leave after a successful contribution.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- The user submits the offer, or a required item is missing or invalid.

## Requirements
- `ADD.OFFER.UX.001-R1`: When a required item is missing, the system shall not send the request.
- `ADD.OFFER.UX.001-R2`: Each missing or invalid item shall be identified by a validation message attached to its own field, with guidance to correct it; a single aggregated paragraph shall not be used in place of field-level messages.
- `ADD.OFFER.UX.001-R3`: Entered data shall be preserved after a rejected submission.
- `ADD.OFFER.UX.001-R4`: A successful contribution shall be confirmed in plain language.
- `ADD.OFFER.UX.001-R5`: The success confirmation shall resolve only when the user selects an explicit `View offer` or `Done` control; no timer shall close the view or navigate away, and the confirmation shall stay perceivable until that selection.
- `ADD.OFFER.UX.001-R6`: Feedback shall be announced to assistive technology.
- `ADD.OFFER.UX.001-R7`: Raw coordinate values shall not be shown in the location UI.
- `ADD.OFFER.UX.001-R8`: The success confirmation shall use a success visual tone distinct from validation errors.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Missing required content is explained at each field
  Given the user is in the Add Offer view
  And the photo, description, tag, and location items are all missing
  When the user attempts to submit
  Then the request is not sent
  And a validation message is attached to each missing item's own field
  And no single aggregated paragraph replaces the field-level messages
  And entered data is preserved

Scenario: Successful contribution waits for an explicit completion control
  Given the user submitted a valid offer
  When the create-offer request succeeds
  Then the app confirms the offer was created
  And the confirmation uses a success visual tone distinct from errors
  And the confirmation stays visible until the user selects View offer or Done
  And no timer navigates away or closes the view

Scenario: Feedback is announced
  Given a validation error or a success confirmation is shown
  When assistive technology is active
  Then the message is announced
  And no internal status code is used as the message

Scenario: Coordinate privacy is preserved
  Given an offer with a confirmed location is displayed
  When the user views the location information
  Then no raw latitude or longitude values are shown
```

## Example Inputs/Outputs
- Example input: submit with no photo, description, tags, or confirmed location.
- Expected output: no request sent; each field carries its own message; entered data retained.
- Example input: a successful create response while the user is reading the confirmation.
- Expected output: the confirmation remains until the user chooses `View offer` or `Done`.

## Edge Cases
- Several required items missing at once — each field still carries its own message.
- A localized message longer than the source text.
- Editing an owned offer with an already-confirmed location.
- The user leaves the success state in the background for longer than any former timer.

## Non-Functional Constraints
- Feedback shall not require a separate dismissal action to continue editing.

## Related Specs
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001`
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.POLISH.UX.001`
- `ADD.OFFER.EXIT.001`
- `ADD.OFFER.KEYBOARD.001`
- `ADD.OFFER.SEQUENCED.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `APP.PERFORMANCE.001`
