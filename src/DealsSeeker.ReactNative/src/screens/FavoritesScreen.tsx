import { platformTouchFloor } from '../utils/layout';
import { landmarkFontFamily } from '../utils/typography';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { selectionFeedback } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openDirections } from '../utils/maps';
import { shorten } from '../utils/format';
import { resolveEmulatorLocation } from '../utils/emulatorLocation';

export function FavoritesScreen() {
  const { api, overlayRoute, palette, preferences, t } = useApp();
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<OfferItemDto[]>([]);
  const [locationUnavailable, setLocationUnavailable] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const { status, reportStatus: reportNotice } = useStatusNotice();

  function reportStatus(message: string | null) {
    reportNotice(message);
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
    const result = await api.setOfferFavorite(offer.offerId, { isFavorite: false });
    if (!result.success) {
      reportStatus(t('favorites.removeFailed'));
      return;
    }

    setOffers((current) => current.filter((item) => item.offerId !== offer.offerId));
    selectionFeedback();
  }

  if (locationUnavailable) {
    return (
      <View style={[styles.unavailableScreen, { backgroundColor: palette.background }]} testID="favorites-location-unavailable">
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.title, { color: palette.ink }]}>{t('favorites.title')}</Text>
          <View accessible accessibilityRole="alert" style={styles.unavailableCopy}>
            <Text style={[styles.unavailableTitle, { color: palette.ink }]}>{t('offers.locationUnavailable')}</Text>
            <Text style={{ color: palette.inkMuted }}>
              {retryFailed ? t('offers.locationRetryFailed') : t('offers.locationUnavailableHint')}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={t('offers.retryLocation')}
            accessibilityRole="button"
            onPress={() => void load(true)}
            style={[styles.retryButton, { backgroundColor: palette.panelAlt }]}
            testID="favorites-location-retry"
          >
            <Text style={{ color: palette.ink, fontWeight: '700', textAlign: 'center' }}>
              {t('offers.retryLocation')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
      data={offers}
      keyExtractor={(item) => item.offerId}
      ListHeaderComponent={
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.ink }]}>{t('favorites.title')}</Text>
          </View>
          {offers.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('favorites.empty')}</Text> : null}
        </View>
      }
      ListFooterComponent={
        status ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: palette.danger }]}>
            {status}
          </Text>
        ) : undefined
      }
      renderItem={({ item: offer }) => (
        <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[styles.offerTitle, { color: palette.ink }]}>{offer.businessName}</Text>
          <Text style={{ color: palette.inkMuted }}>{shorten(offer.description, 110)}</Text>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel={preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: palette.panelAlt }]}
              onPress={() => void openDirections(offer.location, preferences.navigationMode)}
            >
              <Text style={{ color: palette.ink, fontWeight: '700', textAlign: 'center' }}>
                {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('offers.favoriteRemove')}
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: palette.panelAlt }]}
              onPress={() => void removeFavorite(offer)}
            >
              <Text style={{ color: palette.danger, fontWeight: '700', textAlign: 'center' }}>{t('offers.favoriteRemove')}</Text>
            </Pressable>
          </View>
        </View>
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
  title: {
    fontFamily: landmarkFontFamily(),
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
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
  status: {
    fontSize: 14,
    fontWeight: '700',
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
  unavailableTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
});
