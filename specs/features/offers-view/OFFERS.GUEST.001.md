# Spec: `OFFERS.GUEST.001`

## Metadata
- **Title**: Read-Only Guest Discovery in Offers
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Supersedes / scope note
This spec defines the read-only discovery session introduced by `APP.SHELL.001`. Contribution actions remain governed by their own specs (`OFFERS.FAVORITES.001`, `OFFERS.DETAIL.ACTIONS.001`, `OFFERS.COMMENTS.001`, `REPORTS.SUBMIT.001`, `OFFERS.NAV.ADD.001`) for authenticated users; this spec adds sign-in gating and context preservation for unauthenticated users only.

## Purpose
Let an unauthenticated user discover offers read-only, with contribution actions gated behind sign-in and the current discovery context preserved across that sign-in.

## Preconditions
- No active authenticated session exists.
- The user has chosen `Browse nearby without an account` from the unauthenticated startup entry view defined in `APP.SHELL.001` or `ACCOUNT.AUTH.LOGIN.001`, or has entered the Offers section while unauthenticated.
- The Offers view is available in either the standard or the immersive presentation.

## Trigger
- A guest opens or interacts with the Offers view, or a guest attempts a contribution action while unauthenticated.

## Requirements
- `OFFERS.GUEST.001-R1`: A guest shall be able to view the offers feed and the offers map read-only.
- `OFFERS.GUEST.001-R2`: A guest shall be able to enter search text and change the coverage radius, with the offer list and map markers updating as defined in `OFFERS.SEARCH.001`.
- `OFFERS.GUEST.001-R3`: A guest shall be able to open an offer's details and browse its photos as defined in `OFFERS.PHOTOS.CAROUSEL.001`, and shall be able to request directions as defined in `OFFERS.DETAIL.ACTIONS.001`.
- `OFFERS.GUEST.001-R4`: A guest shall not be able to add an offer, favorite an offer, vote on an offer's availability, comment on an offer, or report an offer; none of these contribution actions shall take effect while unauthenticated.
- `OFFERS.GUEST.001-R5`: When a guest attempts a contribution action, the system shall prompt for sign-in instead of performing the action, and shall preserve the current search query, coverage radius, presentation mode, and any open offer.
- `OFFERS.GUEST.001-R6`: After successful sign-in from that prompt, the system shall return to the prior Offers context with the query, coverage radius, presentation mode, and open offer restored, as defined in `ACCOUNT.AUTH.LOGIN.001`.
- `OFFERS.GUEST.001-R7`: If the guest cancels or fails the sign-in prompt, the system shall keep the guest session active and shall restore the preserved discovery context.
- `OFFERS.GUEST.001-R8`: The read-only guest state shall be plainly indicated in both the standard Offers view and the immersive feed, so the user can tell that discovery is available but contributions require an account.
- `OFFERS.GUEST.001-R9`: A guest session shall not create or persist an authenticated user session and shall not access user-scoped data such as saved favorites or the user's own offers.
- `OFFERS.GUEST.001-R10`: The Offers view shall not expose raw `lat` or `lng` values to a guest in either presentation.
- `OFFERS.GUEST.001-R11`: An unfiltered empty result during guest discovery shall render the guidance defined in `OFFERS.EMPTY.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Guest browses the feed and the map
  Given there is no active authenticated session
  And the user has chosen to browse nearby without an account
  When the Offers view opens
  Then the offers feed shall be visible read-only
  And the offers map shall be reachable and viewable

Scenario: Guest searches and widens the coverage area
  Given a guest is on the Offers view
  When the guest enters a search query and changes the coverage radius
  Then the offer list and map markers shall update for the query and radius
  And the guest shall remain in the read-only session

Scenario: Guest opens offer details and photos
  Given a guest is viewing an offer in the feed or map
  When the guest opens the offer's details and swipes through its photos
  Then the details and photos shall be displayed
  And the guest shall not be asked to sign in to view them

Scenario: Guest attempt to favorite prompts sign-in without losing context
  Given a guest is viewing offers with query "coffee" and a 1000 meter radius
  When the guest attempts to favorite an offer
  Then no favorite change shall be made
  And a sign-in prompt shall be shown
  And the query, radius, presentation mode, and open offer shall be preserved

Scenario: Guest attempts to vote, comment, report, or add are gated
  Given a guest is on an offer detail view
  When the guest attempts a vote, a comment, or a report
  Then the action shall not take effect
  And a sign-in prompt shall be shown
  When a guest selects the add-offer action
  Then a sign-in prompt shall be shown instead of the Add Offer view

Scenario: Guest signs in and returns to the prior context
  Given a guest was prompted to sign in while viewing offer "off-100" with query "coffee" and a 1000 meter radius in the immersive feed
  When the guest signs in successfully
  Then the guest session shall end and an authenticated session shall begin
  And the immersive presentation shall be restored
  And the query "coffee", the 1000 meter radius, and offer "off-100" shall be restored

Scenario: Guest cancels or fails sign-in and keeps the discovery context
  Given a guest was prompted to sign in while viewing an offer with an active query
  When the guest cancels the prompt or submits invalid credentials
  Then the guest session shall remain active
  And the active query, radius, presentation mode, and open offer shall be unchanged

Scenario: Guest state is plainly indicated in both presentations
  Given a guest is in the Offers view
  When the standard view or the immersive feed is rendered
  Then a plain indication shall show that browsing is read-only
  And no raw latitude or longitude value shall be displayed

Scenario: Guest with no offers sees the unfiltered empty guidance
  Given a guest is on the Offers view with no query and no favorites filter active
  When a search completes with no offers
  Then the empty-state guidance shall be displayed in the current presentation
```

## Example Inputs/Outputs
- Example input: guest with query `coffee` taps the favorite control on offer `off-100`.
- Expected output: no favorite is saved; a sign-in prompt appears; after successful sign-in the immersive feed, query, radius, and `off-100` are restored.
- Example input: guest opens the map and changes coverage radius to 2000 meters.
- Expected output: map markers and offer list refresh for 2000 meters; no prompt is shown.

## Edge Cases
- The sign-in prompt is dismissed with the Android back gesture: the guest session and the preserved context remain.
- Sign-in fails while context is preserved: the guest stays in the guest session with query, radius, mode, and offer unchanged.
- A direct link opens an offer detail while unauthenticated: the detail opens read-only with no sign-in requirement to view it.
- `My Favorites` or another user-scoped destination is requested by a guest: sign-in is prompted rather than guest data being shown.
- Localized guest-state and sign-in prompt labels expand beyond the English text without clipping.
- Location resolution fails during guest discovery: the non-blocking error/empty state of `APP.LOCATION.FALLBACK.001` applies and navigation stays available.
- The guest session is not restored as an authenticated session after an app relaunch.

## Non-Functional Constraints
- The sign-in prompt shall be reachable with a single activation of a contribution control.
- Guest-state indication shall be exposed to assistive technology and shall not rely on color alone.
- The guest session shall be discarded when the app is closed, so contribution gating applies again on the next launch.

## Related Specs
- `APP.SHELL.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `OFFERS.EMPTY.001`
- `OFFERS.SEARCH.001`
- `OFFERS.MODE.SWITCH.001`
- `OFFERS.MAP.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.FAVORITES.001`
- `OFFERS.COMMENTS.001`
- `REPORTS.SUBMIT.001`
- `OFFERS.NAV.ADD.001`
- `APP.LOCATION.FALLBACK.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.LOCALIZATION.001`
