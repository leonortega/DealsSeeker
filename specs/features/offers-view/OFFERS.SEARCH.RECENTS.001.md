# Spec: `OFFERS.SEARCH.RECENTS.001`

## Metadata
- **Title**: Recent Searches and Saved Radius/Filter Presets
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard search bar and immersive search sheet)
- **Priority**: Medium

## Purpose
Let users repeat past searches and reapply saved radius/filter combinations in one step, without storing or displaying coordinates.

## Preconditions
- The user is in the Offers view with the search bar or immersive search sheet available.
- The user has executed a successful non-empty search or has saved a preset.

## Trigger
- A search completes successfully; the user opens the search controls; the user selects, deletes or clears a recent search or preset; the user saves a preset; the active user session ends.

## Requirements
- `OFFERS.SEARCH.RECENTS.001-R1`: After a search completes successfully with a non-empty query, the system shall add that query to the recent searches, keeping entries deduplicated and ordered by most recent use.
- `OFFERS.SEARCH.RECENTS.001-R2`: An empty query, a cancelled search, a failed lookup and a query that exceeds the input cap shall not be added to recent searches.
- `OFFERS.SEARCH.RECENTS.001-R3`: The system shall let the user save the current coverage radius together with the active filter selection as a preset, and shall let the user reapply that preset with one selection.
- `OFFERS.SEARCH.RECENTS.001-R4`: Selecting a recent search shall populate the query control and execute the same query; selecting a preset shall apply its saved radius and filters and execute the search, following `OFFERS.SEARCH.001`.
- `OFFERS.SEARCH.RECENTS.001-R5`: Recent searches and presets shall be optional accelerators: the user shall be able to ignore them, type a new query, edit a recalled value, delete a single entry and clear all entries.
- `OFFERS.SEARCH.RECENTS.001-R6`: Recent searches and presets shall contain and display only query text and filter or radius selections; they shall not store, infer or display device-location values, raw latitudes or longitudes.
- `OFFERS.SEARCH.RECENTS.001-R7`: Recent searches and presets shall belong to the active user and shall no longer be available after the user signs out or clears them; a different user shall not see another user's entries.
- `OFFERS.SEARCH.RECENTS.001-R8`: Each entry shall be presented in plain language and shall be announced to assistive technology with its value and its selected state; deleting an entry shall be a separate, clearly labelled action.
- `OFFERS.SEARCH.RECENTS.001-R9`: Displaying or focusing recent searches and presets shall not start a lookup; lookup timing, stale-result discarding and progress behavior shall follow `APP.SEARCH.INTERACTION.001`.
- `OFFERS.SEARCH.RECENTS.001-R10`: A recalled query or preset shall use the same matching, radius and pagination behavior as a typed query, and shall respect the 200-character input cap defined in `OFFERS.SEARCH.001`.
- `OFFERS.SEARCH.RECENTS.001-R11`: The system shall bound the number of recent searches and saved presets, discarding the least recently used entry when the cap is reached, so that the accelerator list stays glanceable.

## Acceptance Criteria (BDD)
```gherkin
Scenario: A successful query becomes a recent search
  Given the user executed a successful search for "coffee"
  When the user opens the search controls
  Then "coffee" shall be offered as a recent search
  And selecting it shall populate the query and run the same search

Scenario: A preset reapplies a saved radius and filter
  Given the user saved a preset with a 2500 m coverage radius and the current filter selection
  When the user selects that preset
  Then the radius and filter controls shall show the saved values
  And offers shall be searched with those values

Scenario: Failed, empty and over-limit queries are not recalled
  Given a lookup failed, a query was empty, or a query was pasted beyond the input cap
  When the user opens the search controls
  Then no entry for that query shall be offered as a recent search

Scenario: Recent searches carry no coordinates
  Given recent searches and presets are displayed and read by assistive technology
  When the user inspects their values and the saved data behind them
  Then only query text and filter or radius selections shall be present
  And no device-location value, raw latitude or raw longitude shall be stored or shown

Scenario: The user controls the accelerator list
  Given recent searches and presets are displayed
  When the user deletes one entry or clears all entries
  Then that entry or those entries shall no longer be offered
  And typing a new query shall remain unaffected

Scenario: Entries are scoped to the active user
  Given one user saved a preset
  When a different user signs in and opens the search controls
  Then the first user's preset shall not be offered

Scenario: Displaying entries does not trigger a lookup
  Given the search controls are open and recent searches are visible
  When the user scrolls through them without selecting one
  Then no lookup shall be issued

Scenario: The accelerator list is bounded
  Given the recent-search cap has been reached
  When a new successful query is added
  Then the least recently used entry shall be discarded
  And the new query shall be offered
```

## Example Inputs/Outputs
- Example input: search `coffee` at 2500 m with the current filter, then save a preset named "Nearby coffee".
- Expected output: `coffee` appears in recent searches; selecting the preset sets 2500 m and the saved filter and reruns the search.
- Example input: a search for `coffee` fails, or the user pastes 250 characters.
- Expected output: no recent-search entry is created.
- Example input: the user signs out and another user signs in.
- Expected output: neither user sees the other's recent searches or presets.

## Edge Cases
- Two recent searches differ only by case — they are treated as one entry using the most recent spelling.
- A localized query or preset label at 200 percent text size.
- The device location changes after a preset was saved — the saved radius and filter apply to the current location; no saved coordinate is reused.
- An entry is deleted while a search it triggered is still in flight — the running search still resolves normally.
- The user selects a recent search whose matches have all expired — the empty state is shown and the entry stays available.
- Two presets with the same name — each keeps its own saved values and remains distinguishable.
- The active session ends while a preset is being saved — no partial entry remains for the next user.

## Non-Functional Constraints
- No raw latitude or longitude value shall be persisted or displayed for recent searches or presets.
- Recalled values shall respect the input cap and validation rules of a typed query.
- No new dependency shall be introduced for recall or preset storage.

## Related Specs
- `OFFERS.SEARCH.001`
- `APP.SEARCH.INTERACTION.001`
- `OFFERS.FILTER.SIMPLIFICATION.001`
- `OFFERS.SEARCH.KEYBOARD.001`
- `APP.LOCALIZATION.001`
