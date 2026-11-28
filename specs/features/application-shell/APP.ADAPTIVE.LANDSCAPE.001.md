# Spec: `APP.ADAPTIVE.LANDSCAPE.001`

## Metadata
- **Title**: Landscape and Foldable Layout Conformance
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell and Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Define how the shell and discovery surfaces lay out in landscape on a phone, at tablet width, and across foldable postures, so that no control is clipped by the shorter viewport, system bars or a fold, including at 200 percent font scale.

## Preconditions
- The app runs on an Android device in landscape orientation, at phone or tablet width, or on a foldable in a folded or unfolded posture.
- The active theme, font scale and system bar configuration may differ from defaults.

## Trigger
- A shell, offer, form, sheet or dialog surface is displayed in landscape, the device rotates, the fold posture changes, or the on-screen keyboard appears.

## Requirements
- `APP.ADAPTIVE.LANDSCAPE.001-R1`: In landscape on a phone, every primary discovery and action control shall remain visible and independently tappable, with no core function hidden solely because the viewport is short, as defined by `APP.ADAPTIVE.UX.001`.
- `APP.ADAPTIVE.LANDSCAPE.001-R2`: The bottom navigation surface in landscape shall keep the 48 by 48 dp touch floor and 8 dp separation, and shall not overlap content or system bars, as defined by `APP.PLATFORM.CHROME.001`.
- `APP.ADAPTIVE.LANDSCAPE.001-R3`: At tablet width in landscape, the navigation surface shall be a rail or drawer rather than a bottom bar, and the offer grid shall use additional columns with the same card composition, as defined by `APP.ADAPTIVE.UX.002`.
- `APP.ADAPTIVE.LANDSCAPE.001-R4`: The on-screen keyboard in landscape shall not cover the focused field or its primary action; content shall reflow or scroll so both remain reachable while the keyboard is open and after it closes.
- `APP.ADAPTIVE.LANDSCAPE.001-R5`: A sheet or dialog in landscape shall keep its close and action controls reachable and shall not extend behind system bars or a fold boundary.
- `APP.ADAPTIVE.LANDSCAPE.001-R6`: On a foldable, both folded and unfolded postures shall keep every primary control reachable; no control or label shall be hidden by a hinge or fold, and a posture change shall reflow content without losing the user's place, as defined by `APP.ADAPTIVE.UX.001`.
- `APP.ADAPTIVE.LANDSCAPE.001-R7`: At 200 percent font scale in landscape, no caption, label or metadata value shall be clipped; text shall reflow into a labelled disclosure where inline space is insufficient, as defined by `APP.ACCESSIBILITY.UX.001` and `APP.ADAPTIVE.UX.002`.
- `APP.ADAPTIVE.LANDSCAPE.001-R8`: TalkBack traversal in landscape shall reach every control in a sensible order, with sign-off evidence at the default and 200 percent font scales, as defined by `APP.ACCESSIBILITY.UX.003`.
- `APP.ADAPTIVE.LANDSCAPE.001-R9`: Landscape verification evidence shall be captured in both appearances on a phone and, where tablets are a target, at tablet width, with both foldable postures included where a foldable is a target, as defined by `APP.THEME.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Phone landscape keeps every primary control reachable
  Given the app is in landscape on a phone
  When the Offers view is displayed
  Then every primary discovery and action control is visible and independently tappable
  And no core function is hidden solely because the viewport is short

Scenario: Landscape bottom bar keeps its touch floor
  Given the app is in landscape at compact width
  When the bottom navigation surface is rendered
  Then its targets are at least 48 by 48 dp with 8 dp separation
  And it does not overlap content or system bars

Scenario: Tablet landscape uses a rail and extra columns
  Given the app is in landscape at an expanded tablet width
  When the Offers view is displayed
  Then the navigation surface is a rail or drawer rather than a bottom bar
  And the offer grid uses additional columns with the same card composition

Scenario: Keyboard does not cover the focused field
  Given the app is in landscape with the on-screen keyboard open
  When the user focuses a field near the bottom of a form or sheet
  Then the field and its primary action remain visible
  And content reflows when the keyboard opens and closes

Scenario: Landscape sheet and dialog controls stay reachable
  Given a sheet or dialog is open in landscape
  When its content is rendered
  Then its close and action controls remain reachable
  And it does not extend behind a system bar or a fold boundary

Scenario: Foldable postures keep controls reachable
  Given the app runs on a foldable device
  When the device moves from a folded to an unfolded posture in landscape
  Then every primary control remains reachable in both postures
  And no control or label is hidden by a hinge or fold
  And the user's place is preserved across the posture change

Scenario: 200 percent font does not clip landscape content
  Given the Android font scale is set to 200 percent in landscape
  When labels, captions and metadata are rendered
  Then none are clipped
  And any overflowing captions move into a visibly labelled disclosure

Scenario: TalkBack traversal is signed off in landscape
  Given TalkBack is enabled in landscape at the default and 200 percent font scales
  When the user traverses a surface
  Then every control is reachable in a sensible order and announces its name
  And sign-off evidence records both scales

Scenario: Landscape evidence covers appearances and device classes
  Given landscape conformance is reviewed
  When evidence is captured
  Then both appearances are shown on a phone and, where targeted, at tablet width
  And both foldable postures are included where a foldable is a target
```

## Example Inputs/Outputs
- Example input: phone rotated to landscape on the immersive offers feed.
- Expected output: search and photo controls remain visible and tappable; no control is clipped by the shorter viewport.
- Example input: a long text field focused in landscape with the keyboard open.
- Expected output: the field and its action stay visible above the keyboard; content restores when the keyboard closes.
- Example input: a foldable unfolded during browsing in landscape at 200 percent font scale.
- Expected output: layout reflows to the wide composition with no clipping at the fold and scroll position preserved.

## Edge Cases
- Landscape on the narrowest supported phone with five navigation destinations.
- A fold boundary crossing an action control at 200 percent font scale.
- A sheet opened just before the device is rotated.
- Rapid rotation during an animated transition with reduced motion enabled.
- System bar or display cutout intrusion in landscape.

## Non-Functional Constraints
- Landscape layouts shall not introduce a separate wide desktop reflow.
- Verification evidence shall come from a device in landscape, not a rotated static capture of a portrait layout.

## Related Specs
- `APP.SHELL.002`
- `APP.TYPOGRAPHY.001`
- `APP.PLATFORM.CHROME.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.THEME.001`
