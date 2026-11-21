# Spec: `ADD.OFFER.DESCRIPTION.TAGS.001`

## Metadata
- **Title**: Description Input and Selected Tag Management
- **Version**: `v1.7`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Automatically create tags from description words of at least three characters — both when a word is finished with a delimiter and when it is the final word the user just typed — keep a manual tap fallback, and let users manage and remove selected tags instantly.

## Preconditions
- User is on Add Offer view.

## Trigger
- User types description text, finishes a word, finishes editing, taps a detected word, or manages tags.

## Requirements
- `ADD.OFFER.DESCRIPTION.TAGS.001-R1`: The system shall allow entering textual description.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R2`: The system shall detect words in the description and update word/tag candidates instantly while the user types.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R3`: When the user enters a delimiter (whitespace, `.`, `,`, `;`, `:`, `!`, or `?`) after a word whose normalized form has at least 3 characters, the system shall automatically create a tag from that word without requiring a tap.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R4`: When a word of at least 3 normalized characters is the final word of the description, the system shall automatically create a tag from it when editing finishes — either by moving focus away from the description field or by submitting — even when no delimiter was entered.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R5`: The system shall not create a tag from an intermediate partial word while the user is still typing, even if the user pauses between keystrokes.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R6`: The system shall not automatically create a tag from a word whose normalized form has fewer than 3 characters.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R7`: The system shall allow the user to manually create a tag by tapping a detected word; this manual path shall remain available for every detected word, including words below the automatic minimum length.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R8`: The system shall display the current tag list below the description field.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R9`: The system shall allow the user to remove any tag from the current tag list by selecting it. A removed tag shall not be automatically recreated unless the user adds it again explicitly or the description is cleared.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R10`: If a detected word includes a trailing percent symbol (example `50%`), the created tag shall preserve the percent symbol.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R11`: Tag normalization and duplicate handling shall follow the decision table.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R12`: When the description text is erased to empty or whitespace-only, the system shall clear the selected tag list and any automatic-tag tracking state.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R13`: The save action shall require a non-empty description before create-offer or edit-offer submission proceeds.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R14`: The save action shall require at least one selected tag before create-offer or edit-offer submission proceeds.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R15`: When the final word ends with a self-terminating symbol (example `50%`), the system shall create its tag immediately without requiring a delimiter or an editing-finish event.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R16`: The detected words list shall exclude every word whose normalized form is already in the selected tag list. A removed tag shall make its word appear in the detected words list again.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Completed word becomes a tag automatically
  Given the user is typing the description "Fresh coffee"
  When the user types a space after the word "coffee"
  Then the tag "coffee" shall be created without any tap
  And the tag list shall show "coffee"

Scenario: Final word becomes a tag when editing finishes
  Given the user has typed the description "denims at 50% discount" with the cursor after "discount"
  When the user finishes editing the description
  Then the tag "discount" shall be created automatically
  And the tag list shall show "denims", "50%", and "discount"

Scenario: Partial words are not tagged while typing
  Given the user is typing the word "discount" one letter at a time
  When the user pauses after "dis" and after "discon"
  Then no tag shall be created for "dis" or "discon"
  And only the completed word "discount" shall be created when editing finishes

Scenario: Self-terminating final word is tagged immediately
  Given the user typed "denims at 50%" without a trailing delimiter
  When the word "50%" is detected
  Then the tag "50%" shall be created immediately

Scenario: Detected words already tagged are hidden
  Given the tag list includes "denims"
  And the description is "denims at 50%"
  When the detected words list renders
  Then "denims" shall not appear in the detected words list
  And "at" and "50%" shall still appear

Scenario: Short words are ignored by automatic tag creation
  Given the user is typing the description "an"
  When the user types a space after the word "an"
  Then no tag shall be created for "an"

Scenario: Manual tap still creates a tag
  Given the user is typing the description "Fresh coffee"
  When the user taps the detected word "coffee"
  Then the tag "coffee" shall be added to the tag list

Scenario: Preserve percent symbol in automatically created numeric tags
  Given the user is typing the description "All drinks 50%"
  When the user finishes editing the description
  Then the tag "50%" shall be created

Scenario: Duplicate automatically created tag is ignored
  Given the tag list already includes "coffee"
  When the user types "Coffee " in the description
  Then no duplicate tag shall be added

Scenario: Removed tag is not recreated automatically
  Given the description "coffee near" produced the tags "coffee" and "near"
  When the user removes the tag "coffee"
  And the user continues typing or finishes editing the description
  Then the tag "coffee" shall not be recreated automatically

Scenario: Remove selected tag
  Given the tag list includes "coffee"
  When the user removes the tag "coffee"
  Then the tag list shall no longer show "coffee"

Scenario: Clearing description removes selected tags
  Given the selected tag list includes "coffee" and "discount"
  When the user erases the description text completely
  Then the selected tag list shall be empty

Scenario: Save is blocked when description is empty
  Given the selected tag list includes "coffee"
  And the description is empty or whitespace-only
  When the user submits save
  Then the system shall block submission
  And the system shall show a description-required validation error

Scenario: Save is blocked when no tags are selected
  Given the description is "Fresh coffee near station"
  And the selected tag list is empty
  When the user submits save
  Then the system shall block submission
  And the system shall show a tag-required validation error
```

## Example Inputs/Outputs
- Example input: User types `a COFFEE 50% ` (each word followed by a space).
- Expected output: Tags `coffee` and `50%`; the one-character word `a` is ignored.
- Example input: User types `denims 50% discount` and finishes editing without a trailing space.
- Expected output: Tags `denims`, `50%`, and `discount` — the final word becomes a tag too.
- Example input: User removes the tag `coffee` and keeps typing.
- Expected output: The tag `coffee` stays removed until it is explicitly added again or the description is cleared.

## Edge Cases
- A word is auto-tagged after a delimiter, or as the final word when editing finishes; no tag is created for intermediate partial words while typing continues.
- Normalized words of 1 or 2 characters are skipped by automatic tagging but remain manually addable.
- Trailing percent symbols are preserved (example `50%`) and make a final word self-terminating, so its tag is added immediately.
- Words already present in the tag list are removed from the detected words list; removing the tag restores the word there.
- Detected word list updates continuously as the description changes.
- Removing a tag does not change the description and does not trigger automatic re-creation.
- Clearing the description clears selected tags and automatic-tag tracking state so no stale tag state remains.
- Description-required and tag-required validation applies before both create-offer and edit-offer submission.

## Non-Functional Constraints
- Tag actions should provide immediate visual feedback.
- Detected words are presented as tappable chips; no word-detection guidance text is displayed in the tag section.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `OFFERS.SEARCH.001`
- `APP.ACCESSIBILITY.UX.003`
