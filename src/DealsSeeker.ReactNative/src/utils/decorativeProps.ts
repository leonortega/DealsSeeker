import { Platform } from 'react-native';

/**
 * Keeps purely decorative artwork out of the accessibility tree.
 *
 * `react-native-svg` forwards leftover props straight to the DOM on web, where
 * `accessible` and `accessibilityElementsHidden` are not valid attributes, so web
 * uses `aria-hidden` while native keeps the React Native props.
 */
export const decorativeProps =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({ accessible: false, accessibilityElementsHidden: true } as const);
