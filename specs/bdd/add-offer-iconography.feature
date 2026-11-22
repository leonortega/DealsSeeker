Feature: Consistent control labels in Add Offer view
  As a community contributor
  I want controls labelled with plain words instead of symbols
  So that every action is clear to me and to assistive technology

  Scenario: Empty image area uses a text label
    Given the user opens Add Offer view with no attached photos
    When the image area renders
    Then a plain-language "no photo" label is shown
    And no decorative glyph is shown in its place

  Scenario: Reorder controls name their action
    Given at least one photo is attached
    When the reorder controls render
    Then each control shows a text label naming its direction
    And each control's accessible name matches its visible label

  Scenario: Tag chips carry no trailing glyph
    Given a tag is selected
    When the tag list renders
    Then the tag text contains no trailing removal symbol
    And the removal hint still explains that tapping a tag removes it

  Scenario: Labels follow the active language
    Given the app language is Spanish
    When the image area and reorder controls render
    Then their labels are shown in Spanish
