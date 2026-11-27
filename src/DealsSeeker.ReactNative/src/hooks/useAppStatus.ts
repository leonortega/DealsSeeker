import { useContext } from 'react';
import { AppStatusContext, type AppStatusValue } from '../context/AppContext';
import { useApp } from './useApp';

/** Volatile status lives in its own context so loading/sheet changes only re-render its consumers. */
export function useAppStatus(): AppStatusValue {
  const status = useContext(AppStatusContext);
  if (status) {
    return status;
  }

  const app = useApp() as ReturnType<typeof useApp> & Partial<AppStatusValue>;
  return {
    loadingCount: app.loadingCount ?? 0,
    sheetCount: app.sheetCount ?? 0,
    pendingOperations: app.pendingOperations ?? [],
    isPending: app.isPending ?? (() => false),
  };
}
