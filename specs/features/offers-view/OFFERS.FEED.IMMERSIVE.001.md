# Spec: `OFFERS.FEED.IMMERSIVE.001`

## Metadata
- **Title**: Immersive Vertical Full-Screen Main Page Feed
- **Version**: `v2.1`
- **Status**: Approved
- **Context/View**: Offers View (Main Page)
- **Priority**: High

## Navigation restructure (v2.0)
The following navigation-related requirements are superseded by `OFFERS.MODE.SWITCH.001`, `APP.SHELL.001` and `OFFERS.NAV.ADD.001`: R4–R7, R16–R35, R42–R45 and R53. The immersive feed no longer has a static left navigation panel or a footer mode button; both presentations share one bottom navigation, presentation is chosen in the Offers controls, and Add Offer is opened from a single floating action button. All non-navigation requirements (feed paging, photo carousel, overlays, theme, privacy, states) remain in force.

## Header removal (v2.1)
No global application header is rendered in any standard view, per `APP.SHELL.005`. The immersive top bar and its controls are unchanged.

## Purpose
Define a new main-page browsing experience that presents offers as a vertical, full-screen, one-offer-per-viewport immersive feed, with application identity and discovery controls on the left, offer actions on the right, and offer text/tags in the lower-left description area.

## Preconditions
- User is authenticated and in the Offers section.
- At least one offer is available for the current search/location context, or an empty state applies.

## Trigger
- Offers main page is rendered.

