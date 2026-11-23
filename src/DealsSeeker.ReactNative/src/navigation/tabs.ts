import type { MainTab } from '../api/types';
import type { NavIconName } from '../components/NavIcon';

export interface TabDestination {
  name: MainTab;
  labelKey: string;
  icon: NavIconName;
}

export const MAIN_TAB_DESTINATIONS: readonly TabDestination[] = [
  { name: 'account', labelKey: 'nav.account', icon: 'account' },
  { name: 'suggestions', labelKey: 'nav.suggestions', icon: 'suggestions' },
  { name: 'reports', labelKey: 'nav.reports', icon: 'reports' },
  { name: 'offers', labelKey: 'nav.offers', icon: 'offers' },
];

export function resolveTabFromRoute(routeName: string): MainTab | null {
  return MAIN_TAB_DESTINATIONS.find((destination) => destination.name === routeName)?.name ?? null;
}
