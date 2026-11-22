import { resolveAddOfferColumns, resolveOffersGridColumns } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

describe('device-class grid columns (APP.ADAPTIVE.UX.001)', () => {
  it('uses one column on phone-sized widths', () => {
    expect(resolveOffersGridColumns(390)).toBe(1);
    expect(resolveOffersGridColumns(719)).toBe(1);
  });

  it('uses two columns on tablet-sized widths', () => {
    expect(resolveOffersGridColumns(720)).toBe(2);
    expect(resolveOffersGridColumns(1079)).toBe(2);
  });

  it('uses three columns on wide screens', () => {
    expect(resolveOffersGridColumns(1080)).toBe(3);
  });
});

describe('Add Offer tablet columns (ADD.OFFER.TABLET.LAYOUT.001)', () => {
  it('keeps one column below the shared tablet breakpoint', () => {
    expect(resolveAddOfferColumns(390)).toBe(1);
    expect(resolveAddOfferColumns(719)).toBe(1);
  });

  it('uses two columns from the shared tablet breakpoint upward', () => {
    expect(resolveAddOfferColumns(720)).toBe(2);
    expect(resolveAddOfferColumns(1024)).toBe(2);
  });
});
