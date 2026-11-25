Feature: Immersive feed position stability
  As a deal hunter browsing the full-screen feed
  I want actions to keep me on the offer I am reading
  So that favoriting or voting never throws me to a different offer

  Scenario: Favorite keeps the current offer in view
    Given the immersive feed is on the second offer
    When the user favorites that offer
    And the refreshed results arrive
    Then the feed still displays that offer
    And no visible scroll jump occurs

  Scenario: Vote keeps the current offer in view
    Given the immersive feed is on an offer
    When the user submits an availability vote
    And the refreshed results arrive
    Then the feed still displays that offer

  Scenario: Active offer removed from results
    Given the immersive feed is on an offer
    When a refresh removes that offer from the result set
    Then the feed displays a valid offer without jumping to the top
