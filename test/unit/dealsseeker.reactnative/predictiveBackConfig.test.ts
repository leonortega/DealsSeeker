import fs from 'fs';
import path from 'path';

const appConfig = require('../../../src/DealsSeeker.ReactNative/app.json');
const sourceRoot = path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src');
const readSource = (relativePath: string) => fs.readFileSync(path.join(sourceRoot, relativePath), 'utf8');

describe('predictive Back (APP.SHELL.002-R13)', () => {
  it('enables the Android predictive Back gesture', () => {
    expect(appConfig.expo.android.predictiveBackGestureEnabled).toBe(true);
  });

  it('does not install an application-level hardware Back interceptor', () => {
    expect(readSource('components/BackNavigationHandler.tsx')).not.toMatch(/addEventListener\(\s*['"]hardwareBackPress/);
    expect(readSource('components/BackNavigationHandler.tsx')).not.toMatch(/BackHandler\.exitApp/);
    expect(readSource('../App.tsx')).not.toMatch(/hardwareBackPress/);
  });

  it('resolves overlays and immersive dismissal through native navigation lifecycle', () => {
    const navigator = readSource('navigation/AppNavigator.tsx');
    expect(navigator).toMatch(/addListener\(\s*['"]beforeRemove/);
    expect(readSource('navigation/shellOptions.ts')).toMatch(/gestureEnabled:\s*true/);
  });
});
