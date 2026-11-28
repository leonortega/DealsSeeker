# Spec: `OFFERS.FAVORITES.001`

## Metadata
- **Title**: Offer Favorites and My Favorites View
- **Version**: `v0.7`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Allow users to save offers and manage them from a dedicated favorites section, with an undoable removal and one canonical set of action labels and states, using Material 3 card, list-row and chip patterns without changing behavior, privacy or accessibility.

## Preconditions
- User is authenticated.
- Offer cards are visible in the grid.

## Trigger
- User taps the favorite toggle on an offer card, removes a saved favorite in My Favorites, or opens My Favorites.

## Requirements
- `OFFERS.FAVORITES.001-R1`: Each offer card shall display a favorite toggle control (heart or star).
- `OFFERS.FAVORITES.001-R2`: Tapping the toggle shall switch the offer saved state for the current user.
- `OFFERS.FAVORITES.001-R3`: Favorite state shall be persisted per user account and synced with backend services.
- `OFFERS.FAVORITES.001-R4`: The system shall provide a `My Favorites` section listing all saved offers for the user.
- `OFFERS.FAVORITES.001-R5`: Favorites shall sync across user sessions and devices.
- `OFFERS.FAVORITES.001-R6`: Favorite suggestion chips or optional UI elements shall not block standard browsing/search flows.
- `OFFERS.FAVORITES.001-R7`: Each item in `My Favorites` shall provide an action to remove that offer from saved favorites.
- `OFFERS.FAVORITES.001-R8`: Each item in `My Favorites` shall provide a directions action that opens navigation for the offer location using the configured travel mode.
- `OFFERS.FAVORITES.001-R9`: Unauthenticated access to `My Favorites` shall redirect to `Login`.
- `OFFERS.FAVORITES.001-R10`: The My Favorites view shall use the same panel, card, and button styling as other views such as the Suggestions view (panel wrapper, rounded cards, and consistent button styling).
- `OFFERS.FAVORITES.001-R11`: My Favorites shall never run a search with a fabricated or substitute coordinate; when no usable position is available, it shall show no results and present the no-position state defined in `APP.LOCATION.UNAVAILABLE.001`, leaving the saved set unchanged.
- `OFFERS.FAVORITES.001-R12`: Removing a saved favorite in My Favorites shall produce a success message with one undo action; selecting undo shall restore the offer to the saved set and to its previous position in the list, as defined by `APP.FEEDBACK.001` and `OFFERS.ACTION.UNDO.001`.
- `OFFERS.FAVORITES.001-R13`: The removal action in My Favorites shall expose a canonical accessible name that identifies both the action and the offer, and an announced state, consistent with `OFFERS.ACTIONS.LABELS.001`.
- `OFFERS.FAVORITES.001-R14`: The favorite toggle, removal action and directions action shall keep the same announced name, role and state on every surface that renders them, as defined by `OFFERS.ACTIONS.LABELS.001`; no surface shall supply a different announced value for the same action.
- `OFFERS.FAVORITES.001-R15`: Offer cards and My Favorites list rows shall follow Material 3 card and list-row patterns with a consistent image, content and action structure, keeping the same actions, states and announced names, roles and states on every surface.
- `OFFERS.FAVORITES.001-R16`: Favorite suggestion chips, where present, shall follow a Material 3 chip pattern and shall not block browsing or search, as defined by R6.
- `OFFERS.FAVORITES.001-R17`: The Material 3 card, list-row and chip patterns shall not change favorite persistence and sync, authentication redirect, directions, removal with undo, no-fabricated-position behavior, coordinate privacy or announced labels defined by R1–R14.

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
  Then directions shall open for the offer location using the configured travel mode

Scenario: Unauthenticated user opens My Favorites
  Given the user is not authenticated
  When the user opens My Favorites
  Then the Login view shall be displayed

Scenario: My Favorites never searches with a fabricated coordinate
  Given an authenticated user has saved offers
  And no usable device position can be obtained
  When the user opens My Favorites
  Then no location-bound search shall run with a fabricated or substitute coordinate
  And no saved offers shall be listed as results for a substitute area
  And the no-position state of APP.LOCATION.UNAVAILABLE.001 shall be displayed
  And no raw latitude or longitude value shall be visible

