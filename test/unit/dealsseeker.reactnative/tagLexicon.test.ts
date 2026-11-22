import {
  getSuggestedTags,
  normalizeTag,
  resolveLanguageCode,
} from '../../../src/DealsSeeker.ReactNative/src/utils/tagLexicon';

describe('tag lexicon utilities', () => {
  it.each([
    [undefined, 'en'],
    [null, 'en'],
    ['', 'en'],
    ['  ', 'en'],
    ['en-US', 'en'],
    ['es_ES', 'es'],
    ['ES-ar', 'es'],
  ])('resolves language from %p', (locale, expected) => {
    expect(resolveLanguageCode(locale)).toBe(expected);
  });

  it.each([
    ['  Café!!!  ', 'cafe'],
    ['NIÑO', 'nino'],
    ['', ''],
  ])('normalizes %p to %p', (value, expected) => {
    expect(normalizeTag(value)).toBe(expected);
  });

  it('returns no suggestions when nothing is selected', () => {
    expect(getSuggestedTags([])).toEqual([]);
    expect(getSuggestedTags(['   '])).toEqual([]);
  });

  it('suggests related terms without the selected ones', () => {
    const suggestions = getSuggestedTags(['Coffee'], 'en');

    expect(suggestions).toContain('cafe');
    expect(suggestions).toContain('espresso');
    expect(suggestions).not.toContain('coffee');
    expect(suggestions).toEqual([...suggestions].sort((a, b) => a.localeCompare(b)));
  });

  it('respects the suggestion limit', () => {
    expect(getSuggestedTags(['coffee'], 'en', 0)).toEqual([]);
    expect(getSuggestedTags(['coffee'], 'en', 1)).toHaveLength(1);
  });

  it('handles Spanish and plural forms', () => {
    const suggestions = getSuggestedTags(['cafes'], 'es-ES');

    expect(suggestions).toContain('coffee');
    expect(suggestions).toContain('cafe');
  });
});
