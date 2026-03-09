Feature: Tag suggestions in Add Offer view
  As a user
  I want optional tag suggestions while creating offers
  So that I can improve discoverability without losing control

  Scenario: Suggest related tags from the selected tag list
    Given the user selected the tag "coffee"
    And multilingual suggestion dictionaries are available
    When the suggestion engine runs
    Then the user sees optional chips with related tags such as "cafe" and "espresso"
    And the selected tag list does not change until a suggested chip is tapped

  Scenario: Suggest singular form from plural selected tag
    Given the user selected the tag "offers"
    When the suggestion engine runs
    Then the user sees the related tag "offer"

  Scenario: Suggestions are optional and non-blocking
    Given the user has not selected any tags yet
    When the Add Offer tag section loads
    Then the Suggested Tags section remains visible
    And the user sees guidance to select a tag first

  Scenario: Clearing description removes suggestions
    Given the user selected the tag "coffee"
    And the Suggested Tags section shows related tags
    When the user clears the description text
    Then the selected tag list is empty
    And the Suggested Tags section shows no related tags
