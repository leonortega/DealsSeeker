# Spec: `OFFERS.COMMENTS.001`

## Metadata
- **Title**: Offer Comments
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (immersive feed and offer detail view)
- **Priority**: Medium

## Purpose
Allow authenticated users to read and publish plain-text comments attached to an offer, each comment shown with the author identity and avatar.

## Preconditions
- User is authenticated.
- An offer is being viewed.

## Trigger
- User selects the comments action for an offer.

## Requirements
- `OFFERS.COMMENTS.001-R1`: The immersive offer panel shall expose a comments action positioned above the favorite action.
- `OFFERS.COMMENTS.001-R2`: The offer list card and the offer detail view shall expose a comments action positioned after the favorite and directions actions.
- `OFFERS.COMMENTS.001-R3`: Selecting the comments action shall open a comments section for the selected offer.
- `OFFERS.COMMENTS.001-R4`: The comments section shall list the comments published for the selected offer, ordered from oldest to newest.
- `OFFERS.COMMENTS.001-R5`: Each comment shall display the author display name, the author avatar, the plain-text body, and the publication timestamp.
- `OFFERS.COMMENTS.001-R6`: The comments section shall provide a text input and a publish action.
- `OFFERS.COMMENTS.001-R7`: Publishing a comment shall associate the comment with the authenticated user and the selected offer, and the new comment shall be persisted and displayed.
- `OFFERS.COMMENTS.001-R8`: The system shall reject a comment whose body is empty or consists only of whitespace, and shall not publish it.
- `OFFERS.COMMENTS.001-R9`: The comments section shall show a non-error empty state when the offer has no comments.
- `OFFERS.COMMENTS.001-R10`: The comments section shall show a recoverable error state when comments cannot be loaded or published, keeping the user in the comments section.
- `OFFERS.COMMENTS.001-R11`: Comments shall be visible to every authenticated user who can see the offer.
- `OFFERS.COMMENTS.001-R12`: The comments section shall not expose offer coordinates.
- `OFFERS.COMMENTS.001-R13`: The comments action shall use the same colors and button styling as the offer actions of the classic offers view.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Comments action is available in the immersive offer panel
  Given an authenticated user views an offer in the immersive feed
  When the user inspects the offer action panel
  Then a comments action shall be available above the favorite action

Scenario: Comments action is available in the offer detail view
  Given an authenticated user opens an offer in the offer detail view
  When the user inspects the offer actions
  Then a comments action shall be available after the directions action

Scenario: Comments action is available in the offer list card
  Given an authenticated user views an offer card in the offers list
  When the user inspects the card actions
  Then a comments action shall be available after the favorite action and the directions action

Scenario: User opens the comments section
  Given an authenticated user views an offer
  When the user selects the comments action
  Then the comments section for that offer shall be shown
  And each existing comment shall show the author name, author avatar, body, and timestamp

Scenario: User publishes a comment
  Given an authenticated user has the comments section open for an offer
  When the user types a comment body and publishes it
  Then the comment shall be saved for that user and offer
  And the comment shall be shown in the comments list

Scenario: User publishes an empty comment
  Given an authenticated user has the comments section open for an offer
  When the user publishes without entering a body
  Then the comment shall not be published
  And the comments section shall show a recoverable validation state

Scenario: Offer has no comments
  Given an authenticated user opens the comments section for an offer without comments
  Then the comments section shall show a non-error empty state

Scenario: Comments fail to load
  Given an authenticated user opens the comments section for an offer
  And comments cannot be loaded
  Then the comments section shall show a recoverable error state

Scenario: Immersive comments action matches the classic view styling
  Given an authenticated user views an offer in the immersive feed
  When the user inspects the offer action panel
  Then the comments action shall use the same colors and button styling as the offer actions of the classic offers view
```

## Example Inputs/Outputs
- Example input: open the comments section of an offer that has two published comments.
- Expected output: a list of two comments, oldest first, each with author display name, avatar, body text and publication timestamp.
- Example input: publish the body `Great price` for an offer as an authenticated user.
- Expected output: a saved comment for that user and offer, shown at the end of the comments list.

## Edge Cases
- Comments fail to load: a recoverable error state is shown and the section stays open.
- Comments fail to publish: the typed body is preserved and a recoverable error state is shown.
- The offer is deleted while the comments section is open: the section shows a recoverable error state.
- Comment bodies are plain text and shall be rendered as text, never as markup.

## Non-Functional Constraints
- Comments shall load without exposing raw coordinates.
- The comments section shall remain usable on narrow viewports.

## Related Specs
- `ACCOUNT.PROFILE.AVATAR.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.IMMERSIVE.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `APP.THEME.001`
