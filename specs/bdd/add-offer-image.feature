Feature: Attach photos and populate location in Add Offer
  As a user
  I want to attach photos and confirm location
  So that I can submit a complete offer

  Scenario: Attach one or more photos from gallery and auto-populate location
    Given the user is in Add Offer view
    When the user selects Upload from Gallery and chooses one or more images
    Then the selected photos are attached to the draft
    And the draft location is auto-populated from current location

  Scenario: Attach photo from camera and confirm location
    Given the user is in Add Offer view
    When the user selects Take Photo and captures an image
    And the user presses Confirm Location
    Then the draft contains photo metadata
    And the selected location is confirmed

  Scenario: Permission denied keeps draft incomplete
    Given camera permission is denied
    When the user taps the image upload area
    Then no photo is attached
    And the user receives a permission error state

  Scenario: Save is blocked when no photo is attached
    Given the user is in Add Offer view with no attached user image
    When the user presses save
    Then the offer request is not sent
    And a photo-required validation error is shown
