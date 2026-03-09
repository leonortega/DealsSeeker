Feature: Directions travel mode preference
  As a user
  I want offer directions to match my preferred travel mode
  So that navigation launches the right type of route

  Scenario: Default directions mode is pedestrian
    Given no manual directions mode override exists
    When the user opens an offer detail with directions available
    Then the directions action uses pedestrian mode
    And the directions button text reflects pedestrian directions

  Scenario: User changes directions mode to car
    Given directions mode is currently pedestrian
    When the user selects car mode in user preferences
    Then directions mode persists for that user
    And offer directions use car mode
    And the offer detail directions button text reflects car directions
