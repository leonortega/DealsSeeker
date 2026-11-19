import { StyleSheet, Text } from 'react-native';
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

const styles = StyleSheet.create({
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
