import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useApp } from '../hooks/useApp';
import { useAppStatus } from '../hooks/useAppStatus';

export function LoadingOverlay({ visible = false }: { visible?: boolean }) {
  const { t } = useApp();
  const theme = useTheme();
  const { loadingCount } = useAppStatus();

  if (loadingCount <= 0 && !visible) {
    return null;
  }

  return (
    <View style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}>
      <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.text} variant="titleMedium">{t('app.loading')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  panel: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    minWidth: 180,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});