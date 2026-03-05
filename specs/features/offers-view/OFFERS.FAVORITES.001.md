# Spec: `OFFERS.FAVORITES.001`

## Metadata
- **Title**: Offer Favorites and My Favorites View
- **Version**: `v0.1`
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
```

## Example Inputs/Outputs
- Example input: Toggle favorite on offer `off-100`.
- Expected output: `off-100` appears in My Favorites for that user account.

## Edge Cases
- Save/unsave failures show recoverable error and preserve last confirmed state.
- Duplicate saves for same offer/user are idempotent.

## Non-Functional Constraints
- Favorite toggling should provide immediate UI feedback.

## Related Specs
- `OFFERS.GRID.CARDS.001`
- `ACCOUNT.PROFILE.001`
