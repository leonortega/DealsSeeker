import { Platform } from 'react-native';

function resolveDefaultApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5005';
  }

  return 'http://localhost:5005';
}

const defaultApiBaseUrl = resolveDefaultApiBaseUrl();

export const apiConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl).replace(/\/$/, ''),
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  mapDisplayProvider:
    process.env.EXPO_PUBLIC_MAP_DISPLAY_PROVIDER ??
    process.env.EXPO_PUBLIC_MAP_PROVIDER ??
    'OpenLayers',
  mapDisplayProviderFallback:
    process.env.EXPO_PUBLIC_MAP_DISPLAY_PROVIDER_FALLBACK ??
    process.env.EXPO_PUBLIC_MAP_PROVIDER_FALLBACK ??
    'OpenLayers',
  mapRedirectProvider:
    process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER ??
    process.env.EXPO_PUBLIC_MAP_PROVIDER ??
    'GoogleMaps',
  mapRedirectProviderFallback:
    process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER_FALLBACK ??
    process.env.EXPO_PUBLIC_MAP_PROVIDER_FALLBACK ??
    'OpenLayers',
};

export function normalizeProvider(provider?: string | null): 'GoogleMaps' | 'OpenLayers' {
  return provider?.trim().toLowerCase() === 'googlemaps' ? 'GoogleMaps' : 'OpenLayers';
}

export function resolveDisplayProvider() {
  const selected = normalizeProvider(apiConfig.mapDisplayProvider);
  if (selected === 'GoogleMaps' && apiConfig.googleMapsApiKey.trim().length === 0) {
    return normalizeProvider(apiConfig.mapDisplayProviderFallback);
  }

  return selected;
}

export function resolveRedirectProvider() {
  const selected = normalizeProvider(apiConfig.mapRedirectProvider);
  if (selected === 'GoogleMaps') {
    return 'GoogleMaps';
  }

  return normalizeProvider(apiConfig.mapRedirectProviderFallback);
}
