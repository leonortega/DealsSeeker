Feature: Offer favorites and My Favorites section
  As an authenticated user
  I want to save offers and review them later
  So that I can quickly return to preferred deals

  Scenario: Favorite toggle updates saved state
    Given an authenticated user sees an offer card
    When the user taps the favorite toggle
    Then the offer is marked as saved for that user
    And saved state persists after app relaunch

  Scenario: My Favorites lists only saved offers
    Given an authenticated user has saved at least one offer
    When the user opens My Favorites
    Then all saved offers are listed
    And unsaved offers are not listed

  Scenario: User removes a saved offer from My Favorites
    Given an authenticated user is on My Favorites
    And a saved offer is listed
    When the user taps remove favorite for that offer
    Then the offer is removed from the saved set
    And the offer no longer appears in My Favorites

  Scenario: User opens directions from My Favorites
    Given an authenticated user is on My Favorites
    And a saved offer has a valid location
    When the user taps directions for that offer
    Then directions open for that location using the configured travel mode

  Scenario: Unauthenticated user opens My Favorites
    Given the user is not authenticated
    When the user opens My Favorites
    Then the Login view is shown

  Scenario: My Favorites never searches with a fabricated coordinate
    Given the user opens My Favorites
    And device location is unavailable and no explicit override exists
    When the favorites list loads
    Then no offer search is executed with a substitute coordinate
    And the location-unavailable state is displayed

  Scenario: Removing a favorite offers undo in My Favorites
    Given an authenticated user is on My Favorites
    And a saved offer is listed
    When the user taps remove favorite for that offer
    Then the success message shall present one undo action
    And selecting undo shall restore the offer to the saved set and to its previous position

  Scenario: Removal without undo stands after the dwell
    Given a removal success message with an undo action is displayed
    When the dwell elapses without undo being selected
    Then the undo action shall disappear with the message
    And the offer shall remain removed

  Scenario: My Favorites actions expose canonical labels and states
    Given a saved offer is listed in My Favorites
    When assistive technology traverses that item
    Then the removal and directions actions shall announce the canonical names, roles and states
    And no surface-specific announced value shall be used

  Scenario: Favorite state is announced consistently after undo
    Given a favorite removal was undone from My Favorites
    When the restored offer is rendered on a card and in My Favorites
    Then the favorite action shall announce the same saved state on both surfaces

  Scenario: Favorite cards and list rows use Material 3 patterns
    Given an authenticated user sees an offer card and opens My Favorites
    When the card and the favorites list are rendered
    Then they shall follow Material 3 card and list-row patterns with a consistent structure
    And each action shall keep its announced name, role and state

  Scenario: Favorite suggestion chips follow a chip pattern without blocking browsing
    Given favorite suggestions are shown as chips
    When the user browses or searches the offers feed
    Then the chips shall follow a Material 3 chip pattern
    And they shall not block browsing or search flows

  Scenario: Long localized action labels keep card and row actions usable
    Given a saved offer has localized action labels longer than one word at large text scaling
    When the card and the favorites row are rendered
    Then the actions shall stay within their Material 3 patterns and remain tappable
    And no raw coordinate value shall be shown
