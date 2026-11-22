Feature: Clear contribution flow feedback
  As a community contributor
  I want clear feedback while creating an offer
  So that I can complete a valid offer without guessing what failed

  Scenario: Missing required content is explained at the point of action
    Given the user is in the Add Offer view
    And a required item such as photo, description, tag, or location is missing
    When the user attempts to submit
    Then the request is not sent
    And each missing item is identified with guidance to correct it
    And entered data is preserved

  Scenario: Successful contribution confirms the outcome
    Given the user submitted a valid offer
    When the create-offer request succeeds
    Then the app confirms the offer was created
    And the user is returned to the Offers view after the confirmation is perceivable

  Scenario: Feedback is announced
    Given a validation error or a success confirmation is shown
    When assistive technology is active
    Then the message is announced
    And no internal status code is used as the message

  Scenario: Coordinate privacy is preserved
    Given an offer with a confirmed location is displayed
    When the user views the location information
    Then no raw latitude or longitude values are shown
