import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import {
  DEVICE_LOCATION_TIMEOUT_MS,
  getDevicePositionAsync,
} from '../../../src/DealsSeeker.ReactNative/src/utils/deviceLocation';

jest.mock('expo', () => ({
  requireOptionalNativeModule: jest.fn(),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
}));

const mockNative = requireOptionalNativeModule as jest.Mock;

describe('getDevicePositionAsync (APP.LOCATION.DEVICE.001)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('reads the platform provider on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const getCurrentPositionAsync = jest.fn().mockResolvedValue({ latitude: -31.406609, longitude: -64.243714 });
    mockNative.mockReturnValue({ getCurrentPositionAsync });

    await expect(getDevicePositionAsync()).resolves.toEqual({ lat: -31.406609, lng: -64.243714 });
    expect(mockNative).toHaveBeenCalledWith('DealsSeekerLocation');
    expect(getCurrentPositionAsync).toHaveBeenCalledWith(DEVICE_LOCATION_TIMEOUT_MS);
  });

  it('falls back to the cross-platform location API when no platform module is linked', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockNative.mockReturnValue(null);
    const expoLocation = require('expo-location');
    expoLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });

    await expect(getDevicePositionAsync()).resolves.toEqual({ lat: 40.7128, lng: -74.006 });
  });
});
