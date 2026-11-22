# Spec: `ADD.OFFER.UX.001`

## Metadata
- **Title**: Clear contribution flow feedback
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Let a contributor complete a valid offer without guessing what failed, and confirm a successful contribution before leaving the view.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- The user submits the offer, or a required item is missing or invalid.

## Requirements
- `ADD.OFFER.UX.001-R1`: When a required item is missing, the system shall not send the request.
- `ADD.OFFER.UX.001-R2`: Each missing item shall be identified with guidance to correct it.
- `ADD.OFFER.UX.001-R3`: Entered data shall be preserved after a rejected submission.
- `ADD.OFFER.UX.001-R4`: A successful contribution shall be confirmed in plain language.
- `ADD.OFFER.UX.001-R5`: The success confirmation shall remain perceivable for at least 3 seconds before the view closes.
- `ADD.OFFER.UX.001-R6`: Feedback shall be announced to assistive technology.
- `ADD.OFFER.UX.001-R7`: Raw coordinate values shall not be shown in the location UI.
- `ADD.OFFER.UX.001-R8`: The success confirmation shall use a success visual tone distinct from validation errors.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Missing required content is explained at the point of action
  Given the user is in the Add Offer view
  And a required item such as photo, description, tag, or location is missing
  When the user attempts to submit
  Then the request is not sent
  And each missing item is identified with guidance to correct it
  And entered data is preserved

Scenario: Successful contribution confirms the outcome
  Given the user submitted a valid offer
  When the create-offer request succeeds
  Then the app confirms the offer was created
  And the confirmation uses a success visual tone distinct from errors
  And the confirmation remains perceivable for at least 3 seconds
  And the user is returned to the Offers view after the confirmation is perceivable

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
- Expected output: no request sent; a message naming all four missing items; entered data retained.

## Edge Cases
- Several required items missing at once.
- A localized message longer than the source text.
- Editing an owned offer with an already-confirmed location.

## Non-Functional Constraints
- Feedback shall not require a separate dismissal action to continue editing.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.POLISH.UX.001`
- `ADD.OFFER.EXIT.001`
- `ADD.OFFER.KEYBOARD.001`
