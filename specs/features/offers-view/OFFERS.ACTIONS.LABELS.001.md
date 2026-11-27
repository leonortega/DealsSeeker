# Spec: `OFFERS.ACTIONS.LABELS.001`

## Metadata
- **Title**: Shared Offer Action Vocabulary and Visible Labels
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Offers View (immersive feed, offer cards, favorites and detail sheet)
- **Priority**: Medium

## Purpose
Keep offer actions self-explanatory on a phone and identical across surfaces without relying on memorized glyphs.

## Preconditions
- The user is authenticated on the Offers view.
- An offer with the standard action set is displayed.

## Trigger
- An offer action control is rendered, or the system text size changes.

## Requirements
- `OFFERS.ACTIONS.LABELS.001-R1`: In the default phone presentation, each offer action shall show a visible text label next to or beneath its glyph.
- `OFFERS.ACTIONS.LABELS.001-R2`: When measured available space cannot hold captions without overlapping another control, the secondary actions shall be reachable through a single visibly labelled disclosure whose entries carry text labels; every action shall remain independently tappable and labelled for assistive technology.
- `OFFERS.ACTIONS.LABELS.001-R3`: The directions action shall remain the only waypoint-accented primary action, as defined by `OFFERS.UX.002-R8`.
- `OFFERS.ACTIONS.LABELS.001-R4`: Labels shall follow the system text size without clipping or overlapping adjacent controls.
- `OFFERS.ACTIONS.LABELS.001-R5`: Every action shall keep its assistive-technology label regardless of whether the visible caption is shown.
- `OFFERS.ACTIONS.LABELS.001-R6`: The system shall use one canonical action vocabulary across offer cards, the feed, favorites rows and the detail sheet; for each action the vocabulary shall fix the visible label, the glyph and the relative order.
- `OFFERS.ACTIONS.LABELS.001-R7`: The canonical vocabulary shall be `Directions` (waypoint glyph), `Favorite` (heart glyph), `Comments` (speech-bubble glyph), `Available?` with thumbs-up and thumbs-down glyphs, and `Report` (flag glyph), in that order; the same label and glyph shall appear on every surface.
- `OFFERS.ACTIONS.LABELS.001-R8`: No more than four actions shall be visible at once in an immersive action rail; every remaining action shall sit behind a single control visibly labelled `More` and shall keep its canonical order inside that control.
- `OFFERS.ACTIONS.LABELS.001-R9`: No action shall change its label, glyph or relative order because of the surface that renders it.

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

Scenario: Short viewport uses a labelled disclosure
  Given the available vertical space is too short for action captions
  When the action rail is rendered
  Then secondary actions sit behind one visibly labelled control
  And its entries carry text labels and remain independently tappable
  And every action remains labelled for assistive technology

Scenario: One vocabulary across all offer surfaces
  Given an offer appears on a card, in the feed, in favorites and in the detail sheet
  When the actions are rendered on each surface
  Then Directions, Favorite, Comments, Available? and Report use the same label and glyph everywhere
  And the actions appear in the same relative order on every surface

Scenario: Immersive rail limits visible actions to four
  Given an offer exposes more than four actions in the immersive rail
  When the rail is rendered
  Then at most four actions are visible
  And the remaining actions sit behind one control labelled More
  And the actions inside More keep the canonical order
```

## Example Inputs/Outputs
- Example input: phone offer with comments, favorite, directions, report and two availability votes.
- Expected output: each control carries a readable text caption; directions is the single accented control.
- Example input: a short landscape viewport with the same offer.
- Expected output: captions are omitted; every action stays independently tappable and assistive-technology labelled.
- Example input: the same offer shown in the feed, on a card, in favorites and in the detail sheet.
- Expected output: identical labels, glyphs and order on every surface.
- Example input: an immersive rail with six available actions.
- Expected output: four visible actions plus one labelled `More` holding the other two.

## Edge Cases
- Long localized labels at 200 percent text size.
- An offer whose vote counts are large numbers.
- A viewport with less than the minimum rail height.
- An offer where some actions are unavailable — the order of the remaining actions does not change.
- A localized label for `More` that is longer than the source text.

## Non-Functional Constraints
- The waypoint accent stays reserved for the active path and the primary action.
- Visible captions shall not introduce a second accent color.

## Related Specs
- `APP.ADAPTIVE.UX.002`
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.UX.002`
- `APP.PERFORMANCE.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.DETAIL.ACTIONS.001`
