Feature: Offer list item content and actions
  As a user
  I want complete offer cards with clear actions
  So that I can evaluate and report offer status

  Scenario: Offer list item shows required content
    Given an offer with image, description, highlighted keywords, and tags exists
    When the offer item is rendered in the list
    Then the image is visible
    And the short description is visible
    And keywords are highlighted in the description
    And tags are shown below the description
    And distance in meters from current location is shown

  Scenario: Offer list item shows required action buttons
    Given an offer item is visible in the list
    When the action area is rendered
    Then Available? label is visible
    And thumbs up with positive counter is visible
    And thumbs down with negative counter is visible
    And Report is visible

  Scenario: User can vote only once per offer
    Given the user already voted thumbs up for the displayed offer
    When the same user taps thumbs down for the same offer
    Then the second vote is rejected
    And the counters remain unchanged by the rejected vote

  Scenario: Availability buttons are disabled after user already voted
    Given the user already voted for the displayed offer
    When the offer item action area is rendered
    Then thumbs up with positive counter is visible
    And thumbs down with negative counter is visible
    And both availability buttons are disabled for the user

  Scenario: Availability buttons are enabled when user has not voted
    Given the user has not voted for the displayed offer
    When the offer item action area is rendered
    Then thumbs up with positive counter is visible
    And thumbs down with negative counter is visible
    And both availability buttons are enabled for the user

  Scenario: Selecting offer item opens configured directions
    Given an offer item has a valid location
    When the user selects the offer item destination action
    Then directions open for that location
    And the configured travel mode is selected

  Scenario: Row actions match the canonical vocabulary
    Given the same offer appears in the list, in the feed and in favorites
    When each row's action area is rendered
    Then the same labels, glyphs and relative order are used on every surface
    And any overflow sits behind a single control labelled More

  Scenario: Inline action does not force navigation
    Given an offer row is displayed in the feed
    When the user completes an inline availability vote
    Then the feed stays on the current destination
    And the row remains visible until the user explicitly navigates or closes it
