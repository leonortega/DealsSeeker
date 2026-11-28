import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { useDelayedOffersRedirect } from '../hooks/useDelayedOffersRedirect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { announceStatus } from '../utils/announce';
import { successFeedback } from '../utils/haptics';
import { keyboardAvoidanceBehavior, platformTouchFloor } from '../utils/layout';
import type { StatusTone } from '../utils/statusNotice';

const messageMaxLength = 120;
const contactMaxLength = 254;

export function SuggestionsScreen() {
  const { activeTab, api, openTab, t } = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const [submitted, setSubmitted] = useState(false);
  const returnToOffers = useDelayedOffersRedirect(activeTab, 'suggestions', openTab);

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
    setSubmitted(true);
    reportStatus(t('suggestions.success'));
    successFeedback();
  }

  const statusColor =
    statusTone === 'error'
      ? theme.colors.error
      : statusTone === 'success'
        ? theme.colors.primary
        : theme.colors.inverseOnSurface;

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={styles.keyboardView}
      testID="suggestions-keyboard-view"
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
        style={{ backgroundColor: theme.colors.background }}
      >
        <Card elevation={1} style={styles.card} testID="suggestions-card">
          <Text variant="titleLarge">{t('suggestions.title')}</Text>
          <TextInput
            accessibilityLabel={t('suggestions.message')}
            label={t('suggestions.message')}
            maxLength={messageMaxLength}
            multiline
            onChangeText={(value) => setMessage(value.slice(0, messageMaxLength))}
            placeholder={t('suggestions.message')}
            style={styles.textarea}
            testID="suggestions-message"
            value={message}
          />
          <HelperText style={styles.counter} testID="suggestions-message-counter" type="info">
            {`${message.length}/${messageMaxLength}`}
          </HelperText>
          <TextInput
            accessibilityLabel={t('suggestions.contact')}
            label={t('suggestions.contact')}
            maxLength={contactMaxLength}
            onChangeText={(value) => setContact(value.slice(0, contactMaxLength))}
            placeholder={t('suggestions.contact')}
            testID="suggestions-contact"
            value={contact}
          />
          <Button
            accessibilityLabel={t('suggestions.submit')}
            mode="contained"
            onPress={() => void submit()}
            style={styles.button}
            testID="suggestions-submit"
          >
            {t('suggestions.submit')}
          </Button>
          {submitted ? (
            <View testID="suggestions-success" style={styles.success}>
              <Text accessibilityLiveRegion="polite" variant="labelLarge" style={{ color: theme.colors.primary }}>
                {t('suggestions.success')}
              </Text>
              <Button
                accessibilityLabel={t('common.done')}
                mode="contained"
                onPress={returnToOffers}
                style={styles.button}
                testID="suggestions-done"
              >
                {t('common.done')}
              </Button>
            </View>
          ) : null}
        </Card>
      </ScrollView>
      <Snackbar
        duration={Number.POSITIVE_INFINITY}
        onDismiss={() => {}}
        testID="suggestions-status"
        visible={Boolean(status) && !submitted}
        wrapperStyle={styles.snackbarWrapper}
      >
        <Text variant="labelLarge" style={{ color: statusColor }}>
          {status}
        </Text>
      </Snackbar>
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
  card: {
    gap: 8,
    padding: 18,
  },
  textarea: {
    minHeight: 140,
  },
  counter: {
    textAlign: 'right',
  },
  button: {
    minHeight: platformTouchFloor,
  },
  success: {
    gap: 10,
  },
  snackbarWrapper: {
    paddingHorizontal: 16,
  },
});
