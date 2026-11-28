# Spec: `APP.HELP.CONTEXTUAL.001`

## Metadata
- **Title**: Contextual help entry points and inline field guidance
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application shell; no-position state, Offers empty/filter-clearing state, Add Offer, report, sign-in guard
- **Priority**: Medium

## Purpose
Let users open the existing searchable help surface at the point of confusion, with the relevant topic shown first, and give short inline guidance at the exact field or decision that caused the confusion, without leaving what they were doing.

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
- `APP.HELP.CONTEXTUAL.001-R10`: At each entry point in R1, the system shall present short inline guidance beside the specific field or decision that caused the confusion, in addition to the contextual help affordance and without covering or replacing that field or decision.
- `APP.HELP.CONTEXTUAL.001-R11`: Inline guidance shall address these decisions: in Add Offer, what a confirmed location means and how to change it, plus what makes a useful description and tag; in the report surface, what to include in the reason or message and that sending requires explicit confirmation; in the no-position state, how to provide a position or use an explicit override; at the sign-in guard, why sign-in is needed for the gated action and that the user's place is preserved.
- `APP.HELP.CONTEXTUAL.001-R12`: Inline guidance shall be present while the field or decision is active, shall collapse when that field is completed or the user moves on, and shall not block typing, field-level validation, or the primary action.
- `APP.HELP.CONTEXTUAL.001-R13`: Inline guidance shall be attached to and announced with its field by assistive technology, shall follow the active theme and localization, and shall remain readable at 200 percent text scaling.
- `APP.HELP.CONTEXTUAL.001-R14`: Inline guidance shall not expose raw coordinate values and shall not add to or duplicate the topics of the help surface, whose search behaviour is defined in `APP.HELP.SEARCH.001`.

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

Scenario: Add Offer fields carry inline guidance
  Given the Add Offer view is open with its location, description and tag fields
  When the user focuses each field
  Then short guidance is shown beside that field
  And the location guidance explains a confirmed location without showing coordinates
  And the field and its primary action stay usable

Scenario: Report field carries inline guidance
  Given the report surface is open with a reason or message field
  When the user focuses that field
  Then guidance explains what to include and that sending needs explicit confirmation
  And the draft message stays editable

Scenario: No-position state carries inline guidance
  Given the no-position state is displayed
  When the user reads its decision
  Then inline guidance explains how to provide a position or use an explicit override
  And no location-bound search is started by the guidance

Scenario: Sign-in guard carries inline guidance
  Given a sign-in guard is shown for a gated contribution action
  When the user reads the guard
  Then inline guidance explains why sign-in is needed and that their place is preserved
  And the sign-in form and preserved context remain usable

Scenario: Inline guidance collapses and stays attached
  Given inline guidance is shown for an active field
  When the user completes that field and moves to the next one
  Then the guidance for the completed field collapses
  And guidance for the newly active field may appear
  And each guidance is announced with its own field
  And no raw latitude or longitude value is shown
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
- Inline guidance and a field-level validation message are both present — both stay attached to the same field without overlapping.
- Guidance text localized to a longer form wraps beside the field at 200 percent scaling without covering the primary action.
- The user searches the help surface while an inline guidance is visible — both remain available and neither duplicates the other.

## Non-Functional Constraints
- The existing searchable help surface shall be reused; no new overlay or route shall be introduced.
- Help content and inline guidance shall not expose raw coordinates in any context.
- Inline guidance shall add no new topic to the five essential topics.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.HELP.SEARCH.001`
- `ADD.OFFER.UX.001`
- `APP.DRAFT.RECOVERY.001`
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
