import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export type ImmersiveFeedTab = 'favorites' | 'viewAll';

export function ImmersiveFeedTabs({
  activeTab,
  onChangeTab,
}: {
  activeTab: ImmersiveFeedTab;
  onChangeTab: (tab: ImmersiveFeedTab) => void;
}) {
  const { palette, t } = useApp();

  const tabs: Array<{ key: ImmersiveFeedTab; label: string }> = [
    { key: 'favorites', label: t('offers.tabFavorites') },
    { key: 'viewAll', label: t('offers.tabViewAll') },
  ];

  const inactiveColor = palette.inkMuted;

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChangeTab(tab.key)}
            style={styles.tab}
          >
            <Text numberOfLines={1} style={[styles.tabLabel, { color: selected ? palette.ink : inactiveColor }]}>
              {tab.label}
            </Text>
            <View style={[styles.tabIndicator, { backgroundColor: selected ? palette.accent : 'transparent' }]} />
          </Pressable>
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
    alignItems: 'center',
    gap: 4,
    maxWidth: 110,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tabIndicator: {
    borderRadius: 2,
    height: 3,
    width: 18,
  },
});
