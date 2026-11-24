# Spec: `APP.CONTEXT_MENU.001`

## Metadata
- **Title**: Offer Card Long-Press Actions
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers (standard feed and grid)
- **Priority**: Low

## Purpose
Let users reach an offer's actions by pressing and holding its card, using the existing branded surfaces rather than adding new menu visuals or a new dependency.

## Preconditions
- The user is on the Offers feed or grid with at least one offer card.
- The offer card's existing action surface is available.

## Trigger
- The user presses and holds an offer card.

## Requirements
- `APP.CONTEXT_MENU.001-R1`: A long press on an offer card shall open that offer's existing action surface.
- `APP.CONTEXT_MENU.001-R2`: A long press shall open that surface once and shall not additionally emit the short-press event.
- `APP.CONTEXT_MENU.001-R3`: No new menu control, palette, shape or copy shall be introduced; the existing branded action surface shall be reused.
- `APP.CONTEXT_MENU.001-R4`: Behavior shall be identical on iOS and Android; where the OS offers a native contextual menu, the app shall not be required to use it.
- `APP.CONTEXT_MENU.001-R5`: A short press shall keep the existing open-detail behavior.
- `APP.CONTEXT_MENU.001-R6`: A long press shall not fire twice for one gesture.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Long press opens the offer actions
  Given an offer card is visible in the Offers feed
  When the user presses and holds the card
  Then the offer's existing action surface shall open for that offer
  And the normal open-detail action shall not also run

Scenario: Short press keeps the existing behavior
  Given an offer card is visible
  When the user taps the card
  Then the offer detail shall open as before

Scenario: No new menu visuals
  Given a long press has opened the offer actions
  When the action surface is rendered
  Then it shall use the existing brand palette, shapes and labels

Scenario: One gesture opens the actions once
  Given the user begins a long press on a card
  When the gesture completes
  Then the action surface shall open exactly once
```

## Example Inputs/Outputs
- Example input: long press on a card for "Main Street Cafe".
- Expected output: the existing action surface opens for that offer; no extra menu is drawn.

## Edge Cases
- A long press that is cancelled by moving the finger off the card.
- A long press while a request is in flight.
- Large text sizes where the card label wraps.
- A card with no image.

## Non-Functional Constraints
- No new dependency shall be added for this behavior.
- Long-press handling shall not change tap-to-open behavior.

## Related Specs
- `APP.SHELL.001`
- `OFFERS.GRID.CARDS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.LIST.ACTIONS.001`
- `APP.HAPTICS.001`
