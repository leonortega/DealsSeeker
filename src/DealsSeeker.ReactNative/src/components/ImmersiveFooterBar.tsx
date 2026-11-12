import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export type ImmersiveActionIcon = 'favorite' | 'directions' | 'votePositive' | 'voteNegative' | 'report';

const ACTION_ICONS: Record<ImmersiveActionIcon, string> = {
  favorite: '♥',
  directions: '➤',
  votePositive: '👍',
  voteNegative: '👎',
  report: '⚑',
};

export function ImmersiveActionIconGlyph({ kind, active }: { kind: ImmersiveActionIcon; active?: boolean }) {
  return (
    <Text style={[styles.actionIcon, active && styles.actionIconActive]} accessibilityElementsHidden>
      {ACTION_ICONS[kind]}
    </Text>
  );
}

export function ImmersiveFooterBar({
  onOpenMapMode,
  onOpenFavorites,
  onOpenAccount,
  onOpenSuggestions,
  onOpenReports,
  onCreateOffer,
}: {
  onOpenMapMode: () => void;
  onOpenFavorites: () => void;
  onOpenAccount: () => void;
  onOpenSuggestions: () => void;
  onOpenReports: () => void;
  onCreateOffer: () => void;
}) {
  const { palette, t } = useApp();

  const items = useMemo(
    () => [
      { key: 'map', icon: '🗺️', label: t('offers.mapMode'), onPress: onOpenMapMode },
      { key: 'favorites', icon: '⭐', label: t('nav.favorites'), onPress: onOpenFavorites },
      { key: 'account', icon: '👤', label: t('nav.account'), onPress: onOpenAccount },
      { key: 'suggestions', icon: '✏️', label: t('nav.suggestions'), onPress: onOpenSuggestions },
      { key: 'reports', icon: '🚩', label: t('nav.reports'), onPress: onOpenReports },
      { key: 'create', icon: '➕', label: t('nav.createOffer'), onPress: onCreateOffer },
    ],
    [onCreateOffer, onOpenAccount, onOpenFavorites, onOpenMapMode, onOpenReports, onOpenSuggestions, t],
  );

  return (
    <View style={[styles.footer, { backgroundColor: palette.backgroundRaised, borderTopColor: palette.border }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          onPress={item.onPress}
          style={styles.footerItem}
        >
          <Text style={styles.footerIcon}>{item.icon}</Text>
          <Text numberOfLines={1} style={[styles.footerLabel, { color: palette.inkMuted }]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    paddingTop: 8,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 44,
  },
  footerIcon: {
    fontSize: 20,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionIcon: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 30,
  },
  actionIconActive: {
    color: '#ff4d6d',
  },
});
