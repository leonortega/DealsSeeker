import { useCallback } from 'react';
import type { MainTab } from '../api/types';

/**
 * Returns to Offers only when the caller invokes it from an explicit user action.
 * No timer is involved: success confirmations stay put until the user decides to leave.
 */
export function useDelayedOffersRedirect(
  _activeTab: MainTab,
  _screenTab: MainTab,
  openTab: (tab: MainTab) => void
) {
  return useCallback(() => openTab('offers'), [openTab]);
}
