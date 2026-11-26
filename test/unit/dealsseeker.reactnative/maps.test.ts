jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
}));

const MAPS_PATH = '../../../src/DealsSeeker.ReactNative/src/utils/maps';

function loadMaps(os = 'web') {
  process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER = 'OpenLayers';
  jest.resetModules();

  const reactNative = require('react-native');
  reactNative.Platform.OS = os;
  reactNative.Linking.canOpenURL.mockResolvedValue(true);

  const { openDirections } = require(MAPS_PATH);
  return { openDirections, Linking: reactNative.Linking };
}

const destination = { lat: 40.7128, lng: -74.006 };
const walkingUrl = 'https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=walking';
const drivingUrl = 'https://www.google.com/maps/dir/?api=1&destination=40.7128,-74.006&travelmode=driving';

describe('map directions', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_MAP_REDIRECT_PROVIDER;
  });

  it('opens the Google Maps directions URL for pedestrian mode', async () => {
    const { openDirections, Linking } = loadMaps();

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith(walkingUrl);
  });

  it('opens the directions preview in walking mode on Android without auto-navigation', async () => {
    const { openDirections, Linking } = loadMaps('android');

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith(walkingUrl);
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
  });

  it('opens the directions preview in driving mode on Android for car', async () => {
    const { openDirections, Linking } = loadMaps('android');

    await openDirections(destination, 'car');

    expect(Linking.openURL).toHaveBeenCalledWith(drivingUrl);
  });

  it('opens the Google Maps directions URL on iOS instead of a native maps app URL', async () => {
    const { openDirections, Linking } = loadMaps('ios');

    await openDirections(destination, 'pedestrian');

    expect(Linking.openURL).toHaveBeenCalledWith(walkingUrl);
  });

  it('ignores an alternate redirect provider setting', async () => {
    const { openDirections, Linking } = loadMaps();

    await openDirections(destination, 'car');

    expect(Linking.openURL).toHaveBeenCalledWith(drivingUrl);
  });
});
