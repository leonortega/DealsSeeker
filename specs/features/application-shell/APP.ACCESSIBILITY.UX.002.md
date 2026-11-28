# Spec: `APP.ACCESSIBILITY.UX.002`

## Metadata
- **Title**: Accessible control semantics across every surface
- **Version**: `v1.3`
- **Status**: Approved
- **Context/View**: Application shell, My Account, Add Offer, Suggestions, Reports, Offers detail and comments
- **Priority**: High

## Material 3 component semantics (Android phase)
Adopting a Material 3 component for a control shall not weaken the name, role or state the control exposes to assistive technology; the component shall preserve the exact semantics of the control it replaces, including selected, checked and disabled states.

## Purpose
Make every interactive control on every surface perceivable and understandable to TalkBack by name, role and state, with measured contrast in both appearances and sign-off evidence at default and 200 percent font scale.

## Preconditions
- The user is on a supported screen with TalkBack enabled or available.
- The active theme and localization are applied in both the light and dark appearances.
- Font scale may be at the default or at 200 percent.

## Trigger
- Any interactive control is rendered on a shell, contribution, account, secondary or offer-detail surface, or accessibility verification is performed.

## Requirements
- `APP.ACCESSIBILITY.UX.002-R1`: Every interactive control shall expose an accessibility role that matches its behavior.
- `APP.ACCESSIBILITY.UX.002-R2`: Every control identified only by an icon, glyph, or image shall expose a meaningful accessibility label in the active language.
- `APP.ACCESSIBILITY.UX.002-R3`: Purely decorative glyphs shall be hidden from assistive technology.
- `APP.ACCESSIBILITY.UX.002-R4`: Every text entry field shall expose a meaningful accessibility label associated with that field.
- `APP.ACCESSIBILITY.UX.002-R5`: A control with a visual selected, checked, or disabled state shall expose the equivalent accessibility state.
- `APP.ACCESSIBILITY.UX.002-R6`: Navigation links shall be announced as links, and actions shall be announced as actions.
- `APP.ACCESSIBILITY.UX.002-R7`: These requirements shall hold in both the light and dark appearances and for localized labels longer than the source text.
- `APP.ACCESSIBILITY.UX.002-R8`: A set of mutually exclusive options shall be exposed to assistive technology as a labelled group whose members expose their selected state.
- `APP.ACCESSIBILITY.UX.002-R9`: Every interactive control, including shell chrome, offer cards, feed actions, maps and overlays, shall expose a name, a role and its current state; no control shall rely on a visual cue alone, as defined by `APP.PLATFORM.CHROME.001`.
- `APP.ACCESSIBILITY.UX.002-R10`: Text and control glyph contrast shall be measured and meet the accessibility thresholds in both appearances, with the evidence recorded as part of theme sign-off, as defined by `APP.THEME.001` and `APP.ACCESSIBILITY.UX.001`.
- `APP.ACCESSIBILITY.UX.002-R11`: At 200 percent font scale, accessible names, roles and states shall remain intact while labels reflow without clipping, as defined by `APP.ADAPTIVE.UX.002`.
- `APP.ACCESSIBILITY.UX.002-R12`: TalkBack traversal sign-off evidence shall confirm that every control on each surface announces its name, role and state at the default and 200 percent font scales, as defined by `APP.ACCESSIBILITY.UX.003`.
- `APP.ACCESSIBILITY.UX.002-R13`: A control rendered through a Material 3 component shall expose the same name, role and state as the equivalent control it replaces; adopting the component shall not weaken selected, checked or disabled state semantics for assistive technology.
- `APP.ACCESSIBILITY.UX.002-R14`: Material 3 radio/selection controls for mutually exclusive options shall satisfy R8 exactly: the group shall be labelled and each option shall expose its selected state; no component default shall remove that state from the accessibility tree.

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
  When TalkBack traverses the surface
  Then the decorative glyph is not announced as meaningful content

Scenario: Localized labels keep their semantics
  Given the active language is not the source language
  When a labelled control is rendered
  Then its accessibility label is expressed in the active language
  And its role and state are unchanged

Scenario: Mutually exclusive options are announced as a group
  Given a settings surface with mutually exclusive options
  When TalkBack traverses those options
  Then the options are exposed inside a labelled group
  And each option exposes its selected state

Scenario: Every shell and offer control exposes name, role and state
  Given shell chrome, offer cards, feed actions, a map and an overlay are displayed
  When TalkBack traverses each surface
  Then every interactive control announces a name, a role and its current state
  And no control relies on a visual cue alone

Scenario: Contrast is measured in both appearances
  Given a screen is rendered in the light appearance and again in the dark appearance
  When its labels and control glyphs are measured against their surfaces
  Then the measured contrast meets the accessibility thresholds in both appearances
  And the evidence is recorded for theme sign-off

Scenario: Semantics survive 200 percent font scale
  Given the Android font scale is set to 200 percent
  When a labelled control is rendered
  Then its label reflows without clipping
  And its name, role and state are unchanged

Scenario: TalkBack traversal sign-off covers every surface
  Given TalkBack is enabled at the default and 200 percent font scales
  When each supported surface is traversed
  Then every control announces its name, role and state
  And sign-off evidence records the result for each surface and scale

Scenario: Material 3 components keep name, role and state
  Given a shell action and an offer action are rendered as Material 3 components
  When TalkBack traverses them
  Then each announces the same name, role and state as the control it replaced

Scenario: Material 3 radio selection exposes the selected state
  Given a coverage/distance group is rendered as Material 3 selection controls
  When an option is selected and assistive technology reads the group
  Then the group is labelled
  And the selected option exposes its selected state
  And no option relies on a visual cue alone
```

## Example Inputs/Outputs
- Example input: an icon-only "previous photo" control with no visible caption.
- Expected output: the control is announced as a button named with the localized "previous photo" label.
- Example input: a favorite control shown as active at 200 percent font scale.
- Expected output: the control is announced as selected and its label reflows without clipping.
- Example input: traversal sign-off for the shell in both appearances.
- Expected output: recorded evidence that every control announces name, role and state in both appearances.
- Example input: a coverage group rendered as Material 3 selection controls with one option chosen.
- Expected output: the group is labelled and exactly the chosen option announces its selected state.

## Edge Cases
- A label supplied only by placeholder text that disappears once the user types.
- A control that becomes disabled after a successful action.
- Multiple icon-only actions rendered next to one another.
- Expanded localized labels at 200 percent font scale.
- A control glyph with adequate contrast in one appearance but not the other.
- A surface that appears only at expanded width or in landscape, included in traversal sign-off.
- A Material 3 component whose default state presentation would hide a selected or disabled state; the state stays in the accessibility tree.

## Non-Functional Constraints
- Adding accessibility semantics shall not change the visual appearance, ordering, or behavior of a control.
- Contrast evidence shall be measured, not estimated, and shall cover both appearances.

## Related Specs
- `APP.SHELL.002`
- `APP.TYPOGRAPHY.001`
- `OFFERS.ACTIONS.LABELS.001`
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
- `APP.PLATFORM.CHROME.001`
- `APP.ADAPTIVE.UX.002`
- `APP.THEME.001`
- `APP.SHELL.003`
- `APP.SEARCH.INTERACTION.001`
