# Traceability

## ID Convention
- Pattern: `<VIEW>.<AREA>.<NNN>`
- Examples:
  - `APP.SHELL.001`
  - `OFFERS.SEARCH.001`
  - `ADD.OFFER.IMAGE.001`

## Mapping Rules
1. Every spec ID must have at least one BDD scenario.
2. Every contract file must reference at least one spec ID.
3. Every example fixture must reference exactly one primary spec ID.
4. Related specs must be linked bidirectionally where behavior depends on each other.

## Initial Coverage Matrix

| Spec ID | Feature File | Contract | Examples |
|---|---|---|---|
| `APP.SHELL.001` | `bdd/app-shell.feature`, `bdd/account-management.feature` | N/A | `examples/application-shell/app-shell.startup.json` |
| `APP.LOGGING.001` | `bdd/logging-configuration.feature` | N/A | `examples/application-shell/app-logging.configuration.json` |
| `APP.CONFIG.MAPS.001` | `bdd/map-provider-configuration.feature` | `contracts/json-schema/location-search-result.schema.json`, `contracts/json-schema/location-search-results-response.schema.json`, `contracts/json-schema/geo-point.schema.json` | `examples/application-shell/app-config-maps.providers.json` |
| `APP.THEME.001` | `bdd/app-theme.feature` | N/A | `examples/application-shell/app-theme.system-dark.json` |
| `APP.LOCALIZATION.001` | `bdd/app-localization.feature` | N/A | `examples/application-shell/app-localization.es-ar.json` |
| `APP.NAVIGATION.MODE.001` | `bdd/app-navigation-mode.feature` | N/A | `examples/application-shell/app-navigation-mode.car.json` |
| `ACCOUNT.AUTH.LOGIN.001` | `bdd/account-management.feature` | `contracts/json-schema/login-request.schema.json`, `contracts/json-schema/auth-session.schema.json` | `examples/account-management/login-user.input.json`, `examples/account-management/login-user.output.json` |
| `ACCOUNT.AUTH.REGISTER.001` | `bdd/account-management.feature` | `contracts/json-schema/register-user-request.schema.json`, `contracts/json-schema/command-result.schema.json` | `examples/account-management/register-user.input.json`, `examples/account-management/register-user.output.json` |
| `ACCOUNT.PROFILE.001` | `bdd/account-management.feature` | `contracts/json-schema/user-profile.schema.json`, `contracts/json-schema/account-offers-response.schema.json`, `contracts/json-schema/offer-item.schema.json`, `contracts/json-schema/add-offer-draft.schema.json`, `contracts/json-schema/command-result.schema.json` | `examples/account-management/my-profile.output.json`, `examples/account-management/my-owned-offers.output.json`, `examples/account-management/owned-offer-draft.output.json`, `examples/account-management/logout.output.json` |
| `SUGGESTIONS.SUBMIT.001` | `bdd/suggestions-submit.feature`, `bdd/app-shell.feature` | `contracts/json-schema/suggestion-request.schema.json`, `contracts/json-schema/command-result.schema.json` | `examples/suggestions/submit-suggestion.input.json`, `examples/suggestions/submit-suggestion.output.json` |
| `REPORTS.SUBMIT.001` | `bdd/reports-submit.feature`, `bdd/app-shell.feature` | `contracts/json-schema/report-request.schema.json`, `contracts/json-schema/command-result.schema.json` | `examples/reports/report-generic.input.json`, `examples/reports/report-generic.output.json` |
| `OFFERS.LAYOUT.001` | `bdd/offers-layout-and-navigation.feature` | N/A | `examples/offers-view/offers-layout.render.json` |
| `OFFERS.SEARCH.001` | `bdd/offers-search.feature` | `contracts/json-schema/offer-search-request.schema.json`, `contracts/json-schema/offer-search-response.schema.json`, `contracts/json-schema/offer-item.schema.json`, `contracts/json-schema/business-marker.schema.json`, `contracts/json-schema/geo-point.schema.json` | `examples/offers-search/search-by-tag.input.json`, `examples/offers-search/search-by-tag.output.json`, `examples/offers-search/search-empty.output.json` |
| `OFFERS.SEARCH.SMART.001` | `bdd/offers-smart-search.feature` | `contracts/json-schema/offer-search-request.schema.json`, `contracts/json-schema/offer-search-response.schema.json`, `contracts/json-schema/offer-item.schema.json`, `contracts/json-schema/business-marker.schema.json` | `examples/offers-view/offers-smart-search.fuzzy.json` |
| `OFFERS.FEED.PROMOTED.001` | `bdd/offers-promoted.feature` | `contracts/json-schema/offer-search-response.schema.json` | `examples/offers-view/offers-promoted-feed.json` |
| `OFFERS.GRID.CARDS.001` | `bdd/offers-grid-cards.feature` | N/A | `examples/offers-view/offers-grid-cards.mobile.json` |
| `OFFERS.IMAGE.RENDERING.001` | `bdd/offers-image-rendering.feature` | `contracts/json-schema/add-offer-draft.schema.json`, `contracts/json-schema/offer-search-response.schema.json` | `examples/offers-view/offers-image-rendering.framing.json` |
| `OFFERS.FAVORITES.001` | `bdd/offers-favorites.feature` | `contracts/json-schema/offer-search-response.schema.json`, `contracts/json-schema/set-favorite-request.schema.json`, `contracts/json-schema/command-result.schema.json` | `examples/offers-actions/set-favorite.input.json`, `examples/offers-actions/set-favorite.output.json`, `examples/offers-view/offers-favorites.toggle.json` |
| `OFFERS.REPORTED.DEMOTION.001` | `bdd/offers-reported-demotion.feature` | `contracts/json-schema/offer-search-response.schema.json` | `examples/offers-view/offers-reported-demotion.order.json` |
| `OFFERS.DETAIL.ACTIONS.001` | `bdd/offers-detail-actions.feature` | `contracts/json-schema/offer-search-response.schema.json`, `contracts/json-schema/offer-item.schema.json` | `examples/offers-view/offers-detail-actions.zoom-directions.json` |
| `OFFERS.PHOTOS.CAROUSEL.001` | `bdd/offers-photos-carousel.feature` | `contracts/json-schema/add-offer-draft.schema.json`, `contracts/json-schema/offer-search-response.schema.json` | `examples/offers-view/offers-photos-carousel.reorder.json` |
| `OFFERS.MAP.001` | `bdd/offers-search.feature`, `bdd/offers-list-item.feature`, `bdd/map-provider-configuration.feature` | N/A | `examples/offers-view/offers-map.directions.json` |
| `OFFERS.LIST.ITEM.001` | `bdd/offers-list-item.feature` | N/A | `examples/offers-view/offers-list-item.render.json` |
| `OFFERS.LIST.ACTIONS.001` | `bdd/offers-list-item.feature`, `bdd/reports-offer-prefill.feature` | `contracts/json-schema/offer-search-response.schema.json`, `contracts/json-schema/offer-availability-vote-request.schema.json`, `contracts/json-schema/report-offer-request.schema.json`, `contracts/json-schema/command-result.schema.json` | `examples/offers-actions/vote-availability.input.json`, `examples/offers-actions/vote-availability.output.json`, `examples/offers-actions/report-offer.input.json`, `examples/offers-actions/report-offer.output.json` |
| `REPORTS.OFFER.PREFILL.001` | `bdd/reports-offer-prefill.feature` | `contracts/json-schema/report-request.schema.json`, `contracts/json-schema/offer-item.schema.json` | `examples/reports/report-prefill.input.json` |
| `OFFERS.NAV.ADD.001` | `bdd/offers-layout-and-navigation.feature` | N/A | `examples/offers-view/offers-nav-add.tap.json` |
| `ADD.OFFER.LAYOUT.001` | `bdd/add-offer-layout.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/add-offer-layout.render.json` |
| `ADD.OFFER.IMAGE.001` | `bdd/add-offer-image.feature` | `contracts/json-schema/add-offer-draft.schema.json`, `contracts/json-schema/offer-image.schema.json` | `examples/add-offer/add-offer-draft.valid.json` |
| `ADD.OFFER.LOCATION.001` | `bdd/add-offer-image.feature`, `bdd/add-offer-location.feature`, `bdd/map-provider-configuration.feature` | `contracts/json-schema/add-offer-draft.schema.json`, `contracts/json-schema/offer-location.schema.json`, `contracts/json-schema/location-search-result.schema.json`, `contracts/json-schema/location-search-results-response.schema.json`, `contracts/json-schema/geo-point.schema.json` | `examples/add-offer/add-offer-draft.manual-location.json`, `examples/add-offer/add-offer-draft.permission-denied.json`, `examples/locations/location-search.output.json`, `examples/locations/location-reverse.output.json` |
| `ADD.OFFER.DESCRIPTION.TAGS.001` | `bdd/add-offer-tags.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/add-offer-description-tags.json` |
| `ADD.OFFER.TAGS.SUGGESTIONS.001` | `bdd/add-offer-tag-suggestions.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/add-offer-tag-suggestions.json` |
