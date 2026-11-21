import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

const TOPICS = [
  'help.find',
  'help.mode',
  'help.contribute',
  'help.report',
  'help.favorites',
] as const;

export function HelpSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { palette, t } = useApp();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: palette.overlay }]}
        onPress={onClose}
      >
        <View
          accessibilityViewIsModal
          testID="help-sheet"
          style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <Text style={[styles.title, { color: palette.ink }]}>{t('help.title')}</Text>
          <ScrollView style={styles.list}>
            {TOPICS.map((topic) => (
              <View key={topic} style={styles.topic}>
                <Text style={[styles.topicTitle, { color: palette.ink }]}>{t(`${topic}.title`)}</Text>
                <Text style={[styles.topicBody, { color: palette.inkMuted }]}>{t(`${topic}.body`)}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
            onPress={onClose}
            style={[styles.close, { backgroundColor: palette.accent }]}
          >
            <Text style={styles.closeLabel}>{t('common.close')}</Text>
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
    maxHeight: '80%',
    padding: 20,
    width: '100%',
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  topic: {
    gap: 4,
    marginBottom: 14,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  topicBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  close: {
    alignItems: 'center',
    borderRadius: 999,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  closeLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
