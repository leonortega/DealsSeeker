Feature: Recycled offer lists
  As a user browsing many nearby offers
  I want the list to stay smooth
  So that I can scroll to any offer without jank

  Scenario: Long offer collections recycle rows
    Given a collection with more offers than fit on screen
    When the collection view is displayed
    Then rows are rendered through a recycling list
    And all offers remain reachable by scrolling

  Scenario: Row order and identity stay stable
    Given a collection of offers
    When the collection is rendered or updated
    Then rows keep their order and stable identity
    And adding or removing one row does not alter the others

  Scenario: Headers and empty states remain in place
    Given a collection that is empty or has results
    When the view is displayed
    Then its header and status content appear in the scrolling content
    And all primary actions remain reachable
