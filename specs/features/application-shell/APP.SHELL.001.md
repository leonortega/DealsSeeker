# Spec: `APP.SHELL.001`

## Metadata
- **Title**: Global Navigation and Session-Aware Landing View
- **Version**: `v2.1`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Navigation restructure (v2.0)
Requirement R3 is superseded by `OFFERS.MODE.SWITCH.001`: the startup default is the `Feed` presentation selected in the Offers controls, and presentation switching is no longer a bottom-footer button. R1's section list remains authoritative for the shared bottom navigation; Add Offer is reached from a single floating action button per `OFFERS.NAV.ADD.001`.

## Header removal (v2.1)
The global application header is no longer rendered in any standard view. Requirements R15, R16, R20 and R29 are retired in favor of `APP.SHELL.005`; their BDD scenarios and header-specific edge cases are removed from this spec. The shared bottom footer remains the sole navigation surface as before.

## Purpose
Define global app sections and startup landing behavior based on session state.

## Preconditions
- The user launches the DealsSeeker mobile application.

## Trigger
- Application startup.

## Requirements
- `APP.SHELL.001-R0`: The system shall be a mobile application named `DealsSeeker`.
- `APP.SHELL.001-R1`: The system shall provide the main navigation sections: `My Account`, `Offers`, `Suggestions`.
- `APP.SHELL.001-R23`: Reporting shall be reachable only from an offer's Report action and shall open as an offer-scoped overlay; no `Reports` destination shall appear in the shared footer.
- `APP.SHELL.001-R2`: When there is no active authenticated session, the first view at startup shall be `Login`.
- `APP.SHELL.001-R3`: When there is an active authenticated session, the first view at startup shall be `Offers`, with the `Feed` presentation selected by default as defined in `OFFERS.MODE.SWITCH.001`.
- `APP.SHELL.001-R4`: After successful login or successful user creation, the system shall navigate to `Offers`.
- `APP.SHELL.001-R5`: The system shall persist authenticated session state on device so the user is not required to login again on every app launch.
- `APP.SHELL.001-R6`: On app access with a persisted session, the system shall validate session activity; if the session is expired/invalid, the session shall be cleared and startup view shall be `Login`.
- `APP.SHELL.001-R7`: After successful submission in `Suggestions` or `Reports` view (no errors), the system shall redirect to `Offers` view.
- `APP.SHELL.001-R8`: The My Account view shall include quick controls to change app language and app theme.
- `APP.SHELL.001-R9`: Language/theme changes made in My Account shall apply instantly in the current view.
- `APP.SHELL.001-R10`: On application startup, the system shall display a branded splash screen for approximately 2 seconds before showing the first interactive view.
- `APP.SHELL.001-R11`: The splash screen shall include app identity visuals and a startup animation, then exit with a smooth transition.
- `APP.SHELL.001-R12`: When any active view is waiting for required data (for example, location resolution or search execution), the system shall display a blocking animated loading state.
- `APP.SHELL.001-R13`: While the blocking loading state is visible, user interaction with the underlying view shall be prevented.
- `APP.SHELL.001-R14`: The blocking loading state shall be dismissed automatically when all pending required operations complete.
- `APP.SHELL.001-R17`: On Android, the system back gesture or back button shall navigate to the previously visited view within the application when one exists, instead of closing the application.
- `APP.SHELL.001-R18`: When no previously visited view exists within the application, the Android system back gesture or back button shall leave the application using the platform default behavior.
- `APP.SHELL.001-R19`: Back navigation shall preserve view context that the destination view restores on entry, including the offers search query and radius when returning to the offers feed.
- `APP.SHELL.001-R21`: All views shall present the same bottom footer navigation with My Account (👤), Suggestions, Create, Offers (💲) and a view button in that order. At most one footer option shall be highlighted at a time, and the view button shall never be highlighted. Opening an overlay shall highlight only the option that opened it.
- `APP.SHELL.001-R22`: The view button shall use ⭐ with the label `New view` when the standard view is selected and 🗺️ with the label `Map mode` when the immersive view is selected; selecting it shall change the selected view mode and shall display the offers view in the newly selected mode, even when the user was on another view such as Suggestions. The view button shall never be highlighted.
- `APP.SHELL.001-R25`: The selected view mode shall persist while the user visits other views, including Add Offer. The Offers footer option shall return to the offers view using the previously selected mode. The mode shall change only when the user selects the view button.
- `APP.SHELL.001-R23`: The footer shall use a dark surface that spans the full width of the screen, with a highlighted active option, shall be present in every view, and the Create option shall be the only entry point for starting a new offer from the standard view.
- `APP.SHELL.001-R24`: No view shall display a back control; navigation between views shall be performed through the shared footer.
- `APP.SHELL.001-R26`: On a mobile viewport, the shared footer shall span the full width of the screen and shall contain all five options, including the view button, entirely within its bounds.
- `APP.SHELL.001-R27`: The footer options shall be evenly distributed across the available width and shall shrink as needed so that every option, including the view button, remains inside the footer.
- `APP.SHELL.001-R28`: On a mobile viewport, each footer option label shall wrap to at most two centered lines beneath its icon instead of being truncated with an ellipsis.

