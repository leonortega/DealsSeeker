import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export type ImmersiveActionIcon = 'comments' | 'favorite' | 'directions' | 'votePositive' | 'voteNegative' | 'report';

const ACTION_ICONS: Record<ImmersiveActionIcon, string> = {
  comments: '💬',
  favorite: '♥',
  directions: '➤',
  votePositive: '👍',
  voteNegative: '👎',
  report: '⚑',
};

export function ImmersiveActionIconGlyph({ kind, active }: { kind: ImmersiveActionIcon; active?: boolean }) {
  const { palette } = useApp();

  return (
    <Text
      style={[styles.actionIcon, { color: active ? palette.accent : palette.ink }]}
      accessibilityElementsHidden
    >
      {ACTION_ICONS[kind]}
    </Text>
  );
}

export function ImmersiveActionCaption({ label }: { label: string }) {
  const { palette } = useApp();

  return (
    <Text numberOfLines={1} style={[styles.actionCaption, { color: palette.inkMuted }]} accessibilityElementsHidden>
      {label}
    </Text>
  );
}

export function ImmersiveFooterBar({
  onOpenMapMode,
  onOpenAccount,
  onOpenSuggestions,
  onOpenReports,
  onCreateOffer,
}: {
  onOpenMapMode: () => void;
  onOpenAccount: () => void;
  onOpenSuggestions: () => void;
  onOpenReports: () => void;
  onCreateOffer: () => void;
}) {
  const { palette, t } = useApp();

  const items = useMemo(
    () => [
      { key: 'map', icon: '🗺️', label: t('offers.mapMode'), onPress: onOpenMapMode },
      { key: 'account', icon: '👤', label: t('nav.account'), onPress: onOpenAccount },
      { key: 'suggestions', icon: '✏️', label: t('nav.suggestions'), onPress: onOpenSuggestions },
      { key: 'reports', icon: '🚩', label: t('nav.reports'), onPress: onOpenReports },
      { key: 'create', icon: '➕', label: t('nav.createOffer'), onPress: onCreateOffer },
    ],
    [onCreateOffer, onOpenAccount, onOpenMapMode, onOpenReports, onOpenSuggestions, t],
  );

  return (
    <View style={[styles.footer, { backgroundColor: palette.backgroundRaised, borderTopColor: palette.border }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          onPress={item.onPress}
          style={[styles.footerItem, { backgroundColor: palette.panel, borderColor: palette.border }]}
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
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    marginHorizontal: 2,
    minHeight: 48,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  footerIcon: {
    fontSize: 18,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  actionCaption: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});
