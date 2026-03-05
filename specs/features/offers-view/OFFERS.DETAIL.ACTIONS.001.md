# Spec: `OFFERS.DETAIL.ACTIONS.001`

## Metadata
- **Title**: Offer Detail Image Zoom and Walking Directions Action
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Offer Detail View
- **Priority**: Medium

## Purpose
Enhance offer detail interactions with full-screen image zoom and direct walking navigation.

## Preconditions
- User opened an offer detail view.
- Offer has at least one image and valid location data.

## Trigger
- User taps offer image or selects `Get Walking Directions`.

## Requirements
- `OFFERS.DETAIL.ACTIONS.001-R1`: Tapping the offer image shall open a full-screen image viewer.
- `OFFERS.DETAIL.ACTIONS.001-R2`: Full-screen image viewer shall support pinch-to-zoom gestures.
- `OFFERS.DETAIL.ACTIONS.001-R3`: Offer detail view shall include a `Get Walking Directions` button.
- `OFFERS.DETAIL.ACTIONS.001-R4`: Selecting `Get Walking Directions` shall launch the device default maps application with walking mode and offer destination preloaded.
- `OFFERS.DETAIL.ACTIONS.001-R5`: If native maps application is unavailable, the system shall use browser fallback for walking directions.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User zooms offer image in full-screen viewer
  Given the user is on offer detail view
  And the offer has an image
  When the user taps the image
  Then a full-screen image viewer shall open
  And pinch gestures shall zoom the image

Scenario: User opens walking directions from offer detail
  Given the user is on offer detail view for an offer with valid location
  When the user taps Get Walking Directions
  Then default maps application shall open in walking mode for that offer location
```

## Example Inputs/Outputs
- Example input: Tap detail image and perform pinch gesture.
- Expected output: Image scales in full-screen viewer.

## Edge Cases
- Invalid location disables directions button with visible unavailable state.
- Multi-photo offers open full-screen viewer at selected photo index.

## Non-Functional Constraints
- Full-screen viewer open and gesture response should feel immediate.

## Related Specs
- `OFFERS.MAP.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
