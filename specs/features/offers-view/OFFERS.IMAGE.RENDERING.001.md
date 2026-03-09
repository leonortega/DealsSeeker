# Spec: `OFFERS.IMAGE.RENDERING.001`

## Metadata
- **Title**: Normalized Offer Image Rendering
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Add Offer + Offers Grid + Offer Detail
- **Priority**: High

## Purpose
Ensure consistent image sizing and display style across offer upload, cards, and detail view.

## Preconditions
- Offer image upload is available.

## Trigger
- User uploads offer images or views offer cards/details.

## Requirements
- `OFFERS.IMAGE.RENDERING.001-R1`: The system shall normalize uploaded images to a uniform target aspect ratio.
- `OFFERS.IMAGE.RENDERING.001-R2`: Normalization shall use resize/crop at upload processing time.
- `OFFERS.IMAGE.RENDERING.001-R3`: Offers grid cards and offer detail view shall render images with the same normalized aspect ratio policy.
- `OFFERS.IMAGE.RENDERING.001-R4`: The system shall support a configurable render mode (`square-crop` or `stretched-fill`) with `square-crop` as default.
- `OFFERS.IMAGE.RENDERING.001-R5`: If image normalization fails, the system shall display a placeholder while preserving layout consistency.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Uploaded images are normalized for consistent display
  Given a user uploads images with different dimensions
  When upload processing completes
  Then images shall be normalized to a common aspect ratio
  And grid and detail views shall display consistent framing

Scenario: Fallback placeholder preserves layout
  Given an image cannot be processed
  When the offer card is rendered
  Then a placeholder shall be shown
  And card size shall remain unchanged
```

## Example Inputs/Outputs
- Example input: Images at 4:3, 16:9, and portrait ratios.
- Expected output: Uniformly framed images in cards and detail view.

## Edge Cases
- Extremely small images are upscaled with quality guardrails.
- Corrupt image files fail gracefully with placeholder rendering.

## Non-Functional Constraints
- Image processing and rendering should not block core feed interactions.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `OFFERS.GRID.CARDS.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
