# Spec: `APP.ACCESSIBILITY.UX.002`

## Metadata
- **Title**: Accessible control semantics across contribution, account, and feedback surfaces
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell, My Account, Add Offer, Suggestions, Reports, Offers detail and comments
- **Priority**: High

## Purpose
Make every interactive control perceivable and understandable to assistive technology, not just visually.

## Preconditions
- The user is on a supported screen with an assistive technology enabled or available.
- The active theme and localization are applied.

## Trigger
- Any interactive control is rendered on a contribution, account, secondary, or offer-detail surface.

## Requirements
- `APP.ACCESSIBILITY.UX.002-R1`: Every interactive control shall expose an accessibility role that matches its behavior.
- `APP.ACCESSIBILITY.UX.002-R2`: Every control identified only by an icon, glyph, or image shall expose a meaningful accessibility label in the active language.
- `APP.ACCESSIBILITY.UX.002-R3`: Purely decorative glyphs shall be hidden from assistive technology.
- `APP.ACCESSIBILITY.UX.002-R4`: Every text entry field shall expose a meaningful accessibility label associated with that field.
- `APP.ACCESSIBILITY.UX.002-R5`: A control with a visual selected, checked, or disabled state shall expose the equivalent accessibility state.
- `APP.ACCESSIBILITY.UX.002-R6`: Navigation links shall be announced as links, and actions shall be announced as actions.
- `APP.ACCESSIBILITY.UX.002-R7`: These requirements shall hold in both themes and for localized labels longer than the source text.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Icon-only actions are announced by name and role
  Given a contribution or account screen is displayed
  When an icon-only action is rendered
  Then the action exposes the role of a button
  And the action exposes a meaningful label in the active language

Scenario: Form fields are associated with their labels
  Given the user is on a login, registration, contribution, suggestion, or report form
  When a text entry field is rendered
  Then the field exposes a label that describes the expected input
  And a visible label adjacent to the field refers to the same field

Scenario: Visual state is conveyed to assistive technology
  Given an offer is shown with an active favorite state
  And availability controls are disabled because the user already voted
  When those controls are rendered
  Then the favorite control exposes its selected state
  And the availability controls expose their disabled state

Scenario: Decorative glyphs are not announced as content
  Given an image placeholder or decorative glyph is rendered
  When assistive technology traverses the surface
  Then the decorative glyph is not announced as meaningful content

Scenario: Localized labels keep their semantics
  Given the active language is not the source language
  When a labelled control is rendered
  Then its accessibility label is expressed in the active language
  And its role and state are unchanged
```

## Example Inputs/Outputs
- Example input: an icon-only "previous photo" control with no visible caption.
- Expected output: the control is announced as a button named with the localized "previous photo" label.
- Example input: a favorite control shown as active.
- Expected output: the control is announced as selected.

## Edge Cases
- A label supplied only by placeholder text that disappears once the user types.
- A control that becomes disabled after a successful action.
- Multiple icon-only actions rendered next to one another.
- Right-to-left or expanded localized labels.

## Non-Functional Constraints
- Adding accessibility semantics shall not change the visual appearance, ordering, or behavior of a control.

## Related Specs
- `APP.ACCESSIBILITY.UX.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.LOCALIZATION.001`
- `APP.HELP.001`
- `ADD.OFFER.LAYOUT.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `OFFERS.FAVORITES.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `APP.ACCESSIBILITY.UX.004`
