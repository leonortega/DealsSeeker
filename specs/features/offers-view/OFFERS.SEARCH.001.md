# Spec: `OFFERS.SEARCH.001`

## Metadata
- **Title**: Offers Search Execution and Radius Refresh
- **Version**: `v1.11`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Material 3 coverage selection (Android phase)
The authored-view exception for coverage/distance controls is retired. Coverage options shall be presented with Material 3 radio/selection controls that keep the exact selected-state semantics, canonical names and 48 dp touch floors required by `APP.ACCESSIBILITY.UX.001`, while the distance remains a plain-language label with no raw coordinates.

## Purpose
Allow users to execute offer search and keep list/map results synchronized as search or radius changes, with recent searches and saved presets as optional accelerators, using Material 3 search-field and chip patterns without changing behavior or coordinate privacy.

## Preconditions
- User is in Offers view.
- Offer dataset includes searchable metadata.

## Trigger
- User executes a search from the search bar or changes coverage radius, or selects a recent search or saved preset.

## Requirements
- `OFFERS.SEARCH.001-R1`: The system shall allow the user to enter search text in the Offers search bar.
- `OFFERS.SEARCH.001-R2`: For non-empty query values, the system shall execute matching and scoring strategy defined in `OFFERS.SEARCH.SMART.001`.
- `OFFERS.SEARCH.001-R3`: The system shall filter and rank offer list results according to search and distance constraints.
- `OFFERS.SEARCH.001-R4`: The system shall update map markers to reflect the filtered offer set.
- `OFFERS.SEARCH.001-R5`: Matching, ranking, and radius refresh behavior shall follow `decisions/DECISION_TABLES.md`.
- `OFFERS.SEARCH.001-R6`: When the coverage radius value changes, the system shall execute a new search using the new radius value.
- `OFFERS.SEARCH.001-R7`: If search textbox contains text, radius-triggered search shall apply search matching plus distance filtering.
- `OFFERS.SEARCH.001-R8`: If search textbox is empty, radius-triggered search shall apply distance filtering only.
- `OFFERS.SEARCH.001-R9`: Radius-triggered search refresh shall update both offer list and map markers.
- `OFFERS.SEARCH.001-R10`: Radius-triggered search refresh shall adjust map zoom to visualize the selected coverage radius.
- `OFFERS.SEARCH.001-R11`: While required location resolution is in progress, the view shall show a blocking animated loading state as defined in `APP.SHELL.001`. While a search lookup is in progress, the view shall show a progress indication scoped to the affected content and shall remain interactive, as defined in `APP.SEARCH.INTERACTION.001`.
- `OFFERS.SEARCH.001-R12`: The offer list results shall be delivered in pages as defined in `OFFERS.SEARCH.PAGINATION.001`.
- `OFFERS.SEARCH.001-R13`: The map marker set shall continue to represent the full filtered offer set regardless of the requested page, as defined in `OFFERS.SEARCH.PAGINATION.001`.
- `OFFERS.SEARCH.001-R14`: Both the standard search bar and the immersive search overlay shall accept at most 200 characters, matching the offer-search request contract.
- `OFFERS.SEARCH.001-R15`: In the immersive search sheet, the focused search input and the primary search action shall remain visible above the on-screen keyboard or IME, and taps on visible sheet controls shall reach them, as defined by `OFFERS.SEARCH.KEYBOARD.001`.
- `OFFERS.SEARCH.001-R16`: Wherever the coverage radius is shown, the system shall express it as a human-readable distance in the active language and shall not show raw coordinates or internal identifiers.
- `OFFERS.SEARCH.001-R17`: The system shall offer recent searches, recalled from successfully executed non-empty queries, as an accelerator for repeating a search, as defined by `OFFERS.SEARCH.RECENTS.001`.
- `OFFERS.SEARCH.001-R18`: The system shall offer saved radius/filter presets that reapply a stored coverage radius and filter selection in one selection, as defined by `OFFERS.SEARCH.RECENTS.001`.
- `OFFERS.SEARCH.001-R19`: Selecting a recent search or a saved preset shall populate the affected controls and execute the search with the same matching, radius and pagination behavior as a typed query; the user shall remain free to ignore the accelerators and type a new query instead.
- `OFFERS.SEARCH.001-R20`: The search field and the recent-search and preset chips shall follow Material 3 search-field and chip patterns, keeping the same input cap, matching, radius refresh, pagination, keyboard behavior and accelerator behavior defined by R1–R19.
- `OFFERS.SEARCH.001-R21`: Coverage radius and search controls shall keep their plain-language distance display within the Material 3 pattern; no raw coordinate value or internal identifier shall be exposed by the pattern.
- `OFFERS.SEARCH.001-R22`: Coverage/distance selection shall be presented with Material 3 radio/selection controls; no authored-view exception shall keep an option as an unlabelled custom control.
- `OFFERS.SEARCH.001-R23`: Each coverage option shall expose a selected state that matches its visual selection, announce a canonical name and role through assistive technology, and keep a touch target of at least 48 by 48 dp with the separation defined by `APP.ACCESSIBILITY.UX.001`.
- `OFFERS.SEARCH.001-R24`: The Material 3 selection controls shall keep the plain-language distance display of R16 and R21; no raw coordinate or internal identifier shall be exposed by the selection pattern.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Search filters offer list and map markers
  Given the user is on Offers view
  And offers exist with searchable terms including "coffee"
  When the user searches for "coffee"
  Then only matching offers shall remain in the list
  And only businesses with matching offers shall remain as map markers

