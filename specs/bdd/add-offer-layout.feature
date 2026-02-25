Feature: Add Offer layout required controls
  As a user
  I want all add-offer controls present
  So that I can create an offer draft end-to-end

  Scenario: Add Offer view shows all mandatory controls
    Given the user navigates to Add Offer view
    When the view loads
    Then an image placeholder with photo icon is visible
    And a description input field is visible
    And a tag list section is visible
    And location information is visible
    And Confirm Location is visible
    And Search Location is visible

