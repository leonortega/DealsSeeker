# Spec: `OFFERS.ACTIONS.LABELS.001`

## Metadata
- **Title**: Shared Offer Action Vocabulary and Visible Labels
- **Version**: `v1.5`
- **Status**: Approved
- **Context/View**: Offers View (immersive feed, offer cards, favorites and detail sheet)
- **Priority**: Medium

## Material 3 action components (Android phase)
The authored-view exception for the immersive action rail is retired. Every offer action, including those in the rail, shall be rendered with Material 3 button or icon-button components while keeping the canonical labels, roles, states and order defined by this spec. The separate symbol-vocabulary exception of R10 remains governed by `APP.SYMBOL.VOCABULARY.001` and is not changed here.

## Purpose
Keep offer actions self-explanatory on a phone and identical across cards, feed, favorites and detail, with one canonical label, role, state and order for every action.

## Preconditions
- The user is authenticated on the Offers view.
- An offer with the standard action set is displayed.

## Trigger
- An offer action control is rendered, or the system text size changes.

## Requirements
- `OFFERS.ACTIONS.LABELS.001-R1`: In the default phone presentation, each offer action shall show a visible text label next to or beneath its glyph.
- `OFFERS.ACTIONS.LABELS.001-R2`: When measured available space cannot hold captions without overlapping another control, the secondary actions shall be reachable through a single visibly labelled disclosure whose entries carry text labels; every action shall remain independently tappable and labelled for assistive technology.
- `OFFERS.ACTIONS.LABELS.001-R3`: The directions action shall remain the only waypoint-accented primary action, as defined by `OFFERS.UX.002-R8`.
- `OFFERS.ACTIONS.LABELS.001-R4`: Labels shall follow the system text size without clipping or overlapping adjacent controls.
- `OFFERS.ACTIONS.LABELS.001-R5`: Every action shall keep its assistive-technology label regardless of whether the visible caption is shown.
- `OFFERS.ACTIONS.LABELS.001-R6`: The system shall use one canonical action vocabulary across offer cards, the feed, favorites rows and the detail sheet; for each action the vocabulary shall fix the visible label, the glyph and the relative order.
- `OFFERS.ACTIONS.LABELS.001-R7`: The canonical vocabulary shall be `Directions` (waypoint glyph), `Favorite` (heart glyph), `Comments` (speech-bubble glyph), `Available?` with thumbs-up and thumbs-down glyphs, and `Report` (flag glyph), in that order; the same label and glyph shall appear on every surface.
- `OFFERS.ACTIONS.LABELS.001-R8`: No more than four actions shall be visible at once in an immersive action rail; every remaining action shall sit behind a single control visibly labelled `More` and shall keep its canonical order inside that control.
- `OFFERS.ACTIONS.LABELS.001-R9`: No action shall change its label, glyph or relative order because of the surface that renders it.
- `OFFERS.ACTIONS.LABELS.001-R10`: This canonical vocabulary governs the offer action rail only and is the sole exception to the platform symbol vocabulary; shell chrome and content glyphs outside the rail shall follow the one platform vocabulary defined by `APP.SYMBOL.VOCABULARY.001`, and a rail glyph shall not be reused as a second chrome vocabulary.
- `OFFERS.ACTIONS.LABELS.001-R11`: For every action, the canonical vocabulary shall fix one visible label, one announced name, one announced role and one announced state; the favorite action shall announce whether the offer is saved, and the availability action shall announce the user's current vote.
- `OFFERS.ACTIONS.LABELS.001-R12`: An action shall keep the same announced name, role and state on every surface; no surface shall supply a different assistive-technology value for the same action, and an action shall not be announced differently because it appears inside a disclosure.
- `OFFERS.ACTIONS.LABELS.001-R13`: The canonical vocabulary shall also define the saved-offer removal action as `Remove favorite`; it shall appear only where removal is offered, shall be distinct from the favorite toggle, and shall keep the same label and announced state wherever it appears, as defined by `OFFERS.FAVORITES.001`.
- `OFFERS.ACTIONS.LABELS.001-R14`: Every offer action control, including those in the immersive rail, shall be rendered with Material 3 button or icon-button components; no authored-view exception shall keep an action as a custom touchable control.
- `OFFERS.ACTIONS.LABELS.001-R15`: Moving an action to a Material 3 component shall preserve its canonical visible label, glyph, announced name, role, state and relative order defined by R6–R13; the component shall not change which action is announced as selected or disabled.
- `OFFERS.ACTIONS.LABELS.001-R16`: Each action component shall keep a touch target of at least 48 by 48 dp and shall reflow its caption at 200 percent font scale without clipping, as defined by `APP.ACCESSIBILITY.UX.001` and `APP.ADAPTIVE.UX.002`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Phone presentation shows action labels
  Given an offer is displayed on a phone in portrait
  When the action controls are rendered
  Then each action shows a visible text label
  And the directions action is the only waypoint-accented action

