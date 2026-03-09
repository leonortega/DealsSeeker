Feature: Add Offer layout required controls
  As a user
  I want all add-offer controls present
  So that I can create an offer draft end-to-end

  Scenario: Add Offer view shows all mandatory controls
    Given the user navigates to Add Offer view
    When the view loads
    Then an image upload area with photo icon is visible
    And a description input field is visible
    And a current tag list section is visible
    And a suggested tags section is visible
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

  Scenario: Edit Offer view shows edit title and prefilled data
    Given the user opens Add Offer view in edit mode for a user-owned offer
    When the view loads
    Then the title shown is Edit Offer
    And the existing description, tags, images, and location are shown
    And the mini map shows the stored offer location

  Scenario: Successful edit-offer submit redirects to My Account
    Given the user is in Edit Offer view with valid updated data
    When the user presses Edit Offer
    And the edit-offer request succeeds with no errors
    Then the app redirects to My Account view

  Scenario: Save is blocked when required offer content is missing
    Given the user is in Add Offer view
    And at least one of photo, description, selected tag, or confirmed location is missing
    When the user presses Create Offer
    Then the create-offer request is not sent
    And a validation error state is shown
