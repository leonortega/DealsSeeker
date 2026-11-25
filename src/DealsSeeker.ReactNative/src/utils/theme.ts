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
  onAccent: string;
  highlight: string;
  onHighlight: string;
  success: string;
  danger: string;
  shadow: string;
  overlay: string;
}

const lightPalette: Palette = {
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
  onAccent: '#ffffff',
  highlight: '#f0b447',
  onHighlight: '#1d3126',
  success: '#2e7d52',
  danger: '#a33a32',
  shadow: 'rgba(40, 28, 18, 0.16)',
  overlay: 'rgba(22, 30, 28, 0.52)',
};

const darkPalette: Palette = {
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
  onAccent: '#1d3126',
  highlight: '#f5c56b',
  onHighlight: '#1d3126',
  success: '#86d5a0',
  danger: '#ff9b8e',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(4, 7, 6, 0.66)',
};

/**
 * Backdrop color used behind the immersive offer feed, independent of the active theme.
 */
export function primaryButtonText(palette: Palette): string {
  return palette.onAccent;
}

export const immersiveBackdrop = '#1b2f28';
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