## Requirements
- `OFFERS.FEED.IMMERSIVE.001-R1`: The system shall present offers as a vertical full-screen feed where each offer occupies one viewport-sized page.
- `OFFERS.FEED.IMMERSIVE.001-R2`: The system shall allow the user to move between offers by vertical scrolling/swiping, one offer at a time, without rendering the previous grid layout.
- `OFFERS.FEED.IMMERSIVE.001-R3`: Each feed page shall use the offer image as the full-bleed primary visual background.
- `OFFERS.FEED.IMMERSIVE.001-R4`: The left side of the screen shall display application identity (name and logo) and discovery controls.
- `OFFERS.FEED.IMMERSIVE.001-R5`: The left side of the screen shall provide search options and entry points for the main navigation destinations (account, suggestions, reports).
- `OFFERS.FEED.IMMERSIVE.001-R6`: The system shall keep application preferences and settings options available in the Account destination as defined by `APP.SHELL.001-R8`.
- `OFFERS.FEED.IMMERSIVE.001-R7`: The system shall keep the main navigation destinations reachable with their existing behavior, either through the standard bottom navigation or through the left panel options of the immersive feed.
- `OFFERS.FEED.IMMERSIVE.001-R8`: Each feed page shall expose offer action controls in a vertical side rail on the right, including favorite, directions, availability voting (positive and negative), and report, preserving their existing behavior and state semantics. The open detail control shall not be exposed.
- `OFFERS.FEED.IMMERSIVE.001-R9`: Each feed page shall display business name, distance, description, and tags as an overlay in the lower-left area, analogous to a video description area.
- `OFFERS.FEED.IMMERSIVE.001-R46`: The offer title shall be displayed with a reduced font size, so that the offer text overlay stays compact.
- `OFFERS.FEED.IMMERSIVE.001-R47`: The offer text overlay shall reserve space for the promoted and reported marks, so that they remain readable and are not overlapped by the photo navigation control.
- `OFFERS.FEED.IMMERSIVE.001-R10`: The description in the overlay shall be truncated by default and provide a `more` control that reveals the full description and all associated tags. After expansion, the `more` control shall disappear and no back control shall be provided.
- `OFFERS.FEED.IMMERSIVE.001-R39`: When expanded, associated tags shall be displayed as inline text prefixed with the `#` symbol.
- `OFFERS.FEED.IMMERSIVE.001-R11`: Promoted offers shall remain visually labeled on their feed page.
- `OFFERS.FEED.IMMERSIVE.001-R12`: Reported offers shall retain their reported visual indicator and demotion behavior.
- `OFFERS.FEED.IMMERSIVE.001-R13`: When no offers are available, the system shall render an empty-state message instead of feed pages.
- `OFFERS.FEED.IMMERSIVE.001-R14`: The view shall not expose raw `lat` or `lng` values to users.
- `OFFERS.FEED.IMMERSIVE.001-R15`: The feed shall remain scrollable and responsive on small mobile screens.
- `OFFERS.FEED.IMMERSIVE.001-R16`: The immersive feed shall be opened from the shared bottom footer view button labeled `New view` / `Nueva vista` with a ⭐ glyph; no new-view button shall be rendered in the Offers hero area.
- `OFFERS.FEED.IMMERSIVE.001-R17`: The immersive feed shall provide a map entry point; selecting it shall open the standard offers view, which displays the map for the current offers/location context.
- `OFFERS.FEED.IMMERSIVE.001-R18`: In the immersive feed, the immersive top bar shall be the only top bar; no standard application header shall be rendered.
- `OFFERS.FEED.IMMERSIVE.001-R19`: The left section shall consolidate the entry points previously exposed by the header and bottom navigation, including search and the main navigation destinations.
- `OFFERS.FEED.IMMERSIVE.001-R20`: Main navigation destinations previously in the bottom bar shall be reachable directly through left panel options.
- `OFFERS.FEED.IMMERSIVE.001-R21`: Preference and settings options shall remain available in the Account destination.
- `OFFERS.FEED.IMMERSIVE.001-R22`: The left menu shall remain static and shall not scroll with offer pages.
- `OFFERS.FEED.IMMERSIVE.001-R23`: The map entry point shall be provided inside the left panel, not as a separate header button.
- `OFFERS.FEED.IMMERSIVE.001-R24`: The immersive feed shall not render header buttons.
- `OFFERS.FEED.IMMERSIVE.001-R25`: Footer navigation destinations shall be presented as options within the left panel.
- `OFFERS.FEED.IMMERSIVE.001-R26`: The left panel shall contain all option buttons directly; no separate menu modal shall be required for immersive feed actions.
- `OFFERS.FEED.IMMERSIVE.001-R27`: The search input shall be presented in the left/top area of the immersive feed.
- `OFFERS.FEED.IMMERSIVE.001-R28`: The left panel shall remain static and shall not be part of offer page scrolling.
- `OFFERS.FEED.IMMERSIVE.001-R29`: The left panel shall use the same surface color as the standard application UI with a wider fixed width.
- `OFFERS.FEED.IMMERSIVE.001-R30`: Each option in the left panel shall display both an icon and a text label.
- `OFFERS.FEED.IMMERSIVE.001-R31`: The left panel shall occupy a dedicated side column; offers shall occupy the remaining screen width rather than rendering under the panel.
- `OFFERS.FEED.IMMERSIVE.001-R32`: The top of the left panel shall display the application logo and application name.
- `OFFERS.FEED.IMMERSIVE.001-R33`: The left panel shall not include language, theme, or navigation-mode toggle buttons; those controls shall remain in the Account destination.
- `OFFERS.FEED.IMMERSIVE.001-R34`: The left panel shall display coverage distance buttons below the search input, using the same radius options as the standard offers view.
- `OFFERS.FEED.IMMERSIVE.001-R35`: Text in the left panel, including the application name, shall use the standard application UI text colors.
- `OFFERS.FEED.IMMERSIVE.001-R36`: Offer images shall be contained within the page; when an image does not fill the width, bars using the page background color shall appear on the left and right so the page background remains fully covered.
- `OFFERS.FEED.IMMERSIVE.001-R37`: When an offer has more than one photo, the immersive feed shall allow changing the displayed photo using left and right keyboard arrow keys, a horizontal swipe gesture over the offer page, and a navigation control with one point per photo, displayed above the offer title and horizontally centered within the offer panel.
- `OFFERS.FEED.IMMERSIVE.001-R48`: A horizontal swipe gesture over the offer page shall change the displayed photo, in both pointer and touch environments.
- `OFFERS.FED.IMMERSIVE.001-R49`: A horizontal swipe gesture over the offer page shall not prevent the user from scrolling vertically between offers.
- `OFFERS.FEED.IMMERSIVE.001-R50`: A swipe that does not exceed the swipe distance threshold shall leave the displayed photo unchanged.
- `OFFERS.FEED.IMMERSIVE.001-R38`: Photo navigation affordances, including the control with one point per photo, shall only be displayed when the offer has more than one photo.
- `OFFERS.FEED.IMMERSIVE.001-R40`: The immersive feed photo carousel shall not display scrollbars.
- `OFFERS.FEED.IMMERSIVE.001-R41`: When an offer has more than one photo, each photo of the carousel shall be rendered as a full-page background occupying the whole page area, matching the framing of a single-photo offer, and shall not be rendered as an empty or collapsed visual.
- `OFFERS.FEED.IMMERSIVE.001-R42`: The left panel shall provide an option to create a new offer, placed as the last option of the left panel, labeled `Create` in English and `Crear` in Spanish, and selecting it shall open the Add Offer view.
- `OFFERS.FEED.IMMERSIVE.001-R43`: The immersive offers view shall be the default offers presentation of the application when it starts with an authenticated session.
- `OFFERS.FEED.IMMERSIVE.001-R44`: The map entry point of the immersive feed shall be labeled `Map mode` in English and `Modo mapa` in Spanish, and selecting it shall open the standard offers view.
- `OFFERS.FEED.IMMERSIVE.001-R45`: The left panel shall not display an application-menu option nor a back control.
- `OFFERS.FEED.IMMERSIVE.001-R51`: The immersive top bar shall be positioned below the device system status area, so that system indicators (battery, signal, and similar) do not overlap its controls.
- `OFFERS.FEED.IMMERSIVE.001-R52`: When an offer has more than one photo, the photo navigation control shall be horizontally centered within the visible offer page area.
- `OFFERS.FEED.IMMERSIVE.001-R53`: Each main navigation option of the immersive feed shall display its icon as a graphical emoji glyph rather than a monochrome text symbol.
- `OFFERS.FEED.IMMERSIVE.001-R54`: The immersive offers view shall use the same font family, font sizes and font weights as the standard application UI for all of its text.
- `OFFERS.FEED.IMMERSIVE.001-R55`: The immersive offers view shall use the same color palette and surface treatment as the standard application UI for its side panel, top bar, footer, controls, status banners and search sheet.
- `OFFERS.FEED.IMMERSIVE.001-R56`: The classic styling of the immersive offers view shall follow the active theme (light, dark or system) in the same way as the standard application UI.
- `OFFERS.FEED.IMMERSIVE.001-R57`: The offer text overlay shall have no surrounding box, border or opaque background, so that the offer image remains unobstructed, while its text shall remain readable over offer images.
- `OFFERS.FEED.IMMERSIVE.001-R58`: Text and labels placed directly over the fixed plum backdrop, including the top-bar title, feed tabs and action captions, shall use light foreground colors that hold contrast in both the light and dark themes.
- `OFFERS.FEED.IMMERSIVE.001-R59`: On wide screens the presentation mode control shall keep a compact width and shall not stretch across the full screen.
- `OFFERS.FEED.IMMERSIVE.001-R60`: While the immersive feed is displayed, the safe-area background and the status-bar treatment shall use the fixed plum presentation so the full-bleed surface is not framed by a light band, in both themes.
- `OFFERS.FEED.IMMERSIVE.001-R61`: At increased text sizes, every offer action in the side rail shall remain visible and independently tappable, with no overlapping labels or clipped controls; decorative captions may be omitted when the controls carry accessible names.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Main page renders as vertical full-screen feed
  Given the user is on the Offers main page
  And offers are available
  When the view loads
  Then each offer shall occupy one full-screen page
  And the user shall be able to move vertically between offers
  And the previous grid layout shall not be used

