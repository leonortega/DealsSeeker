# Spec: `OFFERS.FEED.RESPONSIVE.001`

## Metadata
- **Title**: Immersive Feed Responsive Presentation
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (Immersive)
- **Priority**: High

## Purpose
Define how the immersive offers feed adapts its presentation to the available viewport, so that on narrow (mobile) viewports the navigation options become a bottom footer, search becomes an icon that opens a search overlay, and the offer action controls become icons.

## Preconditions
- User is authenticated and the immersive offers view is open.
- The viewport width is either narrow (mobile) or wide (desktop/web).

## Trigger
- The immersive offers view is rendered or the viewport size changes.

## Requirements
- `OFFERS.FEED.RESPONSIVE.001-R1`: The immersive offers view shall adapt its presentation to the available viewport width.
- `OFFERS.FEED.RESPONSIVE.001-R2`: On a narrow viewport, the immersive offers view shall not render the fixed left side panel.
- `OFFERS.FEED.RESPONSIVE.001-R3`: On a narrow viewport, the navigation options shall be presented in a bottom footer bar.
- `OFFERS.FEED.RESPONSIVE.001-R4`: The bottom footer bar shall present the same options as the side panel, in the same order: map mode, favorites, account, suggestions, reports, create.
- `OFFERS.FEED.RESPONSIVE.001-R5`: On a narrow viewport, each footer option shall be presented as an icon with a short text label, and shall expose an accessible full label.
- `OFFERS.FEED.RESPONSIVE.001-R6`: On a narrow viewport, the search input shall not be displayed inline; a search icon control shall be displayed in the top bar.
- `OFFERS.FEED.RESPONSIVE.001-R7`: Selecting the search icon control shall open a search overlay containing the search input and the coverage distance buttons.
- `OFFERS.FEED.RESPONSIVE.001-R8`: The search overlay shall provide a search action that applies the entered query, and a cancel action that closes the overlay without applying the query.
- `OFFERS.FEED.RESPONSIVE.001-R9`: On a narrow viewport, the offer description overlay, the photo navigation control, and the offer action controls shall be displayed above the bottom footer bar and shall not be covered by it.
- `OFFERS.FEED.RESPONSIVE.001-R10`: The offer action controls in the right side rail shall be presented as icons on every viewport size.
- `OFFERS.FEED.RESPONSIVE.001-R11`: Every icon-only offer action control shall expose an accessible text label describing its action.
- `OFFERS.FEED.RESPONSIVE.001-R12`: The availability vote icon controls shall display the corresponding vote count below the icon.
- `OFFERS.FEED.RESPONSIVE.001-R13`: On a wide viewport, the left side panel shall continue to display the search input, the coverage distance buttons, and the navigation options.
- `OFFERS.FEED.RESPONSIVE.001-R14`: The responsive presentation shall not change the behavior of any navigation or offer action control.
- `OFFERS.FEED.RESPONSIVE.001-R15`: On a wide viewport, each offer action control in the right side rail shall display a text caption below its icon, using the labels `favorite` / `Favorito`, `directions` / `¿Cómo llegar?`, `available` / `Sí existe`, `removed` / `No existe`, and `report` / `Reportar`.
- `OFFERS.FEED.RESPONSIVE.001-R16`: On a narrow viewport, the offer action controls in the right side rail shall display icons only, without text captions.
- `OFFERS.FEED.RESPONSIVE.001-R17`: On every viewport size, the photo navigation control shall be displayed above the offer title, and shall be horizontally centered within the offer panel.
- `OFFERS.FEED.RESPONSIVE.001-R18`: On every viewport size, the offer text overlay shall reserve space for the promoted and reported marks, so that they remain readable.
- `OFFERS.FEED.RESPONSIVE.001-R19`: On every viewport size, the offer title shall use a reduced font size.
- `OFFERS.FEED.RESPONSIVE.001-R20`: On a wide viewport, the photo navigation control shall display previous and next arrow controls in addition to the photo position indicators.
- `OFFERS.FEED.RESPONSIVE.001-R21`: On a narrow viewport, the photo navigation control shall display only the photo position indicators, without arrow controls.
- `OFFERS.FEED.RESPONSIVE.001-R22`: On every viewport size, a horizontal swipe over the offer page shall change the displayed photo, and the swipe direction shall determine the adjacent photo.
- `OFFERS.FEED.RESPONSIVE.001-R22`: On a narrow viewport, the immersive offers view shall not render an application header; the application identity icon and the search icon shall be displayed floating over the offer image, without the application name text.
- `OFFERS.FEED.RESPONSIVE.001-R23`: On a wide viewport, the application identity and application name shall remain in the left side panel.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Narrow viewport uses a bottom footer instead of the side panel
  Given the user is on the immersive offers view
  And the viewport is narrow
  When the view is rendered
  Then the fixed left side panel shall not be displayed
  And a bottom footer bar shall be displayed
  And the footer shall offer map mode, favorites, account, suggestions, reports, and create options in that order

