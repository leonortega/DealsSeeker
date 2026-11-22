export interface OffersStateInput {
  hasOffers: boolean;
  searchFailed: boolean;
  hasActiveFilters: boolean;
}

export type OffersViewState =
  | { kind: 'none' }
  | { kind: 'search-error' }
  | { kind: 'no-results-filtered' }
  | { kind: 'empty' };

export function resolveOffersViewState(input: OffersStateInput): OffersViewState {
  if (input.searchFailed) {
    return { kind: 'search-error' };
  }

  if (input.hasOffers) {
    return { kind: 'none' };
  }

  return input.hasActiveFilters ? { kind: 'no-results-filtered' } : { kind: 'empty' };
}
