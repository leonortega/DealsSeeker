# Spec: `OFFERS.PHOTOS.CAROUSEL.001`

## Metadata
- **Title**: Multi-Photo Upload and Offer Detail Carousel
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Add Offer + Offer Detail View
- **Priority**: High

## Purpose
Support multiple offer photos from upload through detail-view browsing.

## Preconditions
- User is in Add Offer view or Offer Detail view.

## Trigger
- User uploads photos in Add Offer or opens detail media area.

## Requirements
- `OFFERS.PHOTOS.CAROUSEL.001-R1`: The system shall allow uploading more than one photo per offer.
- `OFFERS.PHOTOS.CAROUSEL.001-R2`: Add Offer upload UI shall support multi-file selection.
- `OFFERS.PHOTOS.CAROUSEL.001-R3`: Add Offer upload UI shall allow reordering uploaded photos.
- `OFFERS.PHOTOS.CAROUSEL.001-R4`: Maximum photo count per offer shall be configurable, with default value marked as TBD.
- `OFFERS.PHOTOS.CAROUSEL.001-R5`: Offer detail view shall render uploaded photos as a swipeable carousel.
- `OFFERS.PHOTOS.CAROUSEL.001-R6`: Grid and summary contexts shall use the first ordered photo as primary preview unless explicitly configured otherwise.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User uploads and reorders multiple photos
  Given the user is in Add Offer view
  When the user selects multiple image files
  And reorders the selected photos
  Then all selected photos shall be attached to the offer draft in user-defined order

Scenario: Offer detail shows swipeable carousel
  Given an offer has multiple photos
  When the user opens offer detail view
  Then photos shall be shown as a swipeable carousel
  And the first carousel image shall match the configured primary preview
```

## Example Inputs/Outputs
- Example input: Upload 3 images and move image 3 to first position.
- Expected output: Detail carousel order reflects the final user order.

## Edge Cases
- Attempting to exceed configured max photo count is rejected with explicit validation.
- Removing a photo updates persisted order indexes.

## Non-Functional Constraints
- Carousel swipe should remain smooth on common mobile devices.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `OFFERS.IMAGE.RENDERING.001`
- `OFFERS.DETAIL.ACTIONS.001`
