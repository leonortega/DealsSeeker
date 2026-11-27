import { platformTouchFloor } from '../utils/layout';
import { landmarkFontFamily } from '../utils/typography';
import { type ElementRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isRequestAborted } from '../api/client';
import { type DevicePosition, getDevicePositionAsync } from '../utils/deviceLocation';
import { OfferAvailabilityVoteType, OfferItemDto, SearchOffersResponse } from '../api/types';
import { CoverageDistanceControl } from '../components/CoverageDistanceControl';
import { ImmersiveOfferFeed, NARROW_BREAKPOINT } from '../components/ImmersiveOfferFeed';
import { ImmersiveFeedTab } from '../components/ImmersiveFeedTabs';
import { NativeMapPreview } from '../components/NativeMapPreview';
import { OfferTopBar } from '../components/OfferTopBar';
import { OfferCard } from '../components/OfferCard';
import { OfferDetailModal } from '../components/OfferDetailModal';
import { OfferCommentsModal } from '../components/OfferCommentsModal';
import { OfferReportSheet } from '../components/OfferReportSheet';
import { FirstRunSheet } from '../components/FirstRunSheet';
import { HelpSheet, type HelpTopic } from '../components/HelpSheet';
import { PlatformTabIcon } from '../components/PlatformTabIcon';
import { OffersStatePanel } from '../components/OffersStatePanel';
import { PresentationModeSwitch, type PresentationMode } from '../components/PresentationModeSwitch';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { STATUS_DWELL_MS, useStatusNotice } from '../hooks/useStatusNotice';
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

const searchDebounceMs = 300;
const queryMaxLength = 200;

