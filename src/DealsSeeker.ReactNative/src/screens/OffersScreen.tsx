import { type ElementRef, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isRequestAborted } from '../api/client';
import { getDevicePositionAsync } from '../utils/deviceLocation';
import { OfferAvailabilityVoteType, OfferItemDto, SearchOffersResponse } from '../api/types';
import { ImmersiveOfferFeed } from '../components/ImmersiveOfferFeed';
import { ImmersiveFeedTab } from '../components/ImmersiveFeedTabs';
import { NativeMapPreview } from '../components/NativeMapPreview';
import { OfferCard } from '../components/OfferCard';
import { OfferDetailModal } from '../components/OfferDetailModal';
import { OfferCommentsModal } from '../components/OfferCommentsModal';
import { OfferReportSheet } from '../components/OfferReportSheet';
import { FirstRunSheet } from '../components/FirstRunSheet';
import { HelpSheet } from '../components/HelpSheet';
import { NavIcon } from '../components/NavIcon';
import { OffersStatePanel } from '../components/OffersStatePanel';
import { PresentationModeSwitch, type PresentationMode } from '../components/PresentationModeSwitch';
import { StandardHeader } from '../components/StandardHeader';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { partitionOffers } from '../utils/format';
import { selectionFeedback, successFeedback } from '../utils/haptics';
import { openDirections } from '../utils/maps';
import { resolveOffersViewState } from '../utils/offersState';
import { statusColor } from '../utils/statusNotice';
import { resolveOffersGridColumns } from '../utils/layout';
import { loadFirstRunCompleted, saveFirstRunCompleted } from '../utils/storage';
import { resolveEmulatorLocation } from '../utils/emulatorLocation';
import { restoreFocus } from '../utils/focusReturn';
import { immersiveBackdrop } from '../utils/theme';

const fallbackLocation = { lat: 40.7128, lng: -74.006 };
const radiusOptions = [500, 1000, 1500, 2500, 5000];
const searchDebounceMs = 300;

export function OffersScreen() {
  const { activeTab, api, clearReportDraft, closeImmersiveOffers, immersiveOffers, isPending, openAddOffer, openImmersiveOffers, palette, preferences, reportDraft, setReportDraft, t } =
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
  const { status, statusTone, reportStatus: setActionStatus } = useStatusNotice();
  const [searchFailed, setSearchFailed] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [locationFallback, setLocationFallback] = useState(false);
  const [locationNoticeDismissed, setLocationNoticeDismissed] = useState(false);
  const [firstRunVisible, setFirstRunVisible] = useState(false);
  const searchRequest = useAbortableRequest();
  const searchSequence = useRef(0);
  const lastLocationAttemptFailed = useRef(false);
  const helpButtonRef = useRef<ElementRef<typeof View> | null>(null);

  async function resolveCurrentLocation() {
    const emulatorLocation = resolveEmulatorLocation();
    if (emulatorLocation) {
      setUserLocation(emulatorLocation);
      setLocationFallback(false);
      lastLocationAttemptFailed.current = false;
      setLocationNoticeDismissed(true);
      return emulatorLocation;
    }

    let nextLocation = fallbackLocation;
    let usingFallback = false;

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.granted) {
        nextLocation = await getDevicePositionAsync();
      } else {
        usingFallback = true;
      }
    } catch {
      usingFallback = true;
      nextLocation = fallbackLocation;
    }

    setUserLocation(nextLocation);
    setLocationFallback(usingFallback);
    lastLocationAttemptFailed.current = usingFallback;
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

    if (lastLocationAttemptFailed.current) {
      setActionStatus(t('offers.locationRetryFailed'), 'error');
    }

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
        setActionStatus(null);
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
          <Text style={[styles.fallbackButtonLabel, { color: palette.onAccent }]}>
            {t('offers.useMyLocation')}
          </Text>
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

  async function toggleFavorite(offer: OfferItemDto) {
    setActionStatus(null);
    const nextFavorite = !offer.isFavorite;
    const result = await api.setOfferFavorite(offer.offerId, { isFavorite: nextFavorite });
    if (!result.success) {
      setActionStatus(t('offers.favoriteFailed'), 'error');
      return;
    }

    setResults((previous) => ({
      ...previous,
      offers:
        favoritesOnly && !nextFavorite
          ? previous.offers.filter((item) => item.offerId !== offer.offerId)
          : previous.offers.map((item) =>
              item.offerId === offer.offerId ? { ...item, isFavorite: nextFavorite } : item
            ),
    }));
    setDetailOffer((current) =>
      current?.offerId === offer.offerId ? { ...current, isFavorite: nextFavorite } : current
    );
    setCommentsOffer((current) =>
      current?.offerId === offer.offerId ? { ...current, isFavorite: nextFavorite } : current
    );

    setActionStatus(t('offers.favoriteUpdated'));
    selectionFeedback();
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
      return;
    }

    const applyVote = (item: OfferItemDto): OfferItemDto =>
      item.offerId === offer.offerId
        ? {
            ...item,
            hasCurrentUserVoted: true,
            positiveAvailabilityCount: item.positiveAvailabilityCount + (voteType === 1 ? 1 : 0),
            negativeAvailabilityCount: item.negativeAvailabilityCount + (voteType === 2 ? 1 : 0),
          }
        : item;
    setResults((previous) => ({ ...previous, offers: previous.offers.map(applyVote) }));
    setDetailOffer((current) => (current ? applyVote(current) : current));
    setCommentsOffer((current) => (current ? applyVote(current) : current));

    setActionStatus(t('offers.feedbackRegistered'));
    successFeedback();
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
      <View style={[styles.immersiveWrapper, { backgroundColor: immersiveBackdrop }]} testID="immersive-content">
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
        <OfferReportSheet
          draft={reportDraft}
          onClose={() => {
            clearReportDraft();
            restoreFocus(helpButtonRef);
          }}
          returnFocusRef={helpButtonRef}
          visible={reportDraft !== null}
        />
        <FirstRunSheet onDismiss={dismissFirstRun} visible={firstRunVisible} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        testID="offers-scroll"
        contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
        style={{ backgroundColor: palette.background }}
      >
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
            accessibilityLabel={t('offers.searchPlaceholder')}
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
                <Text style={{ color: option === radiusMeters ? palette.accentText : palette.ink }}>{option} m</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionButton, { backgroundColor: palette.accent }]} onPress={() => void search()}>
              <Text style={[styles.primaryLabel, { color: palette.onAccent }]}>{t('common.search')}</Text>
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
              <Text style={{ color: favoritesOnly ? palette.accentText : palette.ink }}>{t('offers.favoritesOnly')}</Text>
            </Pressable>
          </View>
        </View>

        {renderStatePanel()}

        <NativeMapPreview
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
      <OfferReportSheet
        draft={reportDraft}
        onClose={() => {
          clearReportDraft();
          restoreFocus(helpButtonRef);
        }}
        returnFocusRef={helpButtonRef}
        visible={reportDraft !== null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  immersiveWrapper: {
    flex: 1,
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
    borderRadius: 999,
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
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    borderRadius: 999,
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryLabel: {
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
