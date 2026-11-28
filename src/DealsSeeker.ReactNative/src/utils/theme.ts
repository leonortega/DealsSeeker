import { MD3DarkTheme as PaperDarkBase, MD3LightTheme as PaperLightBase, type MD3Theme } from 'react-native-paper';
import { ThemeMode, ThemeWorld } from '../api/types';

export interface Palette {
  mode: 'light' | 'dark';
  background: string;
  backgroundRaised: string;
  panel: string;
  panelAlt: string;
  card: string;
  border: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentMuted: string;
  accentText: string;
  onAccent: string;
  onDanger: string;
  footerActive: string;
  highlight: string;
  onHighlight: string;
  success: string;
  danger: string;
  shadow: string;
  overlay: string;
  backdrop: string;
}

const goldenLight: Palette = {
  mode: 'light',
  background: '#fbf6ec',
  backgroundRaised: '#f3ead9',
  panel: '#fffcf5',
  panelAlt: '#e4f1df',
  card: '#fffdf9',
  border: '#9c8461',
  ink: '#1d3126',
  inkMuted: '#5b6b5e',
  accent: '#b0512c',
  accentMuted: '#fbede3',
  accentText: '#8a5a00',
  onAccent: '#ffffff',
  onDanger: '#ffffff',
  footerActive: '#5c3525',
  highlight: '#f0b447',
  onHighlight: '#1d3126',
  success: '#2e7d52',
  danger: '#a33a32',
  shadow: 'rgba(40, 28, 18, 0.16)',
  overlay: 'rgba(22, 30, 28, 0.52)',
  backdrop: '#1b2f28',
};

const goldenDark: Palette = {
  mode: 'dark',
  background: '#121d19',
  backgroundRaised: '#1b2a24',
  panel: '#20332b',
  panelAlt: '#2a4236',
  card: '#253b32',
  border: '#6a8a75',
  ink: '#fbf4e9',
  inkMuted: '#c8d4c8',
  accent: '#ff9e6b',
  accentMuted: '#5c3525',
  accentText: '#ff9e6b',
  onAccent: '#1d3126',
  onDanger: '#1d3126',
  footerActive: '#5c3525',
  highlight: '#f5c56b',
  onHighlight: '#1d3126',
  success: '#86d5a0',
  danger: '#ff9b8e',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(4, 7, 6, 0.66)',
  backdrop: '#1b2f28',
};

const marketLight: Palette = {
  mode: 'light',
  background: '#fff9ec',
  backgroundRaised: '#fff1d9',
  panel: '#fffdf7',
  panelAlt: '#e7f4e8',
  card: '#ffffff',
  border: '#9c8461',
  ink: '#2b1e2e',
  inkMuted: '#6a5a6c',
  accent: '#e8a13a',
  accentMuted: '#fbe3b6',
  accentText: '#8a5a00',
  onAccent: '#2b1e2e',
  onDanger: '#ffffff',
  footerActive: '#5a4426',
  highlight: '#f2725e',
  onHighlight: '#2b1e2e',
  success: '#2e7d52',
  danger: '#c93160',
  shadow: 'rgba(43, 30, 46, 0.16)',
  overlay: 'rgba(24, 20, 33, 0.52)',
  backdrop: '#181421',
};

const marketDark: Palette = {
  mode: 'dark',
  background: '#181421',
  backgroundRaised: '#221c2c',
  panel: '#2a2030',
  panelAlt: '#25362d',
  card: '#2e2438',
  border: '#8c7a93',
  ink: '#f6e9f0',
  inkMuted: '#cdbbcf',
  accent: '#ffc15e',
  accentMuted: '#5a4426',
  accentText: '#ffc15e',
  onAccent: '#2b1e2e',
  onDanger: '#2b1e2e',
  footerActive: '#5a4426',
  highlight: '#ff8b78',
  onHighlight: '#2b1e2e',
  success: '#86d5a0',
  danger: '#ff6f9c',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(12, 8, 18, 0.66)',
  backdrop: '#181421',
};

const tangerineLight: Palette = {
  mode: 'light',
  background: '#faf8f5',
  backgroundRaised: '#f1ede7',
  panel: '#ffffff',
  panelAlt: '#e7f7f1',
  card: '#ffffff',
  border: '#8b857e',
  ink: '#18181b',
  inkMuted: '#52525b',
  accent: '#ce4719',
  accentMuted: '#fbe6df',
  accentText: '#b83b12',
  onAccent: '#ffffff',
  onDanger: '#ffffff',
  footerActive: '#5a2e20',
  highlight: '#0d7a5f',
  onHighlight: '#ffffff',
  success: '#0d7a5f',
  danger: '#b42318',
  shadow: 'rgba(24, 24, 27, 0.16)',
  overlay: 'rgba(9, 9, 11, 0.52)',
  backdrop: '#121417',
};

