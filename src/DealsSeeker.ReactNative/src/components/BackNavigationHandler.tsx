import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useApp } from '../hooks/useApp';

/**
 * Root-level system Back policy. In-app destinations keep using native navigation
 * handlers; this only resolves overlays, the active tab and final exit.
 */
export function BackNavigationHandler() {
  const {
    activeTab,
    clearReportDraft,
    closeImmersiveOffers,
    closeOverlay,
    immersiveOffers,
    isAuthenticated,
    openTab,
    overlayRoute,
    reportDraft,
    t,
  } = useApp();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (overlayRoute) {
        // Add Offer owns its Back handling so the discard guard is never bypassed.
        if (overlayRoute.name !== 'add-offer') {
          closeOverlay();
        }
        return true;
      }
      if (reportDraft) {
        clearReportDraft();
        return true;
      }
      if (isAuthenticated && activeTab !== 'offers') {
        openTab('offers');
        return true;
      }
      if (isAuthenticated && immersiveOffers) {
        closeImmersiveOffers();
        return true;
      }

      Alert.alert(t('app.exitTitle'), t('app.exitBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('app.exit'), style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });

    return () => subscription.remove();
  }, [
    activeTab,
    clearReportDraft,
    closeImmersiveOffers,
    closeOverlay,
    immersiveOffers,
    isAuthenticated,
    openTab,
    overlayRoute,
    reportDraft,
    t,
  ]);

  return null;
}
