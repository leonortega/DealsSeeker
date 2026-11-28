Feature: Searchable help topics
  As a deal hunter who does not know the app's wording
  I want to search help by describing my task
  So that I find the right guidance without leaving where I am

  Scenario: A topic is found by task wording
    Given the help surface is open with all five topics
    When the user enters a term describing a task they want to do
    Then the matching topic is displayed in place
    And the user remains on the same help surface

  Scenario: A partial or differently cased term still matches
    Given the help surface is open with all five topics
    When the user enters only part of a topic title or summary in a different letter case
    Then the matching topic is still displayed

  Scenario: No match offers a clear action
    Given the user entered a term that matches no topic
    When the no-match state is displayed
    Then a plain-language message states that no topic was found
    And a clear action is available to clear the term and show all topics

  Scenario: Clearing restores all topics and contextual ordering
    Given help was opened contextually with a relevant topic first
    And the user entered a term that reordered the topics
    When the user clears the term
    Then all five topics are shown again
    And the relevant topic is first again
    And no topic was added or removed

  Scenario: Search preserves the invoking context
    Given the user opened help from a context with a draft or an active query
    When the user searches within the help surface
    Then the draft, query, filter, selected offer and sign-in prompt are unchanged
    And no action is submitted

  Scenario: Search is announced, localized and privacy-safe
    Given Spanish is active and assistive technology is enabled
    When the user searches and the results are displayed
    Then the entry point and results are announced
    And text remains readable at 200 percent scaling
    And no raw latitude or longitude value is shown
