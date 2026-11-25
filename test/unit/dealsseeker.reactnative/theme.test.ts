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

    expect(palette.background).toBe('#faf8f5');
    expect(palette.accent).toBe('#ce4719');
    expect(palette.onAccent).toBe('#ffffff');
    expect(palette.highlight).toBe('#0d7a5f');
    expect(palette.onHighlight).toBe('#ffffff');
  });

  it('uses lantern tokens with dark on-accent text', () => {
    const palette = resolveTheme('dark', null);

    expect(palette.background).toBe('#121417');
    expect(palette.accent).toBe('#ff8a65');
    expect(palette.onAccent).toBe('#121417');
    expect(palette.highlight).toBe('#4ade80');
  });

  it('exposes a fixed immersive backdrop', () => {
    expect(immersiveBackdrop).toBe('#121417');
  });
});
