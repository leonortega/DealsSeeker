import { ThemeMode } from '../api/types';

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
  highlight: string;
  onHighlight: string;
  success: string;
  danger: string;
  shadow: string;
  overlay: string;
}

const lightPalette: Palette = {
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
  highlight: '#0d7a5f',
  onHighlight: '#ffffff',
  success: '#0d7a5f',
  danger: '#b42318',
  shadow: 'rgba(24, 24, 27, 0.16)',
  overlay: 'rgba(9, 9, 11, 0.52)',
};

const darkPalette: Palette = {
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
  highlight: '#4ade80',
  onHighlight: '#121417',
  success: '#4ade80',
  danger: '#f87171',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.66)',
};

/**
 * Backdrop color used behind the immersive offer feed, independent of the active theme.
 */
export function primaryButtonText(palette: Palette): string {
  return palette.onAccent;
}

export const immersiveBackdrop = '#121417';
export const immersiveInk = '#f7f1e8';
export const immersiveInkMuted = '#c6d0c9';

export function resolveShellChrome(immersive: boolean, palette: Palette) {
  return {
    background: immersive ? immersiveBackdrop : palette.background,
    statusBarStyle: immersive || palette.mode === 'dark' ? ('light' as const) : ('dark' as const),
  };
}

export function resolveTheme(themeMode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined) {  if (themeMode === 'dark') {
    return darkPalette;
  }

  if (themeMode === 'light') {
    return lightPalette;
  }

  return systemScheme === 'dark' ? darkPalette : lightPalette;
}
