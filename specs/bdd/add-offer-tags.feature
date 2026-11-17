Feature: Manage tags from Add Offer description
  As a user
  I want tags created automatically from the words I type
  So that I can describe my offer without tapping every word

  Scenario: Completed word becomes a tag automatically
    Given the user is typing the description "Fresh coffee"
    When the user types a space after the word "coffee"
    Then the tag "coffee" is added to the tag list without any tap

  Scenario: Final word becomes a tag when editing finishes
    Given the user typed "denims at 50% discount" with the cursor after "discount"
    When the user finishes editing the description
    Then the tag "discount" is added automatically
    And the tag list shows "denims", "50%", and "discount"

  Scenario: Partial words are not tagged while typing
    Given the user is typing the word "discount" one letter at a time
    When the user pauses after "dis" and after "discon"
    Then no tag is created for "dis" or "discon"
    And only the completed word "discount" is created when editing finishes

  Scenario: Self-terminating final word is tagged immediately
    Given the user typed "denims at 50%" without a trailing delimiter
    When the word "50%" is detected
    Then the tag "50%" is created immediately

  Scenario: Detected words already tagged are hidden
    Given the tag list includes "denims"
    And the description is "denims at 50%"
    When the detected words list renders
    Then "denims" does not appear in the detected words list
    And "at" and "50%" still appear

  Scenario: Short words are ignored by automatic tag creation
    Given the user is typing the description "an"
    When the user types a space after the word "an"
    Then no tag is created for "an"

  Scenario: Manual tap still creates a tag
    Given the user is typing the description "Fresh coffee"
    When the user taps the detected word "coffee"
    Then the tag "coffee" is added to the tag list

  Scenario: Tapping whitespace creates no tag
    Given the user is editing a description with spaces
    When the user taps a whitespace character
    Then no tag is created

  Scenario: Percentage tags preserve symbol
    Given the user typed "Everything 50%"
    When the user finishes editing the description
    Then the tag "50%" is added to the tag list

  Scenario: Duplicate tags are prevented
    Given the existing tags include "coffee"
    When the user types "Coffee " in the description
    Then no duplicate tag is created

  Scenario: Removed tag is not recreated automatically
    Given the description "coffee near" produced the tags "coffee" and "near"
    When the user removes the tag "coffee"
    And the user continues typing or finishes editing the description
    Then the tag "coffee" is not recreated automatically

  Scenario: Remove selected tag
    Given the existing tags include "coffee"
    When the user removes the tag "coffee"
    Then the tag list no longer includes "coffee"

  Scenario: Clearing description removes selected tags
    Given the existing tags include "coffee" and "discount"
    When the user clears the description text
    Then the tag list is empty

  Scenario: Save is blocked when description is empty
    Given the existing tags include "coffee"
    And the description is empty or whitespace-only
    When the user presses save
    Then the offer request is not sent
    And a description-required validation error is shown

  Scenario: Save is blocked when no tag is selected
    Given the description is "Fresh coffee near station"
    And the existing tags are empty
    When the user presses save
    Then the offer request is not sent
    And a tag-required validation error is shown
