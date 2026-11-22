import { type ElementRef, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isRequestAborted } from '../api/client';
import { OfferAvailabilityVoteType, OfferItemDto, SearchOffersResponse } from '../api/types';
import { ImmersiveOfferFeed } from '../components/ImmersiveOfferFeed';
import { ImmersiveFeedTab } from '../components/ImmersiveFeedTabs';
import { MapPreview } from '../components/MapPreview';
import { OfferCard } from '../components/OfferCard';
import { OfferDetailModal } from '../components/OfferDetailModal';
import { OfferCommentsModal } from '../components/OfferCommentsModal';
import { FirstRunSheet } from '../components/FirstRunSheet';
import { HelpSheet } from '../components/HelpSheet';
import { NavIcon } from '../components/NavIcon';
import { OffersStatePanel } from '../components/OffersStatePanel';
import { PresentationModeSwitch, type PresentationMode } from '../components/PresentationModeSwitch';
import { StandardHeader } from '../components/StandardHeader';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { partitionOffers } from '../utils/format';
import { openDirections } from '../utils/maps';
import { resolveOffersViewState } from '../utils/offersState';
import { statusColor, type StatusTone } from '../utils/statusNotice';
import { resolveOffersGridColumns } from '../utils/layout';
import { loadFirstRunCompleted, saveFirstRunCompleted } from '../utils/storage';

const fallbackLocation = { lat: 40.7128, lng: -74.006 };
const radiusOptions = [500, 1000, 1500, 2500, 5000];
const searchDebounceMs = 300;

