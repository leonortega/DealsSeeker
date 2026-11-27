# Spec: `APP.ADAPTIVE.UX.002`

## Metadata
- **Title**: Adaptive touch, text, zoom, and motion behavior
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application shell, Offers View, My Account, Add Offer, Suggestions, Reports
- **Priority**: Medium

## Purpose
Keep every surface operable when text is enlarged, when a map is zoomed by pinch, when the width changes to a tablet, and when the user has requested reduced motion.

## Preconditions
- The user is on a phone or tablet in either orientation.
- System text size, zoom, and motion preferences may differ from defaults.

## Trigger
- A control, body of text, action caption, embedded map, navigation surface, or animated transition is rendered.

## Requirements
- `APP.ADAPTIVE.UX.002-R1`: Every tappable control shall present a touch target of at least 44 by 44 pt on iOS and at least 48 by 48 dp on Android on every supported surface, with the platform's required separation between adjacent targets.
- `APP.ADAPTIVE.UX.002-R2`: Body text shall scale with the system reading-size setting without clipping or overlapping, including where a line height is derived from the font size.
- `APP.ADAPTIVE.UX.002-R3`: An embedded map shall allow the user to pinch-zoom it.
- `APP.ADAPTIVE.UX.002-R4`: When the system requests reduced motion, animated transitions and gesture-driven motion shall be replaced by a crossfade or an immediate state change.
- `APP.ADAPTIVE.UX.002-R5`: These requirements shall hold in both themes and in landscape orientation.
- `APP.ADAPTIVE.UX.002-R6`: A reduced-motion preference shall not remove feedback or hide a state change.
- `APP.ADAPTIVE.UX.002-R7`: Action captions shall not be hidden to save space at large reading sizes; when measured space cannot hold all captions inline, they shall reflow into a visibly labelled disclosure rather than be omitted, and every action shall remain independently tappable and labelled for assistive technology.
- `APP.ADAPTIVE.UX.002-R8`: Navigation, presentation-switch, filter and status labels shall scale with the system reading-size setting without clipping, wrapping into unreadable fragments, or overlapping adjacent controls.
- `APP.ADAPTIVE.UX.002-R9`: At expanded/tablet width, navigation surfaces shall adapt to a rail or drawer while preserving the platform touch floors and text reflow; the compact bottom bar shall not be shipped unchanged.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Every control meets the platform touch floor
  Given any supported screen is displayed
  When a tappable control is rendered
  Then its touch target is at least 44 by 44 pt on iOS
  And its touch target is at least 48 by 48 dp on Android
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

Scenario: Reduced motion in both themes and landscape
  Given reduced motion is enabled and the device is in landscape
  When a surface is rendered in either theme
  Then the platform touch floors and text scaling still hold

Scenario: Short viewport with large text keeps captions discoverable
  Given a short viewport and a large reading size
  When the offer actions are displayed
  Then their captions move into a labelled disclosure rather than being omitted
  And the disclosure has a reachable, labelled control

Scenario: Navigation labels scale without breaking
  Given the system reading size is set to 150 percent
  When the navigation surface, presentation switch and feed tabs are rendered
  Then their labels remain readable on one line or wrap at word boundaries
  And no label overlaps an adjacent control

Scenario: Tablet rail preserves touch floor and text scale
  Given the app is rendered at an expanded tablet width
  When the navigation rail or drawer is displayed with a large reading size
  Then its targets keep the platform touch floors
  And its labels reflow without clipping
  And the compact bottom bar is not shipped unchanged
```

## Example Inputs/Outputs
- Example input: a 200% text scale with a long localized offer description.
- Expected output: description wraps fully; no glyphs overlap; action rail remains tappable.
- Example input: an action rail whose captions do not fit at 150% text.
- Expected output: captions reflow into a labelled disclosure; no caption is silently hidden.
- Example input: the OS reduce-motion setting is enabled and a detail dialog opens.
- Expected output: dialog content appears without a slide or spring animation, with the same close and action controls.

## Edge Cases
- Localized labels longer than the source text at 200% scale.
- A map inside a web view that has its own viewport settings.
- Reduced motion enabled while a carousel is mid-transition.
- Landscape on the narrowest supported phone.
- A short viewport at the largest reading size where inline captions cannot fit.

## Non-Functional Constraints
- Raising a touch floor shall not change a control's action, label, or state.
- Reflowing a caption into a disclosure shall not change the associated actions or their accessible names.

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
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.TYPOGRAPHY.001`
- `APP.SHELL.005`
