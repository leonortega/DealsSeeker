# Spec: `ADD.OFFER.UX.001`

## Metadata
- **Title**: Field-Level Validation, Work Preservation and Explicit Success Completion
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Let a contributor fix an invalid offer at the offending field, keep everything they have typed while doing so, and decide when to leave after a successful contribution, using labelled Material 3 text fields and a Material 3 dialog confirmation without changing the validation and work-preservation behavior.

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
- `ADD.OFFER.UX.001-R9`: Validation feedback shall be shown inline while the user edits a field and shall not clear, overwrite or reorder any other entered value.
- `ADD.OFFER.UX.001-R10`: After a rejected submission, every value the user entered shall remain exactly as entered, including partially typed optional fields, selected photos, selected tags and the human-readable confirmed location label; no field shall be reset to a default.
- `ADD.OFFER.UX.001-R11`: An error message shall be attached to its own field without replacing that field's text, and focus shall move to the first offending field so it can be corrected in place.
- `ADD.OFFER.UX.001-R12`: Entered values shall also survive backgrounding, navigating away and relaunching as defined by `APP.DRAFT.RECOVERY.001`.
- `ADD.OFFER.UX.001-R13`: Text inputs shall follow a Material 3 labelled text field pattern with a persistent label and a helper or error text line attached to the field, so that each validation message stays with its own field as required by R2 and R11.
- `ADD.OFFER.UX.001-R14`: A successful contribution shall be confirmed through a Material 3 dialog pattern that remains visible until the user selects an explicit `View offer` or `Done` control, as required by R5; no timer shall dismiss or navigate from it.
- `ADD.OFFER.UX.001-R15`: The labelled-field and dialog patterns shall not change validation, work preservation, focus movement, announcement, success visual tone or coordinate privacy defined by R1–R12.

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

Scenario: A rejected submission preserves every entered value
  Given the user has typed a description, added tags and photos, and confirmed a location
  When the submission is rejected for an invalid item
  Then every entered value remains exactly as typed or selected
  And no field is reset to a default
  And the confirmed location is shown as a human-readable label

Scenario: Inline validation does not clear other fields
  Given the user is editing one field of a partly completed offer
  When inline validation appears for that field
  Then the other fields keep their values
  And no entered text is overwritten or reordered

Scenario: Focus moves to the first offending field
  Given several fields are invalid at submission
  When the field-level errors are attached
  Then focus is placed on the first offending field
  And that field's own text remains available for correction

Scenario: Entered values survive leaving the view
  Given the user has entered values in the Add Offer view
  When the app is backgrounded, the user navigates away, or the app is relaunched
  Then the entered values are recoverable as defined by APP.DRAFT.RECOVERY.001
  And no value is silently cleared

Scenario: Fields use labelled Material 3 inputs with helper or error text
  Given the user is in the Add Offer view
  When a field is rendered or fails validation
  Then it shall show a persistent label and a helper or error text line attached to that field
  And no single aggregated paragraph shall replace the field-level messages

Scenario: Success is confirmed through a Material 3 dialog
  Given the user submitted a valid offer
  When the create-offer request succeeds
  Then the confirmation shall be shown in a Material 3 dialog pattern
  And the dialog shall remain visible until the user selects View offer or Done
  And no timer shall close or navigate from it

Scenario: A long localized error line stays attached to its field
  Given a localized error message wraps to several lines beside other entered values
  When the field-level errors are attached
  Then the error text shall remain attached to its own field
  And the other entered values shall keep their text and order
```

## Example Inputs/Outputs
- Example input: submit with no photo, description, tags, or confirmed location.
- Expected output: no request sent; each field carries its own message; entered data retained.
- Example input: a successful create response while the user is reading the confirmation.
- Expected output: the confirmation remains until the user chooses `View offer` or `Done`.
- Example input: a field-level validation message on a labelled field.
- Expected output: the message appears as the field's error text line beside its persistent label, without altering other entered values.

## Edge Cases
- Several required items missing at once — each field still carries its own message.
- A localized message longer than the source text wraps without shifting other values.
- Editing an owned offer with an already-confirmed location — no raw coordinate value is introduced by the recovery or error path.
- The user leaves the success state in the background for longer than any former timer.
- A partially typed optional field when submission is rejected — the partial text is retained.
- Several invalid fields at once — focus goes to the first while all messages stay attached to their own fields.
- A localized helper or error line longer than the field width — it wraps within that field's pattern without shifting other values.

## Non-Functional Constraints
- Feedback shall not require a separate dismissal action to continue editing.
- Field-level validation shall not trade work preservation for brevity of feedback.
- The field and dialog patterns shall not replace field-level validation with an aggregated message or a timer-driven confirmation.

## Related Specs
- `APP.POLISH.UX.001`
- `APP.HELP.CONTEXTUAL.001`
- `APP.DRAFT.RECOVERY.001`
- `APP.RESILIENCE.UX.001`
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001`
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `APP.ACCESSIBILITY.UX.003`
- `ADD.OFFER.EXIT.001`
- `ADD.OFFER.KEYBOARD.001`
- `ADD.OFFER.SEQUENCED.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `APP.PERFORMANCE.001`
- `SUGGESTIONS.SUBMIT.001`
