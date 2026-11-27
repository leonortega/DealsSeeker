Feature: Image panel action hierarchy in Add Offer view
  As a community contributor
  I want photo entry to lead the image panel
  So that I can tell the primary action from secondary image management

  Scenario: Photo entry leads the image panel
    Given the user is on Add Offer view with no attached photos
    When the image panel renders
    Then Take Photo and Upload are the only action controls shown

  Scenario: Reorder and remove recede behind photo entry
    Given at least one photo is attached
    When the image panel renders
    Then reorder and remove actions use a quieter treatment than Take Photo and Upload
    And every action meets the platform touch floor

  Scenario: Quiet treatment survives themes
    Given the app is in dark appearance
    When the image panel renders with photos attached
    Then reorder and remove actions remain legible and use palette roles
