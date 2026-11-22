import { translate } from '../../../src/DealsSeeker.ReactNative/src/utils/translations';

describe('translations', () => {
  it('returns the key in the requested language', () => {
    expect(translate('en', 'app.title')).toBe('DealsSeeker');
    expect(translate('es', 'nav.offers')).toBe('Ofertas');
  });

  it('falls back to English when a Spanish key is missing', () => {
    expect(translate('es', 'app.title')).toBe('DealsSeeker');
  });

  it('returns the key itself when it is unknown in every language', () => {
    expect(translate('en', 'missing.key')).toBe('missing.key');
  });
});
