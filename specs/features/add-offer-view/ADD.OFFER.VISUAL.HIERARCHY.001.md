# Spec: `ADD.OFFER.VISUAL.HIERARCHY.001`

## Metadata
- **Title**: Image panel action hierarchy in the Add Offer view
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Low

## Purpose
Make the two photo-entry actions the clear next step in the image panel while that step is active, without removing the reorder and remove actions or presenting the panel alongside another step.

## Preconditions
- The user is on the Add Offer view with the Photo step active.
- The image panel renders its action controls.

## Trigger
- The Photo step becomes active, or the image panel's action controls change.

## Requirements
- `ADD.OFFER.VISUAL.HIERARCHY.001-R1`: The photo-entry actions shall carry more visual weight than the reorder and remove actions.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R2`: Reorder and remove actions shall use a quieter treatment than the photo-entry actions while remaining clearly tappable.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R3`: Every image-panel action shall keep a touch target of at least 44pt on iOS and 48dp on Android.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R4`: The treatment shall use existing palette roles and shall not make terracotta a background for a secondary action.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R5`: The image-panel hierarchy shall apply only while the Photo step is active; when another step is active, the image panel and its actions shall not be presented, following `ADD.OFFER.SEQUENCED.001`.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R6`: Within the active step, the step's primary action shall be the element of greatest visual weight; progress and `Next`/`Back` controls shall support navigation without competing with that primary action.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Photo entry leads the image panel
  Given the user is on Add Offer view with no attached photos
  When the Photo step becomes active
  Then Take Photo and Upload are the only action controls shown in the panel
  And the photo-entry actions carry the most visual weight on the step

Scenario: Reorder and remove recede behind photo entry
  Given at least one photo is attached
  When the image panel renders
  Then reorder and remove actions use a quieter treatment than Take Photo and Upload
  And every action remains at least 44pt tall

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
```

## Example Inputs/Outputs
- Example input: one attached photo, light appearance, Photo step active.
- Expected output: Take Photo and Upload read as the primary actions; Move left, Move right and Remove are compact, lower-weight controls; no other step's controls are present.
- Example input: user advances to Details, then returns to Photo.
- Expected output: the attached photo is restored and the photo-entry actions lead the panel again.

## Edge Cases
- Eight attached photos at the limit.
- Long localized action labels.
- Large text sizes where a compact label wraps.
- The step is inactive while photos exist — the panel stays out of the view but the photos remain available when the step is revisited.

## Non-Functional Constraints
- This spec does not change reorder, removal, or validation behavior.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.ICONOGRAPHY.001`
- `ADD.OFFER.SEQUENCED.001`
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001`
