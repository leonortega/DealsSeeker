# Spec: `APP.ADAPTIVE.UX.002`

## Metadata
- **Title**: Adaptive touch, text, zoom, motion and font-scale verification
- **Version**: `v2.2`
- **Status**: Approved
- **Context/View**: Application shell, Offers View, My Account, Add Offer, Suggestions, Reports
- **Priority**: High

## Material 3 component reflow (Android phase)
Material 3 components — app bars, coverage selection options, offer action buttons and icon buttons, and offer cards — shall keep the 48 dp touch floor, caption reflow and labelled disclosure behavior required by this spec at 200 percent font scale, in landscape and in foldable postures.

## Purpose
Keep every surface operable at 200 percent font scale, when the width changes to a tablet, in landscape and foldable postures, when a map is zoomed, and when reduced motion is requested, with verification evidence for each configuration.

## Preconditions
- The user is on an Android phone, tablet, or foldable in either orientation or posture.
- System text size, zoom, motion preferences and font scale may differ from defaults.

## Trigger
- A control, body of text, action caption, embedded map, navigation surface, or animated transition is rendered, or adaptivity verification is performed.

## Requirements
- `APP.ADAPTIVE.UX.002-R1`: Every tappable control shall present a touch target of at least 48 by 48 dp on Android on every supported surface, with at least 8 dp of separation between adjacent targets; a 44 by 44 pt floor is retained for iOS compatibility but is not a verification gate this phase.
- `APP.ADAPTIVE.UX.002-R2`: Body text shall scale with the system reading-size setting without clipping or overlapping, including where a line height is derived from the font size.
- `APP.ADAPTIVE.UX.002-R3`: An embedded map shall allow the user to pinch-zoom it.
- `APP.ADAPTIVE.UX.002-R4`: When the system requests reduced motion, animated transitions and gesture-driven motion shall be replaced by a crossfade or an immediate state change.
- `APP.ADAPTIVE.UX.002-R5`: These requirements shall hold in both the light and dark appearances and in landscape orientation.
- `APP.ADAPTIVE.UX.002-R6`: A reduced-motion preference shall not remove feedback or hide a state change.
- `APP.ADAPTIVE.UX.002-R7`: Action captions shall not be hidden to save space at large reading sizes; when measured space cannot hold all captions inline, they shall reflow into a visibly labelled disclosure rather than be omitted, and every action shall remain independently tappable and labelled for assistive technology.
- `APP.ADAPTIVE.UX.002-R8`: Navigation, presentation-switch, filter and status labels shall scale with the system reading-size setting without clipping, wrapping into unreadable fragments, or overlapping adjacent controls.
- `APP.ADAPTIVE.UX.002-R9`: At expanded/tablet width, navigation surfaces shall adapt to a rail or drawer while preserving the 48 dp touch floors and text reflow; the compact bottom bar shall not be shipped unchanged, as defined by `APP.PLATFORM.CHROME.001`.
- `APP.ADAPTIVE.UX.002-R10`: At 200 percent font scale, no body text, caption or navigation label shall be clipped on any supported surface, and verification evidence shall be captured at that scale.
- `APP.ADAPTIVE.UX.002-R11`: The touch floors, text reflow and reduced-motion behavior shall be re-verified at 200 percent font scale in landscape and in both foldable postures where a foldable is a target, as defined by `APP.ADAPTIVE.UX.001` and `APP.ADAPTIVE.LANDSCAPE.001`.
- `APP.ADAPTIVE.UX.002-R12`: When a control is rendered through a Material 3 component — including an app bar, a coverage selection option, an offer action button or icon button, and an offer card — it shall keep the 48 by 48 dp touch floor of R1 and shall not clip, truncate or hide its caption at 200 percent font scale, in landscape or in a foldable posture.
- `APP.ADAPTIVE.UX.002-R13`: Material 3 component defaults shall not replace the labelled disclosure of R7 with an unlabelled overflow control; every action shall remain independently tappable and labelled for assistive technology.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Every control meets the Android touch floor
  Given any supported screen is displayed
  When a tappable control is rendered
  Then its touch target is at least 48 by 48 dp
  And adjacent targets keep at least 8 dp of separation
  And the control remains distinguishable from its neighbors

Scenario: Body text survives large text scaling
  Given the system reading size is set to twice the default
  When an offer description or detail body is displayed
  Then the text wraps without clipping or overlapping
  And the primary actions remain reachable

Scenario: Embedded map can be pinch-zoomed
  Given a map is displayed inside the application
  When the user pinches the map
  Then the map zooms in or out according to the gesture

