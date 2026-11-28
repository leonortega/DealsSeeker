import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { decorativeProps } from '../utils/decorativeProps';

/**
 * The one Android symbol vocabulary. Keys are verified Material Symbols roles;
 * values are the Material Community Icons names used by Paper components.
 */
export const MATERIAL_SYMBOL_ICONS = {
  create: 'plus',
  search: 'magnify',
  help: 'help',
  explore: 'compass',
  nearby: 'near-me',
  locateMe: 'crosshairs-gps',
  directions: 'directions',
  favorite: 'heart',
  report: 'flag',
  chat: 'chat',
  thumbUp: 'thumb-up',
  eventAvailable: 'calendar-check',
  back: 'arrow-left',
  forward: 'chevron-right',
} as const;

export type PlatformTabIconName =
  | 'account'
  | 'suggestions'
  | 'offers'
  | 'explore'
  | 'create'
  | 'search'
  | 'help'
  | 'favorites'
  | 'report'
  | 'chat'
  | 'thumbUp'
  | 'eventAvailable'
  | 'chevronForward'
  | 'chevronBackward';

const iosGlyphs: Record<PlatformTabIconName, React.ComponentProps<typeof Ionicons>['name']> = {
  account: 'person-outline',
  suggestions: 'bulb-outline',
  offers: 'location-outline',
  explore: 'compass-outline',
  create: 'add',
  search: 'search',
  help: 'help',
  favorites: 'heart-outline',
  report: 'flag-outline',
  chat: 'chatbubble-outline',
  thumbUp: 'thumbs-up-outline',
  eventAvailable: 'calendar-outline',
  chevronForward: 'chevron-forward-outline',
  chevronBackward: 'chevron-back-outline',
};

const androidGlyphs: Record<
  PlatformTabIconName,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  account: 'account',
  suggestions: 'lightbulb-outline',
  offers: MATERIAL_SYMBOL_ICONS.nearby,
  explore: MATERIAL_SYMBOL_ICONS.explore,
  create: MATERIAL_SYMBOL_ICONS.create,
  search: MATERIAL_SYMBOL_ICONS.search,
  help: MATERIAL_SYMBOL_ICONS.help,
  favorites: MATERIAL_SYMBOL_ICONS.favorite,
  report: MATERIAL_SYMBOL_ICONS.report,
  chat: MATERIAL_SYMBOL_ICONS.chat,
  thumbUp: MATERIAL_SYMBOL_ICONS.thumbUp,
  eventAvailable: MATERIAL_SYMBOL_ICONS.eventAvailable,
  chevronForward: MATERIAL_SYMBOL_ICONS.forward,
  chevronBackward: MATERIAL_SYMBOL_ICONS.back,
};

export function PlatformTabIcon({
  color,
  name,
  size = 24,
}: {
  color: string;
  name: PlatformTabIconName;
  size?: number;
}) {
  if (Platform.OS === 'ios') {
    return <Ionicons {...decorativeProps} color={color} name={iosGlyphs[name]} size={size} />;
  }

  return (
    <MaterialCommunityIcons {...decorativeProps} color={color} name={androidGlyphs[name]} size={size} />
  );
}
