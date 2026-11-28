import { platformTouchFloor } from '../utils/layout';
import { type ElementRef, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Button,
  Chip,
  IconButton,
  ProgressBar,
  Searchbar,
  Snackbar,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
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
import { OffersStatePanel } from '../components/OffersStatePanel';
import { OFFER_ACTION_LABEL_KEYS } from '../components/OfferActionVocabulary';
import { PresentationModeSwitch, type PresentationMode } from '../components/PresentationModeSwitch';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { STATUS_DWELL_MS, useStatusNotice } from '../hooks/useStatusNotice';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { formatDistanceMeters, partitionOffers } from '../utils/format';
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
  const { activeTab, api, clearReportDraft, closeImmersiveOffers, immersiveOffers, isAuthenticated, openAddOffer, openImmersiveOffers, palette, preferences, reportDraft, runOperation, session, setReportDraft, t } =
    useApp();
  const { width: viewportWidth } = useWindowDimensions();
  const theme = useTheme();
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
  const {
    status,
    statusTone,
    statusAction,
    pending,
    pendingLabel,
    persistentStatus,
    persistentTone,
    persistentAction,
    statusPersistent,
    reportStatus: setActionStatus,
    reportPending,
    dismissStatus,
    clearStatus,
  } = useStatusNotice();
  const [searchFailed, setSearchFailed] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | undefined>(undefined);
  const [locationUnavailable, setLocationUnavailable] = useState(false);
  const [firstRunVisible, setFirstRunVisible] = useState(false);
  const searchRequest = useAbortableRequest();
  const searchSequence = useRef(0);
  const debounceGeneration = useRef(0);
  const voteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [presets, setPresets] = useState<Array<{ id: string; radiusMeters: number; favoritesOnly: boolean }>>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const activeUserId = session?.userId ?? 'guest';

  const helpButtonRef = useRef<ElementRef<typeof View> | null>(null);

  useEffect(() => {
    setRecentSearches([]);
    setPresets([]);
    setSelectionMode(false);
    setSelectedOfferIds([]);
  }, [activeUserId]);

  useEffect(() => {
    if (activeTab !== 'offers') {
      clearStatus();
    }
  }, [activeTab, clearStatus]);

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
      rememberSearch(nextQuery);
    } catch (error) {
      if (isRequestAborted(error) || sequence !== searchSequence.current) {
        return;
      }

      setSearchFailed(true);
    }
  }

  const searchDebounced = useDebouncedCallback(
    (nextQuery: string, nextRadius: number, nextFavoritesOnly: boolean, generation: number) => {
      if (generation !== debounceGeneration.current) {
        return;
      }
      void search(nextQuery, nextRadius, nextFavoritesOnly);
    },
    searchDebounceMs
  );

  const scheduleSearch = (nextQuery: string, nextRadius: number, nextFavoritesOnly: boolean) =>
    searchDebounced(nextQuery, nextRadius, nextFavoritesOnly, debounceGeneration.current);

  function rememberSearch(nextQuery: string) {
    const value = nextQuery.trim();
    if (!value || value.length > queryMaxLength) {
      return;
    }
    setRecentSearches((current) =>
      [value, ...current.filter((entry) => entry.toLowerCase() !== value.toLowerCase())].slice(0, 5)
    );
  }

  function runImmediateSearch(nextQuery: string, nextRadius: number, nextFavoritesOnly: boolean) {
    debounceGeneration.current += 1;
    searchSequence.current += 1;
    void search(nextQuery, nextRadius, nextFavoritesOnly);
  }

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
  if (activeTab !== 'offers') {
    return null;
  }

  const state = resolveOffersViewState({
    hasActiveFilters: query.trim().length > 0 || favoritesOnly,
    hasOffers: results.offers.length > 0,
    searchFailed,
  });

  const presentationMode: PresentationMode = immersiveOffers ? 'feed' : 'map';
  const searchValidationMessage =
    query.trim().length > 0 && query.trim().length < 2 ? t('offers.searchMinLength') : null;

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
    <IconButton
      ref={helpButtonRef as never}
      accessibilityLabel={t('common.help')}
      accessibilityRole="button"
      icon="help"
      iconColor={palette.ink}
      onPress={() => setHelpVisible(true)}
      size={20}
      style={[styles.helpButton, { backgroundColor: palette.panel, borderColor: palette.border }]}
      testID="offers-help"
    />
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
      <Button
        accessibilityLabel={t('common.why')}
        accessibilityRole="button"
        mode="text"
        onPress={() => openContextHelp('help.find')}
        style={styles.whyButton}
        textColor={palette.accentText}
      >
        {t('common.why')}
      </Button>
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
        <Button
          accessibilityLabel={t('common.why')}
          accessibilityRole="button"
          mode="text"
          onPress={() => openContextHelp('help.find')}
          style={styles.whyButton}
          textColor={palette.accentText}
        >
          {t('common.why')}
        </Button>
      </View>
    );
  }

  function requireSession(): boolean {
    if (isAuthenticated) {
      return true;
    }
    setActionStatus(t('auth.signInToContribute'), 'error', null, { persistent: true });
    return false;
  }

  function saveCurrentPreset() {
    const preset = { id: `${radiusMeters}-${favoritesOnly}`, radiusMeters, favoritesOnly };
    setPresets((current) =>
      [preset, ...current.filter((entry) => entry.id !== preset.id)].slice(0, 5)
    );
  }

  function removeRecent(value: string) {
    setRecentSearches((current) => current.filter((entry) => entry !== value));
  }

  function removePreset(id: string) {
    setPresets((current) => current.filter((entry) => entry.id !== id));
  }

  function toggleSelection(offerId: string) {
    setSelectedOfferIds((current) =>
      current.includes(offerId) ? current.filter((id) => id !== offerId) : [...current, offerId]
    );
  }

  function exitSelection() {
    setSelectionMode(false);
    setSelectedOfferIds([]);
  }

  async function voteSelectedAvailable() {
    const targets = combinedOffers.filter(
      (offer) => selectedOfferIds.includes(offer.offerId) && !offer.hasCurrentUserVoted
    );
    if (targets.length === 0) {
      exitSelection();
      return;
    }
    reportPending(t('common.saving'));
    const results = await Promise.all(
      targets.map((offer) => api.voteOfferAvailability(offer.offerId, { vote: 1 }))
    );
    const votedIds = targets.filter((_, index) => results[index]?.success).map((offer) => offer.offerId);
    if (votedIds.length === 0) {
      setActionStatus(t('offers.voteFailed'), 'error');
      return;
    }
    setResults((previous) => ({
      ...previous,
      offers: previous.offers.map((offer) =>
        votedIds.includes(offer.offerId)
          ? { ...offer, hasCurrentUserVoted: true, positiveAvailabilityCount: offer.positiveAvailabilityCount + 1 }
          : offer
      ),
    }));
    setActionStatus(t('offers.feedbackRegistered'), 'success');
    successFeedback();
    exitSelection();
  }

  async function saveSelectedFavorites() {
    const targets = combinedOffers.filter((offer) => selectedOfferIds.includes(offer.offerId) && !offer.isFavorite);
    if (targets.length === 0) {
      exitSelection();
      return;
    }
    reportPending(t('common.saving'));
    const results = await Promise.all(
      targets.map((offer) => api.setOfferFavorite(offer.offerId, { isFavorite: true }))
    );
    const savedIds = targets.filter((_, index) => results[index]?.success).map((offer) => offer.offerId);
    if (savedIds.length === 0) {
      setActionStatus(t('offers.favoriteFailed'), 'error');
      return;
    }
    setResults((previous) => ({
      ...previous,
      offers: previous.offers.map((offer) =>
        savedIds.includes(offer.offerId) ? { ...offer, isFavorite: true } : offer
      ),
    }));
    setActionStatus(t('offers.favoriteUpdated'), 'success');
    selectionFeedback();
    exitSelection();
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


  const gridColumns = resolveOffersGridColumns(viewportWidth);
  const cardWidth = Math.max(
    220,
    (Math.max(320, viewportWidth - 32) - (gridColumns - 1) * 12) / gridColumns
  );

  async function toggleFavorite(offer: OfferItemDto) {
    if (!requireSession()) {
      return;
    }
    reportPending(t('common.saving'));
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
        void api.setOfferFavorite(offer.offerId, { isFavorite: !nextFavorite }).then((undoResult) => {
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
    reportPending(t('common.saving'));

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

  const guestHelpButton =
    !isAuthenticated && persistentStatus === t('auth.signInToContribute') ? (
      <Button
        accessibilityLabel={t('common.why')}
        accessibilityRole="button"
        mode="text"
        onPress={() => openContextHelp('help.contribute')}
        textColor={palette.accentText}
      >
        {t('common.why')}
      </Button>
    ) : null;

  const hasStatus = Boolean(pending || status || persistentStatus);
  const statusSurface =
    hasStatus ? (
      <Snackbar visible onDismiss={() => undefined} style={styles.statusSurface} testID="offers-status-surface">
        <View style={[styles.statusCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          {persistentStatus ? (
            <View style={styles.statusLine}>
              <Text
                accessibilityLiveRegion="polite"
                variant="bodyMedium"
                style={{ color: statusColor(palette, persistentTone) }}
              >
                {persistentStatus}
              </Text>
              {guestHelpButton}
              {persistentAction ? (
                <Button
                  accessibilityLabel={persistentAction.label}
                  accessibilityRole="button"
                  mode="text"
                  onPress={persistentAction.onPress}
                  textColor={palette.ink}
                >
                  {persistentAction.label}
                </Button>
              ) : null}
              <Button
                accessibilityLabel={t('offers.dismissNotice')}
                accessibilityRole="button"
                mode="text"
                onPress={dismissStatus}
                testID="status-dismiss"
                textColor={palette.ink}
              >
                {t('offers.dismissNotice')}
              </Button>
            </View>
          ) : null}
          {pending ? (
            <View>
              <ProgressBar color={palette.accent} />
              <Text accessibilityLiveRegion="polite" variant="bodyMedium" style={{ color: palette.ink }}>
                {pendingLabel}
              </Text>
            </View>
          ) : status ? (
            <View style={styles.statusLine}>
              <Text
                accessibilityLiveRegion="polite"
                variant="bodyMedium"
                style={{ color: statusColor(palette, statusTone) }}
              >
                {status}
              </Text>
              {statusAction ? (
                <Button
                  accessibilityLabel={statusAction.label}
                  accessibilityRole="button"
                  mode="text"
                  onPress={statusAction.onPress}
                  textColor={palette.ink}
                >
                  {statusAction.label}
                </Button>
              ) : null}
            </View>
          ) : null}
        </View>
      </Snackbar>
    ) : null;

  function renderSearchAccelerators(): ReactNode {
    return (
      <View style={styles.accelerators} testID="search-accelerators">
        {recentSearches.length > 0 ? (
          <View style={styles.acceleratorSection}>
            <Text variant="titleSmall" style={{ color: palette.ink }}>
              {t('offers.recentSearches')}
            </Text>
            <View style={styles.chipRow}>
              {recentSearches.map((entry) => (
                <View key={entry} style={styles.chip}>
                  <Chip
                    accessibilityLabel={entry}
                    accessibilityRole="button"
                    selected={entry === query}
                    onPress={() => {
                      setQuery(entry);
                      runImmediateSearch(entry, radiusMeters, favoritesOnly);
                    }}
                    textStyle={{ color: palette.ink }}
                  >
                    {entry}
                  </Chip>
                  <IconButton
                    accessibilityLabel={`${t('common.remove')} ${entry}`}
                    accessibilityRole="button"
                    icon="close"
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => removeRecent(entry)}
                    size={18}
                    style={styles.removeChip}
                  />
                </View>
              ))}
            </View>
            <Button
              accessibilityLabel={t('offers.clearRecents')}
              accessibilityRole="button"
              mode="text"
              onPress={() => setRecentSearches([])}
              textColor={palette.inkMuted}
            >
              {t('offers.clearRecents')}
            </Button>
          </View>
        ) : null}
        {presets.length > 0 ? (
          <View style={styles.acceleratorSection}>
            <Text variant="titleSmall" style={{ color: palette.ink }}>
              {t('offers.savedPresets')}
            </Text>
            <View style={styles.chipRow}>
              {presets.map((preset) => (
                <View key={preset.id} style={styles.chip}>
                  <Chip
                    accessibilityLabel={`${t('offers.savedPresets')} ${formatDistanceMeters(preset.radiusMeters)}`}
                    accessibilityRole="button"
                    selected={preset.radiusMeters === radiusMeters && preset.favoritesOnly === favoritesOnly}
                    onPress={() => {
                      setRadiusMeters(preset.radiusMeters);
                      setFavoritesOnly(preset.favoritesOnly);
                      setFeedTab(preset.favoritesOnly ? 'favorites' : 'viewAll');
                      runImmediateSearch(query, preset.radiusMeters, preset.favoritesOnly);
                    }}
                    textStyle={{ color: palette.ink }}
                  >
                    {formatDistanceMeters(preset.radiusMeters)} · {preset.favoritesOnly ? t('offers.favoritesOnly') : t('nav.offers')}
                  </Chip>
                  <IconButton
                    accessibilityLabel={`${t('common.remove')} ${formatDistanceMeters(preset.radiusMeters)}`}
                    accessibilityRole="button"
                    icon="close"
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => removePreset(preset.id)}
                    size={18}
                    style={styles.removeChip}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}
        <Button
          accessibilityLabel={t('offers.savePreset')}
          accessibilityRole="button"
          mode="text"
          onPress={saveCurrentPreset}
          testID="save-preset"
          textColor={palette.accentText ?? palette.ink}
        >
          {t('offers.savePreset')}
        </Button>
      </View>
    );
  }

  if (immersiveOffers) {
    return (
      <View style={[styles.immersiveWrapper, { backgroundColor: palette.backdrop }]} testID="immersive-content">
        {locationUnavailable || state.kind !== 'none' ? (
          <View pointerEvents="box-none" style={styles.immersiveStateOverlay} testID="immersive-state-overlay">
            {locationUnavailable ? locationUnavailablePanel : renderStatePanel()}
          </View>
        ) : null}
        {statusSurface}
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
            scheduleSearch(nextQuery, radiusMeters, favoritesOnly);
          }}
          onVote={vote}
          query={query}
          radiusMeters={radiusMeters}
          searchAccelerators={renderSearchAccelerators()}
          selectionMode={selectionMode}
          selectedOfferIds={selectedOfferIds}
          onToggleSelection={toggleSelection}
          onSelectMode={() => setSelectionMode(true)}
          onExitSelection={exitSelection}
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
        <FirstRunSheet onDismiss={dismissFirstRun} returnFocusRef={helpButtonRef} visible={firstRunVisible} />
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
      {statusSurface}
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
            <Text variant="headlineMedium" style={{ color: palette.ink }}>
              {t('offers.title')}
            </Text>
            <Text variant="bodyMedium" style={{ color: palette.inkMuted }}>
              {t('offers.location')}: {userLocationLabel}
            </Text>
          </View>
        </View>
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Searchbar
            accessibilityLabel={t('offers.searchPlaceholder')}
            accessibilityHint={searchValidationMessage ?? undefined}
            inputStyle={[styles.input, { backgroundColor: palette.panel, borderColor: searchValidationMessage ? palette.danger : palette.border, color: palette.ink }]}
            maxLength={queryMaxLength}
            onChangeText={(value) => {
              const next = value.slice(0, queryMaxLength);
              setQuery(next);
              scheduleSearch(next, radiusMeters, favoritesOnly);
            }}
            placeholder={t('offers.searchPlaceholder')}
            placeholderTextColor={palette.inkMuted}
            testID="offers-search-input"
            value={query}
          />
          {searchValidationMessage ? (
            <Text
              accessibilityLiveRegion="polite"
              variant="bodySmall"
              style={{ color: palette.danger }}
              testID="offers-search-validation"
            >
              {searchValidationMessage}
            </Text>
          ) : null}
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
            <Button
              accessibilityLabel={t('common.search')}
              accessibilityRole="button"
              buttonColor={palette.accent}
              mode="contained"
              onPress={() => void search()}
              style={styles.actionButton}
              textColor={palette.onAccent}
            >
              {t('common.search')}
            </Button>
            <Button
              accessibilityLabel={t('offers.favoritesOnly')}
              accessibilityRole="button"
              buttonColor={favoritesOnly ? palette.accentMuted : palette.panel}
              mode="contained"
              onPress={() => {
                const next = !favoritesOnly;
                setFavoritesOnly(next);
                setFeedTab(next ? 'favorites' : 'viewAll');
                void search(query, radiusMeters, next);
              }}
              style={styles.actionButton}
              textColor={favoritesOnly ? palette.accentText : palette.ink}
            >
              {t('offers.favoritesOnly')}
            </Button>
          </View>
          {renderSearchAccelerators()}
          <View style={styles.actionRow}>
            {selectionMode ? (
              <>
                <Button
                  accessibilityLabel={t('offers.batchDone')}
                  accessibilityRole="button"
                  buttonColor={palette.panel}
                  mode="contained"
                  onPress={exitSelection}
                  style={styles.actionButton}
                  textColor={palette.ink}
                >
                  {t('offers.batchDone')}
                </Button>
                <Button
                  accessibilityLabel={t('offers.batchFavorite')}
                  accessibilityRole="button"
                  buttonColor={palette.panel}
                  disabled={selectedOfferIds.length === 0}
                  mode="contained"
                  onPress={() => void saveSelectedFavorites()}
                  style={styles.actionButton}
                  textColor={palette.ink}
                >
                  {t('offers.batchFavorite')}
                </Button>
                <Button
                  accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.available)}
                  accessibilityRole="button"
                  buttonColor={palette.panel}
                  disabled={selectedOfferIds.length === 0}
                  mode="contained"
                  onPress={() => void voteSelectedAvailable()}
                  style={styles.actionButton}
                  textColor={palette.ink}
                >
                  {t(OFFER_ACTION_LABEL_KEYS.available)}
                </Button>
              </>
            ) : (
              <Button
                accessibilityLabel={t('offers.select')}
                accessibilityRole="button"
                accessibilityState={{ expanded: selectionMode }}
                buttonColor={palette.panel}
                mode="contained"
                onPress={() => setSelectionMode(true)}
                style={styles.actionButton}
                textColor={palette.ink}
              >
                {t('offers.select')}
              </Button>
            )}
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
      renderSectionHeader={({ section }) => (
        <Text variant="headlineSmall" style={{ color: palette.ink }}>
          {section.title}
        </Text>
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
            selectionMode={selectionMode}
            selected={selectionMode && selectedOfferIds.includes(offer.offerId)}
            onToggleSelection={toggleSelection}
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
  removeChip: {
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
  },
  statusSurface: {
    left: 16,
    position: 'absolute',
    right: 16,
    top: 116,
    zIndex: 6,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusLine: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accelerators: {
    borderRadius: 16,
    gap: 8,
  },
  acceleratorSection: {
    gap: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
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
  whyButton: {
    alignSelf: 'flex-start',
    minHeight: platformTouchFloor,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
