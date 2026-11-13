# Spec: `OFFERS.IMMERSIVE.001`

## Metadata
- **Title**: Immersive View Navigation
- **Version**: `v1.2`
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
- `OFFERS.IMMERSIVE.001-R3`: Returning to the standard offers view shall restore the standard application header and bottom navigation.
- `OFFERS.IMMERSIVE.001-R4`: Closing the immersive view shall preserve the current search query, radius, and location context.
- `OFFERS.IMMERSIVE.001-R5`: When a destination opened from the immersive left panel (account, suggestions, or reports) is displayed, it shall provide a back control.
- `OFFERS.IMMERSIVE.001-R6`: Selecting that back control shall return the user to the immersive offers view.
- `OFFERS.IMMERSIVE.001-R7`: The back control in those destinations shall only be displayed while the immersive offers mode is enabled.
- `OFFERS.IMMERSIVE.001-R8`: In Account view, the back control shall be placed in the hero row on the right side, and the logout control shall be placed to the right of the email with a minimum gap.
- `OFFERS.IMMERSIVE.001-R9`: In Suggestions and Reports views, the back control shall be placed in the panel header row on the right side, aligned with the title.
- `OFFERS.IMMERSIVE.001-R10`: In Favorites view, the back control shall remain in the panel header row on the right side, aligned with the title, and shall close the Favorites overlay.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User returns from immersive view to the standard offers view
  Given the user is on the immersive offers view
  When the user selects the map mode option
  Then the immersive offers view closes
  And the standard offers view is displayed
  And the standard application header and bottom navigation are restored

Scenario: No back control is shown in the immersive left panel
  Given the user is on the immersive offers view
  When the user views the left panel
  Then a back control shall not be available

Scenario: Context is preserved after returning
  Given the user has an active search in the immersive offers view
  When the user selects the map mode option
  Then the search query and radius shall remain available in the standard offers view

Scenario: Back control is available in destinations opened from immersive view
  Given the user is on the immersive offers view
  When the user opens a destination from the left panel
  Then a back control is available in that destination
  And selecting it returns the user to the immersive offers view
```

## Example Inputs/Outputs
- Example input: User selects map mode in immersive view.
- Expected output: Standard offers view is displayed with header and bottom navigation restored.

## Edge Cases
- The standard offers view remains available even when no offers are loaded.
- Repeated selections do not cause errors.

## Non-Functional Constraints
- Navigation shall be immediate and not lose user context.

## Related Specs
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.FAVORITES.001`
- `APP.SHELL.001`
- `OFFERS.COMMENTS.001`
```