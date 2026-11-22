# Spec: `APP.ADAPTIVE.UX.001`

## Metadata
- **Title**: Device class and orientation
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: Medium

## Purpose
Keep discovery usable across phone, tablet, landscape, and narrow window sizes without breaking the phone-first composition.

## Preconditions
- The app is running on a supported device class and orientation.

## Trigger
- The Offers view is displayed or the available width changes.

## Requirements
- `APP.ADAPTIVE.UX.001-R1`: The phone-first composition shall ship to every target; no wide desktop reflow shall be introduced.
- `APP.ADAPTIVE.UX.001-R2`: On wider screens the offer grid shall use additional columns while keeping the same card composition.
- `APP.ADAPTIVE.UX.001-R3`: In landscape orientation, primary discovery and action controls shall not be clipped or overlapped.
- `APP.ADAPTIVE.UX.001-R4`: In a narrow window on a larger screen, the compact layout shall be used.
- `APP.ADAPTIVE.UX.001-R5`: All layouts shall hold in both themes and at large text sizes.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Wider screens gain columns without a new layout
  Given the app is running on a tablet-sized screen
  When the Offers view is displayed
  Then the offer grid uses additional columns
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
```

## Example Inputs/Outputs
- Example input: viewport width 1080.
- Expected output: three offer columns; the same cards and controls as the phone layout.

## Edge Cases
- Width changes during an active session.
- Landscape on the narrowest supported phone.
- Large text scaling in a multi-column grid.

## Non-Functional Constraints
- A wide desktop reflow is explicitly out of scope because the approved design world pins the phone-first composition.

## Related Specs
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.GRID.CARDS.001`
- `APP.ADAPTIVE.UX.002`
- `APP.THEME.001`
