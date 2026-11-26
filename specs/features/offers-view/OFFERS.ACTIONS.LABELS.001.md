# Spec: `OFFERS.ACTIONS.LABELS.001`

## Metadata
- **Title**: Visible Labels for Offer Actions
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (immersive feed and offer cards)
- **Priority**: Medium

## Purpose
Keep offer actions self-explanatory on a phone without relying on memorized glyphs.

## Preconditions
- The user is authenticated on the Offers view.
- An offer with the standard action set is displayed.

## Trigger
- An offer action control is rendered, or the system text size changes.

## Requirements
- `OFFERS.ACTIONS.LABELS.001-R1`: In the default phone presentation, each offer action shall show a visible text label next to or beneath its glyph.
- `OFFERS.ACTIONS.LABELS.001-R2`: When measured available space cannot hold captions without overlapping another control, captions may be omitted; every action shall remain independently tappable and labelled for assistive technology.
- `OFFERS.ACTIONS.LABELS.001-R3`: The directions action shall remain the only waypoint-accented primary action, as defined by `OFFERS.UX.002-R8`.
- `OFFERS.ACTIONS.LABELS.001-R4`: Labels shall follow the system text size without clipping or overlapping adjacent controls.
- `OFFERS.ACTIONS.LABELS.001-R5`: Every action shall keep its assistive-technology label regardless of whether the visible caption is shown.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Phone presentation shows action labels
  Given an offer is displayed on a phone in portrait
  When the action controls are rendered
  Then each action shows a visible text label
  And the directions action is the only waypoint-accented action

Scenario: Large text keeps actions labelled
  Given the system text size is set to 150 percent or higher
  When the action controls are rendered
  Then each action is either visibly labelled or reachable through a visibly labelled disclosure
  And no label clips or overlaps another control

Scenario: Short viewport keeps actions tappable and labelled
  Given the available vertical space is too short for action captions
  When the action controls are rendered
  Then captions are omitted
  And every action remains independently tappable and labelled for assistive technology
```

## Example Inputs/Outputs
- Example input: phone offer with comments, favorite, directions, report and two availability votes.
- Expected output: each control carries a readable text caption; directions is the single accented control.
- Example input: a short landscape viewport with the same offer.
- Expected output: captions are omitted; every action stays independently tappable and assistive-technology labelled.

## Edge Cases
- Long localized labels at 200 percent text size.
- An offer whose vote counts are large numbers.
- A viewport with less than the minimum rail height.

## Non-Functional Constraints
- The waypoint accent stays reserved for the active path and the primary action.
- Visible captions shall not introduce a second accent color.

## Related Specs
- `APP.ADAPTIVE.UX.002`
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.UX.002`
