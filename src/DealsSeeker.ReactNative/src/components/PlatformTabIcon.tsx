import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { decorativeProps } from '../utils/decorativeProps';

export type PlatformTabIconName =
  | 'account'
  | 'suggestions'
  | 'offers'
  | 'create'
  | 'search'
  | 'help'
  | 'favorites'
  | 'chevronForward'
  | 'chevronBackward';

const iosGlyphs: Record<PlatformTabIconName, React.ComponentProps<typeof Ionicons>['name']> = {
  account: 'person-outline',
  suggestions: 'bulb-outline',
  offers: 'location-outline',
  create: 'add-circle-outline',
  search: 'search-outline',
  help: 'help-circle-outline',
  favorites: 'heart-outline',
  chevronForward: 'chevron-forward-outline',
  chevronBackward: 'chevron-back-outline',
};

const androidGlyphs: Record<PlatformTabIconName, React.ComponentProps<typeof MaterialIcons>['name']> = {
  account: 'person-outline',
  suggestions: 'lightbulb-outline',
  offers: 'place',
  create: 'add-circle-outline',
  search: 'search',
  help: 'help-outline',
  favorites: 'favorite-border',
  chevronForward: 'chevron-right',
  chevronBackward: 'chevron-left',
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

  return <MaterialIcons {...decorativeProps} color={color} name={androidGlyphs[name]} size={size} />;
}
