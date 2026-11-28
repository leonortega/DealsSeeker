# Spec: `APP.THEME.002`

## Metadata
- **Title**: Full Surface Coverage in Dark Theme
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell, all standard views
- **Priority**: High

## Purpose
Prevent fixed light backgrounds from showing through the application when the dark theme is active.

## Preconditions
- The active theme is dark, either explicitly or through the system setting.
- The user is on any standard view with scrollable content.

## Trigger
- A standard view renders its scrollable content area.

## Requirements
- `APP.THEME.002-R1`: The scrollable content area of every standard view shall be painted with the active theme's background color.
- `APP.THEME.002-R2`: Gaps between cards and panels shall use the theme background, not a fixed light surface.
- `APP.THEME.002-R3`: Cards, panels and controls shall keep their own palette roles and shall not be flattened into the background.
- `APP.THEME.002-R4`: The requirement shall hold in both themes and for both supported languages.
- `APP.THEME.002-R5`: The shared navigation surface shall use the active Material 3 navigation colors.
- `APP.THEME.002-R6`: In the immersive presentation, the full content area behind state panels and status banners shall use the fixed plum presentation background, so no navigator surface shows through in either theme.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Dark theme has no white content gaps
  Given the dark theme is active
  When the user opens My Account, Suggestions, Reports, Favorites, Add Offer or Offers
  Then the scrollable content area shall use the dark theme background
  And the gaps between cards shall be dark

Scenario: Theme switch repaints existing surfaces
  Given the user is on a standard view in the light theme
  When the user switches to the dark theme
  Then the content area and card gaps shall update without a restart

Scenario: Cards keep their own surfaces
  Given the dark theme is active
  When a card or panel is displayed
  Then it shall keep its card, panel or panel-alt color role
  And text shall keep its theme ink color

Scenario: Immersive state panels have a dark backdrop
  Given the dark theme is active and the immersive feed is displayed
  When a no-results panel appears above the feed
  Then the area behind the panel shall use the fixed plum presentation
  And no light navigator surface shall show through
```

## Example Inputs/Outputs
- Example input: dark theme, My Account with several cards.
- Expected output: dark background between cards; dark cards with light text; M3 navigation surface unchanged.

## Edge Cases
- Empty states where no cards are present.
- Long content that requires scrolling.
- Sheets over a dark content area.

## Non-Functional Constraints
- No new color values shall be introduced; existing palette roles shall be reused.

## Related Specs
- `APP.THEME.001`
- `APP.SHELL.001`
- `APP.ADAPTIVE.UX.001`
