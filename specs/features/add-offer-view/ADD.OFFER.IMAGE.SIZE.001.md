# Spec: `ADD.OFFER.IMAGE.SIZE.001`

## Metadata
- **Title**: Bounded Photo Payload for Add Offer
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer
- **Priority**: Medium

## Purpose
Bound the encoded photo payload held while creating an offer so the contribution flow stays responsive on a phone.

## Preconditions
- The user is in the Add Offer view with an authenticated session.

## Trigger
- A photo is captured, selected, or added to the draft.

## Requirements
- `ADD.OFFER.IMAGE.SIZE.001-R1`: The draft shall accept at most four photos.
- `ADD.OFFER.IMAGE.SIZE.001-R2`: Photos shall be encoded at reduced quality before being held in the draft, and the picker shall request no more than the remaining photo slots.
- `ADD.OFFER.IMAGE.SIZE.001-R3`: Exceeding the photo limit shall show the existing limit message and shall not add the photo.
- `ADD.OFFER.IMAGE.SIZE.001-R4`: Photo order, formats and submission behavior shall not change.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Photo count is bounded
  Given the draft already holds four photos
  When the user tries to add another photo
  Then the existing limit message is shown
  And the draft still holds four photos

Scenario: Picker requests a reduced payload
  Given the user starts a photo capture or gallery selection
  When the picker is launched
  Then it requests reduced image quality
  And a gallery selection requests at most the remaining slots

Scenario: Submitted photos keep their order and format
  Given a draft with photos
  When it is submitted
  Then the photos keep their order and formats
```

## Example Inputs/Outputs
- Example input: camera capture with one remaining slot.
- Expected output: picker opened with reduced quality; one photo added.
- Example input: four photos already attached.
- Expected output: `add.maxPhotos` shown; no fifth photo added.

## Edge Cases
- A gallery selection larger than the remaining slots.
- A cancelled picker.
- Photos with unusual aspect ratios.

## Non-Functional Constraints
- No new image-processing dependency is introduced.
- Existing localization keys are reused.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.TAG.LIMIT.001`
