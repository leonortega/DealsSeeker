import { immersiveBackdrop, resolveTheme } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

describe('theme utilities', () => {
  it('resolves explicit modes regardless of the system scheme', () => {
    const light = resolveTheme('light', 'dark');
    const dark = resolveTheme('dark', 'light');

    expect(light.mode).toBe('light');
    expect(dark.mode).toBe('dark');
    expect(light.ink).not.toBe(dark.ink);
  });

  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
    [null, 'light'],
    [undefined, 'light'],
  ])('resolves system mode with scheme %p', (scheme, expectedMode) => {
    expect(resolveTheme('system', scheme).mode).toBe(expectedMode);
  });

  it('exposes a fixed immersive backdrop', () => {
    expect(immersiveBackdrop).toBe('#1b2f28');
  });
});
