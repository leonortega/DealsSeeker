import { useEffect, useRef, type ComponentRef, type RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';
import type { MainTab } from '../api/types';
import { MAIN_TAB_DESTINATIONS } from '../navigation/tabs';

type DestinationOverlay = { name: string } | null;
type DestinationContainerRef = RefObject<ComponentRef<typeof View> | null>;

const defaultResolveHandle = (ref: unknown): number | null => findNodeHandle(ref as never) ?? null;

export function resolveDestinationKey(activeTab: MainTab, overlayRoute: DestinationOverlay): string | null {
  if (overlayRoute?.name === 'add-offer') {
    return 'nav.addOffer';
  }
  if (overlayRoute?.name === 'favorites') {
    return 'nav.favorites';
  }
  return MAIN_TAB_DESTINATIONS.find((destination) => destination.name === activeTab)?.labelKey ?? null;
}

export function useDestinationFocus(
  containerRef: DestinationContainerRef,
  activeTab: MainTab,
  overlayRoute: DestinationOverlay,
  translate: (key: string) => string,
  resolveHandle: (ref: unknown) => number | null = defaultResolveHandle
) {
  const lastDestination = useRef<string | null>(null);
  const destination = resolveDestinationKey(activeTab, overlayRoute);

  useEffect(() => {
    if (!destination || destination === lastDestination.current) {
      return;
    }
    lastDestination.current = destination;
    AccessibilityInfo.announceForAccessibility(translate(destination));

    const handle = containerRef.current ? resolveHandle(containerRef.current) : null;
    if (handle != null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, [containerRef, destination, resolveHandle, translate]);
}
