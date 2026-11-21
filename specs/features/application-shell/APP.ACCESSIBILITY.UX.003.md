# Spec: `APP.ACCESSIBILITY.UX.003`

## Metadata
- **Title**: Announced feedback and focused dialogs
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell, My Account, Add Offer, Suggestions, Reports, Offers detail and comments
- **Priority**: High

## Purpose
Ensure that outcomes and errors are communicated to assistive technology and that dialogs keep focus inside their own content.

## Preconditions
- The user is on a supported screen with assistive technology enabled.
- The application has produced a status, validation result, or dialog.

## Trigger
- A status message is presented, or a modal surface is opened or dismissed.

## Requirements
- `APP.ACCESSIBILITY.UX.003-R1`: Every status message shall be announced to assistive technology without requiring the user to move focus to it.
- `APP.ACCESSIBILITY.UX.003-R2`: Status messages shall cover validation errors, save and load outcomes, location confirmation, and selection changes.
- `APP.ACCESSIBILITY.UX.003-R3`: Error messages shall convey their severity through text and not by color alone.
- `APP.ACCESSIBILITY.UX.003-R4`: While a dialog is open, assistive-technology focus shall remain within that dialog's content.
- `APP.ACCESSIBILITY.UX.003-R5`: When a dialog is dismissed, focus shall return to the control that opened it or an equivalent control.
- `APP.ACCESSIBILITY.UX.003-R6`: A success confirmation shall remain perceivable until the user has had a reasonable opportunity to perceive it, including when a view transition follows.
- `APP.ACCESSIBILITY.UX.003-R7`: Announcements shall use the active language and shall not expose internal status codes or raw coordinates.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Validation feedback is announced
  Given the user is completing a contribution or registration form
  When required content is missing and the user attempts to submit
  Then each missing item is identified in a message
  And the message is announced to assistive technology
  And the entered data remains available

Scenario: An error is distinguishable without color
  Given a load or save operation has failed
  When the failure message is shown
  Then the message text identifies the failure
  And the failure is not conveyed by color alone

Scenario: Focus stays within an open dialog
  Given an offer detail, comments, help, or search dialog is open
  When assistive technology moves through the dialog
  Then focus does not reach content behind the dialog
  And a labelled control closes the dialog

Scenario: Focus returns after dismissal
  Given a dialog was opened from a control
  When the dialog is dismissed
  Then focus returns to that control or an equivalent control

Scenario: Success is perceivable before navigation
  Given a contribution or report has been submitted successfully
  When the success confirmation is shown
  Then the confirmation is announced
  And the confirmation remains perceivable before the user is moved to another view
```

## Example Inputs/Outputs
- Example input: submission rejected because the description is empty.
- Expected output: an announced message naming the description field, with the entered data preserved.
- Example input: an offer detail dialog is opened.
- Expected output: assistive technology cannot reach content behind the dialog.

## Edge Cases
- Two status messages produced in quick succession.
- A dialog opened from a control that is no longer present when the dialog closes.
- Localized messages longer than the source text.
- A status that resolves before the user can perceive it.

## Non-Functional Constraints
- Announcements shall be brief and shall not repeat on every render.

## Related Specs
- `APP.ACCESSIBILITY.UX.002`
- `APP.RESILIENCE.UX.001`
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `SUGGESTIONS.SUBMIT.001`
- `REPORTS.SUBMIT.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.COMMENTS.001`
- `APP.LOCATION.FALLBACK.001`
- `APP.ADAPTIVE.UX.002`
- `OFFERS.UX.002`
