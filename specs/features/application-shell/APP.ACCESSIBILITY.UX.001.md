# Spec: `APP.ACCESSIBILITY.UX.001`

## Metadata
- **Title**: Accessible control sizes, reading sizes and contrast on touch surfaces
- **Version**: `v2.2`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (standard and immersive presentations)
- **Priority**: High

## Material 3 component preservation (Android phase)
Where a control is rendered through a Material 3 component — an app bar action, a coverage selection option, an offer action button or icon button, or an offer card — that component shall preserve, not weaken, the touch floors, label size, reflow, contrast and accessible names and states required by this spec.

## Purpose
Keep interactive controls, their spacing, their labels and their measured legibility tappable and readable on Android as the user's reading-size setting grows to 200 percent, in both light and dark appearances, with TalkBack traversal evidence.

## Preconditions
- User is on a phone-sized or tablet-sized Android screen.
- Controls are rendered with the active theme in both the light and dark appearances.
- The platform's system reading-size setting may be at its default or up to 200 percent.

## Trigger
- Any tappable control or its label is presented to the user, or accessibility verification is performed.

## Requirements
- `APP.ACCESSIBILITY.UX.001-R1`: Every tappable control shall present a touch target of at least 48 by 48 dp on Android, with at least 8 dp of separation between adjacent targets; a 44 by 44 pt floor is retained for iOS compatibility but is not a verification gate this phase.
- `APP.ACCESSIBILITY.UX.001-R2`: Control captions and metadata labels shall be rendered at a size of at least 11 units at the default reading size.
- `APP.ACCESSIBILITY.UX.001-R3`: Adjacent tappable controls shall keep the platform's required separation — at least 8 dp on Android.
- `APP.ACCESSIBILITY.UX.001-R4`: These size floors shall hold in both the light and dark appearances without changing the control's behavior.
- `APP.ACCESSIBILITY.UX.001-R5`: A floating action shall not overlap any other tappable control in either presentation.
- `APP.ACCESSIBILITY.UX.001-R6`: At narrow phone widths, every control in the Offers header and the immersive top bar shall remain visible and non-overlapping.
- `APP.ACCESSIBILITY.UX.001-R7`: Default destination labels shall follow the system reading-size setting; at large sizes they shall reflow or wrap rather than be hidden or truncated, while the target floor in R1 shall still hold.
- `APP.ACCESSIBILITY.UX.001-R8`: When the reading size is large, the floating action shall still not overlap any other tappable control, and the view shall reserve enough scrollable space to reach controls beneath it.
- `APP.ACCESSIBILITY.UX.001-R9`: Text shall follow the user's system reading-size setting beyond a 1.2× cap; no fixed maximum scale shall prevent meaningful growth up to 200 percent, as defined by `APP.TYPOGRAPHY.001`.
- `APP.ACCESSIBILITY.UX.001-R10`: When a caption grows, it shall reflow within or around its target or move into a visibly labelled disclosure rather than disappear; the control's accessible name shall remain available.
- `APP.ACCESSIBILITY.UX.001-R11`: At 200 percent font scale, no control label, caption or metadata value shall be clipped, truncated or overlapped; verification evidence shall be captured on Android at that scale.
- `APP.ACCESSIBILITY.UX.001-R12`: Foreground text and essential control glyphs shall meet a measured contrast ratio of at least 4.5 to 1 for body text and 3 to 1 for large text and UI components, measured in both the light and dark appearances, as defined by `APP.THEME.001`.
- `APP.ACCESSIBILITY.UX.001-R13`: Each surface shall be traversable with TalkBack at default and 200 percent font scale, with sign-off evidence confirming that every control in traversal order is reachable and labelled, as defined by `APP.ACCESSIBILITY.UX.003`.
- `APP.ACCESSIBILITY.UX.001-R14`: When a control is presented through a Material 3 component — including an app bar action, a coverage selection option, an offer action button or icon button, and an offer card — it shall preserve the touch target floor of R1, the separation of R3, the label size of R2 and the 200 percent reflow of R11; adopting the component shall not weaken an accessibility label, role or state.
- `APP.ACCESSIBILITY.UX.001-R15`: Material 3 component defaults shall not be used as a reason to drop a caption, shrink a target below 48 by 48 dp, or remove an accessible name from any control covered by this spec.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Footer tabs meet the Android touch floor
  Given the standard application navigation surface is displayed on Android
  When a destination tab is rendered
  Then its touch target is at least 48 by 48 dp
  And adjacent tabs are separated by at least 8 dp

Scenario: Search and filter controls meet the touch floor
  Given the Offers view search panel is displayed
  When a coverage radius chip or a search action is rendered
  Then its touch target is at least 48 dp in height

