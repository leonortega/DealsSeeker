# Spec: `SUGGESTIONS.SUBMIT.001`

## Metadata
- **Title**: Suggestions View Submission Flow
- **Version**: `v1.3`
- **Status**: Approved
- **Context/View**: Suggestions View
- **Priority**: Medium

## Purpose
Allow a user to submit product suggestions with a required message and optional contact information, using labelled Material 3 text fields and card patterns without changing submission behavior.

## Preconditions
- The Suggestions view is available.

## Trigger
- User opens `Suggestions` or submits the suggestion form.

## Requirements
- `SUGGESTIONS.SUBMIT.001-R1`: The system shall provide a dedicated `Suggestions` view with a suggestion message input.
- `SUGGESTIONS.SUBMIT.001-R2`: The Suggestions view shall provide an optional contact input.
- `SUGGESTIONS.SUBMIT.001-R3`: The system shall reject suggestion submission when the message is blank.
- `SUGGESTIONS.SUBMIT.001-R4`: The system shall submit the suggestion message and optional contact details when the form is valid.
- `SUGGESTIONS.SUBMIT.001-R5`: After a successful suggestion submission response, the system shall present an explicit completion control that returns the user to `Offers`; it shall not navigate on a timer.
- `SUGGESTIONS.SUBMIT.001-R6`: When suggestion submission fails, the system shall keep the user in `Suggestions` and show a recoverable failure state.
- `SUGGESTIONS.SUBMIT.001-R7`: The submit action shall remain visible and operable while the on-screen keyboard is open.
- `SUGGESTIONS.SUBMIT.001-R8`: The suggestion message input shall display a live counter in `<current>/120` form and shall accept at most 120 characters, as specified in `APP.TEXTCOUNTER.001`.
- `SUGGESTIONS.SUBMIT.001-R9`: The optional contact input shall accept at most 254 characters.
- `SUGGESTIONS.SUBMIT.001-R10`: The suggestion message and optional contact inputs shall follow a Material 3 labelled text field pattern with a persistent label and helper or error text, including the live counter required by R8, consistent with the field pattern defined by `ADD.OFFER.UX.001`.
- `SUGGESTIONS.SUBMIT.001-R11`: The suggestion form shall be presented on a Material 3 card pattern consistent with other form-and-list surfaces such as My Favorites defined by `OFFERS.FAVORITES.001`, and its submit action shall follow a Material 3 button pattern.
- `SUGGESTIONS.SUBMIT.001-R12`: The Material 3 field, card and button patterns shall not change input caps, blank-message rejection, submission, explicit completion, keyboard behavior, failure handling or announcement defined by R1–R9.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User submits a suggestion with optional contact
  Given the user is on Suggestions view
  When the user submits a non-empty suggestion message
  And the user optionally provides contact details
  Then the suggestion payload shall include the message
  And the contact details shall be included only when provided
  And after a successful response an explicit completion control returns the user to Offers

Scenario: Blank suggestion is rejected
  Given the user is on Suggestions view
  When the user submits the form with a blank suggestion message
  Then the suggestion submission shall be rejected
  And the Suggestions view shall remain displayed
  And a recoverable failure message shall be shown

Scenario: Suggestion message counter tracks typing and stops at 120
  Given the user is on Suggestions view with an empty message
  When the user types 10 characters
  Then the counter shows "10/120"
  When the message reaches 120 characters
  Then the input accepts no further characters
  And the counter shows "120/120"

Scenario: Optional contact stops at its contract maximum
  Given the user is on Suggestions view
  When the user pastes 300 characters into the contact input
  Then the contact input holds exactly 254 characters

Scenario: Suggestion inputs use labelled Material 3 fields
  Given the user is on Suggestions view
  When the message and contact inputs are rendered
  Then each shall show a persistent label and a helper or error text line
  And the message field shall keep its live counter

Scenario: The suggestion form uses a Material 3 card and button
  Given the user is on Suggestions view
  When the form is rendered
  Then it shall be presented on a Material 3 card pattern
  And the submit action shall follow a Material 3 button pattern and stay operable with the keyboard open

Scenario: A long localized helper line stays inside its field
  Given a localized helper or error line longer than the field width
  When the inputs are rendered
  Then the line shall wrap within its own field
  And the submit action shall remain visible and tappable
```

## Example Inputs/Outputs
- Example input: message `Please add price alerts`, contact `me@example.com`.
- Expected output: suggestion is accepted, a confirmation stays visible, and an explicit Done control returns to `Offers`.
- Example input: a blank suggestion submitted with a localized error line.
- Expected output: the error stays attached to the labelled message field and the form remains on a single Material 3 card with the submit action available.

## Edge Cases
- Contact details omitted; submission still succeeds when the suggestion message is valid.
- Submission failure does not clear the current form inputs automatically.
- A localized contact label at 200 percent text size — the field keeps its label and helper line without hiding the submit action.

## Non-Functional Constraints
- Submission feedback should be returned promptly and should not require app restart or relaunch.
- The Material 3 patterns shall not introduce a second form surface or a timer-driven navigation.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `APP.TEXTCOUNTER.001`
- `APP.SHELL.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.POLISH.UX.001`
- `APP.HAPTICS.001`
- `ADD.OFFER.UX.001`
- `OFFERS.FAVORITES.001`
