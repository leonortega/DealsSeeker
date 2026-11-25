# Spec: `OFFERS.MODE.SWITCH.001`

## Metadata
- **Title**: Explicit Feed/Map presentation switch
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Let the user choose the offers presentation explicitly from the Offers header, instead of hiding a mode toggle among navigation destinations.

## Preconditions
- User is authenticated and in the Offers section.
- The active query, coverage radius, and favorites filter are established.

## Trigger
- The user selects a presentation option in the Offers header.

## Requirements
- `OFFERS.MODE.SWITCH.001-R1`: The Offers header shall present a mode control with exactly two options, `Feed` and `Map`.
- `OFFERS.MODE.SWITCH.001-R2`: Selecting `Feed` shall display the immersive full-screen offer feed; selecting `Map` shall display the standard offers view with the map for the current context.
- `OFFERS.MODE.SWITCH.001-R3`: The mode control shall use the same fully rounded control language as other filters, with the waypoint accent reserved for the selected option.
- `OFFERS.MODE.SWITCH.001-R4`: The selected mode shall persist for the current session and shall default to `Feed` on a cold start.
- `OFFERS.MODE.SWITCH.001-R5`: Switching mode shall preserve the active query, coverage radius, and favorites filter.
- `OFFERS.MODE.SWITCH.001-R6`: The mode control shall expose its role and the selected option to assistive technology.
- `OFFERS.MODE.SWITCH.001-R7`: The mode control shall not be presented as a navigation destination in the bottom navigation.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Switch from Feed to Map
  Given the immersive offer feed is active
  When the user selects the Map option in the Offers header
  Then the standard offers view is displayed
  And the map is shown for the current offers and location context

Scenario: Switch from Map to Feed
  Given the standard offers view is active
  When the user selects the Feed option in the Offers header
  Then the immersive offer feed is displayed

Scenario: Switching mode preserves active filters
  Given the current query is "coffee" with a 1000 meter radius and favorites only enabled
  When the user switches presentation mode
  Then the query, radius, and favorites filter remain active
  And the results reflect the same filters in the new presentation

Scenario: Mode persists within the session
  Given the user selected the Map presentation
  When the user navigates to another destination and returns to Offers
  Then the Map presentation is still selected

Scenario: Cold start defaults to Feed
  Given the application starts with an authenticated session
  When the Offers view is first displayed
  Then the Feed presentation is selected

Scenario: Mode control is accessible
  Given the Offers header is displayed
  When the mode control is rendered
  Then each option exposes its role and selected state to assistive technology
```

## Example Inputs/Outputs
- Example input: user taps `Map` in the header mode control.
- Expected output: standard offers view with map, query `coffee` and radius 1000 m still applied.

## Edge Cases
- Localized mode labels longer than the English text.
- Switching mode while a search is in flight.
- Dark theme active while switching.

## Non-Functional Constraints
- The control shall be reachable with one tap and meet the control-size floors of `APP.ACCESSIBILITY.UX.001`.

## Related Specs
- `APP.SHELL.005`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.SEARCH.001`
- `APP.SHELL.001`
- `APP.LOCALIZATION.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.HELP.001`
- `APP.ONBOARD.001`
