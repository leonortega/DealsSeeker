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
| `APP.SHELL.001` | `bdd/app-shell.feature`, `bdd/account-management.feature` | N/A | N/A |
| `APP.CONFIG.MAPS.001` | `bdd/map-provider-configuration.feature` | N/A | N/A |
| `ACCOUNT.AUTH.LOGIN.001` | `bdd/account-management.feature` | N/A | N/A |
| `ACCOUNT.AUTH.REGISTER.001` | `bdd/account-management.feature` | N/A | N/A |
| `ACCOUNT.PROFILE.001` | `bdd/account-management.feature` | N/A | N/A |
| `OFFERS.LAYOUT.001` | `bdd/offers-layout-and-navigation.feature` | N/A | N/A |
| `OFFERS.SEARCH.001` | `bdd/offers-search.feature` | `contracts/json-schema/offer-search-request.schema.json`, `contracts/json-schema/offer-search-response.schema.json` | `examples/offers-search/*` |
| `OFFERS.MAP.001` | `bdd/offers-search.feature`, `bdd/offers-list-item.feature`, `bdd/map-provider-configuration.feature` | N/A | `examples/offers-search/search-by-tag.output.json` |
| `OFFERS.LIST.ITEM.001` | `bdd/offers-list-item.feature` | N/A | N/A |
| `OFFERS.LIST.ACTIONS.001` | `bdd/offers-list-item.feature`, `bdd/reports-offer-prefill.feature` | `contracts/json-schema/offer-search-response.schema.json` | N/A |
| `REPORTS.OFFER.PREFILL.001` | `bdd/reports-offer-prefill.feature` | N/A | N/A |
| `OFFERS.NAV.ADD.001` | `bdd/offers-layout-and-navigation.feature` | N/A | N/A |
| `ADD.OFFER.LAYOUT.001` | `bdd/add-offer-layout.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/*` |
| `ADD.OFFER.IMAGE.001` | `bdd/add-offer-image.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/add-offer-draft.valid.json` |
| `ADD.OFFER.LOCATION.001` | `bdd/add-offer-image.feature`, `bdd/add-offer-location.feature`, `bdd/map-provider-configuration.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/add-offer-draft.valid.json`, `examples/add-offer/add-offer-draft.manual-location.json` |
| `ADD.OFFER.DESCRIPTION.TAGS.001` | `bdd/add-offer-tags.feature` | `contracts/json-schema/add-offer-draft.schema.json` | `examples/add-offer/add-offer-draft.valid.json` |
