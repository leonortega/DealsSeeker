# Spec: `APP.ACCESSIBILITY.UX.001`

## Metadata
- **Title**: Accessible control sizes and reading sizes on touch surfaces
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (standard and immersive presentations)
- **Priority**: Medium

## Purpose
Keep interactive controls, their spacing and their labels tappable and readable on both platforms as the user's reading-size setting grows.

## Preconditions
- User is on a phone-sized screen.
- Controls are rendered with the active theme.
- The platform's system reading-size setting may be at its default or a larger value.

## Trigger
- Any tappable control or its label is presented to the user.

## Requirements
- `APP.ACCESSIBILITY.UX.001-R1`: Every tappable control shall present a touch target of at least 44 by 44 pt on iOS and at least 48 by 48 dp on Android.
- `APP.ACCESSIBILITY.UX.001-R2`: Control captions and metadata labels shall be rendered at a size of at least 11 units at the default reading size.
- `APP.ACCESSIBILITY.UX.001-R3`: Adjacent tappable controls shall keep the platform's required separation — at least 8 dp on Android and clear breathing room on iOS.
- `APP.ACCESSIBILITY.UX.001-R4`: These size floors shall hold in both the light and dark themes without changing the control's behavior.
- `APP.ACCESSIBILITY.UX.001-R5`: A floating action shall not overlap any other tappable control in either presentation.
- `APP.ACCESSIBILITY.UX.001-R6`: At narrow phone widths, every control in the Offers header and the immersive top bar shall remain visible and non-overlapping.
- `APP.ACCESSIBILITY.UX.001-R7`: Default destination labels shall follow the system reading-size setting; at large sizes they shall reflow or wrap rather than be hidden or truncated, while the target floor in R1 shall still hold.
- `APP.ACCESSIBILITY.UX.001-R8`: When the reading size is large, the floating action shall still not overlap any other tappable control, and the view shall reserve enough scrollable space to reach controls beneath it.
- `APP.ACCESSIBILITY.UX.001-R9`: Text shall follow the user's system reading-size setting beyond a 1.2× cap; no fixed maximum scale shall prevent meaningful growth at the largest system setting, as defined by `APP.TYPOGRAPHY.001`.
- `APP.ACCESSIBILITY.UX.001-R10`: When a caption grows, it shall reflow within or around its target or move into a visibly labelled disclosure rather than disappear; the control's accessible name shall remain available.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Footer tabs meet the platform touch floor
  Given the standard application navigation surface is displayed
  When a destination tab is rendered on iOS
  Then its touch target is at least 44 by 44 pt
  And adjacent tabs keep clear breathing room

Scenario: Footer tabs meet the Android touch floor
  Given the standard application navigation surface is displayed on Android
  When a destination tab is rendered
  Then its touch target is at least 48 by 48 dp
  And adjacent tabs are separated by at least 8 dp

Scenario: Search and filter controls meet the platform touch floor
  Given the Offers view search panel is displayed
  When a coverage radius chip or a search action is rendered
  Then its touch target is at least 44 pt on iOS and 48 dp on Android in height

Scenario: Immersive controls meet the platform touch floor
  Given the immersive offers feed is displayed
  When the search control or the photo navigation controls are rendered
  Then each touch target is at least 44 by 44 pt on iOS
  And each touch target is at least 48 by 48 dp on Android

Scenario: Metadata labels stay legible at default reading size
  Given any control caption or metadata label is rendered
  When the default reading size is active
  Then the label size is at least 11 units

Scenario: Footer labels reflow at large reading size
  Given the standard application navigation surface is displayed
  When a large reading size is active
  Then each default destination label grows and wraps rather than being hidden or truncated
  And the platform touch floor still holds

Scenario: Text follows the system reading size beyond 1.2x
  Given the system reading size is set to twice the default
  When a control caption is rendered
  Then its text grows accordingly
  And no fixed cap limits growth at 1.2 times the default

Scenario: Floating action does not cover other controls
  Given the Offers view is displayed in either presentation
  When the create-offer floating action is rendered
  Then it does not overlap any other tappable control
  And every action behind it remains independently tappable

Scenario: Floating action does not cover controls at large reading size
  Given the Offers view is displayed with a large reading size
  When the user scrolls to the bottom of the content
  Then the create-offer floating action does not cover the search action
  And every control beneath it remains independently tappable

Scenario: Header controls stay visible on a narrow phone
  Given the screen width is the narrowest supported phone width
  When the Offers header or the immersive top bar is rendered
  Then the presentation control, the feed tabs, and the search control are all visible
  And none of them overlaps another

Scenario: Long localized label at the largest Android reading size
  Given a long localized destination label at the largest system reading size
  When the navigation surface is rendered
  Then the label wraps within or around its target rather than disappearing
  And the target remains at least 48 by 48 dp
  And the control keeps its accessible name

Scenario: iOS accessibility text size reflows labels
  Given iOS is at an accessibility reading size
  When destination labels are rendered
  Then labels reflow into multiple lines where needed
  And the targets remain at least 44 by 44 pt
```

## Example Inputs/Outputs
- Example input: coverage radius chip labelled `500 m` on Android.
- Expected output: chip is at least 48 dp tall with an 11-unit label.
- Example input: iOS reading size set to twice the default.
- Expected output: destination labels grow and reflow; the 44 pt target floor is preserved.

## Edge Cases
- Five destination tabs on the narrowest supported phone width at a large reading size.
- Localized labels longer than the default English text wrap inside or around the target; no label is dropped.
- Dark theme active while all floors apply.
- The largest system reading size with a single long unbroken word; the accessible name remains available.

## Non-Functional Constraints
- Increasing a target shall not change the control's action, label, or selected state.
- Reflowing a caption shall not change the control's action or accessible name.

## Related Specs
- `APP.HELP.CONTEXTUAL.001`
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
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
