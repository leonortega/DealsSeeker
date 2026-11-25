import { resolveTheme } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

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

  it('uses tangerine and mint tokens in the default world', () => {
    const palette = resolveTheme('light', null, 'tangerine');

    expect(palette.background).toBe('#faf8f5');
    expect(palette.accent).toBe('#ce4719');
    expect(palette.onAccent).toBe('#ffffff');
    expect(palette.highlight).toBe('#0d7a5f');
    expect(palette.onHighlight).toBe('#ffffff');
  });

  it('uses cozy dark tokens in the tangerine world', () => {
    const palette = resolveTheme('dark', null, 'tangerine');

    expect(palette.background).toBe('#121417');
    expect(palette.accent).toBe('#ff8a65');
    expect(palette.onAccent).toBe('#121417');
    expect(palette.highlight).toBe('#4ade80');
  });

  it('resolves each palette world with its own backdrop', () => {
    expect(resolveTheme('dark', 'dark', 'golden').background).toBe('#121d19');
    expect(resolveTheme('dark', 'dark', 'golden').backdrop).toBe('#1b2f28');
    expect(resolveTheme('dark', 'dark', 'market').background).toBe('#181421');
    expect(resolveTheme('dark', 'dark', 'market').backdrop).toBe('#181421');
    expect(resolveTheme('dark', 'dark', 'tangerine').backdrop).toBe('#121417');
  });

  it('falls back to the default world for an unknown value', () => {
    expect(resolveTheme('dark', 'dark', 'unknown' as never).background).toBe('#121417');
  });
});
