# Spec: `APP.SEARCH.INTERACTION.001`

## Metadata
- **Title**: Search Interaction Under High Request Volume
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Material 3 selection controls (Android phase)
Coverage/distance options shall be selected through Material 3 radio/selection controls. The quiet-period, supersession and accelerator rules of this spec apply identically whether a value is typed or selected through such a control, and the control shall preserve the announced name, role and selected state defined by `APP.ACCESSIBILITY.UX.002`.

## Purpose
Define how the client behaves when the user types quickly in a search-like input, so that stale results never replace current results, and so recent-search and preset accelerators do not disturb that behavior.

## Preconditions
- The user is on a view containing a search-like input that triggers a lookup.

## Trigger
- The user changes the value of a search-like input, or selects a recent search or saved preset.

## Requirements
- `APP.SEARCH.INTERACTION.001-R1`: While the user is typing in a search-like input, the system shall wait for a short quiet period after the last input before issuing the lookup.
- `APP.SEARCH.INTERACTION.001-R2`: If a new input arrives while a lookup is in flight, the in-flight lookup for the superseded input shall be abandoned and its result shall not be shown.
- `APP.SEARCH.INTERACTION.001-R3`: A result that arrives for an input the user has already changed shall be discarded and shall not replace the current results.
- `APP.SEARCH.INTERACTION.001-R4`: The interface shall not block the user from interacting while a lookup is in flight; a progress indication shall be shown instead, scoped to the affected content.
- `APP.SEARCH.INTERACTION.001-R5`: The search input shall remain usable and the previous results shall remain visible until new results arrive.
- `APP.SEARCH.INTERACTION.001-R6`: Errors from a lookup shall be recoverable and shall not leave the interface permanently blocked.
- `APP.SEARCH.INTERACTION.001-R7`: Merely displaying or focusing recent searches or saved presets shall not issue a lookup; a lookup shall be issued only after the quiet period following typed input or after the user deliberately selects an entry, as defined by `OFFERS.SEARCH.RECENTS.001`.
- `APP.SEARCH.INTERACTION.001-R8`: Selecting a recent search or saved preset shall be treated as deliberate input that replaces the current value in one step, and shall supersede any in-flight lookup for the previously typed value under R2 and R3.
- `APP.SEARCH.INTERACTION.001-R9`: Recent searches and saved presets shall contain and display only query text and filter or radius selections; they shall not capture, store or show device-location values or raw coordinates, as defined by `OFFERS.SEARCH.RECENTS.001`.
- `APP.SEARCH.INTERACTION.001-R10`: Selecting a coverage/distance option shall be delivered through a Material 3 radio/selection control, and the quiet-period and supersession rules of R1–R8 shall apply identically to a selection made through that control.
- `APP.SEARCH.INTERACTION.001-R11`: A Material 3 selection control shall announce the same name, role and selected state as any equivalent control on every surface, so that selecting an option never depends on authored-view semantics, as defined by `APP.ACCESSIBILITY.UX.002`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Lookup is issued after a quiet period
  Given the user is typing in a search-like input
  When the user types and then stops changing the value
  Then the system shall wait for a short quiet period after the last input
  And the lookup shall be issued only after that quiet period elapses

Scenario: Superseded in-flight lookup is abandoned
  Given a lookup for an input is in flight
  When the user enters a new input
  Then the in-flight lookup for the superseded input shall be abandoned
  And its result shall not be shown

Scenario: Stale result does not replace current results
  Given a lookup for an earlier input is in flight
  And the user has already changed the input
  When the earlier lookup's result arrives
  Then the result shall be discarded
  And the current results shall not be replaced by it

Scenario: Interface stays usable during a lookup
  Given a lookup is in flight
  Then a progress indication shall be shown scoped to the affected content
  And the user shall remain able to interact with the search input and the rest of the view

Scenario: Previous results remain visible until new results arrive
  Given previous results are displayed for the search-like input
  When a new lookup is issued
  Then the search input shall remain usable
  And the previous results shall remain visible until the new results arrive

Scenario: Lookup errors are recoverable
  Given a lookup fails with an error
  When the error is surfaced
  Then the progress indication shall be dismissed
  And the user shall be able to interact and issue a new lookup
  And the interface shall not remain blocked

Scenario: Displaying recent searches does not issue a lookup
  Given the search-like input is focused
  And recent searches and saved presets are displayed
  When the user scrolls them without selecting an entry
  Then no lookup shall be issued by displaying or focusing them
  And the quiet period shall apply only to typed input

Scenario: Selecting a recent search supersedes typed input
  Given a lookup for typed input is in flight
  When the user selects a recent search
  Then the selected value shall replace the current input in one step
  And the in-flight lookup for the typed input shall be abandoned
  And its result shall not replace the current results

Scenario: Recent searches carry no location values
  Given recent searches and saved presets are displayed
  When the user reads them or assistive technology announces them
  Then only query text and filter or radius selections shall be presented
  And no device-location value or raw coordinate shall be presented

Scenario: Selecting a coverage option through a Material 3 control supersedes a lookup
  Given a lookup for typed input is in flight
  When the user selects a coverage option through a Material 3 selection control
  Then the typed lookup shall be abandoned under the same supersession rule
  And the selected option announces its selected state

Scenario: Material 3 selection controls keep their semantics at 200 percent font scale
  Given the Android font scale is set to 200 percent
  When a coverage option is rendered in a Material 3 selection control
  Then its name, role and selected state are unchanged
  And its label reflows without clipping
```

## Example Inputs/Outputs
- Example input: The user types `cof`, then `coff`, then `coffee` in quick succession.
- Expected output: A single lookup is issued for `coffee` after the quiet period; results for `cof` and `coff` are abandoned or discarded and never displayed.
- Example input: the user opens the search bar and recent searches appear.
- Expected output: no lookup is issued until the user types or selects an entry.
- Example input: the user selects a recent search while a typed lookup is in flight.
- Expected output: the typed lookup is abandoned, its result is discarded, and the recent search runs once.
- Example input: the user selects a coverage option in a Material 3 selection control while a typed lookup is in flight.
- Expected output: the typed lookup is abandoned under the same supersession rule and the selected option announces its selected state.

## Edge Cases
- The user clears the input while a lookup is in flight.
- The user navigates away while a lookup is in flight.
- The quiet period elapses exactly while the user is still typing.
- A lookup fails and the user immediately retries with the same input.
- The in-flight lookup is the only pending one; no other content is affected.
- A recent search is selected while its own earlier lookup is still in flight — only one lookup for that value is shown.
- A saved preset is deleted while a lookup it triggered is in flight — the running lookup still resolves normally.
- A coverage option in a Material 3 selection control is chosen at 200 percent font scale — its name, role and selected state remain unchanged.

## Non-Functional Constraints
- The quiet period shall be short enough to keep the interaction responsive.
- The progress indication shall be scoped to the affected content and shall not disable unrelated interactions.
- Recent searches and presets shall not add new lookups merely by being visible.

## Related Specs
- `APP.HELP.SEARCH.001`
- `OFFERS.SEARCH.KEYBOARD.001`
- `OFFERS.SEARCH.001`
- `OFFERS.SEARCH.SMART.001`
- `APP.SHELL.001`
- `APP.LOCATION.QUERY.001`
- `ADD.OFFER.LOCATION.001`
- `OFFERS.SEARCH.RECENTS.001`
- `APP.ACCESSIBILITY.UX.002`
