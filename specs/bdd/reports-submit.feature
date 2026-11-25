Feature: Offer-scoped report submission
  As a community contributor
  I want to report a problem with a specific offer
  So that the report is always tied to the right offer

  Scenario: Authenticated user reports an offer
    Given the user is authenticated
    And the user selects Report on an offer
    When the report overlay opens and the user submits a non-empty message
    Then the offer preview is displayed
    And the payload includes message, offer identifier, authenticated userId, and report date/time
    And after a successful response the system closes the overlay and redirects to Offers

  Scenario: No standalone Reports entry point
    Given the shared footer is displayed
    When the user views its destinations
    Then no Reports destination is present

  Scenario: Unauthenticated user selects Report
    Given the user is not authenticated
    When the user selects Report on an offer
    Then the Login view is displayed
