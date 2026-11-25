const CONFIG_PATH = '../../../src/DealsSeeker.ReactNative/src/api/config';

function loadConfig(env: Record<string, string>) {
  const saved = { ...process.env };
  jest.resetModules();
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  const module = require(CONFIG_PATH);
  process.env = saved;
  return module;
}

describe('API/map configuration', () => {
  it('strips a trailing slash from the base URL', () => {
    const { apiConfig } = loadConfig({ EXPO_PUBLIC_API_BASE_URL: 'http://example.com:5005/' });

    expect(apiConfig.baseUrl).toBe('http://example.com:5005');
  });

  it('keeps the Google Maps credential but exposes no provider switches', () => {
    const { apiConfig, normalizeProvider, resolveDisplayProvider, resolveRedirectProvider } = loadConfig({
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'key',
      EXPO_PUBLIC_MAP_PROVIDER: 'OpenLayers',
      EXPO_PUBLIC_MAP_REDIRECT_PROVIDER: 'OpenLayers',
    });

    expect(apiConfig.googleMapsApiKey).toBe('key');
    expect(apiConfig.mapDisplayProvider).toBeUndefined();
    expect(apiConfig.mapRedirectProvider).toBeUndefined();
    expect(normalizeProvider).toBeUndefined();
    expect(resolveDisplayProvider).toBeUndefined();
    expect(resolveRedirectProvider).toBeUndefined();
  });
});
