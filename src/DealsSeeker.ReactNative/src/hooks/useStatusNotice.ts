import { useCallback, useEffect, useRef, useState } from 'react';
import type { StatusTone } from '../utils/statusNotice';

export const STATUS_DWELL_MS = 4_000;
export const ERROR_STATUS_DWELL_MS = 8_000;

export interface StatusAction {
  label: string;
  onPress: () => void;
}

export interface StatusReportOptions {
  persistent?: boolean;
}

interface PersistentNotice {
  message: string;
  tone: StatusTone;
  action: StatusAction | null;
}

export interface StatusNotice {
  status: string | null;
  statusTone: StatusTone;
  statusAction: StatusAction | null;
  pending: boolean;
  pendingLabel: string | null;
  persistentStatus: string | null;
  persistentTone: StatusTone;
  persistentAction: StatusAction | null;
  statusPersistent: boolean;
  reportStatus: (
    message: string | null,
    tone?: StatusTone,
    action?: StatusAction | null,
    options?: StatusReportOptions
  ) => void;
  reportPending: (label: string) => void;
  dismissStatus: () => void;
  clearStatus: () => void;
}

export function useStatusNotice(defaultTone: StatusTone = 'neutral'): StatusNotice {
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>(defaultTone);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [persistent, setPersistent] = useState<PersistentNotice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const clearTransient = useCallback(() => {
    cancelTimer();
    setStatus(null);
    setStatusAction(null);
  }, [cancelTimer]);

  const clearStatus = useCallback(() => {
    clearTransient();
    setPending(false);
    setPendingLabel(null);
    setPersistent(null);
  }, [clearTransient]);

  const reportPending = useCallback(
    (label: string) => {
      cancelTimer();
      setStatus(null);
      setStatusAction(null);
      setPending(true);
      setPendingLabel(label);
    },
    [cancelTimer]
  );

  const dismissStatus = useCallback(() => setPersistent(null), []);

  const reportStatus = useCallback(
    (
      message: string | null,
      tone: StatusTone = defaultTone,
      action: StatusAction | null = null,
      options: StatusReportOptions = {}
    ) => {
      setPending(false);
      setPendingLabel(null);

      if (options.persistent && message) {
        cancelTimer();
        setStatus(null);
        setStatusAction(null);
        setPersistent({ message, tone, action });
        return;
      }

      clearTransient();
      setStatus(message);
      setStatusTone(tone);
      setStatusAction(message ? action : null);

      if (message) {
        const dwell = tone === 'error' ? ERROR_STATUS_DWELL_MS : STATUS_DWELL_MS;
        timer.current = setTimeout(() => {
          timer.current = null;
          setStatus(null);
          setStatusAction(null);
        }, dwell);
      }
    },
    [cancelTimer, clearTransient, defaultTone]
  );

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    },
    []
  );

  return {
    status,
    statusTone,
    statusAction,
    pending,
    pendingLabel,
    persistentStatus: persistent?.message ?? null,
    persistentTone: persistent?.tone ?? defaultTone,
    persistentAction: persistent?.action ?? null,
    statusPersistent: persistent !== null,
    reportStatus,
    reportPending,
    dismissStatus,
    clearStatus,
  };
}
