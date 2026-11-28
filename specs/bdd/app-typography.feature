Feature: Material 3 type scale and reading-size scaling
  As a DealsSeeker user on either iOS or Android
  I want every string to use the Material 3 type scale and default typeface
  So that the visual system is consistent and stays legible at my reading size

  Scenario: All text uses the Material 3 default typeface
    Given the same screen is displayed on iOS and Android
    When the views are rendered
    Then every text role uses the Material 3 default typeface
    And no serif, Georgia or Roboto Serif face appears

  Scenario: No brand and plain face split remains
    Given a view with titles, descriptions, metadata and buttons
    When the view is rendered
    Then all strings share the same typeface
    And no string class changes face by brand role

  Scenario: Text scales beyond 1.2x with the system setting
    Given the system reading size is set to twice the default
    When title, label and body text are rendered
    Then each grows with the setting
    And no cap limits growth at 1.2 times the default

  Scenario: Long localized title wraps rather than truncates
    Given a title string substantially longer than its English source
    When it is rendered at 200 percent text size
    Then it wraps at word boundaries rather than truncating
    And no glyph is clipped or overlaps a control

  Scenario: Labels wrap at the largest system reading size
    Given the system reading size is at its largest setting
    When button and navigation labels are rendered
    Then they wrap at word boundaries rather than truncate
    And no label is clipped by its container

  Scenario: Hierarchy survives large-scale mixed text
    Given a heading and its body copy at the largest reading size
    When they are rendered together
    Then the heading keeps its Material 3 type role
    And the body stays on the same typeface and wraps without overlap

  Scenario: Material 3 type scale covers every text role
    Given screens with display, headline, title, body and label text
    When their text is rendered
    Then each maps to a Material 3 type scale token in Large, Medium or Small
    And no hand-picked per-screen size replaces a token

  Scenario: Emphasized variants are used for emphasis only
    Given component labels and an editorial headline
    When text is rendered
    Then emphasized Material 3 variants appear only where emphasis is called for
    And component defaults stay on the regular scale tokens

  Scenario: No legacy serif fallback is introduced
    Given a device where a serif face is available
    When text is rendered
    Then no text role selects that serif face
    And the Material 3 default face is used for every role

  Scenario: Line height adapts without clipping
    Given a language script with tall glyphs at an elevated reading size
    When text is rendered
    Then the role's line height adapts to the script
    And no glyph is clipped or overlaps an adjacent row
