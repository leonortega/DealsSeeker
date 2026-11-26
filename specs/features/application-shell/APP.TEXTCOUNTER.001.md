# Spec: `APP.TEXTCOUNTER.001`

## Metadata
- **Title**: Live character counter on bounded free-text inputs
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell (cross-cutting)
- **Priority**: Medium

## Purpose
Make the character limit of free-text fields visible while the user types and prevent text beyond that limit.

## Preconditions
- The user is viewing a screen with one of the bounded free-text inputs in scope.

## Trigger
- The user types, pastes, or removes characters in a bounded free-text input.

## Requirements
- `APP.TEXTCOUNTER.001-R1`: Each bounded free-text input shall display a live counter in `<current>/<maximum>` form adjacent to the input.
- `APP.TEXTCOUNTER.001-R2`: The current number shall increase for each accepted character and decrease when characters are removed; counting shall use Unicode characters, not bytes.
- `APP.TEXTCOUNTER.001-R3`: The input shall reject any character beyond its maximum, including pasted text that exceeds it.
- `APP.TEXTCOUNTER.001-R4`: The maximum shall be 500 for the offer description and 120 for the offer comment, report message, and suggestion message.
- `APP.TEXTCOUNTER.001-R5`: The counter shall be displayed from zero characters (`0/<maximum>`) and remain displayed at the maximum (`<maximum>/<maximum>`).
- `APP.TEXTCOUNTER.001-R6`: The counter shall not change validation, draft prefill behavior, or submission beyond enforcing the bound.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Typing updates the counter
  Given a bounded free-text input with a maximum of 120 characters
  When the user types 10 characters
  Then the counter shows "10/120"

Scenario: Input stops at the maximum
  Given a bounded free-text input already holding 120 characters
  When the user types one more character
  Then the input still holds 120 characters
  And the counter shows "120/120"

Scenario: Removing text decreases the counter
  Given a bounded free-text input holding 10 characters
  When the user removes 3 characters
  Then the counter shows "7/120"

Scenario: Prefilled text starts the counter at its length
  Given a bounded free-text input prefilled with 52 characters
  Then the counter shows "52/120"

Scenario: Pasting beyond the maximum is truncated
  Given a bounded free-text input with a maximum of 120 characters
  When the user pastes 200 characters
  Then the input holds exactly the first 120 characters
  And the counter shows "120/120"
```

## Example Inputs/Outputs
- Example input: type `Great price` into an offer comment input.
- Expected output: counter reads `11/120`; a further 109 characters may be added and the 120th fills the counter.

## Edge Cases
- Emoji and other multi-byte characters count as one character each.
- A draft already at the maximum cannot accept further input.
- Large text sizes keep the counter visible below the input.

## Non-Functional Constraints
- The counter shall be readable with system large-text settings and shall not obscure the input.

## Related Specs
- `ADD.OFFER.INPUT.BOUNDS.001`
- `OFFERS.COMMENTS.001`
- `REPORTS.SUBMIT.001`
- `SUGGESTIONS.SUBMIT.001`
