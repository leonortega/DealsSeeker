import { useCallback, useEffect, useRef, useState } from 'react';
import type { StatusTone } from '../utils/statusNotice';

export const STATUS_DWELL_MS = 4_000;
export const ERROR_STATUS_DWELL_MS = 8_000;

export interface StatusAction {
  label: string;
  onPress: () => void;
}

export function useStatusNotice(defaultTone: StatusTone = 'neutral') {
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>(defaultTone);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStatus = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setStatus(null);
    setStatusAction(null);
  }, []);

  const reportStatus = useCallback(
    (message: string | null, tone: StatusTone = defaultTone, action: StatusAction | null = null) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
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
    [defaultTone]
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

  return { status, statusTone, statusAction, reportStatus, clearStatus };
}
