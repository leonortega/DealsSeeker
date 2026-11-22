import type { Palette } from './theme';

export type StatusTone = 'neutral' | 'error' | 'success';

export function statusColor(palette: Palette, tone: StatusTone) {
  if (tone === 'error') {
    return palette.danger;
  }

  if (tone === 'success') {
    return palette.success;
  }

  return palette.ink;
}
