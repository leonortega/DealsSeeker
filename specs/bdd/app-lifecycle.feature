Feature: Application lifecycle behavior
  As a user of the mobile application
  So that my work is not lost when the operating system suspends or resumes the app

  Scenario: Background and restore a search
    Given the user is on Offers with a query and a coverage radius
    When the application is moved to the background and then returned to the foreground
    Then Offers shall be visible again
    And the query and radius shall be restored

  Scenario: Background with an unsaved draft
    Given the user has entered an unsaved Add Offer draft
    When the application is moved to the background and returned
    Then the draft content shall still be present
    And discarding the draft shall still require confirmation

  Scenario: Return after the session is no longer valid
    Given the application was backgrounded with a valid session
    And the session is no longer valid on return
    When the application returns to the foreground
    Then an authentication view shall be shown
    And a clear message shall explain why
    And no stale protected view shall be displayed

  Scenario: In-flight request across a lifecycle transition
    Given a save request is in progress
    When the application is backgrounded and returned before the request resolves
    Then the request shall be handled exactly once
    And the result shall not be applied twice
