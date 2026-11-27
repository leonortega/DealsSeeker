# Spec: `APP.HELP.CONTEXTUAL.001`

## Metadata
- **Title**: Contextual help entry points
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell; no-position state, Offers empty/filter-clearing state, Add Offer, report, sign-in guard
- **Priority**: Medium

## Purpose
Let users open the existing help surface at the point of confusion, with the relevant topic shown first, without leaving what they were doing.

## Preconditions
- Help content is available in the active language.
- The user is in one of the contexts listed in R1.

## Trigger
- The user selects a contextual help affordance in one of those contexts.

## Requirements
- `APP.HELP.CONTEXTUAL.001-R1`: The system shall offer a contextual help affordance at each of these entry points: the no-position state of `APP.LOCATION.UNAVAILABLE.001`, the empty-results or clear-filters state, the Add Offer view, the report surface, and the sign-in guard for a contribution action.
- `APP.HELP.CONTEXTUAL.001-R2`: Selecting any contextual help affordance shall open the same single dismissible help surface defined in `APP.HELP.001`, without creating a second help surface.
- `APP.HELP.CONTEXTUAL.001-R3`: The surface shall open with the topic relevant to the invoking context shown first, drawn from the five topics of `APP.HELP.001-R3`; the no-position and empty/filter-clearing states shall open on finding deals, Add Offer on contributing an offer, the report surface on reporting an offer, and the sign-in guard on the topic matching the gated action.
- `APP.HELP.CONTEXTUAL.001-R4`: Opening contextual help shall not navigate away from the invoking context or change its query, filters, draft offer, report draft, or sign-in prompt.
- `APP.HELP.CONTEXTUAL.001-R5`: Dismissing contextual help shall return focus to the invoking control and leave the underlying context unchanged.
- `APP.HELP.CONTEXTUAL.001-R6`: The affordance, topic selection, and help content shall be localized and shall follow the active theme.
- `APP.HELP.CONTEXTUAL.001-R7`: The affordance and the help surface shall be reachable and announced by assistive technology.
- `APP.HELP.CONTEXTUAL.001-R8`: Contextual help shall not replace or duplicate the help control in the Offers header defined in `APP.HELP.001`.
- `APP.HELP.CONTEXTUAL.001-R9`: No raw `lat` or `lng` value shall appear in the affordance or in the help content.

## Acceptance Criteria (BDD)
```gherkin
Scenario: No-position state offers contextual help
  Given the no-position state of APP.LOCATION.UNAVAILABLE.001 is displayed
  When the user selects its contextual help affordance
  Then the same help surface opens with finding deals shown first
  And the user remains in the current view

Scenario: Empty or filter-clearing results offer contextual help
  Given an empty-results or clear-filters state is displayed
  When the user selects its contextual help affordance
  Then the same help surface opens with finding deals shown first
  And the active query and filters are unchanged

Scenario: Add Offer offers contextual help
  Given the user is in Add Offer with a draft in progress
  When the user selects its contextual help affordance
  Then the same help surface opens with contributing an offer shown first
  And the user remains in Add Offer with the draft unchanged

Scenario: Report surface offers contextual help
  Given the report surface is open with a partially written message
  When the user selects its contextual help affordance
  Then the same help surface opens with reporting an offer shown first
  And the report surface and its message remain open

Scenario: Sign-in guard offers contextual help
  Given a sign-in guard is shown for a gated contribution action
  When the user selects its contextual help affordance
  Then the same help surface opens with the topic for that action shown first
  And the sign-in prompt and preserved Offers context remain unchanged

Scenario: Dismissing contextual help returns focus and preserves context
  Given contextual help was opened from any entry point
  When the user dismisses the help surface
  Then focus returns to the control that opened it
  And the underlying context is unchanged
  And only one help surface was used

Scenario: Contextual help keeps the five essential topics
  Given contextual help was opened with a relevant topic first
  When the user reviews the help surface
  Then the same five topics of APP.HELP.001 are listed
  And no extra topic is added

Scenario: Contextual help is announced and holds under localization and text scaling
  Given Spanish is active and the system text size is set to 200 percent
  When a contextual help affordance is displayed and opened
  Then the affordance and the help surface are announced by assistive technology
  And no text is clipped
  And no raw latitude or longitude value is visible
```

## Example Inputs/Outputs
- Example input: a user denied location selects the contextual help affordance on the no-position state.
- Expected output: the same dismissible help surface opens with "Finding deals" first, no navigation occurs, and focus returns to the affordance on dismissal.

## Edge Cases
- Contextual help opened while a search, report submission, or save is in flight.
- The invoking context changes presentation while help is open.
- Localized labels are longer than the source text.
- Large text scaling on a phone-sized screen.
- Assistive technology reads the affordance before the surrounding state.

## Non-Functional Constraints
- The existing help surface shall be reused; no new overlay or route shall be introduced.
- Help content shall not expose raw coordinates in any context.

## Related Specs
- `APP.HELP.001`
- `APP.LOCATION.UNAVAILABLE.001`
- `REPORTS.SHEET.001`
- `ADD.OFFER.LAYOUT.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `OFFERS.EMPTY.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.BOTTOM_SHEET.001`
