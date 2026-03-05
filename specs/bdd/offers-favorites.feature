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
