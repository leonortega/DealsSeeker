const appConfig = require('../../../src/DealsSeeker.ReactNative/app.json');

describe('orientation configuration (APP.ADAPTIVE.UX.001-R3)', () => {
  it('lets the operating system control orientation so landscape is reachable', () => {
    expect(appConfig.expo.orientation).toBe('default');
  });
});
