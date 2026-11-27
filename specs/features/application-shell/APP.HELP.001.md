# Spec: `APP.HELP.001`

## Metadata
- **Title**: In-product help surface and essential topics
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations), application-shell entry points
- **Priority**: Low

## Purpose
Give first-time users a short, task-focused explanation of the essential flows where they need it, without leaving the view they are in.

## Preconditions
- For the Offers help control, the user is authenticated and in the Offers section.
- For a contextual entry point, the user is in the context defined in `APP.HELP.CONTEXTUAL.001` and may be unauthenticated.
- Help content is available in the active language.

## Trigger
- User selects the help control in the Offers header, or selects a contextual help affordance at an entry point defined in `APP.HELP.CONTEXTUAL.001`.

## Requirements
- `APP.HELP.001-R1`: The Offers view shall present a labelled help control in its header in both the standard and immersive presentations, and the same help surface shall also be reachable contextually as defined in `APP.HELP.CONTEXTUAL.001`.
- `APP.HELP.001-R2`: Selecting the help control or a contextual help affordance shall open one dismissible help surface without navigating away from the invoking view.
- `APP.HELP.001-R3`: The help surface shall present only the essential topics: finding deals, switching between Feed and Map, contributing an offer, reporting an offer, and favorites; when opened contextually, it shall show the relevant topic first without adding or removing topics.
- `APP.HELP.001-R4`: The help surface shall be dismissed by an explicit close control and by the system back action.
- `APP.HELP.001-R5`: The help control, surface and content shall follow the active theme and localization.
- `APP.HELP.001-R6`: The help control and close control shall expose accessible names and meet the touch-target floors of `APP.ACCESSIBILITY.UX.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Help is reachable from the standard Offers header
  Given the standard Offers view is displayed
  When the user views the header
  Then a labelled help control is available

Scenario: Help is reachable from the immersive feed
  Given the immersive offers feed is displayed
  When the user views the top bar
  Then a labelled help control is available

Scenario: Help opens without leaving Offers and lists the essential topics
  Given the user is on the Offers view
  When the user selects the help control
  Then a help surface is displayed over the current view
  And it lists finding deals, switching presentation, contributing, reporting, and favorites
  And the Offers view remains mounted underneath

Scenario: Help can be closed
  Given the help surface is displayed
  When the user selects the close control
  Then the help surface is dismissed
  And the user remains on the Offers view

Scenario: Help follows theme and localization
  Given the dark theme and Spanish language are active
  When the help surface is displayed
  Then its content uses the dark theme colors and Spanish strings

Scenario: Contextual entry opens the same surface with a topic first
  Given the user selects a contextual help affordance at an entry point defined in APP.HELP.CONTEXTUAL.001
  When the help surface opens
  Then the same single dismissible surface is used
  And the relevant topic is shown first
  And the five essential topics remain listed
  And the user has not navigated away

Scenario: Dismissed contextual help returns focus to the invoking control
  Given contextual help was opened from an entry point defined in APP.HELP.CONTEXTUAL.001
  When the user dismisses the help surface
  Then focus returns to the control that opened it
  And the invoking context is unchanged
```

## Example Inputs/Outputs
- Example input: user taps the help button in the Offers header.
- Expected output: a titled sheet with five concise topics and a close button.
- Example input: user selects a contextual help affordance from the no-position state.
- Expected output: the same sheet opens with finding deals first, and focus returns to the affordance on dismissal.

## Edge Cases
- Opening help while a search is in flight.
- Long localized help text wrapping without clipping.
- Help open when the presentation mode changes underneath.
- Large text size.
- Contextual help opened from a context whose draft or prompt is still active.

## Non-Functional Constraints
- The help surface shall not block access to the underlying view after dismissal.

## Related Specs
- `APP.SHELL.001`
- `APP.SHELL.005`
- `APP.THEME.001`
- `APP.LOCALIZATION.001`
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.MODE.SWITCH.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.BOTTOM_SHEET.001`
- `APP.HELP.CONTEXTUAL.001`
- `REPORTS.SHEET.001`
- `ADD.OFFER.LAYOUT.001`
- `ACCOUNT.AUTH.LOGIN.001`
