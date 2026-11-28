# Spec: `OFFERS.IMMERSIVE.001`

## Metadata
- **Title**: Immersive View Navigation
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: Offers View (Immersive)
- **Priority**: High

## Purpose
Define how the user returns from the immersive offers view to the standard offers view.

## Preconditions
- User is authenticated and the immersive offers view is open.

## Trigger
- User selects the map mode option in the left panel of the immersive offers view.

## Requirements
- `OFFERS.IMMERSIVE.001-R1`: The immersive offers view shall not display a back control in its left panel.
- `OFFERS.IMMERSIVE.001-R2`: Selecting the map mode option shall close the immersive offers view and return the user to the standard offers view.
- `OFFERS.IMMERSIVE.001-R3`: Returning to the standard offers view shall restore the bottom navigation and the Material 3 app bar for that view.
- `OFFERS.IMMERSIVE.001-R4`: Closing the immersive view shall preserve the current search query, radius, and location context.
- `OFFERS.IMMERSIVE.001-R5`: No destination view shall display a back control, including Account, Suggestions, Reports, Favorites and Add Offer.
- `OFFERS.IMMERSIVE.001-R6`: Navigation out of a destination opened from the immersive view shall be performed through the shared bottom footer.
- `OFFERS.IMMERSIVE.001-R7`: On platforms with a system Back action, activating Back while the immersive view is open shall close it and return to the standard offers view without leaving the app.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User returns from immersive view to the standard offers view
  Given the user is on the immersive offers view
  When the user selects the map mode option
  Then the immersive offers view closes
  And the standard offers view is displayed
  And the bottom navigation and the Material 3 app bar are restored

Scenario: No back control is shown in the immersive left panel
  Given the user is on the immersive offers view
  When the user views the left panel
  Then a back control shall not be available

Scenario: Context is preserved after returning
  Given the user has an active search in the immersive offers view
  When the user selects the map mode option
  Then the search query and radius shall remain available in the standard offers view

Scenario: Destinations opened from immersive view have no back control
  Given the user is on the immersive offers view
  When the user opens a destination from the footer
  Then no back control is available in that destination
  And the shared bottom footer remains visible

Scenario: System Back closes the immersive view
  Given the user is on the immersive offers view
  When the user activates the system Back action
  Then the immersive view closes
  And the standard offers view is displayed
  And the app stays in the foreground
```

## Example Inputs/Outputs
- Example input: User selects map mode in immersive view.
- Expected output: Standard offers view is displayed with bottom navigation and its Material 3 app bar restored.

## Edge Cases
- The standard offers view remains available even when no offers are loaded.
- Repeated selections do not cause errors.

## Non-Functional Constraints
- Navigation shall be immediate and not lose user context.

## Related Specs
- `APP.SHELL.005`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.FAVORITES.001`
- `APP.SHELL.001`
- `APP.SHELL.004`
- `OFFERS.COMMENTS.001`
```