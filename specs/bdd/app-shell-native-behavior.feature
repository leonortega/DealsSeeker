Feature: Native navigation behavior with brand chrome
  As a DealsSeeker user
  I want the app to follow my OS navigation behavior
  So that system Back, gestures and insets work while the app still looks like DealsSeeker

  Scenario: Native navigation runs beneath the brand chrome
    Given the authenticated user is on a standard view
    When the user switches between footer destinations
    Then native navigation state and transitions shall handle the switch
    And the branded header and the night footer shall be the only visible navigation surfaces
    And no platform-native header or tab bar shall be visible

  Scenario: Destination state survives a native tab switch
    Given the user has an active offers search query and radius
    When the user switches to another destination and back to Offers
    Then the search query and radius shall be restored

  Scenario: System insets clear the brand chrome
    Given the app runs on a device with system bars, a cutout or gesture areas
    When a standard view is rendered
    Then the branded header and footer shall not be overlapped by system UI
    And the authenticated shell shall apply the platform-reported top safe-area inset
    And their brand styling shall remain unchanged

  Scenario: Reduce Motion changes transitions only
    Given the OS Reduce Motion or Remove animations setting is enabled
    When the user navigates between destinations
    Then native stack and modal transition animations shall be minimized
    And navigation shall avoid large animated movement
    And the branded UI shall render identically to the default motion setting

  Scenario: Native tab state with branded footer
    Given the authenticated user is on the main shell
    When the user switches between sections using the branded footer
    Then the native tab navigator shall own the selected destination state
    And the night footer shall be the only visible tab bar
    And selecting a footer destination shall restore that destination's view state
    And system Back shall follow the native tab back stack

  Scenario: Brand UI is identical across platforms
    Given the same view state on iOS and Android
    When the branded shell is rendered on both platforms
    Then colors, typography, iconography, spacing and layout shall match
    And no platform-specific visual adaptation shall be applied

  Scenario: Add Offer opens with native modal behavior
    Given the authenticated user is on a standard view
    When the user opens Add Offer
    Then platform-native modal behavior shall be used
    And the Add Offer content shall render with unchanged brand styling

  Scenario: Platform dismissal with no unsaved edits
    Given the Add Offer draft has no unsaved edits
    When the user invokes a platform dismissal gesture
    Then the modal shall close and the previous view shall be shown
    And the previous view state shall be preserved

  Scenario: Platform dismissal with unsaved edits
    Given the Add Offer draft has unsaved edits
    When the user invokes a platform dismissal gesture or system back
    Then the discard confirmation shall be shown
    And no draft data shall be discarded before confirmation

  Scenario: Favorites uses native stack behavior
    Given the authenticated user opens Favorites
    When the user closes Favorites with system back
    Then native pop behavior shall return to the previous view
    And brand chrome shall remain visible

  Scenario: No foreign close control appears in the brand UI
    Given an overlay destination is open
    When the modal content is rendered
    Then no platform-native close button shall be drawn inside the brand-styled content

  Scenario: Back with no previous in-app destination
    Given the user is on the first view after launch
    When the user invokes system Back
    Then the application shall leave the foreground using platform default behavior

  Scenario: Back returns to the previously visited destination
    Given the user moved from Offers to Suggestions
    When the user invokes system Back
    Then Offers shall become visible with its search query and radius preserved
    And the application shall remain open

  Scenario: Back from the immersive feed destination
    Given the user opened My Account from the immersive offers feed
    When the user invokes system Back
    Then the immersive offers feed shall become visible again

  Scenario: Back from Add Offer with unsaved edits
    Given the Add Offer draft has unsaved edits
    When the user invokes system Back
    Then the discard confirmation shall be shown
    And the draft shall remain until the user confirms

  Scenario: Back adds no visible control
    Given the user is on any destination
    When system Back handling is active
    Then no in-app back button or arrow shall be displayed

  Scenario: Back during an in-progress save
    Given an Add Offer save request is in progress
    When the user invokes system Back
    Then the request shall resolve before the shell reacts
    And the Back action shall not be applied twice
