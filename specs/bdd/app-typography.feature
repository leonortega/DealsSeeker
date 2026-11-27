Feature: Landmark typography and reading-size scaling across platforms
  As a DealsSeeker user on either iOS or Android
  I want the brand's serif landmarks to render and all text to follow my reading size
  So that the visual system reads the same everywhere and stays legible

  Scenario: Landmarks render as serif on both platforms
    Given the same landmark text is displayed on iOS and Android
    When the views are rendered
    Then both platforms show a serif face for that text
    And the hierarchy matches the design system

  Scenario: Operational text stays sans
    Given a view with descriptions, metadata and buttons
    When the view is rendered
    Then those strings use the system sans face

  Scenario: Text scales beyond 1.2x with the system setting
    Given the system reading size is set to twice the default
    When landmark, label and body text are rendered
    Then each grows with the setting
    And no cap limits growth at 1.2 times the default

  Scenario: Long localized headline wraps rather than truncates
    Given a landmark string substantially longer than its English source
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
    Then the heading keeps its serif landmark role
    And the body stays on the sans face and wraps without overlap