export function OffersScreen() {
  const { activeTab, api, clearReportDraft, closeImmersiveOffers, immersiveOffers, isAuthenticated, openAddOffer, openImmersiveOffers, palette, preferences, reportDraft, runOperation, setReportDraft, t } =
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
  const [userLocation, setUserLocation] = useState<DevicePosition | null>(null);
  const [userLocationLabel, setUserLocationLabel] = useState(t('offers.locationUnavailable'));
  const { status, statusTone, statusAction, reportStatus: setActionStatus } = useStatusNotice();
  const [searchFailed, setSearchFailed] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | undefined>(undefined);
  const [locationUnavailable, setLocationUnavailable] = useState(false);
  const [firstRunVisible, setFirstRunVisible] = useState(false);
  const searchRequest = useAbortableRequest();
  const searchSequence = useRef(0);
  const voteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const helpButtonRef = useRef<ElementRef<typeof View> | null>(null);

  async function resolveCurrentLocation(): Promise<DevicePosition | null> {
    const emulatorLocation = resolveEmulatorLocation();
    if (emulatorLocation) {
      setUserLocation(emulatorLocation);
      setLocationUnavailable(false);
      setUserLocationLabel(t('offers.currentLocation'));
      return emulatorLocation;
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setUserLocation(null);
        setLocationUnavailable(true);
        setUserLocationLabel(t('offers.locationUnavailable'));
        return null;
      }

      const position = await getDevicePositionAsync();
      setUserLocation(position);
      setLocationUnavailable(false);
      try {
        const reverse = await api.reverseLocation(position.lat, position.lng);
        setUserLocationLabel(reverse?.label?.trim() || t('offers.currentLocation'));
      } catch {
        setUserLocationLabel(t('offers.currentLocation'));
      }
      return position;
    } catch {
      setUserLocation(null);
      setLocationUnavailable(true);
      setUserLocationLabel(t('offers.locationUnavailable'));
      return null;
    }
  }

  async function retryLocation() {
    const location = await resolveCurrentLocation();

    if (!location) {
      setActionStatus(t('offers.locationRetryFailed'), 'error');
      return;
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
      setActionStatus(null);
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
    if (!userLocation) {
      setLocationUnavailable(true);
      return;
    }

    const sequence = searchSequence.current + 1;
    searchSequence.current = sequence;

    // A new search supersedes the one still in flight.
    const signal = searchRequest.begin();

    try {
      const response = await api.searchOffers(
        {
          query: nextQuery,
          userLocation: userLocation,
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

    void runOperation(null, async () => {
      try {
        const location = await resolveCurrentLocation();
        if (!location) {
          return;
        }
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
        if (!isRequestAborted(error)) {
          setSearchFailed(true);
        }
      }
    });
  }, [activeTab, preferences.language, runOperation]);

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
      <PlatformTabIcon color={palette.ink} name="help" size={20} />
    </Pressable>
  );

  const locationUnavailablePanel = (
    <View>
      <OffersStatePanel
        actionLabel={t('offers.retry')}
        hint={t('offers.locationUnavailableHint')}
        onAction={() => void retryLocation()}
        palette={palette}
        title={t('offers.locationUnavailable')}
      />
      <Pressable
        accessibilityLabel={t('common.why')}
        accessibilityRole="button"
        onPress={() => openContextHelp('help.find')}
        style={styles.whyButton}
      >
        <Text style={{ color: palette.accentText, fontWeight: '800' }}>{t('common.why')}</Text>
      </Pressable>
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

  function openContextHelp(topic: HelpTopic) {
    setHelpTopic(topic);
    setHelpVisible(true);
  }

  function panel(title: string, hint: string, actionLabel: string, onAction: () => void) {
    return (
      <View>
        <OffersStatePanel
          actionLabel={actionLabel}
          hint={hint}
          onAction={onAction}
          palette={palette}
          title={title}
        />
        <Pressable
          accessibilityLabel={t('common.why')}
          accessibilityRole="button"
          onPress={() => openContextHelp('help.find')}
          style={styles.whyButton}
        >
          <Text style={{ color: palette.accentText, fontWeight: '800' }}>{t('common.why')}</Text>
        </Pressable>
      </View>
    );
  }

  function requireSession(): boolean {
    if (isAuthenticated) {
      return true;
    }
    setActionStatus(t('auth.signInToContribute'), 'error');
    return false;
  }

  function renderStatePanel() {
    if (state.kind === 'empty') {
      return panel(t('offers.emptyTitle'), t('offers.emptyHint'), t('offers.createFirstOffer'), () => {
        if (requireSession()) {
          openAddOffer();
        }
      });
    }

    if (state.kind === 'search-error') {
      return panel(t('offers.searchFailed'), t('offers.searchFailedHint'), t('offers.retry'), () => void search());
    }

    if (state.kind === 'no-results-filtered') {
      return panel(t('offers.noResults'), t('offers.noResultsHint'), t('offers.clearFilters'), clearFilters);
    }

    return null;
  }

  const sections = useMemo(() => partitionOffers(results.offers, query), [results.offers, query]);
  const listSections = useMemo(
    () => [
      ...(sections.promoted.length > 0
        ? [{ key: 'promoted', title: t('offers.promoted'), data: sections.promoted }]
        : []),
      ...(sections.feed.length > 0 ? [{ key: 'feed', title: t('nav.offers'), data: sections.feed }] : []),
    ],
    [sections, t]
  );
  const combinedOffers = useMemo(() => [...sections.promoted, ...sections.feed], [sections]);
  const gridColumns = resolveOffersGridColumns(viewportWidth);
  const cardWidth = Math.max(
    220,
    (Math.max(320, viewportWidth - 32) - (gridColumns - 1) * 12) / gridColumns
  );

  async function toggleFavorite(offer: OfferItemDto) {
    if (!requireSession()) {
      return;
    }
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

    setActionStatus(t('offers.favoriteUpdated'), 'neutral', {
      label: t('common.undo'),
      onPress: () => {
        void api.setOfferFavorite(offer.offerId, { isFavorite: false }).then((undoResult) => {
          if (!undoResult.success) {
            return;
          }
          setResults((previous) => ({
            ...previous,
            offers: favoritesOnly
              ? [offer, ...previous.offers]
              : previous.offers.map((item) => (item.offerId === offer.offerId ? offer : item)),
          }));
          setDetailOffer((current) => (current?.offerId === offer.offerId ? offer : current));
          setCommentsOffer((current) => (current?.offerId === offer.offerId ? offer : current));
          setActionStatus(t('offers.favoriteReverted'));
        });
      },
    });
    selectionFeedback();
  }

  async function vote(offer: OfferItemDto, voteType: OfferAvailabilityVoteType) {
    if (!requireSession()) {
      return;
    }
    setActionStatus(null);

    const applyVote = (item: OfferItemDto): OfferItemDto =>
      item.offerId === offer.offerId
        ? {
            ...item,
            hasCurrentUserVoted: true,
            positiveAvailabilityCount: item.positiveAvailabilityCount + (voteType === 1 ? 1 : 0),
            negativeAvailabilityCount: item.negativeAvailabilityCount + (voteType === 2 ? 1 : 0),
          }
        : item;
    const restore = () => {
      setResults((previous) => ({
        ...previous,
        offers: previous.offers.map((item) => (item.offerId === offer.offerId ? offer : item)),
      }));
      setDetailOffer((current) => (current?.offerId === offer.offerId ? offer : current));
      setCommentsOffer((current) => (current?.offerId === offer.offerId ? offer : current));
    };

    setResults((previous) => ({ ...previous, offers: previous.offers.map(applyVote) }));
    setDetailOffer((current) => (current ? applyVote(current) : current));
    setCommentsOffer((current) => (current ? applyVote(current) : current));

    setActionStatus(t('offers.feedbackRegistered'), 'neutral', {
      label: t('common.undo'),
      onPress: () => {
        const pending = voteTimers.current[offer.offerId];
        if (pending) {
          clearTimeout(pending);
          delete voteTimers.current[offer.offerId];
        }
        restore();
        setActionStatus(t('offers.voteUndone'));
      },
    });
    // The API has no retract endpoint, so the vote is committed only after the
    // undo window closes. This keeps the optimistic change reversible.
    const previousTimer = voteTimers.current[offer.offerId];
    if (previousTimer) {
      clearTimeout(previousTimer);
    }
    voteTimers.current[offer.offerId] = setTimeout(async () => {
      delete voteTimers.current[offer.offerId];
      const result = await api.voteOfferAvailability(offer.offerId, { vote: voteType });
      if (!result.success) {
        restore();
        setActionStatus(
          result.message.toLowerCase().includes('already')
            ? t('offers.voteAlreadySubmitted')
            : t('offers.voteFailed'),
          'error'
        );
        return;
      }
      successFeedback();
    }, STATUS_DWELL_MS + 200);
  }

  async function openOfferDirections(offer: OfferItemDto) {
    await openDirections(offer.location, preferences.navigationMode);
  }

  function openOfferComments(offer: OfferItemDto) {
    if (!requireSession()) {
      return;
    }
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
    return (
      <View style={[styles.immersiveWrapper, { backgroundColor: palette.backdrop }]} testID="immersive-content">
        {locationUnavailable || renderStatePanel() ? (
          <View pointerEvents="box-none" style={styles.immersiveStateOverlay} testID="immersive-state-overlay">
            {locationUnavailable ? locationUnavailablePanel : null}
            {renderStatePanel()}
          </View>
        ) : null}
        {status ? (
          <View pointerEvents="box-none" style={styles.feedbackToast}>
            <View
              style={[styles.feedbackToastText, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Text accessibilityLiveRegion="polite" style={{ color: statusColor(palette, statusTone) }}>
                {status}
              </Text>
              {statusAction ? (
                <Pressable
                  accessibilityLabel={statusAction.label}
                  accessibilityRole="button"
                  onPress={statusAction.onPress}
                >
                  <Text style={{ color: palette.accentText, fontWeight: '800' }}>{statusAction.label}</Text>
                </Pressable>
              ) : null}
            </View>
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
          onReport={(offer) => { if (requireSession()) { setReportDraft(offer); } }}
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
        <HelpSheet onClose={() => setHelpVisible(false)} returnFocusRef={helpButtonRef} topic={helpTopic} visible={helpVisible} />
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
    <View style={styles.screenRoot}>
      <View pointerEvents="box-none" style={styles.topBar}>
        <OfferTopBar
          headerControl={modeSwitch}
          helpControl={helpButton}
          isNarrow={viewportWidth < NARROW_BREAKPOINT}
          palette={palette}
          searchLabel={t('offers.search')}
          surfaceColor={palette.background}
          title={t('app.title')}
          titleColor={palette.ink}
        />
      </View>
      <SectionList
        testID="offers-scroll"
        contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom, paddingHorizontal: 16, paddingTop: 68 }]}
        sections={listSections}
        keyExtractor={(item) => item.offerId}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: palette.background }}
        ListHeaderComponent={
          <>
            {locationUnavailable ? locationUnavailablePanel : null}
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: palette.ink }]}>{t('offers.title')}</Text>
            <Text style={{ color: palette.inkMuted }}>
              {t('offers.location')}: {userLocationLabel}
            </Text>
          </View>
        </View>
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <TextInput
            accessibilityLabel={t('offers.searchPlaceholder')}
            maxLength={queryMaxLength}
            onChangeText={(value) => {
              const next = value.slice(0, queryMaxLength);
              setQuery(next);
              searchDebounced(next, radiusMeters, favoritesOnly);
            }}
            placeholder={t('offers.searchPlaceholder')}
            placeholderTextColor={palette.inkMuted}
            style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
            value={query}
          />
          <View style={styles.filterRow}>
            <CoverageDistanceControl
              onChange={(option) => {
                setRadiusMeters(option);
                void search(query, option, favoritesOnly);
              }}
              palette={palette}
              radiusMeters={radiusMeters}
              t={t}
            />
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

            {userLocation ? (
              <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border, padding: 0 }]}>
                <NativeMapPreview
                  businesses={results.businesses}
                  center={userLocation}
                  height={300}
                  onSelectMarker={(marker) => void openDirections(marker.location, preferences.navigationMode)}
                  radiusMeters={radiusMeters}
                />
              </View>
            ) : null}
          </>
        }
      ListFooterComponent={
        status ? (
          <View style={styles.statusRow}>
            <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>
              {status}
            </Text>
            {statusAction ? (
              <Pressable
                accessibilityLabel={statusAction.label}
                accessibilityRole="button"
                onPress={statusAction.onPress}
              >
                <Text style={{ color: palette.accentText, fontWeight: '800' }}>{statusAction.label}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : undefined
      }
      renderSectionHeader={({ section }) => (
        <Text style={[styles.sectionTitle, { color: palette.ink }]}>{section.title}</Text>
      )}
      renderItem={({ item: offer }) => (
        <View style={gridColumns === 1 ? styles.gridCellFull : [styles.gridCell, { width: cardWidth }]}>
          <OfferCard
            offer={offer}
            onComments={openOfferComments}
            onDirections={openOfferDirections}
            onFavorite={toggleFavorite}
            onOpenDetail={setDetailOffer}
            onReport={(offer) => { if (requireSession()) { setReportDraft(offer); } }}
            onVote={vote}
            query={query}
          />
        </View>
      )}
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
      <HelpSheet onClose={() => setHelpVisible(false)} returnFocusRef={helpButtonRef} topic={helpTopic} visible={helpVisible} />
      <OfferReportSheet
        draft={reportDraft}
        onClose={() => {
          clearReportDraft();
          restoreFocus(helpButtonRef);
        }}
        returnFocusRef={helpButtonRef}
        visible={reportDraft !== null}
      />
    </View>
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
  immersiveStateOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 120,
    zIndex: 3,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  screenRoot: {
    flex: 1,
  },
  topBar: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  helpButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: platformTouchFloor,
    justifyContent: 'center',
    width: platformTouchFloor,
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
    minHeight: platformTouchFloor,
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
    fontFamily: landmarkFontFamily(),
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
    fontFamily: landmarkFontFamily(),
    fontSize: 24,
    fontWeight: '700',
  },
  whyButton: {
    alignSelf: 'flex-start',
    minHeight: platformTouchFloor,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
