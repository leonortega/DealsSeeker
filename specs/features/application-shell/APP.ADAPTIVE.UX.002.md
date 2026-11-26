# Spec: `APP.ADAPTIVE.UX.002`

## Metadata
- **Title**: Adaptive touch, text, zoom, and motion behavior
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Application shell, Offers View, My Account, Add Offer, Suggestions, Reports
- **Priority**: Medium

## Purpose
Keep every surface operable when text is enlarged, when a map is zoomed by pinch, and when the user has requested reduced motion.

## Preconditions
- The user is on a phone or tablet in either orientation.
- System text size, zoom, and motion preferences may differ from defaults.

## Trigger
- A control, body of text, embedded map, or animated transition is rendered.

## Requirements
- `APP.ADAPTIVE.UX.002-R1`: Every tappable control shall present a touch target of at least 44 by 44 device-independent units on every supported surface.
- `APP.ADAPTIVE.UX.002-R2`: Body text shall scale with the system text size without clipping or overlapping, including where a line height is derived from the font size.
- `APP.ADAPTIVE.UX.002-R3`: An embedded map shall allow the user to pinch-zoom it.
- `APP.ADAPTIVE.UX.002-R4`: When the system requests reduced motion, animated transitions and gesture-driven motion shall be replaced by a crossfade or an immediate state change.
- `APP.ADAPTIVE.UX.002-R5`: These requirements shall hold in both themes and in landscape orientation.
- `APP.ADAPTIVE.UX.002-R6`: A reduced-motion preference shall not remove feedback or hide a state change.
- `APP.ADAPTIVE.UX.002-R7`: Action captions shall be omitted only when measured available space cannot hold them without overlapping another control; when omitted, every action shall remain independently tappable and labelled for assistive technology.
- `APP.ADAPTIVE.UX.002-R8`: Navigation, presentation-switch, filter and status labels shall scale with the system text size without clipping, wrapping into unreadable fragments, or overlapping adjacent controls.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Every control meets the touch floor
  Given any supported screen is displayed
  When a tappable control is rendered
  Then its touch target is at least 44 by 44 units
  And the control remains distinguishable from its neighbors

Scenario: Body text survives large text scaling
  Given the system text size is set to twice the default
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

Scenario: Reduced motion in both themes and landscape
  Given reduced motion is enabled and the device is in landscape
  When a surface is rendered in either theme
  Then the touch floor and text scaling still hold

Scenario: Action captions survive large text on a phone
  Given a phone displays an offer with the system text size set to 150 percent
  When the action rail is rendered
  Then every action is visibly labelled or reachable through a visibly labelled disclosure
  And no caption clips or overlaps an adjacent control

Scenario: Navigation labels scale without breaking
  Given the system text size is set to 150 percent
  When the footer, presentation switch and feed tabs are rendered
  Then their labels remain readable on one line or wrap at word boundaries
  And no label overlaps an adjacent control
```

## Example Inputs/Outputs
- Example input: a 200% text scale with a long localized offer description.
- Expected output: description wraps fully; no glyphs overlap; action rail remains tappable.
- Example input: the OS reduce-motion setting is enabled and a detail dialog opens.
- Expected output: dialog content appears without a slide or spring animation, with the same close and action controls.

## Edge Cases
- Localized labels longer than the source text at 200% scale.
- A map inside a web view that has its own viewport settings.
- Reduced motion enabled while a carousel is mid-transition.
- Landscape on the narrowest supported phone.

## Non-Functional Constraints
- Raising a touch floor shall not change a control's action, label, or state.

## Related Specs
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.ACTIONS.LABELS.001`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.GRID.CARDS.001`
- `ADD.OFFER.LOCATION.003`
- `APP.ADAPTIVE.UX.001`
