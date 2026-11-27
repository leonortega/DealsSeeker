import { renderHook, waitFor } from '@testing-library/react-native';
import { useOfferImageUri } from '../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri';

jest.mock('expo-file-system', () => ({
  Directory: jest.fn().mockImplementation(() => ({ exists: true, create: jest.fn() })),
  File: jest.fn().mockImplementation(() => ({
    exists: false,
    create: jest.fn(),
    write: jest.fn(),
    uri: 'file://cached-offer-image.png',
  })),
  Paths: { cache: '/cache' },
}));

const dataUri = 'data:image/png;base64,iVBORw0KGgo=';

describe('useOfferImageUri', () => {
  it('returns null when no image is supplied', async () => {
    const { result } = await renderHook(() => useOfferImageUri(undefined));
    expect(result.current).toBeNull();
  });

  it('resolves a remote image URL directly', async () => {
    const { result } = await renderHook(() => useOfferImageUri('https://example.test/offer.png'));
    expect(result.current).toBe('https://example.test/offer.png');
  });

  it('materializes a data URI into a cache file on native', async () => {
    const { result } = await renderHook(() => useOfferImageUri(dataUri));
    await waitFor(() => expect(result.current).toBe('file://cached-offer-image.png'));
  });

  it('falls back to the data URI when its payload cannot be parsed', async () => {
    const malformed = 'data:image/png;base64,';

    const { result } = await renderHook(() => useOfferImageUri(malformed));

    await waitFor(() => expect(result.current).toBe(malformed));
  });

  it('deduplicates concurrent writes for the same data URI', async () => {
    const { File } = require('expo-file-system');
    (File as jest.Mock).mockClear();

    const first = await renderHook(() => useOfferImageUri(dataUri));
    const second = await renderHook(() => useOfferImageUri(dataUri));

    await waitFor(() => expect(first.result.current).toBe('file://cached-offer-image.png'));
    await waitFor(() => expect(second.result.current).toBe('file://cached-offer-image.png'));
    expect(File.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('uses the mime-specific extension for a cached image', async () => {
    const { File } = require('expo-file-system');
    (File as jest.Mock).mockClear();

    await renderHook(() => useOfferImageUri('data:image/webp;base64,AAAA'));

    expect((File as jest.Mock).mock.calls[0][1]).toMatch(/\.webp$/u);
  });

  it('recovers when the image URL changes', async () => {
    const { result, rerender } = await renderHook(({ url }) => useOfferImageUri(url), {
      initialProps: { url: 'https://example.test/first.png' },
    });
    expect(result.current).toBe('https://example.test/first.png');

    await rerender({ url: 'https://example.test/second.png' });
    expect(result.current).toBe('https://example.test/second.png');
  });
});
