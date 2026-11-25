import { resolveFeedRestoreIndex } from '../../../src/DealsSeeker.ReactNative/src/utils/feedPosition';

const offers = [{ offerId: 'a' }, { offerId: 'b' }, { offerId: 'c' }];

describe('resolveFeedRestoreIndex (OFFERS.FEED.STABILITY.001)', () => {
  it('returns the index of the offer still present in refreshed results', () => {
    expect(resolveFeedRestoreIndex(offers, 'b')).toBe(1);
  });

  it('does not restore when the active offer is the first page', () => {
    expect(resolveFeedRestoreIndex(offers, 'a')).toBeNull();
  });

  it('returns null when the active offer is gone or unknown', () => {
    expect(resolveFeedRestoreIndex(offers, 'missing')).toBeNull();
    expect(resolveFeedRestoreIndex(offers, null)).toBeNull();
  });
});
