import { landmarkFontFamily } from '../utils/typography';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OfferReportDraft } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { restoreFocus } from '../utils/focusReturn';
import { successFeedback } from '../utils/haptics';
import { statusColor } from '../utils/statusNotice';
import { NativeBottomSheet } from './NativeBottomSheet';
import { HelpSheet } from './HelpSheet';

const messageMaxLength = 120;

interface OfferReportSheetProps {
  draft: OfferReportDraft | null;
  visible: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<unknown>;
}

export function OfferReportSheet({ draft, visible, onClose, returnFocusRef }: OfferReportSheetProps) {
  const { api, clearReportDraft, openTab, palette, session, t } = useApp();
  const [message, setMessage] = useState('');
  const [reportedAtUtc, setReportedAtUtc] = useState(new Date().toISOString());
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const [submitted, setSubmitted] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const apiRef = useRef(api);
  const tRef = useRef(t);
  apiRef.current = api;
  tRef.current = t;

  function close() {
    onClose();
    restoreFocus(returnFocusRef);
  }

  function reportStatus(value: string | null, tone: 'neutral' | 'error' | 'success' = 'neutral') {
    reportNotice(value, tone);
    announceStatus(value);
  }

  useEffect(() => {
    if (!visible || !draft) {
      return;
    }
    setMessage(draft.initialMessage);
    setReportedAtUtc(draft.reportedAtUtc);
    setSubmitted(false);
  }, [visible, draft]);

  function finish() {
    clearReportDraft();
    close();
    openTab('offers');
  }

  async function submit() {
    if (!draft) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      reportStatus(tRef.current('reports.messageRequired'), 'error');
      return;
    }

    reportStatus(null);
    try {
      const result = await apiRef.current.submitReport({
        message: trimmed,
        offerId: draft.offer.offerId,
        userId: session?.userId ?? draft.userId,
        reportedAtUtc,
      });

      if (!result.success) {
        reportStatus(tRef.current('reports.failed'), 'error');
        return;
      }

      setMessage('');
      setSubmitted(true);
      reportStatus(tRef.current('reports.success'), 'success');
      successFeedback();
    } catch {
      reportStatus(tRef.current('reports.failed'), 'error');
    }
  }

  if (!draft) {
    return null;
  }

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
      <View
        accessibilityViewIsModal
        style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}
      >
        <View style={styles.header}>
          <Text numberOfLines={2} style={[styles.title, { color: palette.ink }]}>
            {t('reports.title')}
          </Text>
          <Pressable
            accessibilityLabel={t('common.why')}
            accessibilityRole="button"
            onPress={() => setHelpVisible(true)}
          >
            <Text style={{ color: palette.accentText, fontWeight: '800' }}>{t('common.why')}</Text>
          </Pressable>
        </View>

        <Text style={[styles.offerName, { color: palette.inkMuted }]}>{draft.offer.businessName}</Text>
        <Text numberOfLines={2} style={[styles.offerDescription, { color: palette.inkMuted }]}>
          {draft.offer.description}
        </Text>

        <TextInput
          accessibilityLabel={t('reports.message')}
          maxLength={messageMaxLength}
          multiline
          onChangeText={(value) => setMessage(value.slice(0, messageMaxLength))}
          placeholder={t('reports.message')}
          placeholderTextColor={palette.inkMuted}
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={message}
        />
        <Text style={{ color: palette.inkMuted, textAlign: 'right' }}>{`${message.length}/${messageMaxLength}`}</Text>

        {status && !submitted ? (
          <Text style={[styles.status, { color: statusColor(palette, statusTone) }]}>{status}</Text>
        ) : null}

        {submitted ? (
          <View testID="report-success" style={styles.success}>
            <Text accessibilityLiveRegion="polite" style={[styles.status, { color: palette.success ?? palette.accent }]}>
              {t('reports.success')}
            </Text>
            <Pressable
              accessibilityLabel={t('common.done')}
              accessibilityRole="button"
              onPress={finish}
              style={[styles.publishButton, { backgroundColor: palette.accent }]}
              testID="report-done"
            >
              <Text style={[styles.publishLabel, { color: palette.onAccent }]}>{t('common.done')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.publishButton, { backgroundColor: palette.accent }]} onPress={() => void submit()}>
            <Text style={[styles.publishLabel, { color: palette.onAccent }]}>{t('reports.submit')}</Text>
          </Pressable>
        )}
      </View>
      <HelpSheet onClose={() => setHelpVisible(false)} topic="help.report" visible={helpVisible} />
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: landmarkFontFamily(),
    fontSize: 24,
    fontWeight: '700',
    marginRight: 12,
  },
  offerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 13,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
  },
  success: {
    gap: 10,
  },
  publishButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  publishLabel: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
