Feature: Clear contribution flow feedback
  As a community contributor
  I want clear feedback while creating an offer
  So that I can complete a valid offer without guessing what failed

  Scenario: Missing required content is explained at each field
    Given the user is in the Add Offer view
    And the photo, description, tag, and location items are all missing
    When the user attempts to submit
    Then the request is not sent
    And a validation message is attached to each missing item's own field
    And no single aggregated paragraph replaces the field-level messages
    And entered data is preserved

  Scenario: Successful contribution waits for an explicit completion control
    Given the user submitted a valid offer
    When the create-offer request succeeds
    Then the app confirms the offer was created
    And the confirmation uses a success visual tone distinct from errors
    And the confirmation stays visible until the user selects View offer or Done
    And no timer navigates away or closes the view

  Scenario: Feedback is announced
    Given a validation error or a success confirmation is shown
    When assistive technology is active
    Then the message is announced
    And no internal status code is used as the message

  Scenario: Coordinate privacy is preserved
    Given an offer with a confirmed location is displayed
    When the user views the location information
    Then no raw latitude or longitude values are shown