Scenario: Left side exposes identity and discovery controls
  Given the main page is displayed
  When the user views the left side of the screen
  Then the application name and logo shall be visible
  And search options shall be available
  And entry points for the main navigation destinations shall be available

Scenario: Offer controls remain available in side rail
  Given an offer page is displayed
  When the user views the offer
  Then favorite, directions, availability voting, and report controls shall be available in a vertical side rail on the right
  And the open detail control shall not be available
  And their existing behavior and state shall be preserved

Scenario: Description and tags use more control
  Given an offer page with a long description and tags
  When the page is displayed
  Then the description shall be truncated by default
  And a more control shall reveal the full description and tags
  And after expansion the more control shall disappear
  And no back control shall be provided
  And expanded tags shall be displayed as inline text prefixed with #

Scenario: Offer with multiple photos supports photo navigation
  Given an offer page with more than one photo
  When the user presses the left or right arrow keys or swipes horizontally over the page or uses the photo navigation control
  Then the displayed photo shall change
  And a navigation control with one point per photo shall be available above the offer title, horizontally centered within the visible offer page area
  And no scrollbar shall be displayed

Scenario: Horizontal swipe changes the photo
  Given an offer page with more than one photo
  When the user swipes horizontally over the page
  Then the displayed photo shall change to the adjacent photo
  And the active position indicator shall move accordingly

