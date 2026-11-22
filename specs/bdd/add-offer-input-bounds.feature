Feature: Bounded text input in Add Offer view
  As a community contributor
  I want text fields bounded and their limits disclosed
  So that a long paste cannot break the form or create an oversized request

  Scenario: Description input discloses and enforces its bound
    Given the user opens Add Offer view
    When the description section renders
    Then a hint states the maximum number of characters
    And the description input accepts no more than 500 characters

  Scenario: Location search input is bounded
    Given the user is typing in the location search input
    Then the input accepts no more than 120 characters

  Scenario: Bounds apply to a prefilled edit draft
    Given the user opens Add Offer view in edit mode for a user-owned offer
    When the prefilled description is shown
    Then the same character bound applies to further typing
