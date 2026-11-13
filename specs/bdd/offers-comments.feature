Feature: Offer comments
  As an authenticated user
  I want to read and publish comments on an offer
  So that I can share timely plain-text information about the deal

  Scenario: Comments action is available in the immersive offer panel
    Given an authenticated user views an offer in the immersive feed
    When the user inspects the offer action panel
    Then a comments action shall be available above the favorite action

  Scenario: Comments action is available in the offer detail view
    Given an authenticated user opens an offer in the offer detail view
    When the user inspects the offer actions
    Then a comments action shall be available after the directions action

  Scenario: Comments action is available in the offer list card
    Given an authenticated user views an offer card in the offers list
    When the user inspects the card actions
    Then a comments action shall be available after the favorite action and the directions action

  Scenario: User opens the comments section
    Given an authenticated user views an offer
    When the user selects the comments action
    Then the comments section for that offer shall be shown
    And each existing comment shall show the author name, author avatar, body, and timestamp

  Scenario: User publishes a comment
    Given an authenticated user has the comments section open for an offer
    When the user types a comment body and publishes it
    Then the comment shall be saved for that user and offer
    And the comment shall be shown in the comments list

  Scenario: User publishes an empty comment
    Given an authenticated user has the comments section open for an offer
    When the user publishes without entering a body
    Then the comment shall not be published
    And the comments section shall show a recoverable validation state

  Scenario: Offer has no comments
    Given an authenticated user opens the comments section for an offer without comments
    Then the comments section shall show a non-error empty state

  Scenario: Comments fail to load
    Given an authenticated user opens the comments section for an offer
    And comments cannot be loaded
    Then the comments section shall show a recoverable error state

  Scenario: Immersive comments action matches the classic view styling
    Given an authenticated user views an offer in the immersive feed
    When the user inspects the offer action panel
    Then the comments action shall use the same colors and button styling as the offer actions of the classic offers view
