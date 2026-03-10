# Spec: `OFFERS.DETAIL.ACTIONS.001`

## Metadata
- **Title**: Offer Detail Image Zoom and Configured Directions Action
- **Version**: `v0.2`
- **Status**: Draft
- **Context/View**: Offer Detail View
- **Priority**: Medium

## Purpose
Enhance offer detail interactions with full-screen image zoom and direct navigation using the configured travel mode.

## Preconditions
- User opened an offer detail view.
- Offer has at least one image and valid location data.

## Trigger
- User taps offer image or selects the directions action.

## Requirements
- `OFFERS.DETAIL.ACTIONS.001-R1`: Tapping the offer image shall open a full-screen image viewer.
- `OFFERS.DETAIL.ACTIONS.001-R2`: Full-screen image viewer shall preserve host-surface zoom gestures when the active platform supports them.
- `OFFERS.DETAIL.ACTIONS.001-R3`: Offer detail view shall include a directions button.
- `OFFERS.DETAIL.ACTIONS.001-R4`: Directions button text shall reflect the user-selected travel mode.
- `OFFERS.DETAIL.ACTIONS.001-R5`: Selecting the directions button shall launch the device default maps application with the configured travel mode and offer destination preloaded.
- `OFFERS.DETAIL.ACTIONS.001-R6`: If native maps application is unavailable, the system shall use browser fallback for directions while preserving the configured travel mode when supported by the provider.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User zooms offer image in full-screen viewer
  Given the user is on offer detail view
  And the offer has an image
  When the user taps the image
  Then a full-screen image viewer shall open
  And the active host surface shall preserve its native zoom gesture behavior for the image viewer

Scenario: User opens directions from offer detail
  Given the user is on offer detail view for an offer with valid location
  And directions mode is configured as car
  When the user taps the directions button
  Then default maps application shall open in car mode for that offer location
  And the directions button text shall reflect car directions
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
- `APP.NAVIGATION.MODE.001`
