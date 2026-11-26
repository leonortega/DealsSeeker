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

export function resolveFooterColors(palette: Palette) {
  return {
    surface: palette.backdrop,
    border: palette.border,
    active: palette.footerActive,
    accent: palette.accent,
    ink: '#f4f4f6',
    inkMuted: '#a1a1aa',
  };
}

export function resolveShellChrome(immersive: boolean, palette: Palette) {
  return {
    background: immersive ? palette.backdrop : palette.background,
    statusBarStyle: immersive || palette.mode === 'dark' ? ('light' as const) : ('dark' as const),
  };
}
