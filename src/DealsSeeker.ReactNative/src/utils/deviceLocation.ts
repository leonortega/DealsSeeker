import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { requireOptionalNativeModule } from 'expo';

export interface DevicePosition {
  lat: number;
  lng: number;
}

interface NativePlatformLocation {
  getCurrentPositionAsync(timeoutMs: number): Promise<{ latitude: number; longitude: number }>;
}

export const DEVICE_LOCATION_TIMEOUT_MS = 15_000;

/**
 * Android reads the OS location provider directly so emulator-injected
 * positions are honoured. Other platforms keep the cross-platform API.
 */
export async function getDevicePositionAsync(): Promise<DevicePosition> {
  if (Platform.OS === 'android') {
    const native = requireOptionalNativeModule<NativePlatformLocation>('DealsSeekerLocation');
    if (native) {
      const position = await native.getCurrentPositionAsync(DEVICE_LOCATION_TIMEOUT_MS);
      return { lat: position.latitude, lng: position.longitude };
    }
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.LocationAccuracy.Balanced,
  });
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}
