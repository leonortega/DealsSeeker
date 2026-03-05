Feature: Offer detail interactions for zoom and directions
  As a user
  I want richer interactions on offer details
  So that I can inspect images and navigate easily

  Scenario: User opens full-screen image zoom
    Given an offer detail has at least one image
    When the user taps the image
    Then a full-screen viewer opens
    And pinch-to-zoom gestures are supported

  Scenario: User opens walking directions from detail view
    Given an offer detail has a valid location
    When the user taps Get Walking Directions
    Then the device default maps app opens
    And walking mode is requested for that destination
