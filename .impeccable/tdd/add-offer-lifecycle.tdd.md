# TDD Evidence — Add Offer lifecycle pass

## Source
- Driver: impeccable critique of `src/DealsSeeker.ReactNative/src/screens/AddOfferScreen.tsx` (25/40, three P1 + two P2 findings), snapshot `2026-11-22T00-58-24Z__eactnative-src-screens-addofferscreen-tsx-c8c19d34.md`.
- Approved specs: `ADD.OFFER.EXIT.001` (new), `ADD.OFFER.LAYOUT.001` v2.3, `ADD.OFFER.LOCATION.001` v1.8, `ADD.OFFER.UX.001` v1.1, `ADD.OFFER.TAGS.SUGGESTIONS.001` v2.2.
- BDD: `add-offer-exit.feature` (new), `add-offer-layout.feature`, `add-offer-location.feature`, `add-offer-ux.feature`, `add-offer-tag-suggestions.feature`.
- Journeys are derived from the BDD scenarios; no plan file was supplied.

## User journeys
1. As a contributor, I want to leave the Add Offer view without silently losing work, so that an interrupted contribution is discarded deliberately or kept.
2. As a contributor editing my own offer, I want a failed draft load to block saving, so that partial data cannot overwrite the stored offer.
3. As a contributor searching for a location, I want to see searching, no-results, and retry states, so that a slow or failed lookup does not look broken.
4. As a contributor, I want the success confirmation to be distinct and perceivable before the view closes, so that I know the offer was saved.
5. As a contributor, I want a brief note explaining automatic tags, so that tags I did not type are not a surprise.

## RED / GREEN / REFACTOR evidence

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferLifecycle.test.tsx` | 9/9 FAIL — missing error state, retry, searching/no-results/failure feedback, disabled semantics, Cancel/alert, inline note, success tone/dwell |
| GREEN | `npm test -- addOfferLifecycle.test.tsx` | PASS — 9 tests |
| Verification | `npm test` | PASS — 43 suites, 269 tests |
| Typecheck | `npm run typecheck` | clean |
| Coverage | `npm run test:coverage` | `statusNotice.ts` 100%, `translations.ts` 100%, `AddOfferScreen.tsx` 62.92% (whole pre-existing screen), all files 72.78% |

## Test specification

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Failed edit load shows an error, hides Save, and Retry re-runs the load | `addOfferLifecycle.test.tsx: shows a recoverable error, blocks submit, and retries...` | component | PASS |
| 2 | In-flight lookup shows the searching message | `...shows a searching indicator while a location lookup is in flight` | component | PASS |
| 3 | Empty lookup shows the no-results message | `...shows a no-results message when a lookup returns nothing` | component | PASS |
| 4 | Failed lookup shows an inline retry and re-queries | `...shows a retry on lookup failure and keeps the selected location` | component | PASS |
| 5 | Confirm/Edit expose real disabled state to assistive technology | `...exposes real disabled state on the location toggle controls` | component | PASS |
| 6 | Empty draft closes without a confirmation dialog | `...closes an empty draft without a confirmation step` | component | PASS |
| 7 | Dirty draft confirms discard; Keep editing preserves text; Discard closes | `...confirms before discarding a draft with content and keeps it when declined` | component | PASS |
| 8 | Tag section shows the inline auto-tag note | `...shows the inline note explaining automatic tag addition` | component | PASS |
| 9 | Success uses the success color, stays visible, then returns to Offers | `...holds a success-toned confirmation for three seconds before closing` | component | PASS |

## Known gaps
- `AddOfferScreen.tsx` is a pre-existing ~900-line component; overall file coverage is 62.92%, but every branch added in this pass has a dedicated test. The remaining uncovered lines are pre-existing camera/gallery, map-pin, and submit-error paths outside this slice.
- Native visual verification (simulator/emulator, both palettes, phone + tablet, both orientations, Dynamic Type, VoiceOver) was not possible: no adb/emulator or simulator is available. Source-level craft-floor checks and Jest component tests were used instead; this is required before shipping.
- React logs `IS_REACT_ACT_ENVIRONMENT` warnings from pre-existing async effects in the test file; all assertions pass and the warning pattern predates this change.

## Follow-up cycle — keyboard-safe layout (`ADD.OFFER.KEYBOARD.001`)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferKeyboard.test.tsx` | 5/5 FAIL — no keyboard-avoiding wrapper, no `keyboardShouldPersistTaps`, no safe-area-aware padding |
| GREEN | `npm test -- addOfferKeyboard.test.tsx` | PASS — 5 tests |
| Verification | `npm test` | PASS — 44 suites, 274 tests |
| Typecheck | `npm run typecheck` | clean |

