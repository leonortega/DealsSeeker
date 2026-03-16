import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as Location from 'expo-location';
import { OfferAvailabilityVoteType, OfferItemDto, SearchOffersResponse } from '../api/types';
import { MapPreview } from '../components/MapPreview';
import { OfferCard } from '../components/OfferCard';
import { OfferDetailModal } from '../components/OfferDetailModal';
import { useApp } from '../hooks/useApp';
import { partitionOffers } from '../utils/format';
import { openDirections } from '../utils/maps';

const fallbackLocation = { lat: 40.7128, lng: -74.006 };
const radiusOptions = [500, 1000, 1500, 2500, 5000];

export function OffersScreen() {
  const { activeTab, api, openAddOffer, palette, preferences, setReportDraft, t } = useApp();
  const { width: viewportWidth } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(1500);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [results, setResults] = useState<SearchOffersResponse>({ offers: [], businesses: [] });
  const [detailOffer, setDetailOffer] = useState<OfferItemDto | null>(null);
  const [userLocation, setUserLocation] = useState(fallbackLocation);
  const [userLocationLabel, setUserLocationLabel] = useState(t('offers.currentLocation'));
  const [status, setStatus] = useState<string | null>(null);

  async function resolveCurrentLocation() {
    let nextLocation = fallbackLocation;

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.granted) {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.Balanced,
        });
        nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      }
    } catch {
      nextLocation = fallbackLocation;
    }

    setUserLocation(nextLocation);

    try {
      const reverse = await api.reverseLocation(nextLocation.lat, nextLocation.lng);
      setUserLocationLabel(reverse?.label?.trim() || t('offers.currentLocation'));
    } catch {
      setUserLocationLabel(t('offers.currentLocation'));
    }

    return nextLocation;
  }

  async function search(nextQuery = query, nextRadius = radiusMeters, nextFavoritesOnly = favoritesOnly) {
    try {
      const location = userLocation ?? (await resolveCurrentLocation());
      const response = await api.searchOffers({
        query: nextQuery,
        userLocation: location,
        radiusMeters: nextRadius,
        locale: preferences.language,
        favoritesOnly: nextFavoritesOnly,
      });
      setResults(response);
      setStatus(null);
    } catch {
      setStatus(t('offers.searchFailed'));
    }
  }

  useEffect(() => {
    if (activeTab !== 'offers') {
      return;
    }

    void (async () => {
      const location = await resolveCurrentLocation();
      try {
        const response = await api.searchOffers({
          query,
          userLocation: location,
          radiusMeters,
          locale: preferences.language,
          favoritesOnly,
        });
        setResults(response);
        setStatus(null);
      } catch {
        setStatus(t('offers.searchFailed'));
      }
    })();
  }, [activeTab, preferences.language]);

  if (activeTab !== 'offers') {
    return null;
  }

  const sections = partitionOffers(results.offers, query);
  const gridColumns = viewportWidth >= 1080 ? 3 : viewportWidth >= 720 ? 2 : 1;
  const cardWidth = Math.max(
    220,
    (Math.max(320, viewportWidth - 32) - (gridColumns - 1) * 12) / gridColumns
  );

  async function toggleFavorite(offer: OfferItemDto) {
    const result = await api.setOfferFavorite(offer.offerId, { isFavorite: !offer.isFavorite });
    if (!result.success) {
      setStatus(t('offers.favoriteFailed'));
      return;
    }

    await search();
    setStatus(t('offers.favoriteUpdated'));
  }

  async function vote(offer: OfferItemDto, voteType: OfferAvailabilityVoteType) {
    const result = await api.voteOfferAvailability(offer.offerId, { vote: voteType });
    if (!result.success) {
      setStatus(
        result.message.toLowerCase().includes('already')
          ? t('offers.voteAlreadySubmitted')
          : t('offers.voteFailed')
      );
      await search();
      return;
    }

    setStatus(t('offers.feedbackRegistered'));
    await search();
  }

  async function openOfferDirections(offer: OfferItemDto) {
    await openDirections(offer.location, preferences.navigationMode);
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: palette.ink }]}>{t('offers.title')}</Text>
            <Text style={{ color: palette.inkMuted }}>
              {t('offers.location')}: {userLocationLabel}
            </Text>
          </View>
          <Pressable style={[styles.addButton, { backgroundColor: palette.accent }]} onPress={() => openAddOffer()}>
            <Text style={styles.addButtonLabel}>＋</Text>
          </Pressable>
        </View>

        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <TextInput
            onChangeText={setQuery}
            placeholder={t('offers.searchPlaceholder')}
            placeholderTextColor={palette.inkMuted}
            style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
            value={query}
          />
          <View style={styles.filterRow}>
            {radiusOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.radiusChip,
                  {
                    backgroundColor: option === radiusMeters ? palette.accentMuted : palette.panel,
                    borderColor: palette.border,
                  },
                ]}
                onPress={() => {
                  setRadiusMeters(option);
                  void search(query, option, favoritesOnly);
                }}
              >
                <Text style={{ color: option === radiusMeters ? palette.accent : palette.ink }}>{option} m</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionButton, { backgroundColor: palette.accent }]} onPress={() => void search()}>
              <Text style={styles.primaryLabel}>{t('common.search')}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: favoritesOnly ? palette.accentMuted : palette.panel }]}
              onPress={() => {
                const next = !favoritesOnly;
                setFavoritesOnly(next);
                void search(query, radiusMeters, next);
              }}
            >
              <Text style={{ color: favoritesOnly ? palette.accent : palette.ink }}>{t('offers.favoritesOnly')}</Text>
            </Pressable>
          </View>
        </View>

        <MapPreview
          businesses={results.businesses}
          center={userLocation}
          onSelectMarker={(marker) => void openDirections(marker.location, preferences.navigationMode)}
          radiusMeters={radiusMeters}
        />

        {sections.promoted.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('offers.promoted')}</Text>
            <View style={styles.grid}>
              {sections.promoted.map((offer) => (
                <View
                  key={`promoted-${offer.offerId}`}
                  style={gridColumns === 1 ? styles.gridCellFull : [styles.gridCell, { width: cardWidth }]}
                >
                  <OfferCard
                    offer={offer}
                    onDirections={openOfferDirections}
                    onFavorite={toggleFavorite}
                    onOpenDetail={setDetailOffer}
                    onReport={setReportDraft}
                    onVote={vote}
                    query={query}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('nav.offers')}</Text>
          {sections.feed.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('offers.noResults')}</Text> : null}
          <View style={styles.grid}>
            {sections.feed.map((offer) => (
              <View
                key={offer.offerId}
                style={gridColumns === 1 ? styles.gridCellFull : [styles.gridCell, { width: cardWidth }]}
              >
                <OfferCard
                  offer={offer}
                  onDirections={openOfferDirections}
                  onFavorite={toggleFavorite}
                  onOpenDetail={setDetailOffer}
                  onReport={setReportDraft}
                  onVote={vote}
                  query={query}
                />
              </View>
            ))}
          </View>
        </View>
        {status ? <Text style={[styles.status, { color: palette.ink }]}>{status}</Text> : null}
      </ScrollView>

      <OfferDetailModal
        offer={detailOffer}
        onClose={() => setDetailOffer(null)}
        onDirections={openOfferDirections}
        onFavorite={toggleFavorite}
        visible={detailOffer !== null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 30,
    fontWeight: '700',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    borderRadius: 16,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCell: {
    minWidth: 0,
  },
  gridCellFull: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