Scenario: Narrow viewport search is an icon that opens a search overlay
  Given the user is on the immersive offers view
  And the viewport is narrow
  When the user views the top bar
  Then a search icon control shall be displayed
  And no inline search input shall be displayed
  When the user selects the search icon control
  Then a search overlay shall open
  And the overlay shall contain the search input and the coverage distance buttons

Scenario: Search overlay applies or cancels the search
  Given the user is on the immersive offers view
  And the search overlay is open
  When the user selects the search action
  Then the entered query shall be applied
  And the overlay shall close
  When the user selects the cancel action
  Then the overlay shall close without applying the entered query

Scenario: Bottom footer does not cover offer content
  Given the user is on the immersive offers view
  And the viewport is narrow
  When an offer page is displayed
  Then the offer description overlay shall be displayed above the bottom footer bar
  And the photo navigation control shall be displayed above the bottom footer bar

Scenario: Offer action controls are icons on every viewport size
  Given the user is on the immersive offers view
  When an offer page is displayed
  Then the right side rail shall present favorite, directions, availability voting, and report as icons
  And each icon control shall expose an accessible text label
  And each availability vote icon shall display its vote count

Scenario: Wide viewport shows a text caption under each offer action icon
  Given the user is on the immersive offers view
  And the viewport is wide
  When an offer page is displayed
  Then each right side rail icon shall display a text caption below it
  And the captions shall be `favorite` / `Favorito`, `directions` / `¿Cómo llegar?`, `available` / `Sí existe`, `removed` / `No existe`, and `report` / `Reportar`

Scenario: Narrow viewport shows offer action icons without captions
  Given the user is on the immersive offers view
  And the viewport is narrow
  When an offer page is displayed
  Then the right side rail icons shall not display text captions

Scenario: Narrow viewport photo navigation sits above the offer title
  Given the user is on the immersive offers view
  And the viewport is narrow
  And the offer has more than one photo
  When the offer page is displayed
  Then the photo navigation control shall be displayed above the offer title
  And the control shall be horizontally centered within the offer panel
  And the control shall display only the photo position indicators
  And no arrow controls shall be displayed

Scenario: Wide viewport photo navigation shows arrows above the offer title
  Given the user is on the immersive offers view
  And the viewport is wide
  And the offer has more than one photo
  When the offer page is displayed
  Then the photo navigation control shall be displayed above the offer title
  And the control shall be horizontally centered within the offer panel
  And the control shall display previous and next arrow controls

Scenario: Narrow viewport has no application header over the offer image
  Given the user is on the immersive offers view
  And the viewport is narrow
  When the view is rendered
  Then no application header shall be displayed
  And the application identity icon and the search icon shall be displayed floating over the offer image
  And the application name text shall not be displayed

Scenario: Wide viewport keeps the application identity in the side panel
  Given the user is on the immersive offers view
  And the viewport is wide
  When the view is rendered
  Then the left side panel shall display the application identity icon and the application name

Scenario: Horizontal swipe changes the photo on every viewport size
  Given the user is on the immersive offers view
  And the offer has more than one photo
  When the user swipes horizontally over the offer page
  Then the displayed photo shall change to the adjacent photo
  And the direction of the swipe shall determine which photo is shown

Scenario: Offer text overlay reserves space for the promoted mark
  Given the user is on the immersive offers view
  And the offer is promoted
  When the offer page is displayed
  Then the promoted mark shall be visible and readable
  And the photo navigation control shall not overlap it

Scenario: Wide viewport keeps the side panel
  Given the user is on the immersive offers view
  And the viewport is wide
  When the view is rendered
  Then the fixed left side panel shall be displayed
  And the panel shall contain the search input, the coverage distance buttons, and the navigation options
```

## Example Inputs/Outputs
- Example input: Immersive feed rendered at a `390px` viewport width.
- Expected output: Full-screen feed without a side panel, a top bar with a search icon, a bottom footer with the six navigation options, and icon-based offer action controls.
- Example input: Immersive feed rendered at a `1280px` viewport width.
- Expected output: Full-screen feed with the fixed black side panel and icon-based offer action controls.

## Edge Cases
- Rotating or resizing the device switches between the narrow and wide presentations without losing the current search, radius, or feed position.
- The search overlay remains usable when the feed has no offers to show.
- A long footer label is truncated to one line instead of wrapping.
- The footer bar does not intercept vertical feed swipes performed outside the option controls.

## Non-Functional Constraints
- The responsive presentation shall remain smooth on small mobile screens.
- Icon controls shall remain reachable with a comfortable touch target size.

## Related Specs
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.IMMERSIVE.001`
- `OFFERS.LAYOUT.001`
- `OFFERS.SEARCH.001`
- `OFFERS.LIST.ACTIONS.001`
- `APP.SHELL.001`