const tangerineDark: Palette = {
  mode: 'dark',
  background: '#121417',
  backgroundRaised: '#191c21',
  panel: '#1e2228',
  panelAlt: '#17332a',
  card: '#1e2228',
  border: '#71717a',
  ink: '#f4f4f6',
  inkMuted: '#a1a1aa',
  accent: '#ff8a65',
  accentMuted: '#5a2e20',
  accentText: '#ff8a65',
  onAccent: '#121417',
  onDanger: '#121417',
  footerActive: '#5a2e20',
  highlight: '#4ade80',
  onHighlight: '#121417',
  success: '#4ade80',
  danger: '#f87171',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.66)',
  backdrop: '#121417',
};

const palettes: Record<ThemeWorld, { light: Palette; dark: Palette }> = {
  golden: { light: goldenLight, dark: goldenDark },
  market: { light: marketLight, dark: marketDark },
  tangerine: { light: tangerineLight, dark: tangerineDark },
};

/** White-on-photo text for the immersive overlay; independent of the active palette. */
export const immersiveInk = '#f7f1e8';
export const immersiveInkMuted = '#c6d0c9';
export const immersiveScrim = 'rgba(0, 0, 0, 0.28)';
export const immersiveDivider = 'rgba(255, 255, 255, 0.28)';
export const immersiveTagSurface = 'rgba(255, 255, 255, 0.2)';
export const immersivePhotoNav = 'rgba(0, 0, 0, 0.45)';
export const immersiveDot = 'rgba(255, 255, 255, 0.45)';

/** Material 3 type roles shared by chrome and content; fontSize is in scalable sp units. */
export const materialTypeScale = {
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '400' as const },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '400' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

function relativeLuminance(color: string): number {
  if (typeof color !== 'string') {
    return 0.18;
  }
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    // Non-hex values come from test palettes or platform color tokens;
    // treat them as mid-gray rather than producing NaN contrast math.
    return 0.18;
  }
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

/** WCAG 2.1 contrast ratio, measured rather than estimated. */
export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function lightenTowardWhite(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16);
    return Math.round(value + (255 - value) * amount).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

/** Keeps a brand hue while lifting it until it clears a contrast floor on a dark surface. */
export function ensureMinContrast(color: string, background: string, minimum: number): string {
  if (contrastRatio(color, background) >= minimum) {
    return color;
  }
  for (let step = 1; step <= 20; step += 1) {
    const candidate = lightenTowardWhite(color, step / 20);
    if (contrastRatio(candidate, background) >= minimum) {
      return candidate;
    }
  }
  return '#ffffff';
}

export interface ContrastEntry {
  role: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
}

/** Measured role pairing audit for theme sign-off in both appearances. */
export function auditPaletteContrast(palette: Palette): ContrastEntry[] {
  const footer = resolveFooterColors(palette);
  const body: Array<[string, string, string]> = [
    ['ink on background', palette.ink, palette.background],
    ['ink on panel', palette.ink, palette.panel],
    ['ink on card', palette.ink, palette.card],
    ['inkMuted on background', palette.inkMuted, palette.background],
    ['inkMuted on panel', palette.inkMuted, palette.panel],
    ['inkMuted on card', palette.inkMuted, palette.card],
    ['accentText on background', palette.accentText, palette.background],
    ['onAccent on accent', palette.onAccent, palette.accent],
    ['onDanger on danger', palette.onDanger, palette.danger],
    ['onHighlight on highlight', palette.onHighlight, palette.highlight],
    ['navigation ink on M3 surface', footer.ink, footer.surface],
  ];
  const components: Array<[string, string, string]> = [
    ['navigation active icon on M3 surface', footer.accent, footer.surface],
    ['navigation outline on M3 surface', footer.border, footer.surface],
    ['border on background', palette.border, palette.background],
    ['border on card', palette.border, palette.card],
    ['success on card', palette.success, palette.card],
    ['danger on card', palette.danger, palette.card],
  ];
  return [
    ...body.map(([role, foreground, background]) => ({
      role,
      foreground,
      background,
      ratio: contrastRatio(foreground, background),
      required: 4.5,
    })),
    ...components.map(([role, foreground, background]) => ({
      role,
      foreground,
      background,
      ratio: contrastRatio(foreground, background),
      required: 3,
    })),
  ];
}

