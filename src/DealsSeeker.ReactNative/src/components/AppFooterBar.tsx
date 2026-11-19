import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Shared bottom navigation used by both the standard and immersive views.
 * The palette matches the reference footer (dark rounded surface, terracotta active option).
 */
const footerSurface = '#22332f';
const footerBorder = '#476258';
const footerActive = '#5e3a2a';
const footerAccent = '#f08f62';
const footerInk = '#f7f1e8';
const footerInkMuted = '#c6d0c9';

export interface FooterItem {
  key: string;
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
}

export function AppFooterBar({ items }: { items: FooterItem[] }) {
  return (
    <View style={styles.wrapper}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: Boolean(item.active) }}
          onPress={item.onPress}
          style={[styles.tab, item.active && styles.tabActive]}
        >
          <Text style={[styles.icon, item.active ? styles.iconActive : styles.iconInactive]}>{item.icon}</Text>
          <Text style={[styles.label, item.active && styles.labelActive]} numberOfLines={2}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: footerSurface,
    borderColor: footerBorder,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
    marginHorizontal: 16,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 68,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: footerActive,
  },
  icon: {
    fontSize: 16,
    fontWeight: '800',
  },
  iconActive: {
    color: footerAccent,
  },
  iconInactive: {
    color: footerInkMuted,
  },
  label: {
    color: footerInkMuted,
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    textAlign: 'center',
  },
  labelActive: {
    color: footerInk,
  },
});
