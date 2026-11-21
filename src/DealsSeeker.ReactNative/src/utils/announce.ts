import { AccessibilityInfo } from 'react-native';

export function announceStatus(message: string | null | undefined): void {
  if (message) {
    AccessibilityInfo.announceForAccessibility(message);
  }
}
