import { Platform } from 'react-native';

export type TypographyPlatform = 'ios' | 'android' | 'web';

/** The design system's landmark face, with an equivalent serif where Georgia is unavailable. */
export function landmarkFontFamily(platform: TypographyPlatform = Platform.OS as TypographyPlatform): string {
  return platform === 'android' ? 'serif' : 'Georgia';
}
