# Spec: `ACCOUNT.PROFILE.AVATAR.001`

## Metadata
- **Title**: User Avatar Configuration
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: My Account View / Settings
- **Priority**: Medium

## Purpose
Allow authenticated users to choose a preset avatar that identifies them in comment sections across devices.

## Preconditions
- User is authenticated.

## Trigger
- User opens the settings section and selects an avatar.

## Requirements
- `ACCOUNT.PROFILE.AVATAR.001-R1`: The settings section shall present the available preset avatars for selection.
- `ACCOUNT.PROFILE.AVATAR.001-R2`: The selected avatar shall be stored on the user profile so that it is available on every device used by that user.
- `ACCOUNT.PROFILE.AVATAR.001-R3`: The avatar choice shall be persisted after the user signs out and signs in again.
- `ACCOUNT.PROFILE.AVATAR.001-R4`: The system shall reject an avatar selection that is not part of the preset avatar set.
- `ACCOUNT.PROFILE.AVATAR.001-R5`: The user profile shall expose the currently selected avatar.
- `ACCOUNT.PROFILE.AVATAR.001-R6`: The account header shall show the selected avatar of the authenticated user.
- `ACCOUNT.PROFILE.AVATAR.001-R7`: The system shall show a recoverable error state when the avatar choice cannot be saved, keeping the previously saved avatar.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User selects an avatar in settings
  Given an authenticated user opens the settings section
  When the user selects one of the preset avatars
  Then the selected avatar shall be saved on the user profile
  And the settings section shall show the selected avatar as active

Scenario: Selected avatar is shown with the user profile
  Given an authenticated user selected an avatar
  When the user opens My Account
  Then the selected avatar shall be shown in the account header

Scenario: Selected avatar survives a new session
  Given an authenticated user selected an avatar
  When the user signs out and signs in again
  Then the previously selected avatar shall still be shown

Scenario: Unknown avatar selection is rejected
  Given an authenticated user opens the settings section
  When an avatar outside the preset set is submitted
  Then the avatar shall not be saved
  And the previously saved avatar shall remain selected

Scenario: Avatar selection fails
  Given an authenticated user opens the settings section
  And the avatar choice cannot be saved
  Then the previously saved avatar shall remain selected
  And a recoverable error state shall be shown
```

## Example Inputs/Outputs
- Example input: select the `fox` avatar in the settings section.
- Expected output: the user profile exposes `avatarId` = `fox` and the avatar is shown in the account header and in that user's comments.
- Example input: submit an avatar id outside the preset set.
- Expected output: the request is rejected and the previous avatar remains selected.

## Edge Cases
- The user has never chosen an avatar: a default avatar is used until one is selected.
- The stored avatar is no longer part of the preset set: a default avatar is displayed.

## Non-Functional Constraints
- The avatar configuration shall not expose sensitive account fields.
- The avatar choice shall not affect offer visibility or ranking.

## Related Specs
- `OFFERS.COMMENTS.001`
- `ACCOUNT.PROFILE.001`
- `APP.SHELL.001`
