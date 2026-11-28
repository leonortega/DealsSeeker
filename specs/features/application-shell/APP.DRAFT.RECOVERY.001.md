# Spec: `APP.DRAFT.RECOVERY.001`

## Metadata
- **Title**: Add Offer draft recovery across interruption and relaunch
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application shell and Add Offer View
- **Priority**: High

## Purpose
Let a contributor return to an unfinished offer after backgrounding, navigating away or relaunching, without retyping or silently losing work.

## Preconditions
- The user has started a draft in Add Offer in create or edit mode.
- The draft contains user-entered content as defined by `ADD.OFFER.EXIT.001`.

## Trigger
- The application is backgrounded and resumed, the user navigates away from Add Offer and returns, or the application is terminated and relaunched.

## Requirements
- `APP.DRAFT.RECOVERY.001-R1`: When the application is backgrounded with a non-empty draft, the system shall preserve the draft so that returning to Add Offer restores the same field values.
- `APP.DRAFT.RECOVERY.001-R2`: Returning to Add Offer after a background/foreground transition shall restore the draft in place without restarting the flow or presenting a fresh empty form.
- `APP.DRAFT.RECOVERY.001-R3`: When the user navigates away from a non-empty draft and later reopens Add Offer, the system shall offer to resume the retained draft rather than silently starting empty, with explicit `Resume` and `Discard` choices.
- `APP.DRAFT.RECOVERY.001-R4`: After the application is relaunched, the system shall offer to resume the most recent non-empty draft before the user starts a new offer.
- `APP.DRAFT.RECOVERY.001-R5`: Recovery shall preserve every value the user entered, including partially typed optional text, selected photos, selected tags and the human-readable confirmed location label; no raw coordinate value shall be shown.
- `APP.DRAFT.RECOVERY.001-R6`: Recovery shall not submit an offer or start any request; an offer shall be created or updated only by the explicit save action of `ADD.OFFER.UX.001`.
- `APP.DRAFT.RECOVERY.001-R7`: Choosing `Discard` shall clear the retained draft after the confirmation of `ADD.OFFER.EXIT.001`, and a discarded draft shall not reappear on a later launch.
- `APP.DRAFT.RECOVERY.001-R8`: A successfully submitted offer shall clear its retained draft so that recovery does not resurrect a submitted offer.
- `APP.DRAFT.RECOVERY.001-R9`: A recovered draft shall be announced to assistive technology, shall follow the active theme and localization, and shall remain readable at 200 percent text scaling.
- `APP.DRAFT.RECOVERY.001-R10`: If the session is no longer valid at relaunch, the system shall follow `APP.LIFECYCLE.001-R6` and keep the draft available for resume after authentication.
- `APP.DRAFT.RECOVERY.001-R11`: An empty draft, or a draft containing only an auto-populated device location, shall not be offered for recovery.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Background and resume keeps the draft
  Given the user has entered a description and selected tags in Add Offer
  When the application is backgrounded and then returned to the foreground
  Then Add Offer is shown again with the same field values
  And no fresh empty form is displayed

Scenario: Returning after navigating away offers to resume
  Given the user navigated away from Add Offer with a non-empty draft
  When the user reopens Add Offer
  Then an offer to resume the retained draft is presented
  And explicit Resume and Discard choices are available
  And no draft is submitted

Scenario: Relaunch offers the most recent draft
  Given the application was terminated with a non-empty draft
  When the application is relaunched
  Then an offer to resume that draft is presented before a new offer is started
  And selecting Resume restores every entered field value

Scenario: Discard clears the draft for good
  Given an offer to resume a retained draft is presented
  When the user chooses Discard and confirms the discard
  Then the retained draft is cleared
  And no resume offer appears on a later launch

Scenario: A successful submission clears the draft
  Given a retained draft corresponds to an offer the user later submitted successfully
  When the application is relaunched
  Then no resume offer for that offer is presented

Scenario: Recovery is announced and privacy-safe
  Given a resume offer is presented with assistive technology enabled
  When the user reviews the restored field values
  Then the resume offer and restored values are announced
  And the confirmed location is shown as a human-readable label
  And no raw latitude or longitude value is shown

Scenario: An empty or location-only draft is not offered
  Given the draft has no user-entered content beyond an auto-populated device location
  When the application is relaunched
  Then no resume offer is presented
  And Add Offer starts with a fresh draft
```

## Example Inputs/Outputs
- Example input: a typed description, two selected tags and a confirmed location, then the app is backgrounded and resumed.
- Expected output: Add Offer reopens with that description, those tags and the same human-readable location label; no raw coordinates appear.
- Example input: a draft with content, the user leaves for Offers and reopens Add Offer.
- Expected output: `Resume` and `Discard` are offered; choosing `Resume` restores the draft without submitting it.

## Edge Cases
- Rapid repeated background/foreground transitions — the draft is restored once with no duplicate fields or entries.
- Backgrounding while the keyboard is open — the keyboard may be dismissed, following `APP.LIFECYCLE.001-R4`, but no typed text is lost.
- Two interrupted drafts — the most recent non-empty draft is offered first.
- Localized draft text and 200 percent text scaling — values and resume controls stay readable and reachable.
- A draft whose location was auto-populated but never confirmed — it does not count as user-entered content and no raw coordinate is exposed.
- A session that is no longer valid at relaunch — authentication comes first and the draft remains available afterwards.

## Non-Functional Constraints
- Recovery shall use the operating system's standard lifecycle signals and shall not duplicate the navigation state of `APP.LIFECYCLE.001`.
- Recovery shall not issue a network request or create a navigation entry on its own.

## Related Specs
- `APP.LIFECYCLE.001`
- `ADD.OFFER.EXIT.001`
- `ADD.OFFER.UX.001`
- `APP.POLISH.UX.001`
- `OFFERS.UX.002`
- `APP.HELP.CONTEXTUAL.001`
- `APP.RESILIENCE.UX.001`
- `APP.ACCESSIBILITY.UX.003`