Scenario: Empty query clears filter
  Given the user previously searched and filtered results
  When the user clears the search text
  Then all active offers shall be shown
  And map markers shall reflect the full active offer set

Scenario: Coverage radius change with active query re-runs search
  Given the user entered a non-empty search query in the Offers search textbox
  And current offers and map markers are shown for the current radius
  When the user changes the coverage radius value
  Then the system shall execute a new search with the same query and updated radius
  And the offer list shall refresh using the new radius
  And map markers shall refresh using the new radius
  And map zoom shall adjust to show the selected coverage radius

Scenario: Coverage radius change without query re-runs distance-only search
  Given the search textbox is empty
  And current offers and map markers are shown for the current radius
  When the user changes the coverage radius value
  Then the system shall execute a new search using distance filtering only
  And the offer list shall refresh using the new radius
  And map markers shall refresh using the new radius
  And map zoom shall adjust to show the selected coverage radius

Scenario: Required location resolution wait blocks interaction
  Given the Offers view is resolving current location
  When required data is still loading
  Then an animated blocking loading state shall be visible
  And user interaction with offers list and map controls shall be blocked
  And after loading completes the view shall become interactive

Scenario: Search lookup shows a scoped progress indication and stays interactive
  Given the Offers view is executing a search lookup
  When the lookup is still in flight
  Then a progress indication scoped to the affected content shall be visible
  And the user shall remain able to interact with the view
  And the previous results shall remain visible until the new results arrive

Scenario: Search results are delivered in pages
  Given the user is on Offers view
  And more active offers match the current query than fit in a single page
  When the user executes the search
  Then the offer list shall show only the offers of the requested page
  And the response shall carry the effective page and page size
  And the response shall carry a hasMore flag indicating further pages

Scenario: Invalid page size is rejected
  Given the user is on Offers view
  When the user requests a search with a page size greater than the allowed maximum
  Then the request shall be rejected with a validation error
  And no search shall be performed

Scenario: Search query stops at its contract maximum
  Given the standard or immersive search input is displayed
  When the user pastes 250 characters into the search input
  Then the input holds exactly 200 characters

Scenario: Immersive search sheet keeps input and action above the keyboard
  Given the immersive search sheet is open
  And the on-screen keyboard is open
  When the search input is focused
  Then the input and the primary search action remain visible above the keyboard
  And taps on visible sheet controls reach those controls

Scenario: Coverage radius is shown in plain language
  Given a coverage radius is selected
  When the radius is displayed in the Offers view
  Then it is shown as a human-readable distance in the active language
  And no raw coordinate or internal identifier is shown

Scenario: Reuse a recent search
  Given the user previously executed a successful search for "coffee"
  And recent searches are displayed
  When the user selects that recent search
  Then the query control shall be populated with "coffee"
  And the same search shall be executed

Scenario: Reuse a saved radius and filter preset
  Given the user saved a preset with a 2500 m coverage radius
  And saved presets are displayed
  When the user selects the preset
  Then the radius control shall show 2500 m
  And offers shall be searched with that radius

Scenario: Recent searches do not replace typed input
  Given recent searches and presets are displayed
  When the user types a new query instead of selecting one
  Then the typed query shall be used for the search
  And no recent entry shall be applied

