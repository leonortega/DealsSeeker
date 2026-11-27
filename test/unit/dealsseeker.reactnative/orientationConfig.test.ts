const appConfig = require('../../../src/DealsSeeker.ReactNative/app.json');

describe('orientation configuration (APP.ADAPTIVE.UX.001-R3)', () => {
  it('lets the operating system control orientation so landscape is reachable', () => {
    expect(appConfig.expo.orientation).toBe('default');
  });
});

describe('startup surface appearance (APP.THEME.001-R12)', () => {
  it('provides a dark background variant when the device uses dark appearance', () => {
    const plugin = appConfig.expo.plugins.find(
      (entry: unknown) => Array.isArray(entry) && entry[0] === 'expo-splash-screen'
    );
    const options = plugin[1];

    expect(options.backgroundColor).not.toBe(options.dark.backgroundColor);
    expect(options.dark.backgroundColor).toBe('#121417');
  });
});