## Acceptance Criteria (BDD)
```gherkin
Scenario: App starts on Login without active session
  Given the application is installed and launchable
  And there is no active authenticated session
  When the user opens the application
  Then the app identity shall be DealsSeeker mobile application
  And the main navigation shall display My Account, Offers, and Suggestions
  And the Login view shall be the first visible view

Scenario: App starts on Offers with active session
  Given the application is installed and launchable
  And there is an active authenticated session
  When the user opens the application
  Then the Offers section shall be the first visible view
  And the immersive full-screen offers feed shall be presented

Scenario: App starts on Login when persisted session is expired
  Given the application is installed and launchable
  And there is a persisted authenticated session on device
  And that persisted session is expired or invalid
  When the user opens the application
  Then the persisted session shall be cleared
  And the Login view shall be the first visible view

Scenario: Suggestions and offer report success submissions redirect to Offers
  Given the authenticated user is in Suggestions view or in an offer-scoped Reports overlay
  When the user submits the form
  And the submit response is successful with no errors
  Then the success confirmation shall remain perceivable before the redirect
  And the system shall redirect the user to Offers view

Scenario: User leaves before the delayed success redirect
  Given a successful submission has produced a confirmation and a pending delayed redirect
  When the user navigates to another destination before that redirect occurs
  Then the pending redirect shall be cancelled
  And the user's chosen destination shall remain visible

Scenario: No view button is displayed in the Offers hero
  Given the authenticated user is on the Offers view without an open overlay
  When the Offers hero area is rendered
  Then no new-view button shall be displayed in the hero area
  And the view button shall only be available in the shared bottom footer

Scenario: Android back returns to the previously visited view
  Given the authenticated user has moved from one view to another within the application
  And the app is running on an Android device
  When the user invokes the system back gesture or back button
  Then the previously visited view shall become visible
  And the application shall remain open

Scenario: Android back from the first view leaves the application
  Given the user is on the first view shown after application launch
  And no other view has been visited within the application
  When the user invokes the system back gesture or back button
  Then the application shall leave the foreground using the platform default behavior

Scenario: Android back returns from a destination opened in the immersive feed
  Given the authenticated user is on the immersive offers feed
  When the user opens `My Account`, `Suggestions`, an offer's Report action, or `Add Offer` from the immersive feed navigation
  And the user invokes the system back gesture or back button
  Then the immersive offers feed shall become visible again
  And the application shall remain open

Scenario: All views share the same footer
  Given the authenticated user is on a standard view
  When the footer is rendered
  Then it shall display My Account with a 👤 icon, Suggestions, Create, Offers, and ⭐ New view in that order
  And the footer shall be present in every view
  And at most one option shall be highlighted at a time, with the view button never highlighted
  And opening an overlay shall highlight only the option that opened it
  And selecting Create shall open the Add Offer view
  And selecting Offers shall open the standard offers view
  And selecting New view shall open the immersive offers feed
  And no plus button for creating an offer shall be displayed in the standard view
  And no back control shall be displayed in any view

Scenario: Immersive view uses the same footer with a Map mode label
  Given the authenticated user is on the immersive offers feed
  When the footer is rendered
  Then it shall display My Account, Suggestions, Create, Offers, and 🗺️ Map mode in that order
  And selecting Offers shall keep the immersive offers view
  And selecting 🗺️ Map mode shall open the standard offers view
  And the view button shall never be highlighted

Scenario: Mobile footer spans the full screen width
  Given the authenticated user is on a mobile viewport
  When the shared footer is rendered
  Then it shall span the full width of the screen
  And all five options including the view button shall be fully visible inside the footer
  And the options shall be evenly distributed across the footer

Scenario: Mobile footer labels wrap to two centered lines
  Given the authenticated user is on a mobile viewport
  And at least one footer option has a label too long for a single line
  When the shared footer is rendered
  Then the long label shall wrap to at most two lines
  And every label shall be centered beneath its icon
  And no label shall be truncated with an ellipsis

Scenario: Selected view mode persists across other views
  Given the authenticated user has selected the immersive view mode
  When the user opens Suggestions and then Add Offer from the footer
  Then only the Add Offer option shall be highlighted
  And when the user selects Offers in the footer
  Then the immersive offers feed shall be displayed with the previously selected mode
  And the mode shall remain until the user selects the view button again

Scenario: View button redirects to the selected offers mode from another view
  Given the authenticated user is on Suggestions
  And the standard view mode is selected
  When the user selects ⭐ New view in the footer
  Then the immersive offers feed shall be displayed
  When the user opens Suggestions again
  And selects 🗺️ Map mode in the footer
  Then the standard offers view shall be displayed

Scenario: My Account includes quick language and theme controls
  Given the authenticated user opens My Account
  When the settings area is rendered
  Then language-change and theme-change controls shall be visible
  And selecting either control shall apply the change immediately

Scenario: Startup splash screen is shown before first interactive view
  Given the application is installed and launchable
  When the user opens the application
  Then a branded splash screen shall be shown for about 2 seconds
  And the splash screen shall animate in and out
  And after splash exit the first view shall become interactive

Scenario: Blocking loading state appears during required data waits
  Given the user is on any view that is waiting for required data
  When the data request is in progress
  Then an animated loading overlay shall be visible
  And interaction with the underlying view shall be blocked
  And when the request completes the loading overlay shall be removed
```

