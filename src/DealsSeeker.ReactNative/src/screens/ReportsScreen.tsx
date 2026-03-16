import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function ReportsScreen() {
  const { activeTab, clearReportDraft, openTab, palette, reportDraft, session, api, t } = useApp();
  const [message, setMessage] = useState('');
  const [offerId, setOfferId] = useState('');
  const [reportedAtUtc, setReportedAtUtc] = useState(new Date().toISOString());
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!reportDraft) {
      setMessage('');
      setOfferId('');
      setReportedAtUtc(new Date().toISOString());
      return;
    }

    setMessage(reportDraft.initialMessage);
    setOfferId(reportDraft.offer.offerId);
    setReportedAtUtc(reportDraft.reportedAtUtc);
  }, [reportDraft]);

  if (activeTab !== 'reports') {
    return null;
  }

  async function submit() {
    if (!message.trim()) {
      setStatus(t('reports.messageRequired'));
      return;
    }

    const result = await api.submitReport({
      message: message.trim(),
      offerId: offerId.trim() || null,
      userId: session?.userId ?? null,
      reportedAtUtc,
    });

    if (!result.success) {
      setStatus(t('reports.failed'));
      return;
    }

    setMessage('');
    setOfferId('');
    setReportedAtUtc(new Date().toISOString());
    clearReportDraft();
    setStatus(t('reports.success'));
    openTab('offers');
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {reportDraft ? (
        <View style={[styles.preview, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
          <Text style={[styles.previewTitle, { color: palette.ink }]}>{t('reports.preview')}</Text>
          <Text style={[styles.previewName, { color: palette.ink }]}>{reportDraft.offer.businessName}</Text>
          <Text style={{ color: palette.inkMuted }}>{reportDraft.offer.description}</Text>
        </View>
      ) : null}

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.title, { color: palette.ink }]}>{t('reports.title')}</Text>
        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('reports.userId')}</Text>
        <View style={[styles.readonly, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={{ color: palette.ink }}>{session?.userId ?? ''}</Text>
        </View>
        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('reports.offerId')}</Text>
        <TextInput
          editable={!reportDraft}
          onChangeText={setOfferId}
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={offerId}
        />
        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('reports.message')}</Text>
        <TextInput
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
        <Pressable style={[styles.button, { backgroundColor: palette.danger }]} onPress={() => void submit()}>
          <Text style={styles.buttonLabel}>{t('reports.submit')}</Text>
        </Pressable>
        {status ? <Text style={[styles.status, { color: palette.ink }]}>{status}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
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
  input: {
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
    borderRadius: 18,
    marginTop: 6,
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
