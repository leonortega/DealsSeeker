Feature: Material 3 default application identity
  As a DealsSeeker user
  I want one consistent Material 3 identity across every surface
  So that no authored brand overlay or placeholder imagery appears

  Scenario: Material 3 defaults define identity on every surface
    Given the platform Material 3 component library is active
    When a startup, splash, login, navigation or action surface is rendered
    Then its identity treatment follows the Material 3 component defaults
    And no authored brand overlay restyles those defaults

  Scenario: Application name stays localized theme-aware text
    Given the user has not reached the authenticated shell
    When the splash or login view is rendered
    Then the localized application name is shown as text
    And the text follows the active Material 3 color and type roles

  Scenario: No placeholder identity is shown
    Given any application surface is rendered
    When identity imagery is displayed
    Then no placeholder letter glyph or placeholder image is shown

  Scenario: Startup surfaces present one identity
    Given the application is launching
    When the startup or splash surface is rendered
    Then a single application identity is displayed
    And no duplicate title, subtitle or second identity mark is displayed

  Scenario: Action glyphs use Material Symbols
    Given an offer card or action rail is displayed
    When its actions are rendered
    Then each control uses a verified Material Symbol
    And no emoji, legacy icon set or authored glyph set is used as an action icon

  Scenario: Top bars use Material 3 structure without authored mark placement
    Given the user is on a standard or immersive Offers presentation
    When the top bar is rendered
    Then it uses the Material 3 app bar pattern with its default control structure
    And no authored mark tile or mark-beside-switch placement is required

  Scenario: Identity survives seed and appearance changes
    Given any of the three palette seeds in light or dark appearance
    When identity text and artwork are rendered
    Then they use the active Material 3 roles
    And no second accent or second typeface is introduced

  Scenario: Narrow viewport keeps a single identity
    Given an immersive presentation on a narrow viewport
    When the top bar is rendered
    Then exactly one application identity is shown
    And no control is clipped by the screen edges

  Scenario: Retired brand rules do not return as overrides
    Given a Material 3 component with a default color, shape and elevation
    When a former brand rule would change that default
    Then the Material 3 default governs
    And the waypoint accent, night footer and authored glyph set are not reapplied
