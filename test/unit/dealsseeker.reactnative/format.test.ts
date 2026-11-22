import {
  extractCompletedWord,
  extractWords,
  formatDistanceMeters,
  partitionOffers,
  shorten,
  validateEmail,
  validateStrongPassword,
} from '../../../src/DealsSeeker.ReactNative/src/utils/format';
import { OfferItemDto } from '../../../src/DealsSeeker.ReactNative/src/api/types';

function offer(overrides: Partial<OfferItemDto> = {}): OfferItemDto {
  return {
    offerId: 'off-1',
    businessId: 'biz-1',
    businessName: 'Cafe',
    description: 'coffee',
    tags: [],
    imageUrl: '',
    imageUrls: [],
    isActive: true,
    isPromoted: false,
    isFavorite: false,
    isReported: false,
    relevanceScore: 0,
    matchStrategies: [],
    location: { lat: 0, lng: 0 },
    distanceMeters: 0,
    positiveAvailabilityCount: 0,
    negativeAvailabilityCount: 0,
    hasCurrentUserVoted: false,
    ...overrides,
  };
}

describe('format utilities', () => {
  it.each([
    [12.6, '13 m'],
    [-5, '0 m'],
    [0, '0 m'],
  ])('formats %p metres as %p', (value, expected) => {
    expect(formatDistanceMeters(value)).toBe(expected);
  });

  it('trims text and leaves short text unchanged', () => {
    expect(shorten('  hello  ')).toBe('hello');
  });

  it('ellipsises text longer than the limit', () => {
    expect(shorten('abcdefghij', 6)).toBe('abc...');
  });

  it('extracts unique words, keeping percentages and trailing apostrophes', () => {
    expect(extractWords('Café café, 50% O\'Brien!')).toEqual(['Café', 'café', '50%', "O'Brien"]);
  });

  it('extracts only a completed trailing word', () => {
    expect(extractCompletedWord('fresh coffe ')).toBe('coffe');
    expect(extractCompletedWord('fresh ')).toBe('fresh');
    expect(extractCompletedWord('')).toBeNull();
  });

  it.each([
    ['a@b.co', true],
    ['  a@b.co  ', true],
    ['not-email', false],
    ['a@b', false],
  ])('validates email %p', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });

  it.each([
    ['password1', true],
    ['12345678', false],
    ['abcdefgh', false],
    ['short1', false],
  ])('validates password %p', (password, expected) => {
    expect(validateStrongPassword(password)).toBe(expected);
  });

  it('partitions promoted offers when there is no query', () => {
    const promoted = offer({ offerId: 'p', isPromoted: true });
    const regular = offer({ offerId: 'r' });
    const reportedPromoted = offer({ offerId: 'rp', isPromoted: true, isReported: true });

    const result = partitionOffers([regular, promoted, reportedPromoted], '');

    expect(result.promoted.map((item) => item.offerId)).toEqual(['p']);
    expect(result.feed.map((item) => item.offerId)).toEqual(['r', 'rp']);
  });

  it('does not promote offers when a query is present', () => {
    const promoted = offer({ offerId: 'p', isPromoted: true });
    const reported = offer({ offerId: 'r', isReported: true });

    const result = partitionOffers([promoted, reported], 'coffee');

    expect(result.promoted).toEqual([]);
    expect(result.feed.map((item) => item.offerId)).toEqual(['p', 'r']);
  });
});