Scenario: Immersive controls meet the touch floor
  Given the immersive offers feed is displayed
  When the search control or the photo navigation controls are rendered
  Then each touch target is at least 48 by 48 dp

Scenario: Metadata labels stay legible at default reading size
  Given any control caption or metadata label is rendered
  When the default reading size is active
  Then the label size is at least 11 units

Scenario: Footer labels reflow at large reading size
  Given the standard application navigation surface is displayed
  When a large reading size is active
  Then each default destination label grows and wraps rather than being hidden or truncated
  And the 48 by 48 dp touch floor still holds

Scenario: Text follows the system reading size beyond 1.2x
  Given the system reading size is set to twice the default
  When a control caption is rendered
  Then its text grows accordingly
  And no fixed cap limits growth at 1.2 times the default

Scenario: 200 percent font causes no clipping
  Given the Android font scale is set to 200 percent
  When a control, caption or metadata value is rendered on any shell or offer surface
  Then the text is fully visible without clipping or overlap
  And the control's accessible name remains available
  And device evidence at 200 percent captures the result

Scenario: Contrast is measured in both appearances
  Given the app is rendered in the light appearance and again in the dark appearance
  When foreground text and control glyphs are measured against their surfaces
  Then body text reaches at least 4.5 to 1 contrast
  And large text and essential UI components reach at least 3 to 1
  And the measured evidence covers both appearances

Scenario: TalkBack traversal reaches every control at default and 200 percent
  Given TalkBack is enabled at the default and again at 200 percent font scale
  When the user traverses a surface with touch exploration
  Then every control in traversal order is reachable and announces its name
  And no control is clipped out of the traversal
  And sign-off evidence records both scales

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
  When the Offers top bar or the immersive top bar is rendered
  Then the presentation control, the feed tabs, and the search control are all visible
  And none of them overlaps another

Scenario: Long localized label at the largest reading size
  Given a long localized destination label at 200 percent font scale
  When the navigation surface is rendered
  Then the label wraps within or around its target rather than disappearing
  And the target remains at least 48 by 48 dp
  And the control keeps its accessible name

Scenario: Material 3 components preserve the touch floor
  Given an app bar action, a coverage option, an offer action and an offer card are rendered as Material 3 components on Android
  When each target is measured
  Then each presents at least a 48 by 48 dp target with 8 dp separation

Scenario: Material 3 components preserve names and states at 200 percent
  Given the Android font scale is set to 200 percent
  And controls are rendered as Material 3 components
  When TalkBack traverses them
  Then every control keeps its accessible name, role and state
  And no caption is dropped solely because of the component's default
```

## Example Inputs/Outputs
- Example input: coverage radius chip labelled `500 m` on Android at default reading size.
- Expected output: chip is at least 48 dp tall with an 11-unit label and 8 dp separation.
- Example input: Android font scale set to 200 percent with a long localized offer caption.
- Expected output: caption wraps fully, is not clipped, and keeps its accessible name; device evidence captures the result.
- Example input: body text measured in the light and dark appearances.
- Expected output: both appearances meet the measured contrast thresholds with recorded evidence.
- Example input: an app bar action and a coverage option rendered as Material 3 components on Android.
- Expected output: each keeps a 48 by 48 dp target, 8 dp separation and its accessible name and state.

## Edge Cases
- Five destinations on the narrowest supported phone width at 200 percent font scale.
- Localized labels longer than the default English text wrap inside or around the target; no label is dropped.
- Dark appearance active while all floors and contrast thresholds apply.
- 200 percent font scale with a single long unbroken word; the accessible name remains available.
- TalkBack traversal on a surface where a floating action overlays scrollable content.
- A control glyph whose contrast passes in one appearance but not the other; the failing appearance is corrected before sign-off.
- A Material 3 component default that would drop a caption or shrink a target; the accessibility floor wins over the component default.

## Non-Functional Constraints
- Increasing a target shall not change the control's action, label, or selected state.
- Reflowing a caption shall not change the control's action or accessible name.
- Contrast evidence shall be measured, not estimated, and shall cover both appearances.

## Related Specs
- `APP.HELP.SEARCH.001`
- `APP.DRAFT.RECOVERY.001`
- `APP.HELP.CONTEXTUAL.001`
- `OFFERS.ACTIONS.LABELS.001`
- `APP.TYPOGRAPHY.001`
- `APP.LOCALIZATION.001`
- `OFFERS.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.LAYOUT.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.PLATFORM.CHROME.001`
- `APP.THEME.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.SHELL.001`
- `OFFERS.SEARCH.001`
- `OFFERS.GRID.CARDS.001`