Scenario: Vertical swipe still scrolls between offers
  Given the user is on the immersive offers view
  When the user swipes vertically over an offer page
  Then the feed shall move to the adjacent offer page

Scenario: Multi-photo offer still allows vertical feed scrolling
  Given an offer page with more than one photo
  And the photo navigation control is displayed
  When the user swipes vertically over that offer page
  Then the feed shall move to the adjacent offer page
  And the displayed photo shall remain unchanged

Scenario: Immersive top bar clears the device status area
  Given the user is on the immersive offers view on a mobile device
  When the top bar is rendered
  Then it shall be positioned below the device system status area
  And its filter tabs and search control shall not overlap the system indicators

Scenario: Immersive navigation icons are emoji glyphs
  Given the user is on the immersive offers view
  When the navigation options are rendered in the footer or the left panel
  Then each option icon shall be displayed as an emoji glyph
  And no option icon shall be rendered as a monochrome text symbol

Scenario: A short swipe does not change the photo
  Given an offer page with more than one photo
  When the user swipes horizontally over the page by less than the swipe distance threshold
  Then the displayed photo shall remain unchanged

Scenario: Offer with one photo hides photo navigation
  Given an offer page with one photo
  When the page is displayed
  Then photo navigation affordances shall not be available

Scenario: Offer with multiple photos renders each photo as a full-page background
  Given an offer page with more than one photo
  When the page is displayed
  Then each photo shall be rendered as a full-page background occupying the whole page area
  And the displayed photo shall not be an empty or collapsed visual

Scenario: Left panel offers a create-offer option as the last option
  Given the user is in the immersive feed
  When the user views the left panel
  Then a create-offer option shall be available as the last option of the left panel
  And the option shall be labeled `Create` in English and `Crear` in Spanish
  And selecting it shall open the Add Offer view

Scenario: Left panel omits the application menu option and the back option
  Given the user is in the immersive feed
  When the user views the left panel
  Then an application-menu option shall not be available
  And a back option shall not be available

Scenario: Map entry point opens the standard offers view
  Given the user is in the immersive feed
  When the user selects the map entry point
  Then the standard offers view shall be displayed
  And the map shall be displayed for the current offers and location context
  And the entry point shall be labeled `Map mode` in English and `Modo mapa` in Spanish

Scenario: Immersive feed is the default offers presentation
  Given the application starts with an authenticated session
  When the first view is displayed
  Then the immersive offers feed shall be displayed

Scenario: User can try the immersive feed from the shared footer
  Given the user is on the standard Offers view
  When the user selects the ⭐ New view button in the footer
  Then the immersive feed view shall open
  And no new-view button shall be displayed in the Offers hero area

Scenario: Immersive view uses the classic application styling
  Given the user is on the immersive offers view
  When the view is rendered
  Then its text shall use the same font family, sizes and weights as the standard application UI
  And its side panel, top bar, footer, controls, status banners and search sheet shall use the same colors and surfaces as the standard application UI
  And the offer text overlay shall have no surrounding box or opaque background and shall remain readable over the image

