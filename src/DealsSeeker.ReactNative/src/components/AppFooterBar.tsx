import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Shared bottom navigation used by both the standard and immersive views.
 * The palette matches the reference footer (dark rounded surface, terracotta active option).
 */
const footerSurface = '#1e2228';
const footerBorder = '#71717a';
const footerActive = '#5a2e20';
const footerAccent = '#ff8a65';
const footerInk = '#f4f4f6';
const footerInkMuted = '#a1a1aa';

export interface FooterItem {
  key: string;
  icon: ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
}

export function AppFooterBar({
  items,
  createAction,
  fullWidth = false,
}: {
  items: FooterItem[];
  createAction?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.wrapper, fullWidth && styles.fullWidth]}>
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
          <Text style={[styles.label, item.active && styles.labelActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
      {createAction ? <View style={styles.createSlot}>{createAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: footerSurface,
    borderColor: footerBorder,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    marginHorizontal: 16,
    maxWidth: 480,
    paddingHorizontal: 4,
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
    letterSpacing: -0.5,
    lineHeight: 14,
    textAlign: 'center',
  },
  labelActive: {
    color: footerInk,
  },
  createSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
  },
  fullWidth: {
    marginHorizontal: 0,
  },
});
