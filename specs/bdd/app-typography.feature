Feature: Landmark typography across platforms
  As a DealsSeeker user on either iOS or Android
  I want the brand's serif landmarks to render on my device
  So that the visual system reads the same everywhere

  Scenario: Landmarks render as serif on both platforms
    Given the same landmark text is displayed on iOS and Android
    When the views are rendered
    Then both platforms show a serif face for that text
    And the hierarchy matches the design system

  Scenario: Operational text stays sans
    Given a view with descriptions, metadata and buttons
    When the view is rendered
    Then those strings use the system sans face

  Scenario: Long localized headline does not break the layout
    Given a landmark string substantially longer than its English source
    When it is rendered at 200 percent text size
    Then it wraps or truncates without clipping or overlapping controls
