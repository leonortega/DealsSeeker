import { Platform } from 'react-native';

export function touchFloor(os: string) {
  return os === 'android' ? 48 : 44;
}

export const platformTouchFloor = touchFloor(Platform.OS);

/** Compact widths keep the native bottom bar; expanded widths use a rail. */
export function resolveTabBarPosition(width: number) {
  return width >= 720 ? ('left' as const) : ('bottom' as const);
}

export function keyboardAvoidanceBehavior(os: string) {
  return os === 'ios' ? 'padding' : 'height';
}

export function resolveAddOfferColumns(width: number) {
  return width >= 720 ? 2 : 1;
}

export function resolveOffersGridColumns(width: number) {
  if (width >= 1080) {
    return 3;
  }

  return width >= 720 ? 2 : 1;
}