Scenario: Immersive view follows the active theme
  Given the user is on the immersive offers view
  And the active theme is dark
  When the view is rendered
  Then its surfaces and text shall use the dark theme colors of the standard application UI
  When the active theme changes to light
  Then its surfaces and text shall update to the light theme colors of the standard application UI

Scenario: Footer entry points are consolidated in the immersive controls
  Given the user is on the immersive feed
  When the view loads
  Then no global application header shall be rendered
  And the immersive top bar shall be the only top bar
  And the navigation entry points shall be available in the immersive controls
  And bottom navigation destinations shall be reachable directly through left panel options
  And preference options shall remain available in the Account destination

Scenario: Left menu is static and contains map and navigation destinations
  Given the user is on the immersive feed
  When the user scrolls between offers
  Then the left menu shall remain visible in the same position
  And the map option shall be available inside the menu
  And no header buttons shall be rendered
  And footer navigation destinations shall appear as options inside the menu

Scenario: Left panel contains all options and static search
  Given the user is on the immersive feed
  When the view loads
  Then all option buttons shall be available in the left panel
  And the search input shall be visible in the left/top area
  And the left panel shall not scroll with offer pages

Scenario: Left panel is a static side column with classic surfaces
  Given the user is on the immersive feed
  When the view loads
  Then the left panel shall have the classic application surface background and wider fixed width
  And each option shall show an icon and text label
  And offers shall occupy the remaining screen width beside the panel

Scenario: Left panel header and distance controls
  Given the user is on the immersive feed
  When the view loads
  Then the application logo and name shall be visible at the top of the left panel
  And language, theme, and navigation-mode toggle buttons shall not be present
  And coverage distance buttons shall be visible below the search input

Scenario: Left panel text and contained offer image
  Given the user is on the immersive feed
  When the view loads
  Then left panel text, including the application name, shall use the standard application UI text colors
  And offer images shall be contained within the page
  And bars using the page background color shall fill any remaining horizontal space

Scenario: Empty feed state
  Given no offers are available
  When the main page loads
  Then an empty-state message shall be displayed
```

## Example Inputs/Outputs
- Example input: Offers main page with 5 offers at a `390px` viewport width.
- Expected output: Five full-screen offer pages, each with full-bleed image, left identity/discovery controls, right side-rail controls, and truncated description/tags with a `more` control.

## Edge Cases
- Offers with missing images still render a full-screen page with placeholder visual.
- Very long descriptions remain truncated until expanded.
- Promoted and reported indicators remain visible in the overlay and/or side rail.
- Empty offer result renders empty-state instead of blank feed.
- Devices without a reported safe-area inset still clear the status area using a minimum top offset.
- A vertical swipe over a multi-photo offer scrolls the feed without changing the displayed photo.
- Offer text overlays remain readable over both light and dark offer images while their background stays transparent.
- The new-offer and immersive-view buttons remain on the same row on narrow viewports, with the button labels truncating rather than wrapping.

## Non-Functional Constraints
- Vertical feed scrolling should remain smooth under typical offer counts.
- Layout shall remain usable on small mobile screens.

## Related Specs
- `APP.SHELL.005`
- `OFFERS.LAYOUT.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `OFFERS.SEARCH.001`
- `OFFERS.FEED.PROMOTED.001`
- `OFFERS.IMAGE.RENDERING.001`
- `OFFERS.FAVORITES.001`
- `OFFERS.REPORTED.DEMOTION.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
- `OFFERS.MAP.001`
- `OFFERS.LIST.ITEM.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.NAV.ADD.001`
- `OFFERS.IMMERSIVE.001`
- `APP.SHELL.001`
- `APP.THEME.001`
- `APP.LOCALIZATION.001`
- `OFFERS.COMMENTS.001`
- `OFFERS.UX.001`
- `APP.RESILIENCE.UX.001`
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.MODE.SWITCH.001`
- `OFFERS.NAV.ADD.001`
- `OFFERS.UX.002`