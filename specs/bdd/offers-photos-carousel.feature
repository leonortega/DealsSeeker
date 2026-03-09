Feature: Multi-photo upload and detail carousel
  As a user
  I want to add multiple photos and browse them in detail view
  So that offers can be represented better visually

  Scenario: User uploads and reorders multiple photos
    Given the user is in Add Offer view
    When the user selects multiple photos
    And reorders them before submit
    Then the draft stores all photos in user-defined order

  Scenario: Offer detail renders swipeable carousel
    Given an offer includes multiple photos
    When the user opens offer detail
    Then photos are shown in a swipeable carousel
    And the first visible photo matches the configured primary preview
