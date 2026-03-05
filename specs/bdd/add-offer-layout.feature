Feature: Add Offer layout required controls
  As a user
  I want all add-offer controls present
  So that I can create an offer draft end-to-end

  Scenario: Add Offer view shows all mandatory controls
    Given the user navigates to Add Offer view
    When the view loads
    Then an image upload area with photo icon is visible
    And a description input field is visible
    And a tag list section is visible
    And location information is visible
    And a location search input is visible
    And location suggestions appear while typing from the 3rd character
    And a mini map location preview is visible
    And Confirm Location and Edit Location are visible below the mini map

  Scenario: Successful add-offer submit redirects to Offers
    Given the user is in Add Offer view with valid data
    When the user presses Create Offer
    And the create-offer request succeeds with no errors
    Then the app redirects to Offers view
