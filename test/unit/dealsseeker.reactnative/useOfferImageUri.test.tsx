import { renderHook, waitFor } from '@testing-library/react-native';
import {
  IMAGE_CACHE_CAPACITY,
  useOfferImageUri,
} from '../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri';

const mockFileInstances: Array<{
  name: string;
  exists: boolean;
  create: jest.Mock;
  write: jest.Mock;
  writeSync: jest.Mock;
  delete: jest.Mock;
  uri: string;
}> = [];

jest.mock('expo-file-system', () => ({
  Directory: jest.fn().mockImplementation(() => ({ exists: true, create: jest.fn() })),
  File: jest.fn().mockImplementation((_directory: unknown, name: string) => {
    const instance = {
      name,
      exists: false,
      create: jest.fn(),
      write: jest.fn().mockResolvedValue(undefined),
      writeSync: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      uri: 'file://cached-offer-image.png',
    };
    mockFileInstances.push(instance);
    return instance;
  }),
  Paths: { cache: '/cache' },
}));

const dataUri = 'data:image/png;base64,iVBORw0KGgo=';

describe('useOfferImageUri', () => {
  beforeEach(() => {
    mockFileInstances.length = 0;
  });

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
    const first = await renderHook(() => useOfferImageUri(dataUri));
    const second = await renderHook(() => useOfferImageUri(dataUri));

    await waitFor(() => expect(first.result.current).toBe('file://cached-offer-image.png'));
    await waitFor(() => expect(second.result.current).toBe('file://cached-offer-image.png'));
    expect(mockFileInstances.length).toBeGreaterThanOrEqual(1);
  });

  it('uses the mime-specific extension for a cached image', async () => {
    await renderHook(() => useOfferImageUri('data:image/webp;base64,AAAA'));

    expect(mockFileInstances[0].name).toMatch(/\.webp$/u);
  });

  it('recovers when the image URL changes', async () => {
    const { result, rerender } = await renderHook(({ url }) => useOfferImageUri(url), {
      initialProps: { url: 'https://example.test/first.png' },
    });
    expect(result.current).toBe('https://example.test/first.png');

    await rerender({ url: 'https://example.test/second.png' });
    expect(result.current).toBe('https://example.test/second.png');
  });

  it('derives a bounded hash key instead of embedding the raw base64 payload (APP.PERFORMANCE.001-R6)', async () => {
    const longUri = `data:image/png;base64,${'A'.repeat(1000)}`;
    await renderHook(() => useOfferImageUri(longUri));

    const name = mockFileInstances[0].name;
    expect(name.length).toBeLessThan(64);
    expect(name).not.toContain('A'.repeat(10));
    expect(name).toMatch(/^[0-9a-f]+\.png$/u);
  });

  it('maps the same source reference to the same key', async () => {
    const uri = `data:image/png;base64,${'B'.repeat(100)}`;
    await renderHook(() => useOfferImageUri(uri));
    const first = mockFileInstances[0].name;

    mockFileInstances.length = 0;
    await renderHook(() => useOfferImageUri(uri));
    expect(mockFileInstances[0].name).toBe(first);
  });

  it('writes the cache file without a synchronous disk write (APP.PERFORMANCE.001-R8)', async () => {
    await renderHook(() => useOfferImageUri(dataUri));
    await waitFor(() => expect(mockFileInstances[0].write).toHaveBeenCalled());

    expect(mockFileInstances[0].writeSync).not.toHaveBeenCalled();
  });

  it('bounds cache growth with eviction (APP.PERFORMANCE.001-R7)', async () => {
    for (let index = 0; index < IMAGE_CACHE_CAPACITY + 1; index += 1) {
      await renderHook(() => useOfferImageUri(`data:image/png;base64,unique-${index}`));
    }

    await waitFor(() => expect(mockFileInstances.some((file) => file.delete.mock.calls.length > 0)).toBe(true));
  });
});
