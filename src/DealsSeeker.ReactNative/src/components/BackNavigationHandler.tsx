/**
 * Back is owned by native navigation: edge swipe on iOS and predictive Back on
 * Android resolve through the navigation container. Overlay, sheet and
 * immersive dismissals are guarded by their own lifecycle listeners, so no
 * application-level hardware Back interceptor is installed here.
 */
export function BackNavigationHandler() {
  return null;
}