Scenario: Large text keeps actions labelled
  Given the system text size is set to 150 percent or higher
  When the action controls are rendered
  Then each action is either visibly labelled or reachable through a visibly labelled disclosure
  And no label clips or overlaps another control

Scenario: Short viewport uses a labelled disclosure
  Given the available vertical space is too short for action captions
  When the action rail is rendered
  Then secondary actions sit behind one visibly labelled control
  And its entries carry text labels and remain independently tappable
  And every action remains labelled for assistive technology

Scenario: One vocabulary across all offer surfaces
  Given an offer appears on a card, in the feed, in favorites and in the detail sheet
  When the actions are rendered on each surface
  Then Directions, Favorite, Comments, Available? and Report use the same label and glyph everywhere
  And the actions appear in the same relative order on every surface

Scenario: Immersive rail limits visible actions to four
  Given an offer exposes more than four actions in the immersive rail
  When the rail is rendered
  Then at most four actions are visible
  And the remaining actions sit behind one control labelled More
  And the actions inside More keep the canonical order

Scenario: Offer rail is the sole exception to the platform symbol vocabulary
  Given the offer action rail and shell chrome controls are rendered on both platforms
  When their glyphs are displayed
  Then the rail uses only this spec's canonical vocabulary
  And the shell chrome uses the one platform symbol vocabulary
  And no rail glyph is reused as a second chrome vocabulary

Scenario: Every action has one canonical label, role, state and order
  Given an offer appears on a card, in the feed, in favorites and in the detail sheet
  When assistive technology traverses the actions on each surface
  Then each action announces the same canonical name, role and state everywhere
  And the actions keep the same relative order on every surface

Scenario: No surface-specific assistive-technology value
  Given the same offer action is rendered on two different surfaces
  When its announced name, role and state are read
  Then no announced value differs between the surfaces
  And the same holds when the action sits inside a disclosure

Scenario: Saved-offer removal uses a canonical label and state
  Given a saved offer is listed in My Favorites
  When the removal action is rendered and read by assistive technology
  Then it is labelled Remove favorite
  And it is announced distinctly from the favorite toggle
  And its announced state matches the canonical vocabulary

Scenario: Immersive rail uses Material 3 action components
  Given the immersive action rail is displayed
  When the actions are rendered
  Then each action is a Material 3 button or icon-button component
  And no action remains an authored custom touchable control

Scenario: Material 3 components keep canonical labels, roles and states
  Given the Android font scale is set to 200 percent
  And the same action appears in the rail and on a card
  When assistive technology traverses both surfaces
  Then each announces the same canonical name, role and state
  And the action keeps a 48 by 48 dp target on both surfaces
```

## Example Inputs/Outputs
- Example input: phone offer with comments, favorite, directions, report and two availability votes.
- Expected output: each control carries a readable text caption; directions is the single accented control.
- Example input: a short landscape viewport with the same offer.
- Expected output: captions are omitted; every action stays independently tappable and assistive-technology labelled.
- Example input: the same offer shown in the feed, on a card, in favorites and in the detail sheet.
- Expected output: identical labels, glyphs, announced states and order on every surface.
- Example input: an immersive rail with six available actions.
- Expected output: four visible actions plus one labelled `More` holding the other two.
- Example input: a saved favorite in My Favorites with a removal action.
- Expected output: the action reads `Remove favorite`, is distinct from the favorite toggle, and announces the same state as elsewhere.
- Example input: the immersive rail rendered with Material 3 button and icon-button components.
- Expected output: the same canonical labels, roles and selected states as a card or detail surface, with each action independently tappable.

## Edge Cases
- Long localized labels at 200 percent text size.
- An offer whose vote counts are large numbers.
- A viewport with less than the minimum rail height.
- An offer where some actions are unavailable — the order of the remaining actions does not change.
- A localized label for `More` that is longer than the source text.
- A chrome control outside the rail that appears to reuse a rail glyph; it follows the platform vocabulary instead.
- An action that moves into a disclosure at one text size and out of it at another — its announced name, role and state do not change.
- A favorite that is saved in one surface and unsaved in another — each surface announces its actual state using the same vocabulary.
- An action moved from an authored custom touchable control to a Material 3 component — its announced name, role and state do not change.

## Non-Functional Constraints
- The waypoint accent stays reserved for the active path and the primary action.
- Visible captions shall not introduce a second accent color.
- No raw latitude or longitude value shall appear in any action label or announced state.

## Related Specs
- `APP.BRAND.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ACCESSIBILITY.UX.002`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.UX.002`
- `APP.PERFORMANCE.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `APP.SYMBOL.VOCABULARY.001`
- `APP.PLATFORM.CHROME.001`
- `OFFERS.FAVORITES.001`
- `OFFERS.GRID.CARDS.001`
