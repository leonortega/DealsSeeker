import { resolveShellChrome } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const light = { mode: 'light', background: '#f4efe6' } as Palette;
const dark = { mode: 'dark', background: '#17201d' } as Palette;

describe('resolveShellChrome', () => {
  it('uses the fixed plum backdrop and light status icons for immersive light theme', () => {
    expect(resolveShellChrome(true, light)).toEqual({ background: '#181421', statusBarStyle: 'light' });
  });

  it('uses the fixed plum backdrop and light status icons for immersive dark theme', () => {
    expect(resolveShellChrome(true, dark)).toEqual({ background: '#181421', statusBarStyle: 'light' });
  });

  it('keeps the standard light background and dark status icons outside immersive', () => {
    expect(resolveShellChrome(false, light)).toEqual({ background: '#f4efe6', statusBarStyle: 'dark' });
  });

  it('keeps the standard dark background and light status icons outside immersive', () => {
    expect(resolveShellChrome(false, dark)).toEqual({ background: '#17201d', statusBarStyle: 'light' });
  });
});
