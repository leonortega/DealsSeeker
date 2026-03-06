Feature: Manage tags from Add Offer description
  As a user
  I want to create and edit tags
  So that my offer is discoverable

  Scenario: Create tag by tapping a detected description word
    Given the user is editing the description "Fresh coffee near station"
    When the user taps the detected word "coffee"
    Then the tag "coffee" is added to the tag list

  Scenario: Tapping whitespace creates no tag
    Given the user is editing a description with spaces
    When the user taps a whitespace character
    Then no tag is created

  Scenario: Percentage tags preserve symbol
    Given the user is editing the description "Everything 50% off today"
    When the user taps the detected word "50%"
    Then the tag "50%" is added to the tag list

  Scenario: Duplicate tags are prevented
    Given the existing tags include "coffee"
    When the user taps the detected word "Coffee"
    Then no duplicate tag is created

  Scenario: Remove selected tag
    Given the existing tags include "coffee"
    When the user removes the tag "coffee"
    Then the tag list no longer includes "coffee"

  Scenario: Clearing description removes selected tags
    Given the existing tags include "coffee" and "discount"
    When the user clears the description text
    Then the tag list is empty
