import { resolveRouteChrome, resolveShellChrome, resolveTheme } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const light = resolveTheme('system', 'light', 'tangerine');
const dark = resolveTheme('system', 'dark', 'tangerine');

describe('resolveShellChrome', () => {
  it('uses the palette backdrop and light status icons for immersive light theme', () => {
    expect(resolveShellChrome(true, light)).toEqual({ background: light.backdrop, statusBarStyle: 'light' });
  });

  it('uses the palette backdrop and light status icons for immersive dark theme', () => {
    expect(resolveShellChrome(true, dark)).toEqual({ background: dark.backdrop, statusBarStyle: 'light' });
  });

  it('keeps the standard light background and dark status icons outside immersive', () => {
    expect(resolveShellChrome(false, light)).toEqual({ background: light.background, statusBarStyle: 'dark' });
  });

  it('keeps the standard dark background and light status icons outside immersive', () => {
    expect(resolveShellChrome(false, dark)).toEqual({ background: dark.background, statusBarStyle: 'light' });
  });
});

describe('resolveRouteChrome (APP.PLATFORM.CHROME.001-R7)', () => {
  it('uses dark status icons on a light auth route even if a global immersive flag is set', () => {
    expect(resolveRouteChrome('auth', light)).toEqual({ background: light.background, statusBarStyle: 'dark' });
    expect(resolveRouteChrome('auth', dark)).toEqual({ background: dark.background, statusBarStyle: 'light' });
  });

  it('uses light status icons for the immersive route', () => {
    expect(resolveRouteChrome('immersive', light)).toEqual({ background: light.backdrop, statusBarStyle: 'light' });
  });

  it('changes the status bar style when the rendered route changes', () => {
    expect(resolveRouteChrome('standard', light).statusBarStyle).toBe('dark');
    expect(resolveRouteChrome('immersive', light).statusBarStyle).toBe('light');
    expect(resolveRouteChrome('standard', light).statusBarStyle).toBe('dark');
  });

  it('keeps the splash background light when the palette is light', () => {
    expect(resolveRouteChrome('splash', light)).toEqual({ background: light.background, statusBarStyle: 'dark' });
  });
});
