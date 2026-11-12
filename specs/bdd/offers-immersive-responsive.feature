Feature: Immersive feed responsive presentation
  As a user
  I want the immersive offers feed to adapt to my device size
  So that browsing feels natural on mobile and on desktop

  Scenario: Narrow viewport uses a bottom footer instead of the side panel
    Given the user is on the immersive offers view
    And the viewport is narrow
    When the view is rendered
    Then the fixed left side panel is not displayed
    And a bottom footer bar is displayed
    And the footer offers map mode, favorites, account, suggestions, reports, and create options in that order

  Scenario: Narrow viewport search is an icon that opens a search overlay
    Given the user is on the immersive offers view
    And the viewport is narrow
    When the user views the top bar
    Then a search icon control is displayed
    And no inline search input is displayed
    When the user selects the search icon control
    Then a search overlay opens
    And the overlay contains the search input and the coverage distance buttons

  Scenario: Search overlay applies or cancels the search
    Given the user is on the immersive offers view
    And the search overlay is open
    When the user selects the search action
    Then the entered query is applied
    And the overlay closes
    When the user selects the cancel action
    Then the overlay closes without applying the entered query

  Scenario: Bottom footer does not cover offer content
    Given the user is on the immersive offers view
    And the viewport is narrow
    When an offer page is displayed
    Then the offer description overlay is displayed above the bottom footer bar
    And the photo navigation control is displayed above the bottom footer bar
    And the offer action controls are displayed above the bottom footer bar

  Scenario: Offer action controls are icons on every viewport size
    Given the user is on the immersive offers view
    When an offer page is displayed
    Then the right side rail presents favorite, directions, availability voting, and report as icons
    And each icon control exposes an accessible text label
    And each availability vote icon displays its vote count

  Scenario: Wide viewport shows a text caption under each offer action icon
    Given the user is on the immersive offers view
    And the viewport is wide
    When an offer page is displayed
    Then each right side rail icon displays a text caption below it
    And the captions are `favorite` / `Favorito`, `directions` / `¿Cómo llegar?`, `available` / `Sí existe`, `removed` / `No existe`, and `report` / `Reportar`

  Scenario: Narrow viewport shows offer action icons without captions
    Given the user is on the immersive offers view
    And the viewport is narrow
    When an offer page is displayed
    Then the right side rail icons do not display text captions

  Scenario: Narrow viewport photo navigation sits below the top bar
    Given the user is on the immersive offers view
    And the viewport is narrow
    And the offer has more than one photo
    When the offer page is displayed
    Then the photo navigation control is displayed below the top bar
    And a visible gap separates it from the top bar

  Scenario: Wide viewport keeps the side panel
    Given the user is on the immersive offers view
    And the viewport is wide
    When the view is rendered
    Then the fixed left side panel is displayed
    And the panel contains the search input, the coverage distance buttons, and the navigation options
