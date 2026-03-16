import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function LoadingOverlay() {
  const { loadingCount, palette, t } = useApp();

  if (loadingCount <= 0) {
    return null;
  }

  return (
    <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={[styles.text, { color: palette.ink }]}>{t('app.loading')}</Text>
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
