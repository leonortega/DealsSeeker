# Spec: `APP.BRAND.001`

## Metadata
- **Title**: Brand Logo Set and Placement
- **Version**: `v1.12`
- **Status**: Approved
- **Context/View**: Application Shell (all views), Login, Offers (immersive)
- **Priority**: Medium

## Purpose
Use one authored logo set consistently in every app surface and replace placeholder brand imagery.

## Preconditions
- The authored logo set is available to the application: a symbol mark, a horizontal lockup, a stacked lockup, a wordmark, a monochrome mark, an inverse lockup and a reversed knockout lockup.

## Trigger
- A view, a native icon surface or a startup surface is rendered.

## Requirements
- `APP.BRAND.001-R1`: The system shall present the symbol mark as the application identity in the splash view, the login view and the immersive offers top bar.
- `APP.BRAND.001-R2`: The system shall not display the placeholder letter glyph as application identity.
- `APP.BRAND.001-R3`: The application name shall remain shown as localized, theme-aware text beside the symbol mark wherever the name is shown, as defined by `APP.SHELL.001` and `OFFERS.FEED.RESPONSIVE.001`.
- `APP.BRAND.001-R4`: The native app icon, its Android adaptive layers and the web favicon shall be derived from the authored logo set rather than placeholder imagery.
- `APP.BRAND.001-R5`: The native startup image shall use the stacked lockup.
- `APP.BRAND.001-R6`: The monochrome adaptive layer shall be a single-color silhouette of the symbol mark; the reversed knockout lockup shall be used where a filled square icon is required.
- `APP.BRAND.001-R7`: The logo set shall remain legible in both themes; the symbol mark uses the authored brand color and the inverse lockup is available for light-on-dark placements.
- `APP.BRAND.001-R8`: In the standard Offers (map) view, the symbol mark shall be displayed immediately to the left of the feed/map presentation switch.
- `APP.BRAND.001-R9`: The standard Offers top controls shall mirror the immersive feed top bar: the symbol mark in a rounded tile at the left, the presentation switch centered, the help control at the right, and the row pinned at the same top position, so switching presentations keeps the controls visually continuous.
- `APP.BRAND.001-R10`: The standard Offers controls row shall align to the same screen edges as the immersive feed top bar, independent of the surrounding content padding, and no control shall be clipped by the screen edges.
- `APP.BRAND.001-R11`: The standard Offers top bar shall use the same structure and spacing as the immersive feed top bar, including the reserved search slot; the search control itself shall not be displayed in the standard Offers view.
- `APP.BRAND.001-R12`: The standard Offers view title shall be separated from the controls row by a clear gap, and no top-bar control shall be clipped by the screen edges.
- `APP.BRAND.001-R13`: The in-app splash view shall display only the stacked lockup as its brand identity; it shall not display a second logo, an application-subtitle line, or a `DealsSeeker mobile` text line.
- `APP.BRAND.001-R14`: The native launcher icon shall use the symbol mark from the authored logo set on the brand background with sufficient contrast; the adaptive foreground shall contrast with the adaptive background.
- `APP.BRAND.001-R15`: Offer action icons shall use the authored SVG glyph set; emoji shall not be used as action icons. Decorative avatar emoji are not action icons.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Splash and login use the authored symbol mark
  Given the user has not reached the authenticated shell
  When the splash or login view is rendered
  Then the symbol mark shall be displayed as the application identity
  And the localized application name shall be shown as text
  And no placeholder letter glyph shall be displayed

Scenario: Immersive top bar uses the authored symbol mark
  Given the authenticated user is on the immersive offers feed
  When the top bar is rendered
  Then the symbol mark shall be displayed as the application identity
  And the application name text shall follow the viewport rule of `OFFERS.FEED.RESPONSIVE.001`

Scenario: Native icon surfaces use the authored logo set
  Given the application is installed on a mobile device or opened on the web
  When the app icon, its adaptive layers or the favicon are rendered
  Then they shall be derived from the authored logo set
  And no placeholder icon shall be displayed

Scenario: Native startup image uses the stacked lockup
  Given the application is launching
  When the native startup image is rendered
  Then the stacked lockup shall be shown

Scenario: Standard Offers view shows the mark beside the presentation switch
  Given the authenticated user is on the standard Offers (map) view
  When the presentation switch is rendered
  Then the symbol mark shall be displayed immediately to its left
  And the mark shall not be part of the switch itself

Scenario: Map-view controls mirror the feed top bar
  Given the authenticated user is on the standard Offers (map) view
  When the top controls are rendered
  Then the symbol mark sits in a rounded tile at the left
  And the presentation switch is centered and the help control is at the right
  And the controls row is pinned at the same top position as the immersive feed top bar
  And the row aligns to the same screen edges as the immersive feed top bar
  And the symbol mark and help control are not clipped by the screen edges

Scenario: Map-view header reuses the feed header structure without search
  Given the authenticated user is on the standard Offers (map) view
  When the top bar is rendered
  Then it uses the same slots and spacing as the immersive feed top bar
  And the search slot keeps its footprint
  And no search control is displayed

Scenario: Map-view title clears the controls row
  Given the authenticated user is on the standard Offers (map) view
  When the view content is rendered
  Then the title starts below the controls row with a clear gap
  And no top-bar control is clipped by the screen edges

Scenario: Offer actions use the authored glyph set
  Given an offer card or immersive action rail is displayed
  When its actions are rendered
  Then each action uses an authored SVG glyph
  And no emoji is used as an action icon

Scenario: Splash uses the stacked lockup with black copy
  Given the application is showing its in-app splash view
  When the splash is rendered
  Then only the stacked lockup shall be displayed as the brand identity
  And no second logo or symbol tile shall be displayed
  And no separate application-title, subtitle or `DealsSeeker mobile` text shall be displayed
```

## Example Inputs/Outputs
- Example input: Login view rendered in Spanish.
- Expected output: The symbol mark is shown with the localized application name text and subtitle; no "DS" glyph is shown.
- Example input: Immersive feed rendered on a narrow viewport.
- Expected output: The symbol mark is shown in the floating top bar while the name text stays hidden.

## Edge Cases
- A narrow immersive viewport keeps the symbol mark when the name text is hidden.
- Dark theme keeps the symbol mark legible without changing the theme-aware name text.
- The adaptive monochrome layer carries no secondary color.

## Non-Functional Constraints
- The logo set shall be authored once and reused; no placeholder brand artwork shall remain in the application.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.001`
- `APP.SHELL.005`
- `OFFERS.FEED.RESPONSIVE.001`
- `APP.POLISH.UX.001`
