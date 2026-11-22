jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3 },
}));

const MAPS_PATH = '../../../src/DealsSeeker.ReactNative/src/utils/maps';

interface MapOptions {
  provider?: string;
  os?: string;
  canOpenNative?: boolean;
  permissionGranted?: boolean;
  permissionError?: boolean;
}

function loadMaps(options: MapOptions = {}) {
  const {
    provider = 'GoogleMaps',
    os = 'web',
    canOpenNative = true,
    permissionGranted = false,
    permissionError = false,
  } = options;

  process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER = provider;
  jest.resetModules();

  const reactNative = require('react-native');
  const location = require('expo-location');
  reactNative.Platform.OS = os;
  reactNative.Linking.canOpenURL.mockResolvedValue(canOpenNative);
  location.requestForegroundPermissionsAsync.mockResolvedValue({ granted: permissionGranted });
  if (permissionError) {
    location.requestForegroundPermissionsAsync.mockRejectedValue(new Error('denied'));
  }
  location.getCurrentPositionAsync.mockResolvedValue({
    coords: { latitude: 40.7, longitude: -74.0 },
  });

  const { openDirections } = require(MAPS_PATH);
  return { openDirections, Linking: reactNative.Linking };
}

const destination = { lat: 40.7128, lng: -74.006 };

describe('map directions', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER;
  });

  it('opens the Google Maps web URL for pedestrian mode', async () => {
    const { openDirections, Linking } = loadMaps();

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=walking'
    );
  });

  it('opens the native Android intent when supported', async () => {
    const { openDirections, Linking } = loadMaps({ os: 'android' });

    await openDirections(destination, 'car');

    expect(Linking.openURL).toHaveBeenCalledWith('google.navigation:q=40.7128,-74.006&mode=d');
  });

  it('falls back to the web URL when the native intent is unavailable', async () => {
    const { openDirections, Linking } = loadMaps({ os: 'android', canOpenNative: false });

    await openDirections(destination, 'car');

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=driving'
    );
  });

  it('opens the native iOS URL when supported', async () => {
    const { openDirections, Linking } = loadMaps({ os: 'ios' });

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith('maps://?daddr=40.7128,-74.006&dirflg=w');
  });

  it('includes the current position in the OpenStreetMap route when granted', async () => {
    const { openDirections, Linking } = loadMaps({ provider: 'OpenLayers', permissionGranted: true });

    await openDirections(destination, 'car');

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=40.7%2C-74%3B40.7128%2C-74.006'
    );
  });

  it('uses a plain map URL when no origin is available', async () => {
    const { openDirections, Linking } = loadMaps({ provider: 'OpenLayers' });

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.006#map=16/40.7128/-74.006'
    );
  });

  it('handles a location permission error', async () => {
    const { openDirections, Linking } = loadMaps({ provider: 'OpenLayers', permissionError: true });

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.006#map=16/40.7128/-74.006'
    );
  });
});
