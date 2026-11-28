# Spec: `APP.ADAPTIVE.UX.001`

## Metadata
- **Title**: Device class, orientation, foldable posture and font-scale adaptivity
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Offers View and Application Shell (standard and immersive presentations)
- **Priority**: High

## Purpose
Keep discovery usable across phone, tablet, landscape and foldable postures, with a width-matched navigation surface, an N-column grid, no clipping at 200 percent font scale, and verification evidence for each configuration.

## Preconditions
- The app is running on a supported Android device class, orientation and foldable posture.
- The active theme and font scale may differ from defaults.

## Trigger
- The Offers view or shell is displayed, the available width changes, the device rotates, the fold posture changes, or the font scale changes.

## Requirements
- `APP.ADAPTIVE.UX.001-R1`: The phone-first composition shall ship to every target; no wide desktop reflow shall be introduced.
- `APP.ADAPTIVE.UX.001-R2`: On wider screens the offer grid shall use additional columns while keeping the same card composition, and the navigation surface shall become a rail or drawer rather than a bottom bar, as defined by `APP.PLATFORM.CHROME.001`.
- `APP.ADAPTIVE.UX.001-R3`: In landscape orientation, primary discovery and action controls shall not be clipped or overlapped, as defined by `APP.ADAPTIVE.LANDSCAPE.001`.
- `APP.ADAPTIVE.UX.001-R4`: In a narrow window on a larger screen, the compact layout shall be used.
- `APP.ADAPTIVE.UX.001-R5`: All layouts shall hold in both the light and dark appearances and at 200 percent font scale, as defined by `APP.ACCESSIBILITY.UX.001`.
- `APP.ADAPTIVE.UX.001-R6`: On wide screens the shared footer shall keep a compact, centered width instead of stretching edge to edge, so discovery controls are not overlapped by the footer.
- `APP.ADAPTIVE.UX.001-R7`: At tablet width the navigation rail or drawer and the N-column offer grid shall be verified together, with evidence showing the same destinations and card composition as the phone layout, as defined by `APP.ADAPTIVE.UX.002`.
- `APP.ADAPTIVE.UX.001-R8`: On a foldable device, both folded and unfolded postures shall keep every primary control reachable, with no control or label hidden by a hinge or fold boundary; a posture change shall reflow content without losing the user's place.
- `APP.ADAPTIVE.UX.001-R9`: Verification evidence shall be captured at the default and 200 percent font scales for phone, tablet and landscape, and for both foldable postures where a foldable is a target, as defined by `APP.THEME.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Wider screens gain columns and a navigation rail
  Given the app is running on a tablet-sized screen
  When the Offers view is displayed
  Then the offer grid uses additional columns
  And the navigation surface is a rail or drawer rather than a bottom bar
  And the phone-first composition is preserved

Scenario: Landscape keeps controls reachable
  Given the device is in landscape orientation
  When the user views an offer
  Then primary discovery and action controls are not clipped or overlapped
  And no core functionality is hidden

Scenario: A narrow window uses the compact layout
  Given the available width is phone-sized
  When the Offers view is displayed
  Then the compact layout is used
  And controls remain reachable

Scenario: Wide footer stays compact and centered
  Given the device is in landscape orientation
  When the shared footer is rendered
  Then it does not stretch across the full screen width
  And it is horizontally centered
  And discovery controls outside the footer remain visible

Scenario: Tablet rail and N-column grid are verified together
  Given the app is rendered at an expanded tablet width
  When discovery is used
  Then the navigation rail or drawer exposes the same destinations as the phone layout
  And the offer grid uses multiple columns with the same card composition
  And device evidence records the result

Scenario: Folded and unfolded postures keep controls reachable
  Given the app runs on a foldable device
  When the device is in a folded posture and then an unfolded posture
  Then every primary control remains reachable in both postures
  And no control or label is hidden by a hinge or fold boundary
  And a posture change reflows content without losing the user's place

Scenario: Font-scale verification covers every device class
  Given font scale is at the default and again at 200 percent
  When phone, tablet and landscape layouts are reviewed
  Then no control or label is clipped in any layout
  And both foldable postures are included where a foldable is a target
```

## Example Inputs/Outputs
- Example input: tablet-width screen in portrait.
- Expected output: a three-column offer grid and a navigation rail, using the same cards and destinations as the phone layout.
- Example input: a foldable unfolded to a wide posture during browsing.
- Expected output: content reflows to the wide layout without hiding controls at the fold, preserving scroll position.
- Example input: 200 percent font scale in landscape on a phone.
- Expected output: primary controls remain visible and unclipped, with captured evidence.

## Edge Cases
- Width changes during an active session.
- Landscape on the narrowest supported phone.
- Large text scaling in a multi-column grid.
- A fold or hinge crosses an action control or a label.
- A posture change occurs mid-scroll or while a sheet is open.

## Non-Functional Constraints
- A wide desktop reflow is explicitly out of scope because the approved design world pins the phone-first composition.
- Adaptivity evidence shall be captured from a device that represents each target class.

## Related Specs
- `APP.SHELL.002`
- `APP.TYPOGRAPHY.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.GRID.CARDS.001`
- `APP.PLATFORM.CHROME.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.THEME.001`
- `ADD.OFFER.TABLET.LAYOUT.001`
