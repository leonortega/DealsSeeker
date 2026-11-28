import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useApp } from '../hooks/useApp';
import { platformTouchFloor } from '../utils/layout';
import { immersiveInk, immersiveInkMuted, immersivePhotoNav } from '../utils/theme';

export type ImmersiveFeedTab = 'favorites' | 'viewAll';

export function ImmersiveFeedTabs({
  activeTab,
  onChangeTab,
}: {
  activeTab: ImmersiveFeedTab;
  onChangeTab: (tab: ImmersiveFeedTab) => void;
}) {
  const { palette, t } = useApp();
  const theme = useTheme();

  const tabs: Array<{ key: ImmersiveFeedTab; label: string }> = [
    { key: 'favorites', label: t('offers.tabFavorites') },
    { key: 'viewAll', label: t('offers.tabViewAll') },
  ];

  // The immersive feed uses a fixed forest backdrop, so its chrome stays light in both themes.
  const activeColor = immersiveInk;
  const inactiveColor = immersiveInkMuted;

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = tab.key === activeTab;

        return (
          <TouchableRipple
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChangeTab(tab.key)}
            rippleColor={theme.colors.primary}
            style={styles.tab}
          >
            <View style={styles.tabContent}>
              <Text
                numberOfLines={1}
                variant="labelLarge"
                style={[styles.tabLabel, { color: selected ? activeColor : inactiveColor }]}
              >
                {tab.label}
              </Text>
              <View
                style={[styles.tabIndicator, { backgroundColor: selected ? palette.accent : 'transparent' }]}
              />
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  tab: {
    justifyContent: 'center',
    maxWidth: 110,
    minHeight: platformTouchFloor,
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: immersivePhotoNav,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tabIndicator: {
    borderRadius: 2,
    height: 3,
    width: 18,
  },
});
