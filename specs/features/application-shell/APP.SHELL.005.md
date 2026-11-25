# Spec: `APP.SHELL.005`

## Metadata
- **Title**: Headerless Standard Views
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Remove the global application header from standard views so each view presents only its own local heading and content.

## Preconditions
- The user is authenticated.
- A standard view is rendered: Offers, My Account, Suggestions, Favorites or Add Offer.

## Trigger
- A standard view is rendered.

## Requirements
- `APP.SHELL.005-R1`: The system shall not display a global application header — a branded bar showing the application title and a section label — in any standard view.
- `APP.SHELL.005-R2`: Each standard view shall keep its own local heading where one is defined, and its content shall begin at that heading.
- `APP.SHELL.005-R3`: The Offers view's local presentation-mode and help controls shall remain available as defined by `OFFERS.MODE.SWITCH.001` and `APP.HELP.001`.
- `APP.SHELL.005-R4`: The immersive offers view's top bar and its controls shall remain available as defined by `OFFERS.FEED.RESPONSIVE.001`; this spec does not change the immersive presentation.
- `APP.SHELL.005-R5`: Navigation shall remain available through the shared bottom footer as defined by `APP.SHELL.001`.
- `APP.SHELL.005-R6`: Application identity on the splash and login views shall remain unchanged.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Standard views render without a global application header
  Given the authenticated user is on a standard view
  When the view is rendered
  Then no bar showing the application title and a section label shall be displayed
  And the view content shall start at the view's own heading

Scenario: Each standard view keeps its own local heading
  Given the authenticated user opens Offers, My Account, Suggestions, Favorites or Add Offer
  When each view is rendered
  Then that view's own heading shall remain visible
  And no application-title bar shall precede it

Scenario: Offers controls remain reachable without the global header
  Given the authenticated user is on the standard Offers view
  When the view is rendered
  Then the presentation-mode control and the help control shall remain visible
  And no global application header shall be displayed

Scenario: Immersive top bar is unaffected
  Given the authenticated user is on the immersive offers feed
  When the view is rendered
  Then its top bar with the application identity, search, help and feed tabs shall remain available
  And no standard application header shall be displayed

Scenario: Application identity remains on splash and login
  Given the user has not reached the authenticated shell
  When the splash or login view is rendered
  Then the application identity shall still be displayed
```

## Example Inputs/Outputs
- Example input: Authenticated user opens Suggestions.
- Expected output: The `Suggestions` heading and form are shown with no `DealsSeeker` brand bar above them.
- Example input: Authenticated user opens Favorites.
- Expected output: The favorites heading and offer list are shown with no application-title bar above them.

## Edge Cases
- A standard view with no separate text heading, such as My Account, starts with its profile hero and leaves no empty header space.
- A long localized section label produces no header label, so there is no wrapping or overflow to manage.
- The immersive feed on a narrow viewport keeps its floating top bar as defined by `OFFERS.FEED.RESPONSIVE.001`.

## Non-Functional Constraints
- Removing the global header shall not change footer navigation, presentation switching, help or immersive controls.

## Related Specs
- `APP.SHELL.001`
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `OFFERS.IMMERSIVE.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.MODE.SWITCH.001`
- `APP.HELP.001`
- `ACCOUNT.PROFILE.AVATAR.001`
