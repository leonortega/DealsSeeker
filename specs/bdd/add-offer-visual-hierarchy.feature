Feature: Image panel action hierarchy in Add Offer view
  As a community contributor
  I want photo entry to lead the active step
  So that I can tell the primary action from secondary image management

  Scenario: Photo entry leads the image panel
    Given the user is on Add Offer view with no attached photos
    When the Photo step becomes active
    Then Take Photo and Upload are the only action controls shown in the panel
    And the photo-entry actions carry the most visual weight on the step

  Scenario: Reorder and remove recede behind photo entry
    Given at least one photo is attached
    When the image panel renders
    Then reorder and remove actions use a quieter treatment than Take Photo and Upload
    And every action meets the platform touch floor

  Scenario: Quiet treatment survives themes
    Given the app is in dark appearance
    When the image panel renders with photos attached
    Then reorder and remove actions remain legible and use palette roles

  Scenario: Image panel belongs to the active step only
    Given the user has moved from Photo to the Place step
    When the Place controls are presented
    Then no image-panel action is present to scroll to
    And progress and Back remain available for navigation

  Scenario: Returning to Photo restores the hierarchy
    Given photos were attached before the user moved to Details
    When the user returns to the Photo step
    Then Take Photo and Upload again lead the panel
    And reorder and remove actions keep their quieter treatment
