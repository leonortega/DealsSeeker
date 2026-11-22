import {
  resolveOffersViewState,
  type OffersStateInput,
} from '../../../src/DealsSeeker.ReactNative/src/utils/offersState';

describe('resolveOffersViewState', () => {
  const input: OffersStateInput = {
    hasOffers: true,
    searchFailed: false,
    hasActiveFilters: false,
  };

  it('reports no state when offers are available', () => {
    expect(resolveOffersViewState(input)).toEqual({ kind: 'none' });
  });

  it('reports the search error when the search failed, even with offers present', () => {
    expect(resolveOffersViewState({ ...input, searchFailed: true })).toEqual({ kind: 'search-error' });
  });

  it.each([
    ['query', { hasActiveFilters: true }],
    ['favorites-only', { hasActiveFilters: true }],
  ])('reports a filtered no-results state for %s', (_label, overrides) => {
    expect(resolveOffersViewState({ ...input, hasOffers: false, ...overrides })).toEqual({
      kind: 'no-results-filtered',
    });
  });

  it('reports the empty state when no offers and no filters are present', () => {
    expect(resolveOffersViewState({ ...input, hasOffers: false })).toEqual({ kind: 'empty' });
  });

  it('prioritizes the search error over the empty state', () => {
    expect(resolveOffersViewState({ ...input, hasOffers: false, searchFailed: true })).toEqual({
      kind: 'search-error',
    });
  });
});
