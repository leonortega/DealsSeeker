# Spec: `APP.LOCATION.FALLBACK.001`

## Metadata
- **Title**: Honest fallback-location disclosure and recovery
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Never present a fallback location as the user's current area; disclose it, allow a retry, and keep browsing available.

## Preconditions
- The user is on the Offers view.
- Device location may be unavailable because permission was denied, the lookup failed, or no position could be obtained.

## Trigger
- The Offers view resolves the user's location before searching.

## Requirements
- `APP.LOCATION.FALLBACK.001-R1`: When device location cannot be obtained, the system shall not label the fallback area as the user's current location.
- `APP.LOCATION.FALLBACK.001-R2`: The system shall display a plain-language notice stating that the displayed offers are for an approximate area rather than the user's actual location.
- `APP.LOCATION.FALLBACK.001-R3`: The notice shall offer an action that retries obtaining device location.
- `APP.LOCATION.FALLBACK.001-R4`: The notice shall be dismissible, and dismissing it shall not remove the displayed offers.
- `APP.LOCATION.FALLBACK.001-R5`: The notice and its actions shall be available in both the standard and immersive presentations.
- `APP.LOCATION.FALLBACK.001-R6`: When device location is obtained, the notice shall not be displayed and the area label shall describe the resolved location.
- `APP.LOCATION.FALLBACK.001-R7`: The notice shall be announced to assistive technology.
- `APP.LOCATION.FALLBACK.001-R8`: Raw coordinate values shall not appear in the notice or the area label.
- `APP.LOCATION.FALLBACK.001-R9`: The notice shall be localizable and shall hold in both themes.
- `APP.LOCATION.FALLBACK.001-R10`: If a retry does not obtain a position, the system shall show a plain-language failure status while keeping the notice, its actions, and the displayed offers available.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Denied location discloses an approximate area
  Given the user has denied location permission
  When the Offers view loads
  Then the area is not labelled as the user's current location
  And a notice explains that the offers shown are for an approximate area
  And the notice offers a retry action
  And offers remain browsable

Scenario: Retrying location removes the notice on success
  Given the approximate-area notice is displayed
  When the user selects the retry action
  And device location is obtained
  Then the notice is no longer displayed
  And the area label describes the resolved location

Scenario: Retrying location reports a failure without changing results
  Given the approximate-area notice is displayed
  When the user selects the retry action
  And device location cannot be obtained
  Then a plain-language failure status shall be shown
  And the notice and its actions shall remain available
  And the displayed offers shall remain browsable

Scenario: Dismissing the notice keeps the results
  Given the approximate-area notice is displayed
  When the user dismisses the notice
  Then the offers remain displayed
  And the notice is not displayed again for that same location result

Scenario: Immersive feed discloses the fallback area
  Given the immersive offers feed is active
  And device location cannot be obtained
  When the feed loads
  Then the approximate-area notice and its actions are available

Scenario: Fallback notice does not expose coordinates
  Given the approximate-area notice is displayed
  When the notice and area label are shown
  Then no raw latitude or longitude value is visible
```

## Example Inputs/Outputs
- Example input: location permission denied, fallback coordinates used for search.
- Expected output: "Showing offers for an approximate area rather than your current location." with Retry and dismiss actions; no numeric coordinates.

## Edge Cases
- The reverse lookup of the fallback coordinates returns no label.
- The user retries while still denied permission.
- The notice is dismissed and the presentation mode changes.
- Localized notice text longer than the source text.
- Large text scaling on a phone-sized screen.

## Non-Functional Constraints
- The notice shall not block access to the offers or the primary actions.

## Related Specs
- `APP.RESILIENCE.UX.001`
- `APP.SHELL.001`
- `APP.LOCALIZATION.001`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.SEARCH.001`
- `OFFERS.UX.001`
- `APP.ONBOARD.001`
