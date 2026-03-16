import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MainTab } from '../api/types';
import { useApp } from '../hooks/useApp';

const tabs: Array<{ key: MainTab; icon: string; labelKey: string }> = [
  { key: 'account', icon: '◐', labelKey: 'nav.account' },
  { key: 'offers', icon: '⌂', labelKey: 'nav.offers' },
  { key: 'suggestions', icon: '✎', labelKey: 'nav.suggestions' },
  { key: 'reports', icon: '⚑', labelKey: 'nav.reports' },
];

export function BottomTabs() {
  const { activeTab, openTab, palette, t } = useApp();

  return (
    <View style={[styles.wrapper, { backgroundColor: palette.panel, borderColor: palette.border }]}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => openTab(tab.key)}
            style={[
              styles.tab,
              active && {
                backgroundColor: palette.accentMuted,
              },
            ]}
          >
            <Text style={[styles.icon, { color: active ? palette.accent : palette.inkMuted }]}>{tab.icon}</Text>
            <Text style={[styles.label, { color: active ? palette.ink : palette.inkMuted }]}>{t(tab.labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    marginHorizontal: 16,
    padding: 10,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 62,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  icon: {
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
