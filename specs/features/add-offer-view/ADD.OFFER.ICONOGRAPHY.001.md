# Spec: `ADD.OFFER.ICONOGRAPHY.001`

## Metadata
- **Title**: Consistent control labels in the Add Offer view
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Replace standalone Unicode glyphs in the Add Offer view with plain-language labels that match each control's accessible name.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- The view renders its image area, image reorder controls, or selected tag list.

## Requirements
- `ADD.OFFER.ICONOGRAPHY.001-R1`: The view shall not use standalone Unicode glyphs or emoji as stand-ins for icons.
- `ADD.OFFER.ICONOGRAPHY.001-R2`: The empty image area shall show a plain-language label instead of a decorative glyph.
- `ADD.OFFER.ICONOGRAPHY.001-R3`: Image reorder controls shall show text labels that name their action.
- `ADD.OFFER.ICONOGRAPHY.001-R4`: Selected tags shall be identifiable and removable using the existing removal hint, without a trailing glyph on the tag text.
- `ADD.OFFER.ICONOGRAPHY.001-R5`: Each control's accessible name shall match its visible label.
- `ADD.OFFER.ICONOGRAPHY.001-R6`: All new labels shall follow the active language.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Empty image area uses a text label
  Given the user opens Add Offer view with no attached photos
  When the image area renders
  Then a plain-language "no photo" label is shown
  And no decorative glyph is shown in its place

Scenario: Reorder controls name their action
  Given at least one photo is attached
  When the reorder controls render
  Then each control shows a text label naming its direction
  And each control's accessible name matches its visible label

Scenario: Tag chips carry no trailing glyph
  Given a tag is selected
  When the tag list renders
  Then the tag text contains no trailing removal symbol
  And the removal hint still explains that tapping a tag removes it

Scenario: Labels follow the active language
  Given the app language is Spanish
  When the image area and reorder controls render
  Then their labels are shown in Spanish
```

## Example Inputs/Outputs
- Example input: user opens Add Offer view in English with no photos.
- Expected output: the image area reads "No photo selected"; no `▤`, `←`, `→`, or `×` glyphs appear as controls.

## Edge Cases
- A localized label longer than the available button width.
- Large text sizes where the label wraps inside a 44pt control.
- Many selected tags with long names.
- Edit mode with prefilled images and tags.

## Non-Functional Constraints
- Touch targets shall remain at least 44pt tall.
- This spec does not change validation, submission, or coordinate-privacy behavior.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.KEYBOARD.001`
- `APP.LOCALIZATION.001`
- `ADD.OFFER.VISUAL.HIERARCHY.001`
