Feature: Search offers in Offers view
  As a user
  I want to search offers by query text and distance radius
  So that I can quickly find relevant deals near me

  Scenario: Search query filters list and map markers
    Given active offers exist with searchable terms including "coffee"
    And businesses are visible on the Offers map
    When the user searches for "coffee"
    Then only offers with matching terms are shown in the list
    And only businesses with matching active offers are shown as markers

  Scenario: Clearing query resets all results
    Given the user previously filtered offers with a search query
    When the user clears the query
    Then the full active offer set is shown
    And markers reflect the full active offer set

  Scenario: No matches returns empty state
    Given active offers exist
    When the user searches for "nonexistentterm"
    Then no offers are shown
    And no business markers are shown

  Scenario: Offers location text uses address labels
    Given the Offers view has a resolved current location context
    When the map and header location context are rendered
    Then the user sees a human-readable address label
    And raw latitude and longitude values are not shown in UI text

  Scenario: Coverage radius change with active query triggers search refresh
    Given the user entered a non-empty search query
    And current search results are shown
    When the user changes the coverage radius value
    Then the app executes search again using the same query and new radius
    And the offer list is refreshed
    And map markers are refreshed
    And map zoom is adjusted to show the selected coverage radius

  Scenario: Coverage radius change without query triggers distance-only refresh
    Given the search textbox is empty
    And current search results are shown
    When the user changes the coverage radius value
    Then the app executes search again using distance filtering only
    And the offer list is refreshed
    And map markers are refreshed
    And map zoom is adjusted to show the selected coverage radius

  Scenario: Marker selection is delivered directly by the native map
    Given the Offers map is rendered by the native map view
    When the user selects a business marker
    Then the selection is delivered directly to the Offers view
    And directions open for that marker
    And the Offers view continues operating without a runtime error

  Scenario: No alternate renderer or provider switch is shown
    Given the Offers map presentation is selected
    When the user inspects the map and navigation controls
    Then no map renderer option is available
    And no redirect provider option is available

  Scenario: Required location/search loading blocks Offers interactions
    Given the Offers view is resolving current location or executing search
    When the request is still loading
    Then an animated loading overlay is shown
    And interactions with map and offer controls are blocked
    And when loading completes the overlay is hidden

  Scenario: Search query stops at its contract maximum
    Given the standard or immersive search input is displayed
    When the user pastes 250 characters into the search input
    Then the input holds exactly 200 characters

  Scenario: Immersive search sheet keeps input and action above the keyboard
    Given the immersive search sheet is open
    And the on-screen keyboard is open
    When the search input is focused
    Then the input and the primary search action remain visible above the keyboard
    And taps on visible sheet controls reach those controls

  Scenario: Coverage radius is shown in plain language
    Given a coverage radius is selected
    When the radius is displayed in the Offers view
    Then it shall be shown as a human-readable distance in the active language
    And no raw coordinate or internal identifier shall be shown

  Scenario: Reuse a recent search
    Given the user previously executed a successful search for "coffee"
    And recent searches are displayed
    When the user selects that recent search
    Then the query control shall be populated with "coffee"
    And the same search shall be executed

  Scenario: Reuse a saved radius and filter preset
    Given the user saved a preset with a 2500 m coverage radius
    And saved presets are displayed
    When the user selects the preset
    Then the radius control shall show 2500 m
    And offers shall be searched with that radius

  Scenario: Recent searches do not replace typed input
    Given recent searches and presets are displayed
    When the user types a new query instead of selecting one
    Then the typed query shall be used for the search
    And no recent entry shall be applied

  Scenario: Search field and chips follow Material 3 patterns
    Given the user is on Offers view with recent searches and presets displayed
    When the search controls are rendered
    Then the search field shall follow a Material 3 search-field pattern
    And recent searches and presets shall follow a Material 3 chip pattern with the same behavior

  Scenario: Search pattern keeps the input cap and plain-language radius
    Given the search field and a coverage radius control are displayed
    When the user enters text or changes the radius
    Then the 200-character cap shall still apply
    And the radius shall remain a human-readable distance with no raw coordinate or identifier shown

  Scenario: Long localized chip labels keep controls usable
    Given recent-search chip labels are longer than the source text at large text scaling
    When the search controls are rendered
    Then the chips shall stay within the search pattern without hiding the input or action
    And the input and primary search action shall remain visible above the keyboard

  Scenario: Coverage options use Material 3 selection controls
    Given the Offers coverage controls are displayed
    When the distance options are rendered
    Then each option uses a Material 3 radio/selection control
    And no authored-view exception keeps a custom option in its place

  Scenario: Coverage selection announces its exact selected state
    Given the coverage options include a currently selected distance
    When assistive technology reads the options
    Then the group is exposed as a labelled mutually exclusive selection
    And the selected option announces its selected state
    And every other option announces an unselected state

  Scenario: Coverage controls keep the touch floor at 200 percent font scale
    Given the Android font scale is set to 200 percent
    And a coverage distance label is longer than the source text
    When the selection controls are rendered
    Then each option keeps a 48 by 48 dp target
    And the label reflows without covering another option
    And no raw coordinate is announced
