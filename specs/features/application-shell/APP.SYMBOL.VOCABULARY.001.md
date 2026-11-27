# Spec: `APP.SYMBOL.VOCABULARY.001`

## Metadata
- **Title**: One Platform Symbol Vocabulary Outside the Offer Action Rail
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell and content glyphs across views
- **Priority**: Medium

## Purpose
Use exactly one symbol vocabulary per platform for shell chrome and content glyphs, with the offer action rail as the sole exception and imagery kept distinct from symbols.

## Preconditions
- Controls or content glyphs are rendered on iOS or Android.
- The platform's symbol resource set is available.

## Trigger
- A chrome control, gallery control or content glyph is rendered.

## Requirements
- `APP.SYMBOL.VOCABULARY.001-R1`: Outside the offer action rail defined by `OFFERS.ACTIONS.LABELS.001`, each platform shall use exactly one symbol vocabulary — SF-style symbols on iOS and Material symbols on Android — across headers, the Create floating action, help, galleries, tabs and content glyphs.
- `APP.SYMBOL.VOCABULARY.001-R2`: No control shall use a symbol from the other platform's vocabulary or from a web icon set, and matching controls shall keep identical accessible names and actions on both platforms.
- `APP.SYMBOL.VOCABULARY.001-R3`: Gallery navigation controls shall use glyphs from that platform's vocabulary; no textual arrow, dingbat or second glyph set shall stand in for previous, next or open actions.
- `APP.SYMBOL.VOCABULARY.001-R4`: Placeholder imagery for a missing photo or an empty panel shall be treated as imagery rather than a symbol; it shall render as a labelled neutral panel and shall not be presented as a control glyph.
- `APP.SYMBOL.VOCABULARY.001-R5`: User-supplied or product avatar artwork, including emoji avatars, is product content rather than a symbol and is exempt from the single-vocabulary rule.
- `APP.SYMBOL.VOCABULARY.001-R6`: Only installed platform symbol resources shall be used; no second icon dependency shall be introduced for glyphs covered by this spec.
- `APP.SYMBOL.VOCABULARY.001-R7`: The canonical glyphs of the offer action rail are the single exception to this rule and shall remain as defined by `OFFERS.ACTIONS.LABELS.001`; no rail glyph shall be reused as a second chrome vocabulary.

## Acceptance Criteria (BDD)
```gherkin
Scenario: One vocabulary covers every chrome surface
  Given the headers, Create action, help, galleries and tabs are rendered on iOS and Android
  When their symbols are displayed
  Then iOS uses only SF-style symbols and Android only Material symbols
  And matching controls keep identical accessible names and actions

Scenario: No foreign or web symbol is used
  Given a screen with navigation, action and header controls
  When it is rendered on either platform
  Then no control uses the other platform's vocabulary or a web icon set

Scenario: Gallery navigation uses platform glyphs
  Given a photo gallery is rendered on either platform
  When its previous, next and open controls are displayed
  Then each control uses a glyph from that platform's vocabulary
  And no textual arrow or dingbat is used for those actions

Scenario: Placeholder imagery is not a symbol
  Given a gallery or card renders a placeholder for a missing photo
  When the placeholder is displayed
  Then it is a labelled neutral panel
  And it is not presented as a control glyph from any vocabulary

Scenario: Avatar artwork is product content
  Given a user avatar rendered as artwork or an emoji is displayed
  When symbols on the same screen are rendered
  Then the avatar remains product content
  And it is not counted as a second symbol vocabulary

Scenario: Offer rail is the sole exception
  Given the offer action rail and shell chrome are rendered on both platforms
  When their glyphs are displayed
  Then the rail uses the canonical vocabulary from OFFERS.ACTIONS.LABELS.001
  And the chrome uses the one platform vocabulary
  And no rail glyph is reused in chrome

Scenario: Large text keeps symbol vocabulary intact
  Given the system reading size is at its largest setting
  When chrome and gallery controls are rendered
  Then the same platform vocabulary is used
  And no control falls back to a second glyph set
```

## Example Inputs/Outputs
- Example input: an iOS gallery with no photo loaded and an Android gallery with the same empty state.
- Expected output: platform navigation glyphs on each, with a labelled neutral placeholder panel and no web icon set.
- Example input: a screen showing a user's emoji avatar beside the help control.
- Expected output: the avatar appears as content and help uses the single platform vocabulary.

## Edge Cases
- A missing-photo placeholder beside a gallery navigation control at large text sizes.
- An avatar image that resembles a symbol; it is still treated as content.
- A localized label longer than the source text on a chrome control.
- An offer rail glyph that also exists in the platform set; it stays in the rail vocabulary only.

## Non-Functional Constraints
- Only installed platform symbol resources shall be used; no new icon dependency is introduced.
- Accessible names, roles and actions stay identical on both platforms.

## Related Specs
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `OFFERS.ACTIONS.LABELS.001`
