import { resolveOffersGridColumns } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

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