Scenario: Search field and chips follow Material 3 patterns
  Given the user is on Offers view with recent searches and presets displayed
  When the search controls are rendered
  Then the search field shall follow a Material 3 search-field pattern
  And recent searches and presets shall follow a Material 3 chip pattern with the same behavior

Scenario: Search pattern keeps the input cap and plain-language radius
  Given the search field and a coverage radius control are displayed
  When the user enters text or changes the radius
  Then the 200-character cap shall still apply
  And the radius shall remain a human-readable distance with no raw coordinate or identifier shown

Scenario: Long localized chip labels keep controls usable
  Given recent-search chip labels are longer than the source text at large text scaling
  When the search controls are rendered
  Then the chips shall stay within the search pattern without hiding the input or action
  And the input and primary search action shall remain visible above the keyboard

Scenario: Coverage options use Material 3 selection controls
  Given the Offers coverage controls are displayed
  When the distance options are rendered
  Then each option shall use a Material 3 radio/selection control
  And no authored-view exception shall keep a custom option in its place

Scenario: Coverage selection exposes its exact selected state
  Given the coverage options include a currently selected distance
  When assistive technology reads the options
  Then the group is exposed as a labelled mutually exclusive selection
  And the selected option announces its selected state
  And every other option announces an unselected state

Scenario: Coverage controls keep the touch floor at 200 percent font scale
  Given the Android font scale is set to 200 percent
  And a coverage distance label is longer than the source text
  When the selection controls are rendered
  Then each option keeps a 48 by 48 dp target
  And the label reflows without covering another option
  And no raw coordinate is announced
```

## Example Inputs/Outputs
- Example input: Query `coffee`.
- Expected output: Offer list and map markers include matched offers ranked by current search rules.
- Example input: select the recent search `coffee`.
- Expected output: the query control reads `coffee` and the same search runs again.
- Example input: select a preset saved with 2500 m.
- Expected output: the radius control reads a plain-language 2500 m distance and results refresh for that radius.
- Example input: a recent search chip "coffee" displayed beside the search field.
- Expected output: a Material 3 chip that populates a Material 3 search field and runs the same search as a typed query.
- Example input: the coverage options shown as a Material 3 radio/selection group with 500 m selected.
- Expected output: only the 500 m option announces a selected state, the distance reads as plain language, and no coordinate is exposed.

## Edge Cases
- No matches returns empty list and zero business markers.
- Search text with mixed case matches case-insensitively.
- Coverage radius change with empty query applies distance-only filtering and refreshes list/map.
- Coverage radius change also adjusts map zoom to keep selected radius visible.
- Required location resolution timeout/failure shall remove the loading state and show the corresponding non-blocking error/empty state.
- The immersive search sheet is open with a tall keyboard; the input and primary search action remain visible and taps are not swallowed.
- A recalled recent search or preset that no longer matches any offer — the empty state is shown and the entry stays available.
- A preset recalled while the device location has changed — the saved radius and filter apply to the current location; no saved coordinate is used.
- A localized distance label at 200 percent text size.
- A localized long chip label at 200 percent text size — chips wrap without covering the search input or primary action.
- A localized distance label in a Material 3 selection control at 200 percent font scale — the label wraps, the 48 dp target holds and the plain-language display stays free of coordinates.

## Non-Functional Constraints
- Search response should feel immediate for typical local datasets.
- Recalled recent searches and presets shall respect the same 200-character input cap and validation rules as typed queries.
- No raw latitude or longitude value shall be displayed by search controls, results, recent searches or presets.
- The Material 3 search and chip patterns shall not expose raw coordinates or internal identifiers.

## Related Specs
- `APP.HELP.CONTEXTUAL.001`
- `OFFERS.EMPTY.001`
- `OFFERS.FILTER.SIMPLIFICATION.001`
- `OFFERS.SEARCH.SMART.001`
- `OFFERS.SEARCH.PAGINATION.001`
- `OFFERS.MAP.001`
- `OFFERS.LIST.ITEM.001`
- `OFFERS.REPORTED.DEMOTION.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `APP.SEARCH.INTERACTION.001`
- `APP.RESPONSE.CONDITIONAL.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `OFFERS.UX.001`
- `APP.RESILIENCE.UX.001`
- `OFFERS.MODE.SWITCH.001`
- `APP.LOCATION.FALLBACK.001`
- `OFFERS.SEARCH.KEYBOARD.001`
- `APP.BOTTOM_SHEET.001`
- `OFFERS.SEARCH.RECENTS.001`
- `OFFERS.GRID.CARDS.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
