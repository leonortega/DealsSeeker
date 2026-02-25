Feature: Offer list item content and actions
  As a user
  I want complete offer cards with clear actions
  So that I can evaluate and report offer status

  Scenario: Offer list item shows required content
    Given an offer with image, description, highlighted keywords, and tags exists
    When the offer item is rendered in the list
    Then the image is visible
    And the short description is visible
    And keywords are highlighted in the description
    And tags are shown below the description

  Scenario: Offer list item shows required action buttons
    Given an offer item is visible in the list
    When the action area is rendered
    Then Still Available is visible
    And No Longer Available is visible
    And Report is visible

