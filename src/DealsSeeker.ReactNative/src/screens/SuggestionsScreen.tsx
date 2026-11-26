import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { useDelayedOffersRedirect } from '../hooks/useDelayedOffersRedirect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { announceStatus } from '../utils/announce';
import { successFeedback } from '../utils/haptics';
import { keyboardAvoidanceBehavior } from '../utils/layout';
import { statusColor, type StatusTone } from '../utils/statusNotice';

const messageMaxLength = 120;

export function SuggestionsScreen() {
  const { activeTab, api, openTab, palette, t } = useApp();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const redirectAfterSuccess = useDelayedOffersRedirect(activeTab, 'suggestions', openTab);

  function reportStatus(message: string | null, tone: StatusTone = 'neutral') {
    reportNotice(message, tone);
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
      reportStatus(t('suggestions.failed'), 'error');
      return;
    }

    setMessage('');
    setContact('');
    reportStatus(t('suggestions.success'));
    successFeedback();
    redirectAfterSuccess();
  }

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={styles.keyboardView}
      testID="suggestions-keyboard-view"
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
        style={{ backgroundColor: palette.background }}
      >
      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{t('suggestions.title')}</Text>
        </View>
        <TextInput
          accessibilityLabel={t('suggestions.message')}
          maxLength={messageMaxLength}
          multiline
          onChangeText={(value) => setMessage(value.slice(0, messageMaxLength))}
          placeholder={t('suggestions.message')}
          placeholderTextColor={palette.inkMuted}
          style={[
            styles.textarea,
            { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink },
          ]}
          value={message}
        />
        <Text style={{ color: palette.inkMuted, textAlign: 'right' }}>{`${message.length}/${messageMaxLength}`}</Text>
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
          <Text style={[styles.buttonLabel, { color: palette.onAccent }]}>{t('suggestions.submit')}</Text>
        </Pressable>
        {status ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>
            {status}
          </Text>
        ) : null}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 15,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
