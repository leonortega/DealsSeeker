import { resolveShellChrome, resolveTheme } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

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