export function primaryButtonText(palette: Palette): string {
  return palette.onAccent;
}

export function resolveTheme(
  themeMode: ThemeMode,
  systemScheme: 'light' | 'dark' | null | undefined,
  themeWorld: ThemeWorld = 'tangerine'
): Palette {
  const pair = palettes[themeWorld] ?? palettes.tangerine;
  if (themeMode === 'dark') {
    return pair.dark;
  }
  if (themeMode === 'light') {
    return pair.light;
  }
  return systemScheme === 'dark' ? pair.dark : pair.light;
}

/** Navigation surface colors from the active Material 3 role set, never an authored footer surface. */
export function resolveFooterColors(palette: Palette) {
  const { colors } = resolvePaperTheme(palette.mode, palette.mode);
  return {
    surface: colors.surface,
    border: colors.outline,
    active: colors.secondaryContainer,
    accent: colors.onSecondaryContainer,
    ink: colors.onSurface,
    inkMuted: colors.onSurfaceVariant,
  };
}

export type ShellSurface = 'standard' | 'immersive' | 'auth' | 'splash';

/** Status bar chrome follows the rendered M3 surface, never a global immersive flag. */
export function resolveRouteChrome(surface: ShellSurface, palette: Palette) {
  const { colors, dark } = resolvePaperTheme(palette.mode, palette.mode);
  const immersive = surface === 'immersive';
  return {
    background: immersive && !dark ? colors.inverseSurface : colors.surface,
    statusBarStyle: immersive || dark ? ('light' as const) : ('dark' as const),
  };
}

export function resolveShellChrome(immersive: boolean, palette: Palette) {
  return resolveRouteChrome(immersive ? 'immersive' : 'standard', palette);
}

/**
 * Material 3 role tables generated with the Google Design MCP from each
 * brand primary (TONAL_SPOT, standard contrast). Kept explicit so the
 * authored worlds survive theme changes and remain reviewable.
 */
type PaperRoles = Partial<MD3Theme['colors']>;

