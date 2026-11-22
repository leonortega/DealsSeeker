Feature: Keyboard-safe Add Offer form
  As a community contributor
  I want the form to stay usable while the on-screen keyboard is open
  So that I can type details and select results without fighting the keyboard

  Scenario: Typing in the description keeps the field visible
    Given the user is on the Add Offer view
    When the description input receives focus and the on-screen keyboard appears
    Then the description input remains visible above the keyboard
    And the form can still be scrolled to reach later controls

  Scenario: Tapping a location suggestion while typing
    Given the location search input has focus and the keyboard is open
    And at least one suggestion is shown
    When the user taps a suggestion
    Then the suggestion is selected in one tap
    And the keyboard no longer blocks the selected location label

  Scenario: Keyboard-safe layout in edit mode
    Given the user opens Add Offer view in edit mode for a user-owned offer
    When the description input receives focus and the keyboard appears
    Then the prefilled description remains visible above the keyboard
    And the bottom safe-area padding is preserved
