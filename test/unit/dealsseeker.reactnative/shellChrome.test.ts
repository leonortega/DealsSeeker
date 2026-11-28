import {
  auditPaletteContrast,
  contrastRatio,
  resolvePaperTheme,
  resolveRouteChrome,
  resolveShellChrome,
  resolveTheme,
  type ThemeWorld,
} from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const light = resolveTheme('system', 'light', 'tangerine');
const dark = resolveTheme('system', 'dark', 'tangerine');
const lightRoles = resolvePaperTheme('system', 'light', 'tangerine').colors;
const darkRoles = resolvePaperTheme('system', 'dark', 'tangerine').colors;
const worlds: ThemeWorld[] = ['golden', 'market', 'tangerine'];

describe('resolveShellChrome (APP.THEME.001-R8)', () => {
  it('uses the M3 dark tonal surface and light status icons for immersive light theme', () => {
    expect(resolveShellChrome(true, light)).toEqual({
      background: lightRoles.inverseSurface,
      statusBarStyle: 'light',
    });
  });

  it('uses the M3 dark surface and light status icons for immersive dark theme', () => {
    expect(resolveShellChrome(true, dark)).toEqual({
      background: darkRoles.surface,
      statusBarStyle: 'light',
    });
  });

  it('keeps the M3 light surface and dark status icons outside immersive', () => {
    expect(resolveShellChrome(false, light)).toEqual({
      background: lightRoles.surface,
      statusBarStyle: 'dark',
    });
  });

  it('keeps the M3 dark surface and light status icons outside immersive', () => {
    expect(resolveShellChrome(false, dark)).toEqual({
      background: darkRoles.surface,
      statusBarStyle: 'light',
    });
  });
});

describe('resolveRouteChrome (APP.PLATFORM.CHROME.001-R7)', () => {
  it('uses dark status icons on a light auth route even if a global immersive flag is set', () => {
    expect(resolveRouteChrome('auth', light)).toEqual({
      background: lightRoles.surface,
      statusBarStyle: 'dark',
    });
    expect(resolveRouteChrome('auth', dark)).toEqual({
      background: darkRoles.surface,
      statusBarStyle: 'light',
    });
  });

  it('uses light status icons for the immersive route', () => {
    expect(resolveRouteChrome('immersive', light)).toEqual({
      background: lightRoles.inverseSurface,
      statusBarStyle: 'light',
    });
  });

  it('changes the status bar style when the rendered route changes', () => {
    expect(resolveRouteChrome('standard', light).statusBarStyle).toBe('dark');
    expect(resolveRouteChrome('immersive', light).statusBarStyle).toBe('light');
    expect(resolveRouteChrome('standard', light).statusBarStyle).toBe('dark');
  });

  it('keeps the splash background in the M3 light surface role', () => {
    expect(resolveRouteChrome('splash', light)).toEqual({
      background: lightRoles.surface,
      statusBarStyle: 'dark',
    });
  });
});

describe('measured contrast in both appearances (APP.ACCESSIBILITY.UX.001-R12)', () => {
  it('computes the WCAG contrast ratio instead of estimating it', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 2);
  });

  it.each(worlds)('%s light and dark roles meet the measured thresholds', (world) => {
    (['light', 'dark'] as const).forEach((scheme) => {
      const audit = auditPaletteContrast(resolveTheme('system', scheme, world));
      const failures = audit.filter((entry) => entry.ratio < entry.required);

      expect(audit.length).toBeGreaterThan(8);
      expect(audit.some((entry) => entry.role.includes('navigation'))).toBe(true);
      expect(failures).toEqual([]);
    });
  });
});
