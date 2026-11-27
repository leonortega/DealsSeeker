Feature: Offer detail interactions for zoom and directions
  As a user
  I want richer interactions on offer details
  So that I can inspect images and navigate easily

  Scenario: User opens the image viewer in the common sheet
    Given an offer detail has at least one image
    When the user taps the image
    Then an image viewer opens in the common sheet
    And no separate full-screen modal is introduced
    And native zoom gestures remain available when the active host surface supports them

  Scenario: Image viewer shares the common sheet Back and focus behavior
    Given the image viewer is open over an offer detail sheet
    When the user invokes system Back
    Then only the image viewer is dismissed through the common sheet path
    And focus returns to the image that opened it

  Scenario: User opens configured directions from detail view
    Given an offer detail has a valid location
    And directions mode is set to car
    When the user taps the directions button
    Then the device default maps app opens
    And car mode is requested for that destination

  Scenario: Status badges and reported warning are mirrored into the sheet
    Given an offer carries a promoted badge and a reported badge with its warning on the feed row
    When the user opens the detail sheet for that offer
    Then the promoted and reported badges are shown in the sheet
    And the reported warning is shown with the same wording as on the feed row

  Scenario: Detail actions stay on the sheet until an explicit completion control
    Given the user is on the detail sheet for an offer
    When the user completes an inline action such as a vote or a report
    Then the sheet remains open
    And no automatic navigation occurs
    And an explicit Done or Close control ends the interaction
