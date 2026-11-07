# Spec: `OFFERS.IMMERSIVE.001`

## Metadata
- **Title**: Immersive View Back Navigation
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (Immersive)
- **Priority**: High

## Purpose
Define back navigation from the immersive offers view to the standard offers view, analogous to the back control in the My Favorites view.

## Preconditions
- User is authenticated and the immersive offers view is open.

## Trigger
- User selects the back control in the immersive offers view.

## Requirements
- `OFFERS.IMMERSIVE.001-R1`: The immersive offers view shall provide a back control, analogous to the back control in the My Favorites view.
- `OFFERS.IMMERSIVE.001-R2`: Selecting the back control shall close the immersive offers view and return the user to the standard offers view.
- `OFFERS.IMMERSIVE.001-R3`: Selecting the back control shall restore the standard application header and bottom navigation.
- `OFFERS.IMMERSIVE.001-R4`: The back control shall be reachable from the left panel of the immersive offers view.
- `OFFERS.IMMERSIVE.001-R5`: The back control shall use the shared `common.back` label.
- `OFFERS.IMMERSIVE.001-R6`: Closing the immersive view via back shall preserve the current search query, radius, and location context.
- `OFFERS.IMMERSIVE.001-R7`: When a destination opened from the immersive left panel (account, suggestions, reports, or favorites) is displayed, it shall provide a back control.
- `OFFERS.IMMERSIVE.001-R8`: Selecting that back control shall return the user to the immersive offers view.
- `OFFERS.IMMERSIVE.001-R9`: The back control in those destinations shall only be displayed while the immersive offers view is active.
- `OFFERS.IMMERSIVE.001-R10`: In Account view, the back control shall be placed in the hero row on the right side, and the logout control shall be placed to the right of the email with a minimum gap.
- `OFFERS.IMMERSIVE.001-R11`: In Suggestions and Reports views, the back control shall be placed in the panel header row on the right side, aligned with the title.
- `OFFERS.IMMERSIVE.001-R12`: In Favorites view, the back control shall remain in the panel header row on the right side, aligned with the title.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User goes back from immersive view
  Given the user is on the immersive offers view
  When the user selects the back control
  Then the immersive offers view shall close
  And the standard offers view shall be displayed
  And the standard application header and bottom navigation shall be restored

Scenario: Back control is available in left panel
  Given the user is on the immersive offers view
  When the user views the left panel
  Then a back control shall be available
  And its label shall be the shared back label

Scenario: Context is preserved after back
  Given the user has an active search in the immersive offers view
  When the user selects the back control
  Then the search query and radius shall remain available in the standard offers view
```

## Example Inputs/Outputs
- Example input: User selects back in immersive view.
- Expected output: Standard offers view is displayed with header and bottom navigation restored.

## Edge Cases
- Back control remains available even when no offers are loaded.
- Repeated back selections do not cause errors.

## Non-Functional Constraints
- Back navigation shall be immediate and not lose user context.

## Related Specs
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.FAVORITES.001`
- `APP.SHELL.001`
```