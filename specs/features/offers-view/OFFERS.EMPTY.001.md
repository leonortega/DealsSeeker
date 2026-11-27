# Spec: `OFFERS.EMPTY.001`

## Metadata
- **Title**: Guided Unfiltered No-Offers State in Both Presentations
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Supersedes / scope note
For the *unfiltered* no-offers case only, this spec supersedes `OFFERS.UX.001-R3`, `OFFERS.UX.001-R5` and `OFFERS.FEED.IMMERSIVE.001-R13`, which previously required no empty-state message. Filtered no-results continue to be governed by `OFFERS.UX.001`. The owning specs must be reconciled with this change before approval.

## Purpose
Ensure an unfiltered no-offers result shows actionable guidance in both Offers presentations instead of a blank surface, without blocking navigation or exposing raw coordinates.

## Preconditions
- The user is in the Offers view in either the standard presentation or the immersive feed.
- A search completed successfully with an empty result.
- No search query and no favorites filter are active.

## Trigger
- An unfiltered search returns no offers in the standard Offers view or in the immersive feed.

## Requirements
- `OFFERS.EMPTY.001-R1`: When an unfiltered search returns no offers, the system shall render guidance in place of a blank surface in both the standard Offers view and the immersive feed.
- `OFFERS.EMPTY.001-R2`: The guidance shall offer an action to add the first offer and an action to widen the search area.
- `OFFERS.EMPTY.001-R3`: Selecting `add the first offer` shall open the Add Offer flow for an authenticated user as defined in `OFFERS.NAV.ADD.001`, or shall prompt sign-in for a guest as defined in `OFFERS.GUEST.001`, preserving the current context.
- `OFFERS.EMPTY.001-R4`: Selecting `widen the search area` shall increase the coverage radius and re-run the search as defined in `OFFERS.SEARCH.001`, without exceeding the radius bound of `APP.VALIDATION.001`.
- `OFFERS.EMPTY.001-R5`: The guidance and both actions shall be announced to assistive technology, including that no offers are available.
- `OFFERS.EMPTY.001-R6`: The guidance shall not block navigation: search, coverage radius controls, the presentation switch of `OFFERS.MODE.SWITCH.001`, and the shared footer destinations shall remain reachable.
- `OFFERS.EMPTY.001-R7`: The guidance shall not display raw `lat` or `lng` values in either presentation.
- `OFFERS.EMPTY.001-R8`: When a query or the favorites filter is active, the filtered no-results message and clear-filters action of `OFFERS.UX.001` shall apply instead of this guidance.
- `OFFERS.EMPTY.001-R9`: The guidance shall follow the active theme and localization.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Standard view shows guidance instead of a blank surface
  Given the user is on the standard Offers view
  And no query or favorites filter is active
  When a search completes with no offers
  Then guidance stating that no offers are nearby shall be displayed
  And an action to add the first offer shall be available
  And an action to widen the search area shall be available

Scenario: Immersive feed shows guidance instead of a blank surface
  Given the immersive offers feed is active
  And no query or favorites filter is active
  When a search completes with no offers
  Then the same unfiltered guidance shall be displayed in the feed
  And the feed surface shall not be blank

Scenario: Authenticated user adds the first offer from the guidance
  Given an authenticated user is viewing the unfiltered no-offers guidance
  When the user selects the add-first-offer action
  Then the Add Offer view shall open

Scenario: Guest adds the first offer from the guidance
  Given a guest is viewing the unfiltered no-offers guidance
  When the guest selects the add-first-offer action
  Then a sign-in prompt shall be shown
  And the guest's discovery context shall be preserved

Scenario: Widen the search area re-runs the search
  Given the unfiltered no-offers guidance is displayed with a 1000 meter radius
  When the user selects the widen-search-area action
  Then the coverage radius shall increase
  And a new search shall run with the increased radius
  And the results or the guidance shall update

Scenario: Guidance is announced to assistive technology
  Given the unfiltered no-offers guidance is displayed
  When assistive technology reads the Offers view
  Then it shall announce that no offers are available
  And it shall expose both the add-first-offer and widen-search-area actions

Scenario: Guidance never blocks navigation
  Given the unfiltered no-offers guidance is displayed
  When the user searches, changes the coverage radius, switches presentation, or selects a shared footer destination
  Then the action shall be available and shall take effect
  And no raw latitude or longitude value shall be displayed

Scenario: Filtered no-results still uses the clear-filters state
  Given a query is active
  When a search completes with no offers
  Then the filtered no-results message and clear-filters action of `OFFERS.UX.001` shall be displayed
  And the add-first-offer and widen-search-area guidance shall not replace them
```

## Example Inputs/Outputs
- Example input: unfiltered search at a 1000 meter radius returns zero offers in the immersive feed.
- Expected output: guidance stating no nearby offers, with `Add the first offer` and `Widen the search area` actions, announced to assistive technology.

## Edge Cases
- The coverage radius is already at its maximum: the widen action shall be unavailable or shall state that the maximum has been reached.
- The guidance is displayed while the presentation mode changes: the guidance shall remain visible in the newly selected presentation.
- Localized guidance labels expand beyond the English text without clipping.
- Dark theme and high-contrast theme keep the guidance and both actions legible.
- A guest sees the same guidance as an authenticated user, with contributions gated by `OFFERS.GUEST.001`.
- A failed widen-search request leaves the guidance visible and interactive, as defined in `APP.RESILIENCE.UX.001`.

## Non-Functional Constraints
- Both guidance actions shall be reachable with a single activation on a phone-sized screen.
- The guidance shall not prevent the shared footer from remaining visible and usable.
- No raw `lat` or `lng` value shall be exposed at any point in this state.

## Related Specs
- `OFFERS.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.SEARCH.001`
- `OFFERS.MODE.SWITCH.001`
- `OFFERS.NAV.ADD.001`
- `OFFERS.GUEST.001`
- `APP.SHELL.001`
- `APP.LIST.VIRTUALIZATION.001`
- `APP.VALIDATION.001`
- `APP.RESILIENCE.UX.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
