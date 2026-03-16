import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function SuggestionsScreen() {
  const { activeTab, api, openTab, palette, t } = useApp();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  if (activeTab !== 'suggestions') {
    return null;
  }

  async function submit() {
    const result = await api.submitSuggestion({
      message: message.trim(),
      contact: contact.trim() || null,
    });

    if (!result.success) {
      setStatus(t('suggestions.failed'));
      return;
    }

    setMessage('');
    setContact('');
    setStatus(t('suggestions.success'));
    openTab('offers');
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.title, { color: palette.ink }]}>{t('suggestions.title')}</Text>
        <TextInput
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
          onChangeText={setContact}
          placeholder={t('suggestions.contact')}
          placeholderTextColor={palette.inkMuted}
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={contact}
        />
        <Pressable style={[styles.button, { backgroundColor: palette.accent }]} onPress={() => void submit()}>
          <Text style={styles.buttonLabel}>{t('suggestions.submit')}</Text>
        </Pressable>
        {status ? <Text style={[styles.status, { color: palette.ink }]}>{status}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
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
    borderRadius: 18,
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
