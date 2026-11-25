jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
}));

const MAPS_PATH = '../../../src/DealsSeeker.ReactNative/src/utils/maps';

interface MapOptions {
  os?: string;
  canOpenNative?: boolean;
}

function loadMaps(options: MapOptions = {}) {
  const { os = 'web', canOpenNative = true } = options;

  process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER = 'OpenLayers';
  jest.resetModules();

  const reactNative = require('react-native');
  reactNative.Platform.OS = os;
  reactNative.Linking.canOpenURL.mockResolvedValue(canOpenNative);

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

  it('falls back to the Google Maps web URL when the native intent is unavailable', async () => {
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

  it('ignores an alternate redirect provider setting', async () => {
    const { openDirections, Linking } = loadMaps();

    await openDirections(destination, 'car');

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=driving'
    );
  });
});
