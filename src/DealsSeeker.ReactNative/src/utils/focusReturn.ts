import type { RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export function focusHandle(handle: number | null) {
  if (handle != null) {
    AccessibilityInfo.setAccessibilityFocus(handle);
  }
}

export function restoreFocus(ref?: RefObject<unknown> | null) {
  const node = ref?.current;
  focusHandle(node ? findNodeHandle(node as never) ?? null : null);
}
