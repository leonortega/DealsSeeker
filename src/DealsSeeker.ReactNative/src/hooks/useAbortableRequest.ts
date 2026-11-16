import { useCallback, useEffect, useRef } from 'react';

/**
 * Manages a single request that supersedes the previous one.
 *
 * Calling `begin` aborts the request that is still in flight, so a lookup for an input the user
 * has already replaced is not sent to completion.
 */
export function useAbortableRequest() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    },
    []
  );

  const begin = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  return { begin, abort };
}
