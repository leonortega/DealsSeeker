Feature: Bounded photo payload for Add Offer
  As a contributor on a phone
  I want the photo payload kept small
  So that creating an offer stays responsive

  Scenario: Photo count is bounded
    Given the draft already holds four photos
    When the user tries to add another photo
    Then the existing limit message is shown
    And the draft still holds four photos

  Scenario: Picker requests a reduced payload
    Given the user starts a photo capture or gallery selection
    When the picker is launched
    Then it requests reduced image quality
    And a gallery selection requests at most the remaining slots

  Scenario: Submitted photos keep their order and format
    Given a draft with photos
    When it is submitted
    Then the photos keep their order and formats
