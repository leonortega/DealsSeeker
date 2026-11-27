# Spec: `REPORTS.OFFER.PREFILL.001`

## Metadata
- **Title**: Reports View Prefill from Offer Item
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Reports View
- **Priority**: High

## Purpose
Ensure report creation from Offers list carries full context into report overlay.

## Preconditions
- User is authenticated.
- Offers list contains at least one offer item.

## Trigger
- User selects `Report` on an offer item in Offers view.

## Requirements
- `REPORTS.OFFER.PREFILL.001-R1`: The system shall navigate to report overlay when Report is selected from an offer item.
- `REPORTS.OFFER.PREFILL.001-R2`: The report overlay shall display a preview of the selected offer item.
- `REPORTS.OFFER.PREFILL.001-R3`: The report draft shall include selected `offerId`.
- `REPORTS.OFFER.PREFILL.001-R4`: The report draft shall include current `userId`.
- `REPORTS.OFFER.PREFILL.001-R5`: The report draft shall include report date/time.
- `REPORTS.OFFER.PREFILL.001-R6`: The report draft shall include a prefilled text message created at report-button press time.
- `REPORTS.OFFER.PREFILL.001-R7`: On report submission from report overlay, the system shall submit message, offerId, userId, and report date/time.
- `REPORTS.OFFER.PREFILL.001-R8`: After a successful report submission response (no errors), the system shall present an explicit completion control that returns to `Offers` view; it shall not navigate on a timer.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Report action opens report overlay with prefilled metadata
  Given an authenticated user is on Offers view
  And an offer item is visible
  When the user selects Report on that offer item
  Then report overlay shall be displayed
  And offer preview shall be displayed
  And offerId shall be prefilled
  And userId shall be prefilled
  And report date/time shall be prefilled
  And report text shall be prefilled

Scenario: Submit report with prefilled context
  Given report overlay has prefilled context from selected offer
  When the user submits the report
  Then report payload shall include message, offerId, userId, and report date/time
  And report submission shall complete successfully
  And an explicit completion control returns the user to Offers view
```

## Example Inputs/Outputs
- Example input: User taps Report on offer `off-102`.
- Expected output: report overlay opens with preview for `off-102` and prefilled metadata.

## Edge Cases
- No standalone report entry point exists; a report is always opened from an offer's Report action.
- Session missing at navigation time; user is redirected to login.

## Non-Functional Constraints
- Navigation from Report button to report overlay should feel immediate.

## Related Specs
- `OFFERS.LIST.ACTIONS.001`
- `ACCOUNT.PROFILE.001`
- `REPORTS.SUBMIT.001`
- `REPORTS.SHEET.001`
- `REPORTS.FORM.002`
