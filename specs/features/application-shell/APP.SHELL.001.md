# Spec: `APP.SHELL.001`

## Metadata
- **Title**: Global Navigation and Session-Aware Landing View
- **Version**: `v1.8`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define global app sections and startup landing behavior based on session state.

## Preconditions
- The user launches the DealsSeeker mobile application.

## Trigger
- Application startup.

## Requirements
- `APP.SHELL.001-R0`: The system shall be a mobile application named `DealsSeeker`.
- `APP.SHELL.001-R1`: The system shall provide the main navigation sections: `My Account`, `Offers`, `Suggestions`, `Reports`.
- `APP.SHELL.001-R2`: When there is no active authenticated session, the first view at startup shall be `Login`.
- `APP.SHELL.001-R3`: When there is an active authenticated session, the first view at startup shall be `Offers`, presented as the immersive full-screen offers feed.
- `APP.SHELL.001-R4`: After successful login or successful user creation, the system shall navigate to `Offers`.
- `APP.SHELL.001-R5`: The system shall persist authenticated session state on device so the user is not required to login again on every app launch.
- `APP.SHELL.001-R6`: On app access with a persisted session, the system shall validate session activity; if the session is expired/invalid, the session shall be cleared and startup view shall be `Login`.
- `APP.SHELL.001-R7`: After successful submission in `Suggestions` or `Reports` view (no errors), the system shall redirect to `Offers` view.
- `APP.SHELL.001-R8`: The main navigation menu shall include quick controls to change app language and app theme.
- `APP.SHELL.001-R9`: Menu-triggered language/theme changes shall apply instantly in the current view.
- `APP.SHELL.001-R10`: On application startup, the system shall display a branded splash screen for approximately 2 seconds before showing the first interactive view.
- `APP.SHELL.001-R11`: The splash screen shall include app identity visuals and a startup animation, then exit with a smooth transition.
- `APP.SHELL.001-R12`: When any active view is waiting for required data (for example, location resolution or search execution), the system shall display a blocking animated loading state.
- `APP.SHELL.001-R13`: While the blocking loading state is visible, user interaction with the underlying view shall be prevented.
- `APP.SHELL.001-R14`: The blocking loading state shall be dismissed automatically when all pending required operations complete.
- `APP.SHELL.001-R15`: The standard application header shall place the menu button on the trailing side and, when the Offers view is displayed without an open overlay, shall place an immersive-view button immediately to its left, labeled `Immersive view` in English and `Modo inmersivo` in Spanish. Selecting it shall open the immersive offers feed.
- `APP.SHELL.001-R16`: The standard application header shall be positioned below the device system status area, so that system indicators (battery, signal, and similar) do not overlap the header content.
- `APP.SHELL.001-R17`: On Android, the system back gesture or back button shall navigate to the previously visited view within the application when one exists, instead of closing the application.
- `APP.SHELL.001-R18`: When no previously visited view exists within the application, the Android system back gesture or back button shall leave the application using the platform default behavior.
- `APP.SHELL.001-R19`: Back navigation shall preserve view context that the destination view restores on entry, including the offers search query and radius when returning to the offers feed.

## Acceptance Criteria (BDD)
```gherkin
Scenario: App starts on Login without active session
  Given the application is installed and launchable
  And there is no active authenticated session
  When the user opens the application
  Then the app identity shall be DealsSeeker mobile application
  And the main navigation shall display My Account, Offers, Suggestions, and Reports
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

Scenario: Suggestions and Reports success submissions redirect to Offers
  Given the authenticated user is in Suggestions or Reports view
  When the user submits the form
  And the submit response is successful with no errors
  Then the system shall redirect the user to Offers view

Scenario: Header places the immersive-view button left of the menu button
  Given the authenticated user is on the Offers view without an open overlay
  When the standard application header is rendered
  Then an immersive-view button shall be displayed immediately to the left of the menu button
  And the button shall be labeled `Immersive view` in English and `Modo inmersivo` in Spanish
  And selecting it shall open the immersive offers feed

Scenario: Standard header clears the device status area
  Given the authenticated user is on any view that renders the standard application header
  And the app is running on a mobile device
  When the header is rendered
  Then the header shall be positioned below the device system status area
  And the app title, user badge, and menu button shall not overlap the system indicators

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
  When the user opens `My Account`, `Suggestions`, `Reports`, or `Add Offer` from the immersive feed navigation
  And the user invokes the system back gesture or back button
  Then the immersive offers feed shall become visible again
  And the application shall remain open

Scenario: Menu includes quick language and theme controls
  Given the authenticated user opens the main navigation menu
  When the menu is rendered
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
- On devices without a reported safe-area inset, the header shall still clear the status area using a minimum offset.
- Repeated back invocations shall walk back through visited views and shall not close the application while a previous in-app view remains.
- Back invoked while a view is briefly replacing its content shall still resolve to the previous visited view rather than closing the application.

## Non-Functional Constraints
- First visible shell and startup view should render without blocking on network responses.
- Splash display duration target is ~2 seconds with smooth animation on supported devices.
- Blocking loading animation should be lightweight and consistent across light/dark themes.

## Related Specs
- `APP.CONFIG.MAPS.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.LAYOUT.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `ACCOUNT.PROFILE.001`
- `SUGGESTIONS.SUBMIT.001`
- `REPORTS.SUBMIT.001`
- `APP.SEARCH.INTERACTION.001`
