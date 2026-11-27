# Spec: `ADD.OFFER.VISUAL.HIERARCHY.001`

## Metadata
- **Title**: Image panel action hierarchy in the Add Offer view
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Low

## Purpose
Make the two photo-entry actions the clear next step in the image panel without removing the reorder and remove actions.

## Preconditions
- The user is on the Add Offer view with at least one attached photo.

## Trigger
- The image panel renders its action controls.

## Requirements
- `ADD.OFFER.VISUAL.HIERARCHY.001-R1`: The photo-entry actions shall carry more visual weight than the reorder and remove actions.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R2`: Reorder and remove actions shall use a quieter treatment than the photo-entry actions while remaining clearly tappable.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R3`: Every image-panel action shall keep a touch target of at least 44pt on iOS and 48dp on Android.
- `ADD.OFFER.VISUAL.HIERARCHY.001-R4`: The treatment shall use existing palette roles and shall not make terracotta a background for a secondary action.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Photo entry leads the image panel
  Given the user is on Add Offer view with no attached photos
  When the image panel renders
  Then Take Photo and Upload are the only action controls shown

Scenario: Reorder and remove recede behind photo entry
  Given at least one photo is attached
  When the image panel renders
  Then reorder and remove actions use a quieter treatment than Take Photo and Upload
  And every action remains at least 44pt tall

Scenario: Quiet treatment survives themes
  Given the app is in dark appearance
  When the image panel renders with photos attached
  Then reorder and remove actions remain legible and use palette roles
```

## Example Inputs/Outputs
- Example input: one attached photo, light appearance.
- Expected output: Take Photo and Upload read as the primary actions; Move left, Move right and Remove are compact, lower-weight controls.

## Edge Cases
- Eight attached photos at the limit.
- Long localized action labels.
- Large text sizes where a compact label wraps.

## Non-Functional Constraints
- This spec does not change reorder, removal, or validation behavior.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.ICONOGRAPHY.001`
