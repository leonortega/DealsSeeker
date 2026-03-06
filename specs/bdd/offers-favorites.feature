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
    Then walking directions open for that location

  Scenario: Unauthenticated user opens My Favorites
    Given the user is not authenticated
    When the user opens My Favorites
    Then the Login view is shown
