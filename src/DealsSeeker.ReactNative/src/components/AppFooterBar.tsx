import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { BottomNavigation, Text, TouchableRipple } from 'react-native-paper';
import { platformTouchFloor } from '../utils/layout';

export interface FooterItem {
  key: string;
  icon: ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
}

/** Thin adapter from legacy footer items to the RNP Material 3 navigation bar. */
export function AppFooterBar({ items }: { items: FooterItem[] }) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.active)
  );

  return (
    <BottomNavigation.Bar
      navigationState={{
        index: activeIndex,
        routes: items.map(({ key, label }) => ({
          key,
          title: label,
          accessibilityLabel: label,
          testID: `footer-tab-${key}`,
        })),
      }}
      onTabPress={({ route }) => items.find((item) => item.key === route.key)?.onPress()}
      renderIcon={({ route }) => {
        const icon = items.find((item) => item.key === route.key)?.icon ?? null;
        return typeof icon === 'string' ? <Text>{icon}</Text> : icon;
      }}
      renderLabel={({ route, focused, color }) => (
        <Text
          aria-hidden={!focused}
          variant="labelMedium"
          style={[styles.label, { color, flexShrink: 1 }]}
        >
          {route.title}
        </Text>
      )}
      renderTouchable={({ route, style, ...props }) => (
        <TouchableRipple
          {...props}
          style={[style, styles.touchable] as unknown as StyleProp<ViewStyle>}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
  touchable: {
    marginHorizontal: 4,
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
  },
});
