# Spec: `OFFERS.FAVORITES.001`

## Metadata
- **Title**: Offer Favorites and My Favorites View
- **Version**: `v0.2`
- **Status**: Draft
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Allow users to save offers and manage them from a dedicated favorites section.

## Preconditions
- User is authenticated.
- Offer cards are visible in the grid.

## Trigger
- User taps the favorite toggle on an offer card or opens My Favorites.

## Requirements
- `OFFERS.FAVORITES.001-R1`: Each offer card shall display a favorite toggle control (heart or star).
- `OFFERS.FAVORITES.001-R2`: Tapping the toggle shall switch the offer saved state for the current user.
- `OFFERS.FAVORITES.001-R3`: Favorite state shall be persisted per user account and synced with backend services.
- `OFFERS.FAVORITES.001-R4`: The system shall provide a `My Favorites` section listing all saved offers for the user.
- `OFFERS.FAVORITES.001-R5`: Favorites shall sync across user sessions and devices.
- `OFFERS.FAVORITES.001-R6`: Favorite suggestion chips or optional UI elements shall not block standard browsing/search flows.
- `OFFERS.FAVORITES.001-R7`: Each item in `My Favorites` shall provide an action to remove that offer from saved favorites.
- `OFFERS.FAVORITES.001-R8`: Each item in `My Favorites` shall provide a directions action that opens walking navigation for the offer location.
- `OFFERS.FAVORITES.001-R9`: Unauthenticated access to `My Favorites` shall redirect to `Login`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User toggles favorite from offer card
  Given an authenticated user sees an offer card
  When the user taps the favorite toggle
  Then the offer saved state shall be updated for that user
  And favorite state shall remain after app relaunch

Scenario: My Favorites lists saved offers
  Given an authenticated user has saved offers
  When the user opens My Favorites
  Then all saved offers shall be listed
  And unsaved offers shall not appear

Scenario: User removes an offer from My Favorites
  Given an authenticated user is on My Favorites
  And a saved offer is listed
  When the user selects remove favorite on that offer
  Then the offer shall be removed from the saved favorites set
  And the offer shall no longer appear in My Favorites

Scenario: User opens directions from My Favorites
  Given an authenticated user is on My Favorites
  And a saved offer has a valid location
  When the user selects directions for that offer
  Then walking directions shall open for the offer location

Scenario: Unauthenticated user opens My Favorites
  Given the user is not authenticated
  When the user opens My Favorites
  Then the Login view shall be displayed
```

## Example Inputs/Outputs
- Example input: Toggle favorite on offer `off-100`.
- Expected output: `off-100` appears in My Favorites for that user account.

## Edge Cases
- Save/unsave failures show recoverable error and preserve last confirmed state.
- Duplicate saves for same offer/user are idempotent.
- An empty favorites set shows a non-error empty state.

## Non-Functional Constraints
- Favorite toggling should provide immediate UI feedback.

## Related Specs
- `OFFERS.GRID.CARDS.001`
- `ACCOUNT.PROFILE.001`
