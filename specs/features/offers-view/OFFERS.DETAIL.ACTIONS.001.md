# Spec: `OFFERS.DETAIL.ACTIONS.001`

## Metadata
- **Title**: Offer Detail Actions, Status Mirroring and Explicit Completion
- **Version**: `v0.4`
- **Status**: Approved
- **Context/View**: Offer Detail View
- **Priority**: Medium

## Purpose
Keep detail interactions consistent with the offer card while mirroring status and letting the user decide when to leave.

## Preconditions
- User opened an offer detail view.
- Offer has at least one image and valid location data.

## Trigger
- User taps offer image or selects the directions action.

## Requirements
- `OFFERS.DETAIL.ACTIONS.001-R1`: Tapping the offer image shall open an image viewer in the shell's single sheet system; no separate full-screen modal shall be introduced.
- `OFFERS.DETAIL.ACTIONS.001-R2`: Full-screen image viewer shall preserve host-surface zoom gestures when the active platform supports them.
- `OFFERS.DETAIL.ACTIONS.001-R3`: Offer detail view shall include a directions button.
- `OFFERS.DETAIL.ACTIONS.001-R4`: Directions button text shall reflect the user-selected travel mode.
- `OFFERS.DETAIL.ACTIONS.001-R5`: Selecting the directions button shall launch the device default maps application with the configured travel mode and offer destination preloaded.
- `OFFERS.DETAIL.ACTIONS.001-R6`: If native maps application is unavailable, the system shall use browser fallback for directions while preserving the configured travel mode when supported by the provider.
- `OFFERS.DETAIL.ACTIONS.001-R7`: The detail sheet shall mirror any promoted or reported badge shown on the offer card or feed row, and shall show the same reported warning when the offer is reported.
- `OFFERS.DETAIL.ACTIONS.001-R8`: Actions in the detail sheet shall use the canonical vocabulary defined by `OFFERS.ACTIONS.LABELS.001` with the same label, glyph and relative order as on the card and feed.
- `OFFERS.DETAIL.ACTIONS.001-R9`: Completing an action in the detail sheet shall not automatically close the sheet or navigate away; the sheet shall remain until the user selects an explicit completion control such as `Done` or `Close`.
- `OFFERS.DETAIL.ACTIONS.001-R10`: The image viewer shall use the common sheet system and shall share its single Back dispatch and focus-return behavior with the other offer overlays, as defined by `APP.MODALITY.UNIFICATION.001`.

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

Scenario: Status badges and reported warning are mirrored into the sheet
  Given an offer carries a promoted badge and a reported badge with its warning on the feed row
  When the user opens the detail sheet for that offer
  Then the promoted and reported badges are shown in the sheet
  And the reported warning is shown with the same wording as on the feed row

Scenario: Detail actions stay on the sheet until an explicit completion control
  Given the user is on the detail sheet for an offer
  When the user completes an inline action such as a vote or a report
  Then the sheet remains open
  And no automatic navigation occurs
  And an explicit Done or Close control ends the interaction
```

## Example Inputs/Outputs
- Example input: Tap the detail image on a zoom-capable host surface, then perform a native zoom gesture in the sheet image viewer.
- Expected output: The viewer opens in the common sheet immediately, preserves the host surface zoom gesture, and scales the image while the directions action remains available for the configured travel mode.
- Example input: Open the detail sheet for a reported and promoted offer.
- Expected output: Both badges and the reported warning appear in the sheet as they did on the feed row.
- Example input: Invoke system Back while the image viewer is open over the detail sheet.
- Expected output: the viewer is dismissed through the common sheet path and focus returns to the tapped image.

## Edge Cases
- Invalid location disables directions button with visible unavailable state.
- Multi-photo offers open the sheet image viewer at the selected photo index.
- An offer whose status changes while the sheet is open — the mirrored badges follow the offer's current status.
- A reported offer whose warning is longer than the source text at large text sizes.
- Back is invoked while the image viewer and the detail sheet are both open; one invocation dismisses only the topmost sheet.

## Non-Functional Constraints
- Image viewer open and gesture response should feel immediate.

## Related Specs
- `OFFERS.MAP.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
- `APP.NAVIGATION.MODE.001`
- `OFFERS.COMMENTS.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `APP.CONTEXT_MENU.001`
- `APP.PERFORMANCE.001`
- `OFFERS.ACTIONS.LABELS.001`
- `OFFERS.LIST.ACTIONS.001`
- `APP.MODALITY.UNIFICATION.001`
- `APP.BOTTOM_SHEET.001`
