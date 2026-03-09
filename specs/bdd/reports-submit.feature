Feature: Reports generic submission flow
  As an authenticated user
  I want to submit reports from the Reports section
  So that I can flag issues even when not starting from a specific offer

  Scenario: Authenticated user submits a generic report
    Given the user is authenticated
    And the user opens Reports directly without offer context
    When the user submits a non-empty report message
    Then no offer preview is required
    And the report payload includes message, authenticated userId, and report date/time
    And the app redirects to Offers after a successful response

  Scenario: Unauthenticated user opens Reports
    Given the user is not authenticated
    When the user opens Reports
    Then the Login view is shown

  Scenario: Legacy Complaints entry uses the same report flow
    Given the user is authenticated
    When the user opens the legacy Complaints entry point
    Then the Reports submission flow is shown
    And submitting a valid report uses the same behavior as Reports
