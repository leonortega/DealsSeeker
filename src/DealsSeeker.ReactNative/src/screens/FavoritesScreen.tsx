import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { openDirections } from '../utils/maps';
import { shorten } from '../utils/format';

const fallbackLocation = { lat: 40.7128, lng: -74.006 };

export function FavoritesScreen() {
  const { api, closeOverlay, overlayRoute, palette, preferences, t } = useApp();
  const [offers, setOffers] = useState<OfferItemDto[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (overlayRoute?.name !== 'favorites') {
      return;
    }

    async function load() {
      let userLocation = fallbackLocation;

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.granted) {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.LocationAccuracy.Balanced,
          });
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        }
      } catch {
        userLocation = fallbackLocation;
      }

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
        setStatus(t('favorites.loadFailed'));
      }
    }

    void load();
  }, [overlayRoute, preferences.language]);

  if (overlayRoute?.name !== 'favorites') {
    return null;
  }

  async function removeFavorite(offer: OfferItemDto) {
    const result = await api.setOfferFavorite(offer.offerId, { isFavorite: false });
    if (!result.success) {
      setStatus(t('favorites.removeFailed'));
      return;
    }

    setOffers((current) => current.filter((item) => item.offerId !== offer.offerId));
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.ink }]}>{t('favorites.title')}</Text>
        <Pressable onPress={closeOverlay}>
          <Text style={{ color: palette.accent, fontWeight: '700' }}>{t('common.back')}</Text>
        </Pressable>
      </View>
      {offers.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('favorites.empty')}</Text> : null}
      {offers.map((offer) => (
        <View key={offer.offerId} style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.offerTitle, { color: palette.ink }]}>{offer.businessName}</Text>
          <Text style={{ color: palette.inkMuted }}>{shorten(offer.description, 110)}</Text>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.button, { backgroundColor: palette.panel }]}
              onPress={() => void openDirections(offer.location, preferences.navigationMode)}
            >
              <Text style={{ color: palette.ink }}>
                {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
              </Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: palette.panelAlt }]} onPress={() => void removeFavorite(offer)}>
              <Text style={{ color: palette.danger }}>{t('offers.favoriteRemove')}</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {status ? <Text style={[styles.status, { color: palette.ink }]}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 16,
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
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
