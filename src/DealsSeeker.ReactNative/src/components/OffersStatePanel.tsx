import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../utils/theme';

export interface OffersStatePanelProps {
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
  palette: Palette;
}

export function OffersStatePanel({ actionLabel, hint, onAction, palette, title }: OffersStatePanelProps) {
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.title, { color: palette.ink }]}>{title}</Text>
      <Text style={[styles.hint, { color: palette.inkMuted }]}>{hint}</Text>
      {hasAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={[styles.action, { backgroundColor: palette.accent }]}
        >
          <Text style={[styles.actionLabel, { color: palette.onAccent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 28,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
});
