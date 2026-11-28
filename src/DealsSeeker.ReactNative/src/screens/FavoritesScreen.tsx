import { platformTouchFloor } from '../utils/layout';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, Snackbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import * as Location from 'expo-location';
import { OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { statusColor } from '../utils/statusNotice';
import { selectionFeedback } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openDirections } from '../utils/maps';
import { OFFER_ACTION_LABEL_KEYS } from '../components/OfferActionVocabulary';
import { shorten } from '../utils/format';
import { resolveEmulatorLocation } from '../utils/emulatorLocation';

export function FavoritesScreen() {
  const { api, overlayRoute, palette, preferences, t } = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<OfferItemDto[]>([]);
  const [locationUnavailable, setLocationUnavailable] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const {
    status,
    statusTone,
    statusAction,
    pending,
    pendingLabel,
    reportStatus: reportNotice,
    reportPending,
    clearStatus,
  } = useStatusNotice();

  function reportStatus(message: string | null, tone: 'neutral' | 'error' | 'success' = 'neutral', action: { label: string; onPress: () => void } | null = null) {
    reportNotice(message, tone, action);
    announceStatus(message);
  }

  async function resolveLocation() {
    const override = resolveEmulatorLocation();
    if (override) {
      return override;
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
      });
      return { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch {
      return null;
    }
  }

  async function load(isRetry = false) {
    const userLocation = await resolveLocation();
    if (!userLocation) {
      setOffers([]);
      setLocationUnavailable(true);
      setRetryFailed(isRetry);
      return;
    }

    setLocationUnavailable(false);
    setRetryFailed(false);
    try {
      const response = await api.searchOffers({
        query: '',
        userLocation,
        radiusMeters: 5000,
        locale: preferences.language,
        favoritesOnly: true,
      });
      setOffers(response.offers);
    } catch {
      reportStatus(t('favorites.loadFailed'));
    }
  }

  useEffect(() => {
    if (overlayRoute?.name !== 'favorites') {
      return;
    }

    void load();
  }, [overlayRoute, preferences.language]);

  if (overlayRoute?.name !== 'favorites') {
    return null;
  }

  async function removeFavorite(offer: OfferItemDto) {
    reportPending(t('common.saving'));
    const previousIndex = offers.findIndex((item) => item.offerId === offer.offerId);
    const result = await api.setOfferFavorite(offer.offerId, { isFavorite: false });
    if (!result.success) {
      reportStatus(t('favorites.removeFailed'), 'error');
      return;
    }

    setOffers((current) => current.filter((item) => item.offerId !== offer.offerId));
    reportStatus(t('offers.favoriteReverted'), 'neutral', {
      label: t('common.undo'),
      onPress: () => {
        void api.setOfferFavorite(offer.offerId, { isFavorite: true }).then((undoResult) => {
          if (!undoResult.success) {
            reportStatus(t('favorites.removeFailed'), 'error');
            return;
          }
          setOffers((current) => {
            if (current.some((item) => item.offerId === offer.offerId)) {
              return current;
            }
            const restored = current.slice();
            restored.splice(previousIndex < 0 ? restored.length : previousIndex, 0, offer);
            return restored;
          });
          reportStatus(t('offers.favoriteUpdated'), 'success');
        });
      },
    });
    selectionFeedback();
  }

  useEffect(() => () => clearStatus(), [clearStatus]);

  if (locationUnavailable) {
    return (
      <View style={[styles.unavailableScreen, { backgroundColor: palette.background }]} testID="favorites-location-unavailable">
        <Card style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text variant="headlineSmall" style={{ color: palette.ink }}>
            {t('favorites.title')}
          </Text>
          <View accessible accessibilityRole="alert" style={styles.unavailableCopy}>
            <Text variant="titleMedium" style={{ color: palette.ink }}>
              {t('offers.locationUnavailable')}
            </Text>
            <Text variant="bodyMedium" style={{ color: palette.inkMuted }}>
              {retryFailed ? t('offers.locationRetryFailed') : t('offers.locationUnavailableHint')}
            </Text>
          </View>
          <Button
            accessibilityLabel={t('offers.retryLocation')}
            accessibilityRole="button"
            buttonColor={palette.panelAlt}
            mode="contained"
            onPress={() => void load(true)}
            style={styles.retryButton}
            testID="favorites-location-retry"
            textColor={palette.ink}
          >
            {t('offers.retryLocation')}
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
      data={offers}
      keyExtractor={(item) => item.offerId}
      ListHeaderComponent={
        <Card style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={{ color: palette.ink }}>
              {t('favorites.title')}
            </Text>
          </View>
          {offers.length === 0 ? (
            <Text variant="bodyMedium" style={{ color: palette.inkMuted }}>
              {t('favorites.empty')}
            </Text>
          ) : null}
        </Card>
      }
      ListFooterComponent={
        pending || status ? (
          <Snackbar visible onDismiss={() => undefined} style={styles.statusRow} testID="favorites-status">
            {pending ? <ProgressBar color={palette.accent} /> : null}
            <Text
              accessibilityLiveRegion="polite"
              variant="bodyMedium"
              style={{ color: statusColor(palette, statusTone) }}
            >
              {pending ? pendingLabel : status}
            </Text>
            {!pending && statusAction ? (
              <Button
                accessibilityLabel={statusAction.label}
                accessibilityRole="button"
                mode="text"
                onPress={statusAction.onPress}
                textColor={palette.accentText ?? palette.ink}
              >
                {statusAction.label}
              </Button>
            ) : null}
          </Snackbar>
        ) : undefined
      }
      renderItem={({ item: offer }) => (
        <Card style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text variant="titleMedium" style={{ color: palette.ink }}>
            {offer.businessName}
          </Text>
          <Text variant="bodyMedium" style={{ color: palette.inkMuted }}>
            {shorten(offer.description, 110)}
          </Text>
          <View style={styles.actionRow}>
            <Button
              accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.directions)}
              accessibilityRole="button"
              buttonColor={palette.panelAlt}
              mode="contained"
              onPress={() => void openDirections(offer.location, preferences.navigationMode)}
              style={styles.button}
              textColor={palette.ink}
            >
              {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
            </Button>
            <TouchableRipple
              accessibilityLabel={t('offers.favoriteRemove')}
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              onPress={() => void removeFavorite(offer)}
              rippleColor={theme.colors.primary}
              style={styles.button}
            >
              <View style={styles.buttonContent}>
                <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
                  <Button
                    children={null}
                    buttonColor={palette.panelAlt}
                    icon="heart"
                    mode="contained"
                    onPress={() => void removeFavorite(offer)}
                    style={styles.m3Button}
                    textColor={palette.danger}
                  />
                </View>
                <Text variant="labelLarge" style={{ color: palette.danger }}>
                  {t('offers.favoriteRemove')}
                </Text>
              </View>
            </TouchableRipple>
          </View>
        </Card>
      )}
      style={{ backgroundColor: palette.background }}
      testID="favorites-scroll"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonContent: {
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  m3Button: {
    margin: 0,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  unavailableScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  retryButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  unavailableCopy: {
    gap: 8,
  },
});
