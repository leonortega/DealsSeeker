Feature: Normalized offer image rendering
  As a user
  I want images displayed consistently in cards and details
  So that visual quality and layout are predictable

  Scenario: Different source image sizes are normalized
    Given the user uploads images with mixed dimensions
    When image processing completes
    Then images are normalized to the configured aspect ratio
    And cards and detail views use consistent framing

  Scenario: Failed image processing uses placeholder
    Given an uploaded image cannot be processed
    When the offer card is rendered
    Then a placeholder image is shown
    And card size remains unchanged