## Example Inputs/Outputs
- Example input: App launch with no active session.
- Expected output: `Login` view rendered first.
- Example input: App launch with active session.
- Expected output: `Offers` view rendered first.

## Edge Cases
- Persisted session token is invalid or expired at startup; first view shall be `Login`.
- Multiple concurrent required requests shall keep the blocking loading state visible until all complete.
- If a request fails, the blocking loading state shall still be dismissed and the error state shall remain interactive.
- Repeated back invocations shall walk back through visited views and shall not close the application while a previous in-app view remains.
- Back invoked while a view is briefly replacing its content shall still resolve to the previous visited view rather than closing the application.
- A very long localized footer label shall still fit within two lines and inside the footer bounds without an ellipsis.

## Non-Functional Constraints
- First visible shell and startup view should render without blocking on network responses.
- Splash display duration target is ~2 seconds with smooth animation on supported devices.
- Blocking loading animation should be lightweight and consistent across light/dark themes.

## Related Specs
- `APP.BRAND.001`
- `APP.SHELL.005`
- `APP.API.CONNECTIVITY.001`
- `APP.CONFIG.MAPS.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `APP.THEME.004`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.LAYOUT.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `ACCOUNT.PROFILE.001`
- `SUGGESTIONS.SUBMIT.001`
- `REPORTS.SUBMIT.001`
- `APP.SEARCH.INTERACTION.001`
- `APP.HELP.001`
- `APP.LOCATION.FALLBACK.001`
- `APP.ONBOARD.001`
- `APP.ADAPTIVE.UX.001`
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.004`
