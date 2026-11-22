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
  it('normalizes provider names case-insensitively', () => {
    const { normalizeProvider } = loadConfig({});

    expect(normalizeProvider(' googlemaps ')).toBe('GoogleMaps');
    expect(normalizeProvider('OPENLAYERS')).toBe('OpenLayers');
    expect(normalizeProvider(undefined)).toBe('OpenLayers');
    expect(normalizeProvider('mystery')).toBe('OpenLayers');
  });

  it('strips a trailing slash from the base URL', () => {
    const { apiConfig } = loadConfig({ EXPO_PUBLIC_API_BASE_URL: 'http://example.com:5005/' });

    expect(apiConfig.baseUrl).toBe('http://example.com:5005');
  });

  it('falls back for display when GoogleMaps has no API key', () => {
    const withoutKey = loadConfig({
      EXPO_PUBLIC_MAP_DISPLAY_PROVIDER: 'GoogleMaps',
      EXPO_PUBLIC_MAP_DISPLAY_PROVIDER_FALLBACK: 'OpenLayers',
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: '',
    });
    const withKey = loadConfig({
      EXPO_PUBLIC_MAP_DISPLAY_PROVIDER: 'GoogleMaps',
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'key',
    });

    expect(withoutKey.resolveDisplayProvider()).toBe('OpenLayers');
    expect(withKey.resolveDisplayProvider()).toBe('GoogleMaps');
  });

  it('resolves the redirect provider and its fallback', () => {
    const google = loadConfig({ EXPO_PUBLIC_MAP_REDIRECT_PROVIDER: 'GoogleMaps' });
    const openLayers = loadConfig({
      EXPO_PUBLIC_MAP_REDIRECT_PROVIDER: 'OpenLayers',
      EXPO_PUBLIC_MAP_REDIRECT_PROVIDER_FALLBACK: 'GoogleMaps',
    });

    expect(google.resolveRedirectProvider()).toBe('GoogleMaps');
    expect(openLayers.resolveRedirectProvider()).toBe('GoogleMaps');
  });

  it('supports the legacy provider environment keys', () => {
    const legacy = loadConfig({
      EXPO_PUBLIC_MAP_PROVIDER: 'GoogleMaps',
      EXPO_PUBLIC_MAP_PROVIDER_FALLBACK: 'OpenLayers',
    });

    expect(legacy.apiConfig.mapDisplayProvider).toBe('GoogleMaps');
    expect(legacy.apiConfig.mapRedirectProviderFallback).toBe('OpenLayers');
  });
});
