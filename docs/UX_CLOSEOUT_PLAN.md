# UX closeout plan — seven remaining Impeccable findings

Source: focused Impeccable critique + native audit (2026-11-27), verified against current source. All behavior changes follow the project's spec-first BDD flow before code; each code change is RED → GREEN → refactor with the Jest suite and typecheck as the gate.

## Ordered work

| # | Finding | Sev | Spec work | Implementation |
|---|---------|-----|-----------|----------------|
| 1 | Remove the New York fallback entirely | P1 | Rewrite `APP.LOCATION.FALLBACK.001` (delete explicit-browse requirement); add `APP.LOCATION.UNAVAILABLE.001`; amend `OFFERS.GUEST.001`, `APP.RESILIENCE.UX.001`, `APP.LOCATION.DEVICE.001`, `OFFERS.FAVORITES.001`; BDD `app-location-fallback.feature`, new `app-location-unavailable.feature` | Delete `fallbackLocation`, `fallbackAcceptedRef`, fallback reverse-geocode and "Browse this area" strings in `OffersScreen` and `FavoritesScreen`. No position ⇒ no location-bound search, no map center; show one honest "Location unavailable" panel with Try again. Keep the explicit dev override. |
| 2 | Keyboard avoidance in immersive search sheet | P1 | Amend `APP.BOTTOM_SHEET.001` (new R13), `APP.POLISH.UX.001`, `OFFERS.SEARCH.001`; add `OFFERS.SEARCH.KEYBOARD.001` | Wrap the sheet body in `KeyboardAvoidingView` using the existing `keyboardAvoidanceBehavior()` helper; persist taps; keep snap points and brand styling. |
| 3 | Three modality systems → one sheet + one native route | P1 | Amend `APP.PLATFORM.CHROME.001`, `APP.BOTTOM_SHEET.001`, `APP.ONBOARD.001`, `OFFERS.DETAIL.ACTIONS.001`; add `APP.MODALITY.UNIFICATION.001` | Replace RN `Modal` fullscreen image and `FirstRunSheet` modal with `NativeBottomSheet`; remove the per-sheet `BackHandler` subscription in favour of the sheet's single `onClose`; keep stack `beforeRemove` only for routes. |
| 4 | One icon vocabulary per platform outside the offer rail | P2 | Amend `APP.PLATFORM.CHROME.001`, `APP.SHELL.002`, `OFFERS.ACTIONS.LABELS.001`; add `APP.SYMBOL.VOCABULARY.001` | Extend `PlatformTabIcon` with search/help/create; route chrome through it; retire `NavIcon`; replace gallery `‹/›` with platform glyphs and `▣/▤` placeholders with labelled neutral panels. Avatar emoji remain product content. |
| 5 | Add Offer true progressive disclosure | P2 | Amend `ADD.OFFER.SEQUENCED.001` (R3: only active step mounted), `ADD.OFFER.VISUAL.HIERARCHY.001`; add `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001` | Gate Photo/Place/Details panels on `activeStep`; keep state in the parent so data survives unmount; keep progress, Next/Back, and submit only on Details. |
| 6 | Undo for votes/favorites | P2 | Amend `APP.FEEDBACK.001`, `OFFERS.FAVORITES.001`, `OFFERS.LIST.ACTIONS.001`, `OFFERS.UX.002`; add `OFFERS.ACTION.UNDO.001` | Add one optional action to the existing status surface. Favorite undo reverses the local change and calls the existing API; vote undo is optimistic-only (defer the POST until the undo window closes) because the API has no retract endpoint. |
| 7 | Contextual help | P2 | Amend `APP.HELP.001`, `APP.LOCATION.FALLBACK.001`, `REPORTS.SHEET.001`, `ADD.OFFER.LAYOUT.001`, `ACCOUNT.AUTH.LOGIN.001`; add `APP.HELP.CONTEXTUAL.001` | Add an optional `topic` prop to `HelpSheet` and a small "Why?" affordance at location denial, filters/empty, Add Offer, report and sign-in guard; reuse the existing sheet, focus return and theme/localization. |

## Verification gate
- `npm test -- --runInBand` (currently 78 suites / 485 tests) and `npm run typecheck` after every batch.
- Android-only device pass on `emulator-5554` (Metro and API are already running); no emulator restart.
- Re-run critique + audit to close the loop and persist new snapshots.