| # | What is guaranteed | Test | Result |
|---|---|---|---|
| 12 | Form is wrapped in a keyboard-avoiding view | `addOfferKeyboard.test.tsx: wraps the form in a keyboard-avoiding view` | PASS |
| 13 | iOS uses padding, Android/other use height | `...maps each platform to its keyboard-avoidance behavior` | PASS |
| 14 | Taps on other controls work while the keyboard is open | `...lets taps on other controls work while the keyboard is open` | PASS |
| 15 | Bottom safe-area inset (34) is preserved (paddingBottom 58) | `...preserves the bottom safe-area padding...` | PASS |
| 16 | Edit mode gets the same keyboard-safe layout | `...applies keyboard avoidance in edit mode too` | PASS |

Known gap: the real keyboard interaction still needs on-device verification (no emulator/simulator available); these tests verify the mechanism, not a rendered keyboard.

## Follow-up cycle — map source stability (behavior-preserving refactor)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- mapPreview.test.tsx` | 1 FAIL — WebView `source` identity changed on an unrelated re-render (serialized to the same string) |
| GREEN | `npm test -- mapPreview.test.tsx` | PASS — 9 tests |
| Verification | `npm test` | PASS — 44 suites, 276 tests |
| Typecheck | `npm run typecheck` | clean |

Spec-first exemption: memoizing `buildMapHtml` and the WebView `source` changes no observable behavior, so this refactor is exempt under `AGENTS.md`; it was kept under `safe-refactor` (same props, same message ordering, same failure behavior, no new dependencies, same proof re-run).

| # | What is guaranteed | Test | Result |
|---|---|---|---|
| 17 | Unrelated re-renders keep the same WebView source (no map reload) | `mapPreview.test.tsx: keeps the same WebView source when only prop identities change` | PASS |
| 18 | A changed center still rebuilds the source | `mapPreview.test.tsx: rebuilds the source when the map center changes` | PASS |

## Follow-up cycle — control labels (`ADD.OFFER.ICONOGRAPHY.001`)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferIconography.test.tsx` | 4/4 FAIL — no plain-language labels, glyph controls still present |
| GREEN | `npm test -- addOfferIconography.test.tsx` | PASS — 4 tests |
| Verification | `npm test` | PASS — 45 suites, 280 tests |
| Typecheck | `npm run typecheck` | clean |

| # | What is guaranteed | Test | Result |
|---|---|---|---|
| 19 | Empty image area shows a label, not `▤` | `addOfferIconography.test.tsx: shows a plain-language label in the empty image area` | PASS |
| 20 | Reorder controls show labelled text and matching accessible names | `...labels reorder controls and keeps their accessible names in sync` | PASS |
| 21 | Tag chips have no trailing `×` | `...renders tag chips without a trailing removal glyph` | PASS |
| 22 | Labels follow the active language | `...shows the labels in Spanish when the active language is Spanish` | PASS |

Spec-first exemption for the submit-color change: replacing the literal `#fff` with the named `primaryButtonText` token is a visually identical internal cleanup, so it needed no spec; it is counted here for completeness.

### Final verification note
A background re-run once reported one failure in `client.test.ts` after 363 s; that file is untouched by this work. `npm test -- client.test.ts` passed 10/10 in 2.3 s and a clean full `npm test` passed 45 suites / 280 tests. Treated as a transient timing flake, not a regression; re-check if it recurs.

