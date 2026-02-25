# Spec: `ADD.OFFER.IMAGE.001`

## Metadata
- **Title**: Add Offer Image Capture or Upload
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Allow user to attach an image from camera or gallery.

## Preconditions
- User is on Add Offer view.

## Trigger
- User taps image placeholder.

## Requirements
- `ADD.OFFER.IMAGE.001-R1`: The system shall request camera permission when needed.
- `ADD.OFFER.IMAGE.001-R2`: The system shall allow taking a photo with device camera.
- `ADD.OFFER.IMAGE.001-R3`: The system shall allow selecting an image from device gallery.
- `ADD.OFFER.IMAGE.001-R4`: After selection, the image shall be attached to current offer draft.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User attaches image from camera
  Given the user is on Add Offer view
  When the user taps image placeholder and selects Take Photo
  And captures a photo
  Then the image shall be attached to the offer draft

Scenario: User attaches image from gallery
  Given the user is on Add Offer view
  When the user taps image placeholder and selects Upload from Gallery
  And selects an image
  Then the image shall be attached to the offer draft
```

## Example Inputs/Outputs
- Example input: Selected image file metadata.
- Expected output: Draft contains attached image reference and UI thumbnail.

## Edge Cases
- Permission denied keeps image empty and exposes explicit error state.
- User cancels camera/gallery flow and draft remains unchanged.
- File too large fails validation.

## Non-Functional Constraints
- Image metadata should be available for validation (file type, size, dimensions).

## Related Specs
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.LAYOUT.001`

