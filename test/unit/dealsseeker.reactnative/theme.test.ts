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

  it('uses golden-hour tokens with light on-accent text', () => {
    const palette = resolveTheme('light', null);

    expect(palette.background).toBe('#fbf6ec');
    expect(palette.accent).toBe('#b0512c');
    expect(palette.onAccent).toBe('#ffffff');
    expect(palette.highlight).toBe('#f0b447');
    expect(palette.onHighlight).toBe('#1d3126');
  });

  it('uses lantern tokens with dark on-accent text', () => {
    const palette = resolveTheme('dark', null);

    expect(palette.background).toBe('#121d19');
    expect(palette.accent).toBe('#ff9e6b');
    expect(palette.onAccent).toBe('#1d3126');
    expect(palette.highlight).toBe('#f5c56b');
  });

  it('exposes a fixed immersive backdrop', () => {
    expect(immersiveBackdrop).toBe('#1b2f28');
  });
});
