import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function FirstRunSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const { palette, t } = useApp();

  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onDismiss}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: palette.overlay }]}
        onPress={onDismiss}
      >
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <Text style={[styles.title, { color: palette.ink }]}>{t('onboarding.title')}</Text>
          <Text style={[styles.body, { color: palette.inkMuted }]}>{t('onboarding.body')}</Text>
          <Pressable
            accessibilityLabel={t('onboarding.gotIt')}
            accessibilityRole="button"
            onPress={onDismiss}
            style={[styles.action, { backgroundColor: palette.accent }]}
          >
            <Text style={[styles.actionLabel, { color: palette.onAccent }]}>{t('onboarding.gotIt')}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  action: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 20,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
});
