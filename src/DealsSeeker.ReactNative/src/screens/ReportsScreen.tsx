import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StandardHeader } from '../components/StandardHeader';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { announceStatus } from '../utils/announce';
import { successFeedback } from '../utils/haptics';
import { keyboardAvoidanceBehavior } from '../utils/layout';
import { statusColor, type StatusTone } from '../utils/statusNotice';

export function ReportsScreen() {
  const { clearReportDraft, closeOverlay, openTab, overlayRoute, palette, reportDraft, session, api, t } = useApp();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [reportedAtUtc, setReportedAtUtc] = useState(new Date().toISOString());
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    },
    []
  );

  function reportStatus(message: string | null, tone: StatusTone = 'neutral') {
    reportNotice(message, tone);
    announceStatus(message);
  }

  useEffect(() => {
    if (!reportDraft) {
      setMessage('');
      setReportedAtUtc(new Date().toISOString());
      return;
    }

    setMessage(reportDraft.initialMessage);
    setReportedAtUtc(reportDraft.reportedAtUtc);
  }, [reportDraft]);

  if (overlayRoute?.name !== 'report') {
    return null;
  }

  async function submit() {
    if (!message.trim()) {
      reportStatus(t('reports.messageRequired'), 'error');
      return;
    }

    const result = await api.submitReport({
      message: message.trim(),
      offerId: reportDraft?.offer.offerId ?? null,
      userId: session?.userId ?? null,
      reportedAtUtc,
    });

    if (!result.success) {
      reportStatus(t('reports.failed'), 'error');
      return;
    }

    setMessage('');
    setReportedAtUtc(new Date().toISOString());
    clearReportDraft();
    reportStatus(t('reports.success'));
    successFeedback();
    redirectTimer.current = setTimeout(() => {
      redirectTimer.current = null;
      closeOverlay();
      openTab('offers');
    }, 900);
  }

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={styles.keyboardView}
      testID="reports-keyboard-view"
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
        style={{ backgroundColor: palette.background }}
      >
      <StandardHeader />
      {reportDraft ? (
        <View style={[styles.preview, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
          <Text style={[styles.previewTitle, { color: palette.ink }]}>{t('reports.preview')}</Text>
          <Text style={[styles.previewName, { color: palette.ink }]}>{reportDraft.offer.businessName}</Text>
          <Text style={{ color: palette.inkMuted }}>{reportDraft.offer.description}</Text>
        </View>
      ) : null}

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{t('reports.title')}</Text>
        </View>
        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('reports.message')}</Text>
        <TextInput
          accessibilityLabel={t('reports.message')}
          multiline
          onChangeText={setMessage}
          placeholder={t('reports.message')}
          placeholderTextColor={palette.inkMuted}
          style={[
            styles.textarea,
            { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink },
          ]}
          value={message}
        />
        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('reports.reportedAt')}</Text>
        <View style={[styles.readonly, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={{ color: palette.ink }}>{reportedAtUtc.replace('T', ' ').replace(/\.\d{3}Z$/u, ' UTC')}</Text>
        </View>
        <Pressable
          accessibilityLabel={t('reports.submit')}
          accessibilityRole="button"
          testID="report-submit-button"
          style={[styles.button, { backgroundColor: palette.danger }]}
          onPress={() => void submit()}
        >
          <Text style={styles.buttonLabel}>{t('reports.submit')}</Text>
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
  preview: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
    padding: 16,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  previewName: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  readonly: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textarea: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 150,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 6,
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