## Follow-up cycle — observations from the re-review

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferBoundsAndHierarchy.test.tsx` | 6/6 FAIL — no `maxLength`, no hint, no quieter secondary actions |
| GREEN | `npm test -- addOfferBoundsAndHierarchy.test.tsx` | PASS — 6 tests |
| Verification | `npm test` | PASS — 46 suites, 286 tests |
| Typecheck | `npm run typecheck` | clean |

Specs: `ADD.OFFER.INPUT.BOUNDS.001` and `ADD.OFFER.VISUAL.HIERARCHY.001` (both Approved), with BDD and traceability rows; the JSON contract now declares `description.maxLength: 500`.

| # | What is guaranteed | Test | Result |
|---|---|---|---|
| 23 | Description accepts at most 500 characters and discloses the limit | `addOfferBoundsAndHierarchy.test.tsx: bounds the description at 500 characters and discloses the limit` | PASS |
| 24 | Location search accepts at most 120 characters | `...bounds the location search at 120 characters` | PASS |
| 25 | Bound applies in edit mode with a prefilled description | `...keeps the bound in edit mode` | PASS |
| 26 | Photo entry takes a larger share of the action row | `...gives photo entry a larger share of the row than reorder actions` | PASS |
| 27 | Reorder/remove use quieter palette colors | `...uses quieter colors for reorder and remove than for photo entry` | PASS |
| 28 | Every image-panel action stays at least 44pt tall | `...keeps every image-panel control at least 44pt tall` | PASS |

Not fixed by choice: batch undo for auto-added tags (explicitly declined earlier; the inline note remains), map provider network dependency (fallback message and center-pin action already cover it), and device-only verification (no emulator/simulator).

## Device verification via mobile-mcp (2026-11-22)
Installed `@mobilenext/mobile-mcp` in the global OpenCode config and started the local AVD `DealsSeekerApi` with `scripts/run-reactnative-android.ps1 -Target app -ExpoPort 8082` (API already healthy on 5005). Verified on device: create-mode Add Offer view, "Sin foto seleccionada" label, Spanish localization, one-tap location suggestion selection with keyboard open, "Hasta 500 caracteres" hint, auto-tag note, tag chips without `×`, real disabled state on Edit Location, and the Cancel discard confirmation with Keep Editing preserving the draft.

### Bug found on device — create FAB opened edit mode
`CreateOfferFab` passes its press event to `openAddOffer`, which set `overlayRoute.offerId` to the event object. The Add Offer view therefore opened in edit mode, tried to load a bogus draft, and showed the recoverable error panel. This violated the existing Approved `OFFERS.NAV.ADD.001` (R1/R4).

| Stage | Command | Result |
|---|---|---|
| Spec update | `OFFERS.NAV.ADD.001` R4 + BDD scenario | create action opens create mode with no offer identifier |
| RED | `npm test -- appContext.test.tsx` | 1 FAIL — event object was stored as `offerId` |
| GREEN | `npm test -- appContext.test.tsx` | PASS — 10 tests |
| Verification | `npm test` | PASS — 46 suites, 287 tests; `npm run typecheck` clean |
| Device | mobile-mcp after Fast Refresh | FAB now opens "Agregar Oferta" in create mode |

Fix: `openAddOffer` only stores `offerId` when it is a string (root-cause guard covering all callers).

Not exercised on device: full successful submission (needs a camera/gallery photo plus confirmation), the success tone/dwell, and dark appearance.

## Follow-up cycle — Android system Back (`ADD.OFFER.EXIT.001-R8`)
Device verification exposed that the system Back action exited the app instead of closing the Add Offer overlay.

| Stage | Command | Result |
|---|---|---|
| Spec update | `ADD.OFFER.EXIT.001` R8 + BDD scenario | Back is treated as Cancel, with the same confirmation rules |
| RED | `npm test -- addOfferBack.test.tsx` | 2/2 FAIL — no `hardwareBackPress` handler registered |
| GREEN | `npm test -- addOfferBack.test.tsx` | PASS — 2 tests |
| Verification | `npm test` | PASS — 47 suites, 289 tests; `npm run typecheck` clean |
| Device | mobile-mcp on `DealsSeekerApi` via port 8081 | Empty draft: Back closes overlay and stays in Offers; dirty draft: Back shows the discard confirmation |

Implementation: `BackHandler.addEventListener('hardwareBackPress', …)` routes to the existing `handleCancel` and returns `true`; a ref prevents a duplicate confirmation while the native dialog is open.

## Follow-up cycle — tablet composition (`ADD.OFFER.TABLET.LAYOUT.001`)
Closes the final audit P3 (phone-first form stretching on tablets). Web stays phone-first because `APP.ADAPTIVE.UX.001` rules out a wide desktop reflow.

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferTabletLayout.test.tsx adaptiveLayout.test.ts` | 3 FAIL — no `resolveAddOfferColumns`, no two-column wrapper |
| GREEN | same | PASS — 8 tests |
| Verification | `npm test` | PASS — 48 suites, 294 tests; `npm run typecheck` clean |
| Device | mobile-mcp, emulator temporarily set to 800 dp width | `add-offer-tablet-columns` present; primary column at x=16, secondary at x=408; display restored to 720x1280 / 320 dpi afterward |

Implementation: `resolveAddOfferColumns(width)` reuses the shared 720-unit breakpoint; the screen picks one or two columns with `useWindowDimensions` (hook called before the early returns to preserve hook order) and groups Images+Location on the left and Description+Tags+Submit on the right without duplicating controls.
