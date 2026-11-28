# Spec: `APP.HELP.SEARCH.001`

## Metadata
- **Title**: Searchable help topics
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell help surface (Offers standard and immersive presentations, contextual entry points)
- **Priority**: Medium

## Purpose
Let a user find the help topic they need by describing the task, without leaving the view or the help surface they are in.

## Preconditions
- The help surface defined by `APP.HELP.001` is open in the active language.
- Help content is available in that language.

## Trigger
- The user focuses the help search entry point and enters, changes, or clears a term.

## Requirements
- `APP.HELP.SEARCH.001-R1`: The help surface shall present one labelled search entry point that accepts a user term and filters the existing topics of `APP.HELP.001-R3` in place.
- `APP.HELP.SEARCH.001-R2`: Matching shall consider each topic's title and its plain-language summary in the active language.
- `APP.HELP.SEARCH.001-R3`: The surface shall display every topic whose title or summary matches the term, keeping the task-oriented organisation of `APP.HELP.001-R7`, without navigating away from the help surface.
- `APP.HELP.SEARCH.001-R4`: When no topic matches, the surface shall state in plain language that no topic was found and shall offer a clear action to clear the term and show all topics.
- `APP.HELP.SEARCH.001-R5`: Clearing the term shall restore the full set of topics and, when help was opened contextually, shall show the relevant topic first as defined by `APP.HELP.CONTEXTUAL.001-R3`.
- `APP.HELP.SEARCH.001-R6`: Searching shall not navigate away, submit an action, or change the invoking context, including any draft offer, report draft, query, filter or sign-in prompt.
- `APP.HELP.SEARCH.001-R7`: The search entry point, results and no-match state shall be localized, follow the active theme, be announced by assistive technology, and remain readable at 200 percent text scaling.
- `APP.HELP.SEARCH.001-R8`: Searching shall not add or remove topics; the five essential topics of `APP.HELP.001-R3` shall remain the only topics.
- `APP.HELP.SEARCH.001-R9`: No raw coordinate value shall appear in the search entry point, results or no-match state.

## Acceptance Criteria (BDD)
```gherkin
Scenario: A topic is found by task wording
  Given the help surface is open with all five topics
  When the user enters a term describing a task they want to do
  Then the matching topic is displayed in place
  And the user remains on the same help surface

Scenario: A partial or differently cased term still matches
  Given the help surface is open with all five topics
  When the user enters only part of a topic title or summary in a different letter case
  Then the matching topic is still displayed

Scenario: No match offers a clear action
  Given the user entered a term that matches no topic
  When the no-match state is displayed
  Then a plain-language message states that no topic was found
  And a clear action is available to clear the term and show all topics

Scenario: Clearing restores all topics and contextual ordering
  Given help was opened contextually with a relevant topic first
  And the user entered a term that reordered the topics
  When the user clears the term
  Then all five topics are shown again
  And the relevant topic is first again
  And no topic was added or removed

Scenario: Search preserves the invoking context
  Given the user opened help from a context with a draft or an active query
  When the user searches within the help surface
  Then the draft, query, filter, selected offer and sign-in prompt are unchanged
  And no action is submitted

Scenario: Search is announced, localized and privacy-safe
  Given Spanish is active and assistive technology is enabled
  When the user searches and the results are displayed
  Then the entry point and results are announced
  And text remains readable at 200 percent scaling
  And no raw latitude or longitude value is shown
```

## Example Inputs/Outputs
- Example input: the user types "report" in the help search entry point.
- Expected output: the reporting-an-offer topic is shown in place; the other four topics remain reachable after clearing the term.
- Example input: the user types a term with no match.
- Expected output: "No help topic found for that text." with a `Clear search` action that restores all five topics.

## Edge Cases
- An empty term — all topics remain visible.
- Rapid successive terms — only the results for the latest term are displayed, following `APP.SEARCH.INTERACTION.001`.
- Search used while the on-screen keyboard is open — results stay visible and the entry point stays editable.
- A localized term longer than the source text wrapping without clipping.
- Search opened from a context whose draft or prompt is still active — the context is unchanged on dismissal.

## Non-Functional Constraints
- Search shall reuse the single help surface of `APP.HELP.001`; no second overlay or route shall be introduced.
- Search shall operate on help content already available in the active language.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `APP.HELP.001`
- `APP.HELP.CONTEXTUAL.001`
- `APP.POLISH.UX.001`
- `APP.SEARCH.INTERACTION.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `APP.ACCESSIBILITY.UX.001`
