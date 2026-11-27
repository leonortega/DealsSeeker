# Spec: `APP.SHELL.005`

## Metadata
- **Title**: Platform-Native Headers on Standard Views
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Allow standard top-level views to carry a platform-native header that names the view, while the immersive presentation keeps only its own top bar and remains headerless.

## Preconditions
- The user is authenticated.
- A standard view is rendered: Offers, My Account, Suggestions, Favorites or Add Offer.
- A platform-native navigation surface is present as defined by `APP.SHELL.002`.

## Trigger
- A standard view or an overlay destination is rendered.

## Requirements
- `APP.SHELL.005-R1`: Each standard top-level view shall present a single platform-native header that shows that view's title and the platform's standard leading affordance where one applies; no additional global application-title bar shall be rendered above it.
- `APP.SHELL.005-R2`: A view's own local heading may remain where it labels distinct content below the header; a duplicate application title shall not be shown twice.
- `APP.SHELL.005-R3`: The Offers view's local presentation-mode and help controls shall remain available as defined by `OFFERS.MODE.SWITCH.001` and `APP.HELP.001`.
- `APP.SHELL.005-R4`: The immersive offers presentation shall keep only its own top bar and controls as defined by `OFFERS.FEED.RESPONSIVE.001`; no platform-native header shall be displayed in that presentation.
- `APP.SHELL.005-R5`: Navigation shall remain available through the platform-native navigation surface as defined by `APP.SHELL.002` and `APP.PLATFORM.CHROME.001`.
- `APP.SHELL.005-R6`: Application identity on the splash and login views shall remain displayed and shall follow `APP.BRAND.001`.
- `APP.SHELL.005-R7`: The native header shall follow the platform's convention — a large or inline title on iOS and a top app bar on Android — using the brand palette and type roles.
- `APP.SHELL.005-R8`: The header shall derive from the active route: a top-level destination shall show its section title, an overlay destination shall show its own title with a back affordance as defined by `APP.PLATFORM.CHROME.001`, and the immersive presentation shall show no header.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Standard views present a platform-native header
  Given the authenticated user is on a standard top-level view
  When the view is rendered
  Then a platform-native header shows that view's title
  And the platform's standard leading affordance is present where one applies
  And no second redundant application-title bar is shown

Scenario: Each standard view keeps its own local heading
  Given the authenticated user opens Offers, My Account, Suggestions, Favorites or Add Offer
  When each view is rendered
  Then that view's own local heading may remain where it labels distinct content
  And the application title is not shown twice

Scenario: Offers controls remain reachable beneath the native header
  Given the authenticated user is on the standard Offers view
  When the view is rendered
  Then the presentation-mode control and the help control remain visible
  And the native header shows the Offers title

Scenario: Header follows the active route
  Given the user moves from a top-level destination to an overlay destination
  When each destination is rendered
  Then the header title changes with the route
  And a back affordance appears on the overlay destination
  And returning to the top-level destination restores its section title

Scenario: Immersive presentation stays headerless
  Given the authenticated user is on the immersive offers feed
  When the view is rendered
  Then no platform-native header is displayed
  And only its own top bar with application identity, search, help and feed tabs is present

Scenario: Application identity remains on splash and login
  Given the user has not reached the authenticated shell
  When the splash or login view is rendered
  Then the application identity shall still be displayed as defined by APP.BRAND.001

Scenario: Long localized title reflows in the native header
  Given a standard view has a long localized title at a large reading size
  When the header is rendered
  Then the title wraps at word boundaries without clipping
  And the header's controls remain visible and tappable
```

## Example Inputs/Outputs
- Example input: Authenticated user opens Suggestions.
- Expected output: A platform-native header titled `Suggestions` is shown above the form; no second `DealsSeeker` title bar is added.
- Example input: Authenticated user opens Favorites.
- Expected output: A native header titled `Favorites` is shown above the offer list; no duplicate application-title bar appears.
- Example input: The user opens the immersive offers feed.
- Expected output: No platform-native header; only the immersive top bar is shown.

## Edge Cases
- A standard view with no separate text heading, such as My Account, still shows its native header with the section title.
- A long localized section label wraps in the native header rather than clipping or disappearing.
- The immersive feed on a narrow viewport keeps its floating top bar as defined by `OFFERS.FEED.RESPONSIVE.001` and adds no header.
- An overlay destination opened from a top-level view swaps the header title and back affordance without duplicating the top-level title.

## Non-Functional Constraints
- Adding a native header shall not change navigation, presentation switching, help or immersive controls.
- The header shall use the brand palette and type roles rather than a new visual treatment.

## Related Specs
- `APP.PLATFORM.CHROME.001`
- `APP.BRAND.001`
- `APP.SHELL.001`
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.TYPOGRAPHY.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
- `OFFERS.IMMERSIVE.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.MODE.SWITCH.001`
- `APP.HELP.001`
- `ACCOUNT.PROFILE.AVATAR.001`
