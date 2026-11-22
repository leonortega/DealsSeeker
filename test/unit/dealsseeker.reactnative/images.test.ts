import { apiConfig } from '../../../src/DealsSeeker.ReactNative/src/api/config';
import { isSvgImageUri, resolveOfferImageUri } from '../../../src/DealsSeeker.ReactNative/src/utils/images';

describe('image utilities', () => {
  it('returns null for blank input', () => {
    expect(resolveOfferImageUri(null)).toBeNull();
    expect(resolveOfferImageUri('   ')).toBeNull();
  });

  it.each([
    'https://example.com/a.png',
    'http://example.com/a.png',
    'data:image/png;base64,abc',
    'file:///tmp/a.png',
    'content://media/a',
    'blob:http://localhost/uuid',
  ])('passes through absolute URI %p', (uri) => {
    expect(resolveOfferImageUri(uri)).toBe(uri);
  });

  it('resolves root-relative paths against the API base URL', () => {
    expect(resolveOfferImageUri('/images/offer-placeholder.svg')).toBe(
      `${apiConfig.baseUrl}/images/offer-placeholder.svg`
    );
  });

  it('rejects other relative paths', () => {
    expect(resolveOfferImageUri('images/a.png')).toBeNull();
  });

  it('detects SVG images case-insensitively', () => {
    expect(isSvgImageUri('/a.SVG')).toBe(true);
    expect(isSvgImageUri('data:image/svg+xml;base64,abc')).toBe(true);
    expect(isSvgImageUri('/a.png')).toBe(false);
    expect(isSvgImageUri(null)).toBe(false);
  });
});
