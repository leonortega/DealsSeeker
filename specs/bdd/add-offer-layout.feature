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
    And the required blocks are grouped into the Photo, Place and Details steps
    And location information is visible
    And a location search input is visible
    And location suggestions appear while typing from the 3rd character
    And a mini map location preview is visible
    And Confirm Location and Edit Location are visible below the mini map

  Scenario: Successful add-offer submit waits for explicit completion
    Given the user is in Add Offer view with valid data
    When the user presses Create Offer
    And the create-offer request succeeds with no errors
    Then View offer and Done controls are shown
    And no redirect occurs until one of them is selected

  Scenario: Edit Offer view shows edit title and prefilled data
    Given the user opens Add Offer view in edit mode for a user-owned offer
    When the view loads
    Then the title shown is Edit Offer
    And the existing description, tags, images, and location are shown
    And the mini map shows the stored offer location

  Scenario: Successful edit-offer submit waits for explicit completion
    Given the user is in Edit Offer view with valid updated data
    When the user presses Edit Offer
    And the edit-offer request succeeds with no errors
    Then View offer and Done controls are shown
    And no redirect occurs until one of them is selected

  Scenario: Save is blocked when required offer content is missing
    Given the user is in Add Offer view
    And at least one of photo, description, selected tag, or confirmed location is missing
    When the user presses Create Offer
    Then the create-offer request is not sent
    And a validation error state is shown

  Scenario: Tag section shows removal hint and opt-in suggestions
    Given the user navigates to Add Offer view
    When the tag section loads with description-derived tags
    Then a hint states that tapping a selected tag removes it
    And related tags are offered with an explicit acceptance control
    And no note states that related tags are added automatically
    And no word-detection guidance text is displayed

  Scenario: Edit draft load failure blocks submission
    Given the user opens Add Offer view in edit mode for a user-owned offer
    And the owned offer draft cannot be loaded
    When the load attempt fails
    Then a recoverable error state is shown
    And submission is blocked
    And Retry and Cancel actions are offered

  Scenario: Explicit cancel action is present
    Given the user navigates to Add Offer view
    Then an explicit Cancel action is visible

  Scenario: Contextual help is reachable while contributing an offer
    Given the user is on the Add Offer view
    When the user asks why a location must be confirmed
    Then the single help surface opens with the location topic first
    And all entered contribution data is preserved
