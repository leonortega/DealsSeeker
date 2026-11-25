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
  highlight: '#f2725e',
  onHighlight: '#2b1e2e',
  success: '#2e7d52',
  danger: '#c93160',
  shadow: 'rgba(43, 30, 46, 0.16)',
  overlay: 'rgba(24, 20, 33, 0.52)',
};

const darkPalette: Palette = {
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
  highlight: '#ff8b78',
  onHighlight: '#2b1e2e',
  success: '#86d5a0',
  danger: '#ff6f9c',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(12, 8, 18, 0.66)',
};

/**
 * Backdrop color used behind the immersive offer feed, independent of the active theme.
 */
export function primaryButtonText(palette: Palette): string {
  return palette.onAccent;
}

export const immersiveBackdrop = '#181421';
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
