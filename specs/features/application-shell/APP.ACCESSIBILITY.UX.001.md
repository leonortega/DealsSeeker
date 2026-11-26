# Spec: `APP.ACCESSIBILITY.UX.001`

## Metadata
- **Title**: Accessible control sizes on touch surfaces
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (standard and immersive presentations)
- **Priority**: Medium

## Purpose
Keep interactive controls and their labels at sizes that can be reliably tapped and read on a phone.

## Preconditions
- User is on a phone-sized screen.
- Controls are rendered with the active theme.

## Trigger
- Any tappable control is presented to the user.

## Requirements
- `APP.ACCESSIBILITY.UX.001-R1`: Every tappable control shall present a touch target of at least 44 by 44 device-independent units.
- `APP.ACCESSIBILITY.UX.001-R2`: Control captions and metadata labels shall be rendered at a size of at least 11 units at the default text size.
- `APP.ACCESSIBILITY.UX.001-R3`: Adjacent tappable controls in a row shall keep at least 8 units of separation.
- `APP.ACCESSIBILITY.UX.001-R4`: These size floors shall hold in both the light and dark themes without changing the control's behavior.
- `APP.ACCESSIBILITY.UX.001-R5`: A floating action shall not overlap any other tappable control in either presentation.
- `APP.ACCESSIBILITY.UX.001-R6`: At narrow phone widths, every control in the Offers header and the immersive top bar shall remain visible and non-overlapping.
- `APP.ACCESSIBILITY.UX.001-R7`: The default footer destination labels shall remain on a single line at both the default text size and a large text size, without reducing below the size floor in R2.
- `APP.ACCESSIBILITY.UX.001-R8`: When the text size is large, the floating action shall still not overlap any other tappable control, and the view shall reserve enough scrollable space to reach controls beneath it.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Footer tabs meet the touch target floor
  Given the standard application footer is displayed
  When a footer tab is rendered
  Then its touch target is at least 44 by 44 units
  And adjacent tabs are separated by at least 8 units

Scenario: Search and filter controls meet the touch target floor
  Given the Offers view search panel is displayed
  When a coverage radius chip or a search action is rendered
  Then its touch target is at least 44 units in height

Scenario: Immersive controls meet the touch target floor
  Given the immersive offers feed is displayed
  When the search control or the photo navigation controls are rendered
  Then each touch target is at least 44 by 44 units

Scenario: Metadata labels stay legible at default text size
  Given any control caption or metadata label is rendered
  When the default text size is active
  Then the label size is at least 11 units

Scenario: Footer labels stay on one line at large text size
  Given the standard application footer is displayed
  When a large text size is active
  Then each default destination label shall occupy a single line
  And its size shall remain at least 11 units

Scenario: Floating action does not cover controls at large text size
  Given the Offers view is displayed with a large text size
  When the user scrolls to the bottom of the content
  Then the create-offer floating action shall not cover the search action
  And every control beneath it shall remain independently tappable
```

## Example Inputs/Outputs
- Example input: coverage radius chip labelled `500 m`.
- Expected output: chip is at least 44 units tall with an 11-unit label.

## Edge Cases
- Five footer destinations on the narrowest supported phone width.
- Localized labels longer than the default English text may wrap inside the 44-unit target; the default labels themselves stay on one line.
- Dark theme active while all floors apply.

## Non-Functional Constraints
- Increasing a target shall not change the control's action, label, or selected state.

## Related Specs
- `APP.THEME.001`
- `OFFERS.ACTIONS.LABELS.001`
- `APP.TYPOGRAPHY.001`
- `APP.LOCALIZATION.001`
- `OFFERS.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.LAYOUT.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `APP.ADAPTIVE.UX.002`
