# Spec: `APP.ACCESSIBILITY.UX.003`

## Metadata
- **Title**: Announced feedback, focused dialogs and TalkBack traversal sign-off
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application shell, My Account, Add Offer, Suggestions, Reports, Offers detail and comments
- **Priority**: High

## Purpose
Ensure that outcomes and errors are announced to TalkBack, dialogs keep focus inside their own content, status stays legible in both appearances, and end-to-end traversal is signed off at default and 200 percent font scale.

## Preconditions
- The user is on a supported screen with TalkBack enabled.
- The application has produced a status, validation result, or dialog.
- Font scale may be at the default or at 200 percent, in either appearance.

## Trigger
- A status message is presented, a modal surface is opened or dismissed, or accessibility verification is performed.

## Requirements
- `APP.ACCESSIBILITY.UX.003-R1`: Every status message shall be announced to TalkBack without requiring the user to move focus to it.
- `APP.ACCESSIBILITY.UX.003-R2`: Status messages shall cover validation errors, save and load outcomes, location confirmation, and selection changes.
- `APP.ACCESSIBILITY.UX.003-R3`: Error messages shall convey their severity through text and not by color alone.
- `APP.ACCESSIBILITY.UX.003-R4`: While a dialog is open, TalkBack focus shall remain within that dialog's content.
- `APP.ACCESSIBILITY.UX.003-R5`: When a dialog is dismissed, focus shall return to the control that opened it or an equivalent control.
- `APP.ACCESSIBILITY.UX.003-R6`: A success confirmation shall remain perceivable until the user has had a reasonable opportunity to perceive it, including when a view transition follows.
- `APP.ACCESSIBILITY.UX.003-R7`: Announcements shall use the active language and shall not expose internal status codes or raw coordinates.
- `APP.ACCESSIBILITY.UX.003-R8`: End-to-end TalkBack traversal sign-off evidence shall confirm that status announcements and dialog focus containment work on each supported surface, at both the default and 200 percent font scales, as defined by `APP.ACCESSIBILITY.UX.002`.
- `APP.ACCESSIBILITY.UX.003-R9`: Status messages and dialog text shall meet measured contrast thresholds in both the light and dark appearances, as defined by `APP.THEME.001` and `APP.ACCESSIBILITY.UX.001`.
- `APP.ACCESSIBILITY.UX.003-R10`: At 200 percent font scale, status messages and dialog content shall reflow without clipping, and the dialog's labelled close and action controls shall remain reachable, as defined by `APP.ADAPTIVE.UX.002`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Validation feedback is announced
  Given the user is completing a contribution or registration form
  When required content is missing and the user attempts to submit
  Then each missing item is identified in a message
  And the message is announced to TalkBack
  And the entered data remains available

Scenario: An error is distinguishable without color
  Given a load or save operation has failed
  When the failure message is shown
  Then the message text identifies the failure
  And the failure is not conveyed by color alone

Scenario: Focus stays within an open dialog
  Given an offer detail, comments, help, or search dialog is open
  When TalkBack moves through the dialog
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

Scenario: Traversal sign-off covers announcements and dialogs
  Given TalkBack is enabled at the default and 200 percent font scales
  When each supported surface is traversed and a status or dialog is produced
  Then every status is announced and dialog focus stays contained
  And sign-off evidence records the result for each surface and scale

Scenario: Status and dialog text contrast is measured in both appearances
  Given a status message and a dialog are shown in the light appearance and again in the dark appearance
  When their text is measured against its surface
  Then the measured contrast meets the accessibility thresholds in both appearances
  And the evidence is recorded

Scenario: Dialog content reflows at 200 percent font scale
  Given the Android font scale is set to 200 percent
  When a dialog with a long localized message is opened
  Then its content reflows without clipping
  And its labelled close and action controls remain reachable
```

## Example Inputs/Outputs
- Example input: submission rejected because the description is empty.
- Expected output: an announced message naming the description field, with the entered data preserved.
- Example input: an offer detail dialog is opened at 200 percent font scale.
- Expected output: TalkBack cannot reach content behind the dialog, and the close control remains reachable.
- Example input: sign-off pass over the shell in both appearances.
- Expected output: recorded evidence that every status is announced and dialog focus is contained.

## Edge Cases
- Two status messages produced in quick succession.
- A dialog opened from a control that is no longer present when the dialog closes.
- Localized messages longer than the source text at 200 percent font scale.
- A status that resolves before the user can perceive it.
- A dialog rendered in landscape or at expanded width, included in traversal sign-off.

## Non-Functional Constraints
- Announcements shall be brief and shall not repeat on every render.
- Announcements shall not expose internal status codes or raw coordinates.

## Related Specs
- `APP.PLATFORM.CHROME.001`
- `APP.TYPOGRAPHY.001`
- `APP.HELP.SEARCH.001`
- `APP.DRAFT.RECOVERY.001`
- `OFFERS.ACTIONS.LABELS.001`
- `APP.HELP.CONTEXTUAL.001`
- `OFFERS.ACTION.UNDO.001`
- `APP.ACCESSIBILITY.UX.001`
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
- `APP.ADAPTIVE.LANDSCAPE.001`
- `OFFERS.UX.002`
- `APP.POLISH.UX.001`
- `ADD.OFFER.UX.001`
- `APP.ACCESSIBILITY.UX.004`
- `APP.HAPTICS.001`
- `APP.THEME.001`
