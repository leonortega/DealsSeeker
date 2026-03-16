Feature: Offer detail interactions for zoom and directions
  As a user
  I want richer interactions on offer details
  So that I can inspect images and navigate easily

  Scenario: User opens full-screen image zoom
    Given an offer detail has at least one image
    When the user taps the image
    Then a full-screen viewer opens
    And native zoom gestures remain available when the active host surface supports them

  Scenario: User opens configured directions from detail view
    Given an offer detail has a valid location
    And directions mode is set to car
    When the user taps the directions button
    Then the device default maps app opens
    And car mode is requested for that destination
