import { useCallback, useEffect, useRef } from 'react';
import type { MainTab } from '../api/types';

const REDIRECT_DELAY_MS = 900;

export function useDelayedOffersRedirect(
  activeTab: MainTab,
  screenTab: MainTab,
  openTab: (tab: MainTab) => void
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeTab !== screenTab && timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, [activeTab, screenTab]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  return useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => openTab('offers'), REDIRECT_DELAY_MS);
  }, [openTab]);
}
