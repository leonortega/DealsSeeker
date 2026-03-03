Feature: Prefilled report flow from offer item
  As an authenticated user
  I want report action on an offer to open Reports with prefilled context
  So that I can submit a complete report quickly

  Scenario: Report action opens Reports with offer preview and metadata
    Given the user is authenticated
    And an offer item is visible in Offers list
    When the user selects Report on that offer
    Then the Reports view is displayed
    And the selected offer preview is displayed
    And offerId is prefilled
    And userId is prefilled
    And report date is prefilled
    And report text is prefilled

  Scenario: Submit report with prefilled context
    Given Reports view has prefilled report context from selected offer
    When the user submits the report
    Then report payload includes message, offerId, userId, and report date
    And the report is submitted successfully
    And the app redirects to Offers view
