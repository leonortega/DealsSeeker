import type { Palette } from './theme';

export type StatusTone = 'neutral' | 'error';

export function statusColor(palette: Palette, tone: StatusTone) {
  return tone === 'error' ? palette.danger : palette.ink;
}