Scenario: Reduced motion replaces animation
  Given the system requests reduced motion
  When a transition or animated gallery scroll would occur
  Then the state change is presented without the animated motion
  And the same information and controls remain available

Scenario: Action captions reflow into a labelled disclosure at large text
  Given the system reading size is at 150 percent of the default
  When an offer action rail is rendered
  Then captions that cannot fit inline reflow into a visibly labelled disclosure
  And no action caption is hidden solely to save space
  And every action remains independently tappable

Scenario: Short viewport with large text keeps captions discoverable
  Given a short viewport and a large reading size
  When the offer actions are displayed
  Then their captions move into a labelled disclosure rather than being omitted
  And the disclosure has a reachable, labelled control

Scenario: Reduced motion in both themes and landscape
  Given reduced motion is enabled and the device is in landscape
  When a surface is rendered in either theme
  Then the 48 dp touch floor and text scaling still hold

Scenario: Navigation labels scale without breaking
  Given the system reading size is set to 150 percent
  When the navigation surface, presentation switch and feed tabs are rendered
  Then their labels remain readable on one line or wrap at word boundaries
  And no label overlaps an adjacent control

Scenario: Tablet rail preserves touch floor and text scale
  Given the app is rendered at an expanded tablet width
  When the navigation rail or drawer is displayed with a large reading size
  Then its targets keep the 48 by 48 dp floor and 8 dp separation
  And its labels reflow without clipping
  And the compact bottom bar is not shipped unchanged

Scenario: 200 percent font scale verification
  Given the Android font scale is set to 200 percent
  When body text, captions and navigation labels are rendered on any surface
  Then none are clipped or overlapped
  And verification evidence captures the result

Scenario: Adaptivity holds at 200 percent in landscape and foldable postures
  Given the font scale is 200 percent and reduced motion is enabled
  When the app is used in landscape and in both foldable postures where a foldable is a target
  Then touch floors, text reflow and reduced-motion behavior still hold
  And every primary control remains reachable

Scenario: Material 3 components keep touch floors at 200 percent
  Given the Android font scale is set to 200 percent
  And app bar, coverage selection and offer actions are rendered as Material 3 components
  When each target is measured
  Then each keeps a 48 by 48 dp target and 8 dp separation

Scenario: Material 3 overflow keeps actions labelled
  Given an offer action rail uses a Material 3 component for its overflow control
  And the viewport is too short for inline captions
  When the rail is rendered at 150 percent text
  Then secondary actions remain behind one visibly labelled disclosure
  And every action stays independently tappable and labelled
```

## Example Inputs/Outputs
- Example input: a 200 percent text scale with a long localized offer description.
- Expected output: description wraps fully, no glyphs overlap, and the action rail remains tappable with captured evidence.
- Example input: an action rail whose captions do not fit at 150 percent text.
- Expected output: captions reflow into a labelled disclosure; no caption is silently hidden.
- Example input: the OS remove-animations setting is enabled and a detail dialog opens in landscape at 200 percent font scale.
- Expected output: dialog content appears without motion, with the same close and action controls and no clipped text.
- Example input: app bar, coverage selection and offer actions rendered as Material 3 components at 200 percent font scale.
- Expected output: each keeps a 48 by 48 dp target, 8 dp separation and a fully visible, labelled caption.

## Edge Cases
- Localized labels longer than the source text at 200 percent scale.
- A map inside a surface that has its own viewport behavior.
- Reduced motion enabled while a carousel is mid-transition.
- Landscape on the narrowest supported phone.
- A short viewport at the largest reading size where inline captions cannot fit.
- A posture change to unfolded at 200 percent font scale with a sheet open.
- A Material 3 overflow control that would replace the labelled disclosure with an unlabelled menu; the labelled disclosure is retained.

## Non-Functional Constraints
- Raising a touch floor shall not change a control's action, label, or state.
- Reflowing a caption into a disclosure shall not change the associated actions or their accessible names.
- Adaptivity evidence shall cover the default and 200 percent font scales.

## Related Specs
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.ACTIONS.LABELS.001`
- `OFFERS.FILTER.SIMPLIFICATION.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.GRID.CARDS.001`
- `ADD.OFFER.LOCATION.003`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.PLATFORM.CHROME.001`
- `APP.THEME.001`
- `APP.SHELL.002`
- `APP.TYPOGRAPHY.001`
- `APP.SHELL.005`
- `OFFERS.SEARCH.001`
- `OFFERS.FEED.IMMERSIVE.001`
