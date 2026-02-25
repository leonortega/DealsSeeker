Feature: Attach image and populate location in Add Offer
  As a user
  I want to attach an image and confirm location
  So that I can submit a complete offer

  Scenario: Attach image from gallery and auto-populate location
    Given the user is in Add Offer view
    When the user selects Upload from Gallery and chooses an image
    Then the image is attached to the draft
    And the draft location is auto-populated from current location

  Scenario: Attach image from camera and confirm location
    Given the user is in Add Offer view
    When the user selects Take Photo and captures an image
    And the user presses Confirm Location
    Then the draft contains image metadata
    And the selected location is confirmed

  Scenario: Permission denied keeps draft incomplete
    Given camera permission is denied
    When the user taps the image placeholder
    Then no image is attached
    And the user receives a permission error state

