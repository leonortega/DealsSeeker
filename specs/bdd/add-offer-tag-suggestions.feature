Feature: Tag suggestions in Add Offer view
  As a user
  I want optional tag suggestions while creating offers
  So that I can improve discoverability without losing control

  Scenario: Suggest tags from fuzzy and synonym dictionaries
    Given the user selected the tag "coffee"
    And multilingual suggestion dictionaries are available
    When the suggestion engine runs
    Then the user sees optional chips with similar and related tags
    And the user can remove any suggested tag before submission

  Scenario: Suggestions are optional and non-blocking
    Given suggestion services are unavailable
    When the user manually adds tags
    Then the user can still submit the offer
    And no blocking error is raised by the suggestions feature
