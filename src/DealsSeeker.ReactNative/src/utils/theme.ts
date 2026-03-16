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
  success: string;
  danger: string;
  shadow: string;
  overlay: string;
}

const lightPalette: Palette = {
  mode: 'light',
  background: '#f4efe6',
  backgroundRaised: '#efe5d8',
  panel: '#fff9f0',
  panelAlt: '#e6f0e6',
  card: '#fffdf8',
  border: '#d7c9b5',
  ink: '#1f3128',
  inkMuted: '#5f6d63',
  accent: '#b85c38',
  accentMuted: '#e9c9b8',
  success: '#2f6e46',
  danger: '#8d2f2f',
  shadow: 'rgba(31, 49, 40, 0.14)',
  overlay: 'rgba(22, 30, 28, 0.52)',
};

const darkPalette: Palette = {
  mode: 'dark',
  background: '#17201d',
  backgroundRaised: '#22302b',
  panel: '#22332f',
  panelAlt: '#2d4037',
  card: '#293a35',
  border: '#476258',
  ink: '#f7f1e8',
  inkMuted: '#c6d0c9',
  accent: '#f08f62',
  accentMuted: '#5e3a2a',
  success: '#7ec48c',
  danger: '#f08f8f',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(4, 7, 6, 0.66)',
};

export function resolveTheme(themeMode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined) {
  if (themeMode === 'dark') {
    return darkPalette;
  }

  if (themeMode === 'light') {
    return lightPalette;
  }

  return systemScheme === 'dark' ? darkPalette : lightPalette;
}
