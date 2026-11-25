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

    expect(palette.background).toBe('#fff9ec');
    expect(palette.accent).toBe('#e8a13a');
    expect(palette.onAccent).toBe('#2b1e2e');
    expect(palette.highlight).toBe('#f2725e');
    expect(palette.onHighlight).toBe('#2b1e2e');
  });

  it('uses lantern tokens with dark on-accent text', () => {
    const palette = resolveTheme('dark', null);

    expect(palette.background).toBe('#181421');
    expect(palette.accent).toBe('#ffc15e');
    expect(palette.onAccent).toBe('#2b1e2e');
    expect(palette.highlight).toBe('#ff8b78');
  });

  it('exposes a fixed immersive backdrop', () => {
    expect(immersiveBackdrop).toBe('#181421');
  });
});