Scenario: Removing a favorite offers undo in My Favorites
  Given an authenticated user is on My Favorites
  And a saved offer is listed
  When the user selects remove favorite for that offer
  Then the success message shall present one undo action
  And selecting undo shall restore the offer to the saved set and to its previous position

Scenario: Removal without undo stands after the dwell
  Given a removal success message with an undo action is displayed
  When the dwell elapses without undo being selected
  Then the undo action shall disappear with the message
  And the offer shall remain removed

Scenario: My Favorites actions expose canonical labels and states
  Given a saved offer is listed in My Favorites
  When assistive technology traverses that item
  Then the removal and directions actions shall announce the canonical names, roles and states
  And no surface-specific announced value shall be used

Scenario: Favorite state is announced consistently after undo
  Given a favorite removal was undone from My Favorites
  When the restored offer is rendered on a card and in My Favorites
  Then the favorite action shall announce the same saved state on both surfaces

Scenario: Favorite cards and list rows use Material 3 patterns
  Given an authenticated user sees an offer card and opens My Favorites
  When the card and the favorites list are rendered
  Then they shall follow Material 3 card and list-row patterns with a consistent structure
  And each action shall keep its announced name, role and state

Scenario: Favorite suggestion chips follow a chip pattern without blocking browsing
  Given favorite suggestions are shown as chips
  When the user browses or searches the offers feed
  Then the chips shall follow a Material 3 chip pattern
  And they shall not block browsing or search flows

Scenario: Long localized action labels keep card and row actions usable
  Given a saved offer has localized action labels longer than one word at large text scaling
  When the card and the favorites row are rendered
  Then the actions shall stay within their Material 3 patterns and remain tappable
  And no raw coordinate value shall be shown
```

## Example Inputs/Outputs
- Example input: Toggle favorite on offer `off-100`.
- Expected output: `off-100` appears in My Favorites for that user account.
- Example input: Remove `off-100` from My Favorites and select `Undo` in the success message.
- Expected output: `off-100` is saved again and returns to its previous position in My Favorites.
- Example input: Remove `off-100` and let the message expire.
- Expected output: `off-100` stays removed and the undo action disappears with the message.
- Example input: My Favorites with a saved offer and a favorite suggestion chip.
- Expected output: a Material 3 list row and chip with the same actions, states and announcements as elsewhere.

## Edge Cases
- Save/unsave failures show recoverable error and preserve last confirmed state.
- Duplicate saves for same offer/user are idempotent.
- An empty favorites set shows a non-error empty state.
- A stale or remembered position shall not be used to populate My Favorites when no current position is available.
- A removal is undone after the item has scrolled out of view — it returns to its previous position when the list is rendered again.
- A removal fails — the error offers no undo and the offer remains saved.
- Localized removal and directions labels at 200 percent text size.
- A localized chip label wrapping at large text size — the chip does not block the browse or search controls.

## Non-Functional Constraints
- Favorite toggling should provide immediate UI feedback.
- Removal feedback and undo shall follow the shared feedback lifecycle in `APP.FEEDBACK.001`.
- No raw latitude or longitude value shall be exposed by any favorite action or feedback.
- The Material 3 card, list-row and chip patterns shall not expose raw coordinate values or change action announcements.

## Related Specs
- `OFFERS.GUEST.001`
- `APP.LOCATION.UNAVAILABLE.001`
- `APP.LIST.VIRTUALIZATION.001`
- `OFFERS.GRID.CARDS.001`
- `ACCOUNT.PROFILE.001`
- `APP.NAVIGATION.MODE.001`
- `OFFERS.IMMERSIVE.001`
- `APP.ACCESSIBILITY.UX.002`
- `OFFERS.UX.002`
- `APP.HAPTICS.001`
- `APP.FEEDBACK.001`
- `OFFERS.ACTIONS.LABELS.001`
- `OFFERS.ACTION.UNDO.001`
- `SUGGESTIONS.SUBMIT.001`
