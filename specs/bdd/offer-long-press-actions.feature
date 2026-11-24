Feature: Offer card long-press actions
  As a user browsing offers
  So that I can reach an offer's actions without finding a small control

  Scenario: Long press opens the offer actions
    Given an offer card is visible in the Offers feed
    When the user presses and holds the card
    Then the offer's existing action surface opens for that offer
    And the normal open-detail action does not also run

  Scenario: Short press keeps the existing behavior
    Given an offer card is visible
    When the user taps the card
    Then the offer detail opens as before

  Scenario: No new menu visuals
    Given a long press has opened the offer actions
    When the action surface is rendered
    Then it uses the existing brand palette, shapes and labels

  Scenario: One gesture opens the actions once
    Given the user begins a long press on a card
    When the gesture completes
    Then the action surface opens exactly once
