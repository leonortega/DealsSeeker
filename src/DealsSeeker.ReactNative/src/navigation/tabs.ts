import type { MainTab } from '../api/types';
import type { PlatformTabIconName } from '../components/PlatformTabIcon';

export interface TabDestination {
  name: MainTab;
  labelKey: string;
  icon: PlatformTabIconName;
}

export const MAIN_TAB_DESTINATIONS: readonly TabDestination[] = [
  { name: 'account', labelKey: 'nav.account', icon: 'account' },
  { name: 'suggestions', labelKey: 'nav.suggestions', icon: 'suggestions' },
  { name: 'offers', labelKey: 'nav.offers', icon: 'offers' },
];

export function resolveTabFromRoute(routeName: string): MainTab | null {
  return MAIN_TAB_DESTINATIONS.find((destination) => destination.name === routeName)?.name ?? null;
}
