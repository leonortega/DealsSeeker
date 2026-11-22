# Spec: `ADD.OFFER.TABLET.LAYOUT.001`

## Metadata
- **Title**: Tablet composition for the Add Offer view
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Use the extra width of a tablet without changing the Add Offer controls, their behavior, or the phone-first composition.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- The view renders on a surface whose available width meets the tablet breakpoint used by the rest of the app.

## Requirements
- `ADD.OFFER.TABLET.LAYOUT.001-R1`: On native tablet-width surfaces, the system shall place the image and location panels in a first column and the description, tag, and primary-action controls in a second column.
- `ADD.OFFER.TABLET.LAYOUT.001-R2`: On phone-width surfaces and on web, the system shall keep the existing single-column composition in the same reading order.
- `ADD.OFFER.TABLET.LAYOUT.001-R3`: The tablet composition shall expose the same controls, labels, state, and behavior as the phone composition, with no control present in both columns.
- `ADD.OFFER.TABLET.LAYOUT.001-R4`: The breakpoint shall match the one used by other adaptive layouts in the application.
- `ADD.OFFER.TABLET.LAYOUT.001-R5`: Touch targets, palette roles, typing, and validation shall be unchanged by the column arrangement.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Phone width keeps one column
  Given the Add Offer view is displayed on a phone-width surface
  When the form renders
  Then image, location, description, and submit controls appear in one vertical column
  And their reading order is unchanged

Scenario: Tablet width uses two columns
  Given the Add Offer view is displayed on a native tablet-width surface
  When the form renders
  Then image and location panels appear in a first column
  And description, tag, and primary-action controls appear in a second column
  And each control appears exactly once

Scenario: Tablet composition preserves behavior
  Given the Add Offer view is in the two-column composition
  When the user confirms a location, types a description, and submits
  Then the same validation, feedback, and navigation rules apply as on a phone
```

## Example Inputs/Outputs
- Example input: 390-unit-wide phone viewport.
- Expected output: single scrolling column, identical to today.
- Example input: 1024-unit-wide tablet viewport.
- Expected output: two side-by-side columns with the same panels and a 44pt-or-larger touch floor.

## Edge Cases
- Width exactly at the tablet breakpoint.
- Landscape phone that meets the width breakpoint.
- A prefilled edit draft in either composition.
- Long localized labels wrapping in a narrower column.

## Non-Functional Constraints
- The tablet arrangement shall not add a second scaffold or duplicate any control instance.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.UX.002`
