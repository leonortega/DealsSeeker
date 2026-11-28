import { StyleSheet } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { platformTouchFloor } from '../utils/layout';
import type { Palette } from '../utils/theme';

export interface OffersStatePanelProps {
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
  palette: Palette;
}

export function OffersStatePanel({ actionLabel, hint, onAction, title }: OffersStatePanelProps) {
  const hasAction = Boolean(actionLabel && onAction);
  const theme = useTheme();

  return (
    <Card style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        {hint}
      </Text>
      {hasAction ? (
        <Button
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          buttonColor={theme.colors.primary}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={onAction}
          style={styles.action}
          textColor={theme.colors.onPrimary}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Card>
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
    minHeight: platformTouchFloor,
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
