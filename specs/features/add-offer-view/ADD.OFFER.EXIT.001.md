# Spec: `ADD.OFFER.EXIT.001`

## Metadata
- **Title**: Safe exit from the Add Offer view
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Let a contributor leave the Add Offer view without silently losing work, in both create and edit modes.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- The user activates the `Cancel` action.

## Requirements
- `ADD.OFFER.EXIT.001-R1`: The view shall expose an explicit `Cancel` action to leave the view.
- `ADD.OFFER.EXIT.001-R2`: When the draft contains user-entered content, activating `Cancel` shall ask for confirmation before the draft is discarded.
- `ADD.OFFER.EXIT.001-R3`: When the draft contains no user-entered content, activating `Cancel` shall leave the view without a confirmation step.
- `ADD.OFFER.EXIT.001-R4`: Confirming the discard shall close the view and discard the draft.
- `ADD.OFFER.EXIT.001-R5`: Declining the discard shall keep the draft and the view unchanged.
- `ADD.OFFER.EXIT.001-R6`: The `Cancel` action and the confirmation controls shall be reachable and operable with assistive technology.
- `ADD.OFFER.EXIT.001-R7`: The confirmation shall not display raw coordinate values.
- `ADD.OFFER.EXIT.001-R8`: On platforms with a system Back action, activating Back while the Add Offer view is open shall be treated as activating Cancel, shall not leave the app, and shall follow the same draft-confirmation rules.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Cancel an empty draft
  Given the user opened the Add Offer view
  And the draft contains no user-entered content
  When the user activates Cancel
  Then the view closes without a confirmation step

Scenario: Cancel a draft with content asks for confirmation
  Given the draft contains user-entered content
  When the user activates Cancel
  Then a confirmation asks whether the draft should be discarded

Scenario: Confirming discard leaves the view
  Given the discard confirmation is shown
  When the user confirms the discard
  Then the view closes
  And the draft is discarded

Scenario: Declining discard keeps the draft
  Given the discard confirmation is shown
  When the user chooses to keep editing
  Then the view stays open
  And the draft content is unchanged

Scenario: Confirmation is accessible and privacy-safe
  Given the discard confirmation is shown
  When assistive technology is active
  Then the confirmation and its controls are announced
  And no raw latitude or longitude values are shown

Scenario: System Back acts as Cancel
  Given the user is on the Add Offer view
  When the user activates the system Back action
  Then the view is treated as cancelled
  And the app does not leave the Add Offer flow
  And a draft with content asks for confirmation before discarding
```

## Example Inputs/Outputs
- Example input: user typed a description, then activates Cancel and confirms discard.
- Expected output: view closes; no create or update request is sent; a later open starts with a fresh draft.

## Edge Cases
- An auto-populated device location alone does not count as user-entered content.
- An explicitly confirmed location counts as user-entered content.
- The confirmation is dismissed by the platform back action without discarding the draft.
- Edit mode with a loaded owned offer always counts as user-entered content.

## Non-Functional Constraints
- The discard confirmation shall not require a separate dismissal action to resume editing.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
- `APP.ACCESSIBILITY.UX.003`
