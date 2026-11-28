import { type ElementRef, type RefObject, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  HelperText,
  IconButton,
  RadioButton,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { OfferReportDraft } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { restoreFocus } from '../utils/focusReturn';
import { successFeedback } from '../utils/haptics';
import { platformTouchFloor } from '../utils/layout';
import { NativeBottomSheet } from './NativeBottomSheet';
import { HelpSheet } from './HelpSheet';
import { PlatformTabIcon } from './PlatformTabIcon';

const messageMaxLength = 120;
const reasonKeys = [
  'reports.reason.closed',
  'reports.reason.inaccurate',
  'reports.reason.unavailable',
  'reports.reason.other',
] as const;

interface OfferReportSheetProps {
  draft: OfferReportDraft | null;
  visible: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<unknown>;
}

export function OfferReportSheet({ draft, visible, onClose, returnFocusRef }: OfferReportSheetProps) {
  const { api, clearReportDraft, openTab, session, t } = useApp();
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [guidanceVisible, setGuidanceVisible] = useState(false);
  const [reportedAtUtc] = useState(new Date().toISOString());
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const [submitted, setSubmitted] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const apiRef = useRef(api);
  const tRef = useRef(t);
  const helpButtonRef = useRef<ElementRef<typeof IconButton>>(null);
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
    setMessageError(null);
    setReason(null);
    setConfirming(false);
    setGuidanceVisible(false);
    setSubmitted(false);
  }, [visible, draft]);

  useEffect(() => {
    if (!visible || !confirming || submitted) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setConfirming(false);
      return true;
    });
    return () => subscription.remove();
  }, [confirming, visible, submitted]);

  function finish() {
    clearReportDraft();
    close();
    openTab('offers');
  }

  function requestSend() {
    const trimmed = message.trim();
    if (!trimmed) {
      reportStatus(tRef.current('reports.messageRequired'), 'error');
      return;
    }
    if (!reason) {
      return;
    }
    setConfirming(false);
    reportStatus(null);
    void submit(trimmed);
  }

  async function submit(trimmedMessage: string) {
    if (!draft) {
      return;
    }

    try {
      const result = await apiRef.current.submitReport({
        message: trimmedMessage,
        offerId: draft.offer.offerId,
        userId: session?.userId ?? draft.userId,
        reportedAtUtc,
      });

      if (!result.success) {
        reportStatus(tRef.current('reports.failed'), 'error');
        return;
      }

      setMessage('');
      setConfirming(false);
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

  const canSend = Boolean(reason) && message.trim().length > 0 && !submitted;
  const statusColor =
    statusTone === 'error'
      ? theme.colors.error
      : statusTone === 'success'
        ? theme.colors.primary
        : theme.colors.inverseOnSurface;

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
      <Surface
        accessibilityViewIsModal
        elevation={1}
        style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text numberOfLines={2} variant="titleLarge" style={styles.title}>
            {t('reports.title')}
          </Text>
          <IconButton
            accessibilityLabel={t('common.why')}
            icon={({ size, color }) => (
              <PlatformTabIcon color={color} name="help" size={size} />
            )}
            onPress={() => setHelpVisible(true)}
            ref={helpButtonRef}
            testID="report-why"
          />
        </View>

        <Text variant="bodyMedium">{draft.offer.businessName}</Text>
        <Text numberOfLines={2} variant="bodyMedium">
          {draft.offer.description}
        </Text>

        {!confirming ? (
          <>
            <Text variant="labelLarge">{t('reports.reason.title')}</Text>
            <RadioButton.Group onValueChange={(value) => setReason(value)} value={reason ?? ''}>
              {reasonKeys.map((key) => (
                <RadioButton.Item
                  accessibilityLabel={t(key)}
                  key={key}
                  label={t(key)}
                  onPress={() => setReason(key)}
                  status={reason === key ? 'checked' : 'unchecked'}
                  style={styles.reasonItem}
                  testID={`report-reason-${key}`}
                  value={key}
                />
              ))}
            </RadioButton.Group>

            <TextInput
              accessibilityLabel={t('reports.message')}
              error={Boolean(messageError)}
              label={t('reports.message')}
              maxLength={messageMaxLength}
              multiline
              onChangeText={(value) => {
                const next = value.slice(0, messageMaxLength);
                setMessage(next);
                setMessageError(next.trim() ? null : t('reports.messageRequired'));
              }}
              onBlur={() => {
                if (message.trim()) {
                  setGuidanceVisible(false);
                }
              }}
              onFocus={() => setGuidanceVisible(true)}
              placeholder={t('reports.message')}
              style={styles.input}
              testID="report-message"
              value={message}
            />
            {guidanceVisible ? (
              <HelperText
                accessibilityLabel={t('reports.guidance')}
                accessibilityLiveRegion="polite"
                testID="report-guidance"
                type="info"
              >
                {t('reports.guidance')}
              </HelperText>
            ) : null}
            <HelperText style={styles.counter} testID="report-counter" type="info">
              {`${message.length}/${messageMaxLength}`}
            </HelperText>
            {messageError ? (
              <HelperText accessibilityLiveRegion="polite" testID="report-message-error" type="error">
                {messageError}
              </HelperText>
            ) : null}
          </>
        ) : null}

        {submitted ? (
          <View testID="report-success" style={styles.success}>
            <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.primary }} variant="bodyLarge">
              {t('reports.success')}
            </Text>
            <Button
              accessibilityLabel={t('common.done')}
              mode="contained"
              onPress={finish}
              style={styles.actionButton}
              testID="report-done"
            >
              {t('common.done')}
            </Button>
          </View>
        ) : !confirming ? (
          <Button
            accessibilityLabel={t('reports.submit')}
            disabled={!canSend}
            mode="contained"
            onPress={() => setConfirming(true)}
            style={styles.actionButton}
            testID="report-submit"
          >
            {t('reports.submit')}
          </Button>
        ) : null}
      </Surface>

      <Dialog
        dismissable={false}
        dismissableBackButton={false}
        onDismiss={() => setConfirming(false)}
        testID="report-confirmation"
        visible={confirming}
      >
        <Dialog.Title>{t('reports.confirmTitle')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('reports.confirmBody')}</Text>
          <Text accessibilityLabel={t('reports.reason.title')} variant="bodyMedium">
            {t(reason ?? '')}
          </Text>
          <Text variant="bodyMedium">{message.trim()}</Text>
          <Text variant="bodyMedium">{draft.offer.businessName}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            accessibilityLabel={t('common.cancel')}
            mode="text"
            onPress={() => setConfirming(false)}
            testID="report-confirm-cancel"
          >
            {t('common.cancel')}
          </Button>
          <Button
            accessibilityLabel={t('reports.confirmSend')}
            mode="contained"
            onPress={requestSend}
            testID="report-confirm-send"
          >
            {t('reports.confirmSend')}
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Snackbar
        duration={Number.POSITIVE_INFINITY}
        onDismiss={() => {}}
        testID="report-status"
        visible={Boolean(status) && !submitted}
        wrapperStyle={styles.snackbarWrapper}
      >
        <Text style={{ color: statusColor, fontWeight: '700' }} variant="labelLarge">{status}</Text>
      </Snackbar>
      <HelpSheet
        onClose={() => setHelpVisible(false)}
        returnFocusRef={helpButtonRef}
        topic="help.report"
        visible={helpVisible}
      />
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    gap: 12,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  reasonItem: {
    minHeight: platformTouchFloor,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    minHeight: 72,
  },
  counter: {
    textAlign: 'right',
  },
  success: {
    gap: 10,
  },
  actionButton: {
    alignSelf: 'stretch',
    minHeight: platformTouchFloor,
  },
  snackbarWrapper: {
    paddingHorizontal: 16,
  },
});
