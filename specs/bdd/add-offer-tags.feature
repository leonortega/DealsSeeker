Feature: Manage tags from Add Offer description
  As a user
  I want to create and edit tags
  So that my offer is discoverable

  Scenario: Create tag by long-pressing a description word
    Given the user is editing the description "Fresh coffee near station"
    When the user long-presses the word "coffee" for 2 seconds
    Then the tag "coffee" is added to the tag list

  Scenario: Long-press on whitespace creates no tag
    Given the user is editing a description with spaces
    When the user long-presses a whitespace character for 2 seconds
    Then no tag is created

  Scenario: Duplicate tags are prevented
    Given the existing tags include "coffee"
    When the user long-presses "Coffee" for 2 seconds
    Then no duplicate tag is created

