# Spec: `ADD.OFFER.INPUT.BOUNDS.001`

## Metadata
- **Title**: Bounded text input in the Add Offer view
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Keep pasted or typed text within reasonable bounds so the form and its payload stay usable.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- The user types or pastes into the description or location search input.

## Requirements
- `ADD.OFFER.INPUT.BOUNDS.001-R1`: The description input shall accept at most 500 characters.
- `ADD.OFFER.INPUT.BOUNDS.001-R2`: The location search input shall accept at most 120 characters.
- `ADD.OFFER.INPUT.BOUNDS.001-R3`: The description section shall disclose its limit before the user reaches it.
- `ADD.OFFER.INPUT.BOUNDS.001-R4`: The bounds shall apply in both create mode and edit mode, and shall not alter validation, submission, or tag extraction.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Description input discloses and enforces its bound
  Given the user opens Add Offer view
  When the description section renders
  Then a hint states the maximum number of characters
  And the description input accepts no more than 500 characters

Scenario: Location search input is bounded
  Given the user is typing in the location search input
  Then the input accepts no more than 120 characters

Scenario: Bounds apply to a prefilled edit draft
  Given the user opens Add Offer view in edit mode for a user-owned offer
  When the prefilled description is shown
  Then the same character bound applies to further typing
```

## Example Inputs/Outputs
- Example input: paste 800 characters into the description.
- Expected output: the field holds at most 500 characters; the hint states the limit; no request is sent until the rest of validation passes.

## Edge Cases
- A localized hint longer than the source text.
- Emoji and multi-byte characters within the bound.
- A prefilled draft whose description is already at the bound.
- Large text sizes where the hint wraps below the input.

## Non-Functional Constraints
- Character counting shall use Unicode characters, not bytes.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.LOCATION.001`
