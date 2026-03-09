# Spec: `ADD.OFFER.IMAGE.001`

## Metadata
- **Title**: Add Offer Photo Capture or Upload
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Allow user to attach photos from camera or gallery.

## Preconditions
- User is on Add Offer view.

## Trigger
- User taps image upload area.

## Requirements
- `ADD.OFFER.IMAGE.001-R1`: The system shall request camera permission when needed.
- `ADD.OFFER.IMAGE.001-R2`: The system shall allow taking a photo with device camera.
- `ADD.OFFER.IMAGE.001-R3`: The system shall allow selecting one or more images from device gallery.
- `ADD.OFFER.IMAGE.001-R4`: After selection, the selected images shall be attached to current offer draft.
- `ADD.OFFER.IMAGE.001-R5`: Image processing and rendering normalization shall follow `OFFERS.IMAGE.RENDERING.001`.
- `ADD.OFFER.IMAGE.001-R6`: Multi-photo selection and ordering behavior shall follow `OFFERS.PHOTOS.CAROUSEL.001`.
- `ADD.OFFER.IMAGE.001-R7`: The save action shall require at least one attached user image before create-offer or edit-offer submission proceeds.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User attaches photo from camera
  Given the user is on Add Offer view
  When the user taps image upload area and selects Take Photo
  And captures a photo
  Then the photo shall be attached to the offer draft

Scenario: User attaches one or more photos from gallery
  Given the user is on Add Offer view
  When the user taps image upload area and selects Upload from Gallery
  And selects one or more images
  Then the selected photos shall be attached to the offer draft

Scenario: Save is blocked when no photo is attached
  Given the user is on Add Offer view with no attached user image
  When the user submits save
  Then the system shall block submission
  And the system shall show a photo-required validation error
```

## Example Inputs/Outputs
- Example input: Selected image file metadata list.
- Expected output: Draft contains attached image references and UI previews.

## Edge Cases
- Permission denied keeps photo list unchanged and exposes explicit error state.
- User cancels camera/gallery flow and draft remains unchanged.
- File too large fails validation.
- Placeholder imagery does not satisfy the required attached-photo rule for save validation.

## Non-Functional Constraints
- Image metadata should be available for validation (file type, size, dimensions).

## Related Specs
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.LAYOUT.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
- `OFFERS.IMAGE.RENDERING.001`
