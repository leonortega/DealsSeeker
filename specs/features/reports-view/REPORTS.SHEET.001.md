# Spec: `REPORTS.SHEET.001`

## Metadata
- **Title**: Report Bottom Sheet Matching Comments
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Reports, Offers overlays
- **Priority**: Medium

## Purpose
Give report submission the same look, feel and interaction model as the offer comments overlay.

## Preconditions
- An offer is visible in the standard or immersive Offers presentation.
- The user is authenticated.

## Trigger
- The user selects Report on an offer.

## Requirements
- `REPORTS.SHEET.001-R1`: The report overlay shall use the same native bottom-sheet component, snap points, drag and swipe dismissal as the comments overlay.
- `REPORTS.SHEET.001-R2`: The report sheet shall use the same surface, corner radii, title typography, offer name treatment, multiline input, status line and primary action as the comments sheet.
- `REPORTS.SHEET.001-R3`: The report sheet shall not expose raw user or offer identifiers as user input.
- `REPORTS.SHEET.001-R4`: A successful submission shall show confirmable feedback, then close the sheet and return to Offers as defined in `APP.SHELL.001-R7`.
- `REPORTS.SHEET.001-R5`: Dismissing the sheet shall not change the offer or its report state.
- `REPORTS.SHEET.001-R6`: The behavior shall be identical in both presentations, themes and supported languages.
- `REPORTS.SHEET.001-R7`: The report surface shall offer a contextual help affordance that opens the same help surface with the reporting topic first, as defined in `APP.HELP.CONTEXTUAL.001`, without closing the report surface, submitting the draft, or leaving the Offers view.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Report opens as the same sheet as comments
  Given an offer is visible
  When the user selects Report
  Then a native bottom sheet opens with the comments sheet's surface and title treatment
  And the offer name is shown above a multiline report input
  And no separate Close button is rendered

Scenario: Submitting a report from the sheet
  Given the report sheet is open with a non-empty message
  When the user selects the primary action
  Then the payload includes the offer context per REPORTS.SUBMIT.001
  And confirmable feedback is shown
  And the sheet closes and the app returns to Offers

Scenario: Dismissing the report sheet
  Given the report sheet is open with a partially written message
  When the user swipes the sheet down
  Then the sheet closes without submitting
  And the offer list remains unchanged

Scenario: Contextual help opens from the report sheet
  Given the report sheet is open with a partially written message
  When the user selects its contextual help affordance
  Then the same help surface opens with reporting an offer shown first
  And the report sheet and its message remain open
  And dismissing help returns focus to the affordance
```

## Example Inputs/Outputs
- Example input: select Report on an offer, type a reason, tap Send Report.
- Expected output: feedback appears, the sheet closes after the dwell, Offers is displayed.

## Edge Cases
- Empty message submission.
- Failed submission while the sheet stays open.
- Sheet dismissed while the submit request is in flight.
- Large text and long localized labels.
- Contextual help opened while the report draft is partially written.

## Non-Functional Constraints
- No new visual component library shall be added; reuse the comments sheet styling pattern.

## Related Specs
- `REPORTS.SUBMIT.001`
- `REPORTS.OFFER.PREFILL.001`
- `APP.BOTTOM_SHEET.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `APP.HELP.CONTEXTUAL.001`
- `APP.HELP.001`
