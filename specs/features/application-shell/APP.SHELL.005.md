# Spec: `APP.SHELL.005`

## Metadata
- **Title**: Material 3 App Bars on All Views
- **Version**: `v3.0`
- **Status**: Approved
- **Context/View**: Application Shell (all views and presentations)
- **Priority**: Medium

## Purpose
Require a Material 3 app bar on every standard view; the immersive presentation keeps its own top bar and remains headerless, and platform-native header substitution is removed.

## Preconditions
- The user is authenticated.
- A standard view is rendered: Offers, My Account, Suggestions, Favorites or Add Offer.
- A Material 3 navigation bar, rail or drawer is present as defined by `APP.SHELL.002`.

## Trigger
- A standard view or an overlay destination is rendered.

## Requirements
- `APP.SHELL.005-R1`: Each standard top-level view shall present a single Material 3 app bar that shows the view's title and the platform's standard leading affordance where one applies; no additional global application-title bar or platform-native header shall be rendered above it.
- `APP.SHELL.005-R2`: A view's own local heading may remain where it labels distinct content below the app bar; a duplicate application title shall not be shown twice.
- `APP.SHELL.005-R3`: The Offers view's local presentation-mode and help controls shall remain available as defined by `OFFERS.MODE.SWITCH.001` and `APP.HELP.001`, within the Material 3 app bar structure.
- `APP.SHELL.005-R4`: The immersive offers presentation shall keep only its own top bar and shall remain headerless; no Material 3 app bar or platform-native header shall be rendered there.
- `APP.SHELL.005-R5`: Navigation shall remain available through the Material 3 navigation bar, rail or drawer as defined by `APP.SHELL.002` and `APP.PLATFORM.CHROME.001`.
- `APP.SHELL.005-R6`: Application identity on the splash and login views shall remain displayed and shall follow `APP.BRAND.001`; no authored identity placement rule shall apply to the app bar.
- `APP.SHELL.005-R7`: The app bar shall use the Material 3 app bar pattern on both platforms, with the active Material 3 color roles, type scale roles and shape tokens; no second brand role set or platform-native large-title convention shall override it.
- `APP.SHELL.005-R8`: The app bar shall derive from the active route: a top-level destination shall show its section title, an overlay destination shall show its own title with a back affordance as defined by `APP.PLATFORM.CHROME.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Standard views present a Material 3 app bar
  Given the authenticated user is on a standard top-level view
  When the view is rendered
  Then a Material 3 app bar shows that view's title
  And the platform's standard leading affordance is present where one applies
  And no platform-native header or second redundant application-title bar is shown

Scenario: Each standard view keeps its own local heading
  Given the authenticated user opens Offers, My Account, Suggestions, Favorites or Add Offer
  When each view is rendered
  Then that view's own local heading may remain where it labels distinct content
  And the application title is not shown twice

Scenario: Offers controls remain reachable in the app bar
  Given the authenticated user is on the standard Offers view
  When the view is rendered
  Then the presentation-mode control and the help control remain visible
  And the Material 3 app bar shows the Offers title

Scenario: App bar follows the active route
  Given the user moves from a top-level destination to an overlay destination
  When each destination is rendered
  Then the app bar title changes with the route
  And a back affordance appears on the overlay destination
  And returning to the top-level destination restores its section title

Scenario: Immersive presentation presents a Material 3 app bar
  Given the authenticated user is on the immersive offers feed
  When the view is rendered
  Then a Material 3 app bar shows its title
  And its identity, search, help and feed controls remain reachable
  And no headerless exception applies

Scenario: Application identity remains on splash and login
  Given the user has not reached the authenticated shell
  When the splash or login view is rendered
  Then the application identity is still displayed as defined by APP.BRAND.001

Scenario: App bar uses Material 3 roles on both platforms
  Given the same view is rendered on iOS and Android
  When the app bar is displayed
  Then it uses the Material 3 app bar pattern with the active M3 roles
  And no platform-native large-title convention or brand override replaces it

Scenario: Long localized title reflows in the app bar
  Given a standard view has a long localized title at a large reading size
  When the app bar is rendered
  Then the title wraps at word boundaries without clipping
  And the app bar's controls remain visible and tappable
```

## Example Inputs/Outputs
- Example input: Authenticated user opens Suggestions.
- Expected output: A Material 3 app bar titled `Suggestions` is shown above the form; no second `DealsSeeker` title bar and no native header are added.
- Example input: Authenticated user opens Favorites.
- Expected output: A Material 3 app bar titled `Favorites` is shown above the offer list; no duplicate application-title bar appears.
- Example input: The user opens the immersive offers feed.
- Expected output: A Material 3 app bar with the feed title and controls is shown; the former headerless presentation is gone.

## Edge Cases
- A standard view with no separate text heading, such as My Account, still shows its Material 3 app bar with the section title.
- A long localized section label wraps in the app bar rather than clipping or disappearing.
- The immersive feed on a narrow viewport keeps its Material 3 app bar and controls reachable, as defined by `OFFERS.FEED.RESPONSIVE.001`.
- An overlay destination opened from a top-level view swaps the app bar title and back affordance without duplicating the top-level title.
- A former platform-native header would be substituted on a standard view; the Material 3 app bar pattern is retained.

## Non-Functional Constraints
- Adding an app bar shall not change navigation, presentation switching, help or immersive controls.
- The app bar shall use Material 3 roles and component defaults rather than a new brand treatment.

## Related Specs
- `APP.BRAND.001`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.THEME.001`
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.SHELL.001`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
- `OFFERS.IMMERSIVE.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.MODE.SWITCH.001`
- `APP.HELP.001`
- `ACCOUNT.PROFILE.AVATAR.001`