const paperRoles: Record<ThemeWorld, { light: PaperRoles; dark: PaperRoles }> = {
  golden: {
    light: {
      primary: '#8f4c33', onPrimary: '#ffffff', primaryContainer: '#ffdbcf', onPrimaryContainer: '#72361e',
      secondary: '#77574c', onSecondary: '#ffffff', secondaryContainer: '#ffdbcf', onSecondaryContainer: '#5d4035',
      tertiary: '#695e2f', onTertiary: '#ffffff', tertiaryContainer: '#f2e2a8', onTertiaryContainer: '#50471a',
      surface: '#fff8f6', onSurface: '#231a16', surfaceVariant: '#f5ded6', onSurfaceVariant: '#53433e',
      background: '#fff8f6', onBackground: '#231a16', error: '#ba1a1a', onError: '#ffffff',
      errorContainer: '#ffdad6', onErrorContainer: '#93000a', outline: '#85736d', outlineVariant: '#d8c2bb',
      inverseSurface: '#392e2b', inverseOnSurface: '#ffede7', inversePrimary: '#ffb59a',
    },
    dark: {
      primary: '#ffb59a', onPrimary: '#55200a', primaryContainer: '#72361e', onPrimaryContainer: '#ffdbcf',
      secondary: '#e7beaf', onSecondary: '#442a20', secondaryContainer: '#5d4035', onSecondaryContainer: '#ffdbcf',
      tertiary: '#d5c68e', onTertiary: '#393005', tertiaryContainer: '#50471a', onTertiaryContainer: '#f2e2a8',
      surface: '#1a110e', onSurface: '#f1dfd9', surfaceVariant: '#53433e', onSurfaceVariant: '#d8c2bb',
      background: '#1a110e', onBackground: '#f1dfd9', error: '#ffb4ab', onError: '#690005',
      errorContainer: '#93000a', onErrorContainer: '#ffdad6', outline: '#a08d86', outlineVariant: '#53433e',
      inverseSurface: '#f1dfd9', inverseOnSurface: '#392e2b', inversePrimary: '#8f4c33',
    },
  },
  market: {
    light: {
      primary: '#815512', onPrimary: '#ffffff', primaryContainer: '#ffddb6', onPrimaryContainer: '#643f00',
      secondary: '#705b40', onSecondary: '#ffffff', secondaryContainer: '#e9d6bd', onSecondaryContainer: '#53412b',
      tertiary: '#53643e', onTertiary: '#ffffff', tertiaryContainer: '#d5e7bd', onTertiaryContainer: '#3b4b28',
      surface: '#fff8f4', onSurface: '#211a13', surfaceVariant: '#eee0d1', onSurfaceVariant: '#53483c',
      background: '#fff8f4', onBackground: '#211a13', error: '#ba1a1a', onError: '#ffffff',
      errorContainer: '#ffdad6', onErrorContainer: '#93000a', outline: '#827568', outlineVariant: '#d5c6b8',
      inverseSurface: '#392f26', inverseOnSurface: '#f8ecdf', inversePrimary: '#e9bc70',
    },
    dark: {
      primary: '#f6bc70', onPrimary: '#462a00', primaryContainer: '#643f00', onPrimaryContainer: '#ffddb6',
      secondary: '#dec2a2', onSecondary: '#33261a', secondaryContainer: '#53412b', onSecondaryContainer: '#e9d6bd',
      tertiary: '#bacd9f', onTertiary: '#27331a', tertiaryContainer: '#3b4b28', onTertiaryContainer: '#d5e7bd',
      surface: '#18120c', onSurface: '#ede0d4', surfaceVariant: '#453a2f', onSurfaceVariant: '#c9baa9',
      background: '#18120c', onBackground: '#ede0d4', error: '#ffb4ab', onError: '#690005',
      errorContainer: '#93000a', onErrorContainer: '#ffdad6', outline: '#9c8e80', outlineVariant: '#51473c',
      inverseSurface: '#ede0d4', inverseOnSurface: '#31281f', inversePrimary: '#815512',
    },
  },
  tangerine: {
    light: {
      primary: '#8f4c37', onPrimary: '#ffffff', primaryContainer: '#ffdbd0', onPrimaryContainer: '#723522',
      secondary: '#77574d', onSecondary: '#ffffff', secondaryContainer: '#f3d9d1', onSecondaryContainer: '#5d4036',
      tertiary: '#6b5e2f', onTertiary: '#ffffff', tertiaryContainer: '#eae0a9', onTertiaryContainer: '#514619',
      surface: '#fff8f6', onSurface: '#231917', surfaceVariant: '#f3ded8', onSurfaceVariant: '#55423d',
      background: '#fff8f6', onBackground: '#231917', error: '#ba1a1a', onError: '#ffffff',
      errorContainer: '#ffdad6', onErrorContainer: '#93000a', outline: '#85736e', outlineVariant: '#d9c3bd',
      inverseSurface: '#392d2a', inverseOnSurface: '#ffede9', inversePrimary: '#ffb59f',
    },
    dark: {
      primary: '#ffb59f', onPrimary: '#561f0e', primaryContainer: '#723522', onPrimaryContainer: '#ffdbd0',
      secondary: '#e7bdb1', onSecondary: '#442a20', secondaryContainer: '#5d4036', onSecondaryContainer: '#f3d9d1',
      tertiary: '#d8c68d', onTertiary: '#393005', tertiaryContainer: '#514619', onTertiaryContainer: '#eae0a9',
      surface: '#1a110f', onSurface: '#f1dfda', surfaceVariant: '#51423d', onSurfaceVariant: '#d6c3bd',
      background: '#1a110f', onBackground: '#f1dfda', error: '#ffb4ab', onError: '#690005',
      errorContainer: '#93000a', onErrorContainer: '#ffdad6', outline: '#a08c87', outlineVariant: '#55423d',
      inverseSurface: '#f1dfda', inverseOnSurface: '#392d2a', inversePrimary: '#8f4c37',
    },
  },
};

/** Maps the active authored world onto a React Native Paper MD3 theme. */
export function resolvePaperTheme(
  themeMode: ThemeMode,
  systemScheme: 'light' | 'dark' | null | undefined,
  themeWorld: ThemeWorld = 'tangerine'
): MD3Theme {
  const dark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const base = dark ? PaperDarkBase : PaperLightBase;
  const world = paperRoles[themeWorld] ?? paperRoles.tangerine;
  const roles = dark ? world.dark : world.light;
  return {
    ...base,
    colors: { ...base.colors, ...roles },
  } as MD3Theme;
}