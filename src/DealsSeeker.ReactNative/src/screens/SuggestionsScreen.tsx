import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StandardHeader } from '../components/StandardHeader';
import { useApp } from '../hooks/useApp';
import { announceStatus } from '../utils/announce';

export function SuggestionsScreen() {
  const { activeTab, api, openTab, palette, t } = useApp();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  function reportStatus(message: string | null) {
    setStatus(message);
    announceStatus(message);
  }

  if (activeTab !== 'suggestions') {
    return null;
  }

  async function submit() {
    const result = await api.submitSuggestion({
      message: message.trim(),
      contact: contact.trim() || null,
    });

    if (!result.success) {
      reportStatus(t('suggestions.failed'));
      return;
    }

    setMessage('');
    setContact('');
    reportStatus(t('suggestions.success'));
    openTab('offers');
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <StandardHeader />
      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{t('suggestions.title')}</Text>
        </View>
        <TextInput
          accessibilityLabel={t('suggestions.message')}
          multiline
          onChangeText={setMessage}
          placeholder={t('suggestions.message')}
          placeholderTextColor={palette.inkMuted}
          style={[
            styles.textarea,
            { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink },
          ]}
          value={message}
        />
        <TextInput
          accessibilityLabel={t('suggestions.contact')}
          onChangeText={setContact}
          placeholder={t('suggestions.contact')}
          placeholderTextColor={palette.inkMuted}
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={contact}
        />
        <Pressable
          accessibilityLabel={t('suggestions.submit')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: palette.accent }]}
          onPress={() => void submit()}
        >
          <Text style={styles.buttonLabel}>{t('suggestions.submit')}</Text>
        </Pressable>
        {status ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: palette.ink }]}>
            {status}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
  },
  textarea: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 150,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  button: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 15,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