export function OffersScreen() {
  const { activeTab, api, closeImmersiveOffers, immersiveOffers, isPending, openAddOffer, openImmersiveOffers, palette, preferences, setReportDraft, t } =
    useApp();
  const { width: viewportWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(1500);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [feedTab, setFeedTab] = useState<ImmersiveFeedTab>('viewAll');
  const [results, setResults] = useState<SearchOffersResponse>({ offers: [], businesses: [] });
  const [detailOffer, setDetailOffer] = useState<OfferItemDto | null>(null);
  const [commentsOffer, setCommentsOffer] = useState<OfferItemDto | null>(null);
  const [userLocation, setUserLocation] = useState(fallbackLocation);
  const [userLocationLabel, setUserLocationLabel] = useState(t('offers.currentLocation'));
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>('neutral');
  const [searchFailed, setSearchFailed] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [locationFallback, setLocationFallback] = useState(false);
  const [locationNoticeDismissed, setLocationNoticeDismissed] = useState(false);
  const [firstRunVisible, setFirstRunVisible] = useState(false);
  const searchRequest = useAbortableRequest();
  const searchSequence = useRef(0);
  const helpButtonRef = useRef<ElementRef<typeof View> | null>(null);

  async function resolveCurrentLocation() {
    let nextLocation = fallbackLocation;
    let usingFallback = false;

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
      } else {
        usingFallback = true;
      }
    } catch {
      usingFallback = true;
      nextLocation = fallbackLocation;
    }

    setUserLocation(nextLocation);
    setLocationFallback(usingFallback);
    setLocationNoticeDismissed(false);

    try {
      const reverse = await api.reverseLocation(nextLocation.lat, nextLocation.lng);
      const resolvedLabel = reverse?.label?.trim();
      setUserLocationLabel(
        usingFallback
          ? resolvedLabel
            ? `${t('offers.approximateArea')}: ${resolvedLabel}`
            : t('offers.approximateArea')
          : resolvedLabel || t('offers.currentLocation')
      );
    } catch {
      setUserLocationLabel(usingFallback ? t('offers.approximateArea') : t('offers.currentLocation'));
    }

    return nextLocation;
  }

  async function retryLocation() {
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
      setSearchFailed(false);
    } catch {
      setSearchFailed(true);
    }
  }

  async function search(
    nextQuery = query,
    nextRadius = radiusMeters,
    nextFavoritesOnly = favoritesOnly
  ) {
    const sequence = searchSequence.current + 1;
    searchSequence.current = sequence;

    // A new search supersedes the one still in flight.
    const signal = searchRequest.begin();

    try {
      const location = userLocation ?? (await resolveCurrentLocation());
      const response = await api.searchOffers(
        {
          query: nextQuery,
          userLocation: location,
          radiusMeters: nextRadius,
          locale: preferences.language,
          favoritesOnly: nextFavoritesOnly,
        },
        { signal }
      );

      if (sequence !== searchSequence.current) {
        return;
      }

      setResults(response);
      setSearchFailed(false);
    } catch (error) {
      if (isRequestAborted(error) || sequence !== searchSequence.current) {
        return;
      }

      setSearchFailed(true);
    }
  }

  const searchDebounced = useDebouncedCallback(
    (nextQuery: string, nextRadius: number, nextFavoritesOnly: boolean) => {
      void search(nextQuery, nextRadius, nextFavoritesOnly);
    },
    searchDebounceMs
  );

  useEffect(() => {
    if (activeTab !== 'offers') {
      return;
    }

    void loadFirstRunCompleted().then((completed) => setFirstRunVisible(!completed));
  }, [activeTab]);

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
        setSearchFailed(false);
      } catch (error) {
        if (isRequestAborted(error)) {
          return;
        }
        setSearchFailed(true);
      }
    })();
  }, [activeTab, preferences.language]);

  if (activeTab !== 'offers') {
    return null;
  }

  const state = resolveOffersViewState({
    hasActiveFilters: query.trim().length > 0 || favoritesOnly,
    hasOffers: results.offers.length > 0,
    searchFailed,
  });

  const presentationMode: PresentationMode = immersiveOffers ? 'feed' : 'map';

  function changePresentationMode(nextMode: PresentationMode) {
    if (nextMode === 'feed') {
      openImmersiveOffers();
      return;
    }
    closeImmersiveOffers();
  }

  const modeSwitch = (
    <PresentationModeSwitch
      feedLabel={t('offers.mode.feed')}
      mapLabel={t('offers.mode.map')}
      onChange={changePresentationMode}
      palette={palette}
      value={presentationMode}
    />
  );

  const helpButton = (
    <Pressable
      ref={helpButtonRef}
      accessibilityLabel={t('common.help')}
      accessibilityRole="button"
      onPress={() => setHelpVisible(true)}
      style={[styles.helpButton, { backgroundColor: palette.panel, borderColor: palette.border }]}
    >
      <NavIcon color={palette.ink} name="help" size={20} />
    </Pressable>
  );

  const fallbackNotice = (
    <View style={[styles.fallbackNotice, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text accessibilityLiveRegion="polite" style={[styles.fallbackText, { color: palette.ink }]}>
        {t('offers.locationFallbackNotice')}
      </Text>
      <View style={styles.fallbackActions}>
        <Pressable
          accessibilityLabel={t('offers.useMyLocation')}
          accessibilityRole="button"
          onPress={() => void retryLocation()}
          style={[styles.fallbackButton, { backgroundColor: palette.accent }]}
        >
          <Text style={styles.fallbackButtonLabel}>{t('offers.useMyLocation')}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.dismissNotice')}
          accessibilityRole="button"
          onPress={() => setLocationNoticeDismissed(true)}
          style={[styles.fallbackButton, { backgroundColor: palette.panel }]}
        >
          <Text style={{ color: palette.ink }}>{t('offers.dismissNotice')}</Text>
        </Pressable>
      </View>
    </View>
  );

  function dismissFirstRun() {
    setFirstRunVisible(false);
    void saveFirstRunCompleted();
  }

  function clearFilters() {
    setQuery('');
    setFavoritesOnly(false);
    setFeedTab('viewAll');
    void search('', radiusMeters, false);
  }

  function panel(title: string, hint: string, actionLabel: string, onAction: () => void) {
    return (
      <OffersStatePanel
        actionLabel={actionLabel}
        hint={hint}
        onAction={onAction}
        palette={palette}
        title={title}
      />
    );
  }

  function renderStatePanel() {
    if (state.kind === 'search-error') {
      return panel(t('offers.searchFailed'), t('offers.searchFailedHint'), t('offers.retry'), () => void search());
    }

    if (state.kind === 'no-results-filtered') {
      return panel(t('offers.noResults'), t('offers.noResultsHint'), t('offers.clearFilters'), clearFilters);
    }

    if (state.kind === 'empty') {
      return panel(t('offers.emptyTitle'), t('offers.emptyHint'), t('offers.createFirstOffer'), openAddOffer);
    }

    return null;
  }

  const sections = partitionOffers(results.offers, query);
  const gridColumns = resolveOffersGridColumns(viewportWidth);
  const cardWidth = Math.max(
    220,
    (Math.max(320, viewportWidth - 32) - (gridColumns - 1) * 12) / gridColumns
  );

  function setActionStatus(message: string | null, tone: StatusTone = 'neutral') {
    setStatus(message);
    setStatusTone(tone);
  }

  async function toggleFavorite(offer: OfferItemDto) {
    setActionStatus(null);
    const result = await api.setOfferFavorite(offer.offerId, { isFavorite: !offer.isFavorite });
    if (!result.success) {
      setActionStatus(t('offers.favoriteFailed'), 'error');
      return;
    }

    await search();
    setActionStatus(t('offers.favoriteUpdated'));
  }

  async function vote(offer: OfferItemDto, voteType: OfferAvailabilityVoteType) {
    setActionStatus(null);
    const result = await api.voteOfferAvailability(offer.offerId, { vote: voteType });
    if (!result.success) {
      setActionStatus(
        result.message.toLowerCase().includes('already')
          ? t('offers.voteAlreadySubmitted')
          : t('offers.voteFailed'),
        'error'
      );
      await search();
      return;
    }

    setActionStatus(t('offers.feedbackRegistered'));
    await search();
  }

  async function openOfferDirections(offer: OfferItemDto) {
    await openDirections(offer.location, preferences.navigationMode);
  }

  function openOfferComments(offer: OfferItemDto) {
    setDetailOffer(null);
    setCommentsOffer(offer);
  }

  function handleFeedTabChange(tab: ImmersiveFeedTab) {
    const nextFavoritesOnly = tab === 'favorites';
    setFeedTab(tab);
    setFavoritesOnly(nextFavoritesOnly);
    void search(query, radiusMeters, nextFavoritesOnly);
  }

  if (immersiveOffers) {
    const combinedOffers = [...sections.promoted, ...sections.feed];

    return (
      <>
        {locationFallback && !locationNoticeDismissed ? fallbackNotice : null}
        {renderStatePanel()}
        {status ? (
          <View pointerEvents="box-none" style={styles.feedbackToast}>
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.feedbackToastText, { backgroundColor: palette.card, borderColor: palette.border, color: statusColor(palette, statusTone) }]}
            >
              {status}
            </Text>
          </View>
        ) : null}
        {isPending('offers-search') ? (
          <View style={[styles.progressBanner, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.progressLabel, { color: palette.inkMuted }]}>{t('offers.loading')}</Text>
          </View>
        ) : null}
        <ImmersiveOfferFeed
          feedTab={feedTab}
          headerControl={modeSwitch}
          helpControl={helpButton}
          returnFocusRef={helpButtonRef}
          offers={combinedOffers}
          onComments={openOfferComments}
          onDirections={openOfferDirections}
          onFavorite={toggleFavorite}
          onFeedTabChange={handleFeedTabChange}
          onRadiusChange={(nextRadius) => {
            setRadiusMeters(nextRadius);
            void search(query, nextRadius, favoritesOnly);
          }}
          onReport={setReportDraft}
          onSearch={(nextQuery) => {
            setQuery(nextQuery);
            searchDebounced(nextQuery, radiusMeters, favoritesOnly);
          }}
          onVote={vote}
          query={query}
          radiusMeters={radiusMeters}
        />
        <OfferDetailModal
          offer={detailOffer}
          onClose={() => setDetailOffer(null)}
          onComments={openOfferComments}
          onDirections={openOfferDirections}
          onFavorite={toggleFavorite}
          returnFocusRef={helpButtonRef}
          visible={detailOffer !== null}
        />
        <OfferCommentsModal
          offer={commentsOffer}
          onClose={() => setCommentsOffer(null)}
          returnFocusRef={helpButtonRef}
          visible={commentsOffer !== null}
        />
        <HelpSheet onClose={() => setHelpVisible(false)} returnFocusRef={helpButtonRef} visible={helpVisible} />
        <FirstRunSheet onDismiss={dismissFirstRun} visible={firstRunVisible} />
      </>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        {locationFallback && !locationNoticeDismissed ? fallbackNotice : null}
        <StandardHeader />
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: palette.ink }]}>{t('offers.title')}</Text>
            <Text style={{ color: palette.inkMuted }}>
              {t('offers.location')}: {userLocationLabel}
            </Text>
          </View>
        </View>
        <View style={styles.headerControls}>
          {modeSwitch}
          {helpButton}
        </View>

        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <TextInput
            onChangeText={(value) => {
              setQuery(value);
              searchDebounced(value, radiusMeters, favoritesOnly);
            }}
            placeholder={t('offers.searchPlaceholder')}
            placeholderTextColor={palette.inkMuted}
            style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
            value={query}
          />
          <View style={styles.filterRow}>
            {radiusOptions.map((option) => (
              <Pressable
                key={option}
                accessibilityLabel={`${option} m`}
                accessibilityRole="button"
                accessibilityState={{ selected: option === radiusMeters }}
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
                setFeedTab(next ? 'favorites' : 'viewAll');
                void search(query, radiusMeters, next);
              }}
            >
              <Text style={{ color: favoritesOnly ? palette.accent : palette.ink }}>{t('offers.favoritesOnly')}</Text>
            </Pressable>
          </View>
        </View>

        {renderStatePanel()}

        <MapPreview
          businesses={results.businesses}
          center={userLocation}
          height={300}
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
                    onComments={openOfferComments}
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
          <View style={styles.grid}>
            {sections.feed.map((offer) => (
              <View
                key={offer.offerId}
                style={gridColumns === 1 ? styles.gridCellFull : [styles.gridCell, { width: cardWidth }]}
              >
                <OfferCard
                  offer={offer}
                  onComments={openOfferComments}
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
        {status ? <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>{status}</Text> : null}
      </ScrollView>

      <OfferDetailModal
        offer={detailOffer}
        onClose={() => setDetailOffer(null)}
        onComments={openOfferComments}
        onDirections={openOfferDirections}
        onFavorite={toggleFavorite}
        returnFocusRef={helpButtonRef}
          visible={detailOffer !== null}
      />
      <OfferCommentsModal
        offer={commentsOffer}
        onClose={() => setCommentsOffer(null)}
        returnFocusRef={helpButtonRef}
          visible={commentsOffer !== null}
      />
      <HelpSheet onClose={() => setHelpVisible(false)} returnFocusRef={helpButtonRef} visible={helpVisible} />
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
  headerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  helpButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  fallbackNotice: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fallbackText: {
    fontSize: 12,
  },
  fallbackActions: {
    flexDirection: 'row',
    gap: 10,
  },
  fallbackButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  fallbackButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackToast: {
    alignItems: 'flex-start',
    bottom: 176,
    left: 16,
    maxWidth: '70%',
    position: 'absolute',
    right: 16,
    zIndex: 5,
  },
  feedbackToastText: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 30,
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
    minHeight: 44,
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
    minHeight: 44,
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
  progressBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  progressLabel: {
    fontSize: 14,
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
