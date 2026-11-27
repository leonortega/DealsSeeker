Feature: One platform symbol vocabulary outside the offer action rail
  As a DealsSeeker user on iOS or Android
  I want every chrome control to use my platform's symbols
  So that the interface looks native and glyphs mean one thing

  Scenario: One vocabulary covers every chrome surface
    Given the headers, Create action, help, galleries and tabs are rendered on iOS and Android
    When their symbols are displayed
    Then iOS uses only SF-style symbols and Android only Material symbols
    And matching controls keep identical accessible names and actions

  Scenario: No foreign or web symbol is used
    Given a screen with navigation, action and header controls
    When it is rendered on either platform
    Then no control uses the other platform's vocabulary or a web icon set

  Scenario: Gallery navigation uses platform glyphs
    Given a photo gallery is rendered on either platform
    When its previous, next and open controls are displayed
    Then each control uses a glyph from that platform's vocabulary
    And no textual arrow or dingbat is used for those actions

  Scenario: Placeholder imagery is not a symbol
    Given a gallery or card renders a placeholder for a missing photo
    When the placeholder is displayed
    Then it is a labelled neutral panel
    And it is not presented as a control glyph from any vocabulary

  Scenario: Avatar artwork is product content
    Given a user avatar rendered as artwork or an emoji is displayed
    When symbols on the same screen are rendered
    Then the avatar remains product content
    And it is not counted as a second symbol vocabulary

  Scenario: Offer rail is the sole exception
    Given the offer action rail and shell chrome are rendered on both platforms
    When their glyphs are displayed
    Then the rail uses the canonical vocabulary from OFFERS.ACTIONS.LABELS.001
    And the chrome uses the one platform vocabulary
    And no rail glyph is reused in chrome

  Scenario: Large text keeps symbol vocabulary intact
    Given the system reading size is at its largest setting
    When chrome and gallery controls are rendered
    Then the same platform vocabulary is used
    And no control falls back to a second glyph set
