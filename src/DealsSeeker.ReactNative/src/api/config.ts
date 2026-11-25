import { Platform } from 'react-native';

function resolveDefaultApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5005';
  }

  return 'http://localhost:5005';
}

export const apiConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? resolveDefaultApiBaseUrl()).replace(/\/$/, ''),
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
};
