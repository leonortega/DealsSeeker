const appConfig = require('../../../src/DealsSeeker.ReactNative/app.json');

describe('predictive Back configuration (APP.SHELL.004-R7)', () => {
  it('enables the Android predictive Back gesture', () => {
    expect(appConfig.expo.android.predictiveBackGestureEnabled).toBe(true);
  });
});
