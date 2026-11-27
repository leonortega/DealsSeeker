import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { platformTouchFloor } from '../utils/layout';
import type { Palette } from '../utils/theme';
import { resolveFooterColors, resolveTheme } from '../utils/theme';

/**
 * The authored night-footer surface is shared with the native tab bar so the
 * compact bar and the expanded navigation rail keep the same brand treatment.
 */
export function footerBarAppearance(palette: Palette) {
  const footer = resolveFooterColors(palette);
  return {
    backgroundColor: footer.surface,
    borderColor: footer.border,
    activeTintColor: footer.accent,
    inactiveTintColor: footer.inkMuted,
  };
}

/**
 * Shared bottom navigation used by the standard and immersive views.
 * Its night surface is derived from the selected palette world.
 */
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
  palette = resolveTheme('dark', 'dark', 'tangerine'),
}: {
  items: FooterItem[];
  createAction?: ReactNode;
  fullWidth?: boolean;
  palette?: Palette;
}) {
  const footer = resolveFooterColors(palette);

  return (
    <View
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        { backgroundColor: footer.surface, borderColor: footer.border },
      ]}
    >
      {items.map((item) => (
        <Pressable
          android_ripple={{ color: palette.accentMuted }}
          key={item.key}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: Boolean(item.active) }}
          onPress={item.onPress}
          style={[styles.tab, item.active && [styles.tabActive, { backgroundColor: footer.active }]]}
        >
          <Text style={[styles.icon, { color: item.active ? footer.accent : footer.inkMuted }]}>
            {item.icon}
          </Text>
          <Text style={[styles.label, { color: item.active ? footer.ink : footer.inkMuted }]}>
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
    flexShrink: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: Math.max(68, platformTouchFloor),
    minWidth: platformTouchFloor,
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  tabActive: {
    borderRadius: 18,
  },
  icon: {
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
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
