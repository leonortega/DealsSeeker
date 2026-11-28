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

  Scenario: A rejected submission preserves every entered value
    Given the user has typed a description, added tags and photos, and confirmed a location
    When the submission is rejected for an invalid item
    Then every entered value remains exactly as typed or selected
    And no field is reset to a default
    And the confirmed location is shown as a human-readable label

  Scenario: Inline validation does not clear other fields
    Given the user is editing one field of a partly completed offer
    When inline validation appears for that field
    Then the other fields keep their values
    And no entered text is overwritten or reordered

  Scenario: Focus moves to the first offending field
    Given several fields are invalid at submission
    When the field-level errors are attached
    Then focus is placed on the first offending field
    And that field's own text remains available for correction

  Scenario: Entered values survive leaving the view
    Given the user has entered values in the Add Offer view
    When the app is backgrounded, the user navigates away, or the app is relaunched
    Then the entered values are recoverable as defined by APP.DRAFT.RECOVERY.001
    And no value is silently cleared

  Scenario: Fields use labelled Material 3 inputs with helper or error text
    Given the user is in the Add Offer view
    When a field is rendered or fails validation
    Then it shall show a persistent label and a helper or error text line attached to that field
    And no single aggregated paragraph shall replace the field-level messages

  Scenario: Success is confirmed through a Material 3 dialog
    Given the user submitted a valid offer
    When the create-offer request succeeds
    Then the confirmation shall be shown in a Material 3 dialog pattern
    And the dialog shall remain visible until the user selects View offer or Done
    And no timer shall close or navigate from it

  Scenario: A long localized error line stays attached to its field
    Given a localized error message wraps to several lines beside other entered values
    When the field-level errors are attached
    Then the error text shall remain attached to its own field
    And the other entered values shall keep their text and order
