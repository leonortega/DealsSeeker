import { platformTouchFloor } from '../utils/layout';
import { type ElementRef, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  findNodeHandle,
  View,
} from 'react-native';
import {
  Button,
  Checkbox,
  Dialog,
  HelperText,
  IconButton,
  ProgressBar,
  Snackbar,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isRequestAborted } from '../api/client';
import { apiConfig } from '../api/config';
import { GeoPoint, OfferImageDto, OfferLocationDto } from '../api/types';
import { NativeMapPreview } from '../components/NativeMapPreview';
import { PlatformTabIcon } from '../components/PlatformTabIcon';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { useAppStatus } from '../hooks/useAppStatus';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { HelpSheet } from '../components/HelpSheet';
import { announceStatus } from '../utils/announce';
import type { StatusTone } from '../utils/statusNotice';
import { extractCompletedWord, extractWords } from '../utils/format';
import { keyboardAvoidanceBehavior, resolveAddOfferColumns } from '../utils/layout';
import {
  clearAddOfferDraft,
  loadAddOfferDraft,
  saveAddOfferDraft,
  type AddOfferDraftSnapshot,
} from '../utils/storage';
import { getSuggestedTags, maxDraftTags, normalizeTag } from '../utils/tagLexicon';
import { focusHandle } from '../utils/focusReturn';

interface DraftImage {
  previewUri: string | null;
  metadata: OfferImageDto;
}

interface LocationSearchResult {
  label: string;
  position: { lat: number; lng: number };
}

const maxPhotos = 4;
const minAutoTagLength = 3;
const maxTagLength = 40;
const stepOrder = ['photo', 'place', 'details'] as const;
type AddOfferStep = (typeof stepOrder)[number];
const descriptionMaxLength = 500;
const locationQueryMaxLength = 120;

const fallbackMapCenter: GeoPoint = { lat: 0, lng: 0 };
const pinnedAreaRadiusMeters = 500;
const unpinnedAreaRadiusMeters = 20000;

function resolveImagePreviewUri(image: OfferImageDto) {
  const candidate = image.dataUrl?.trim();
  if (!candidate) {
    return null;
  }

  if (/^(data|https?):/iu.test(candidate)) {
    return candidate;
  }

  if (candidate.startsWith('/')) {
    return `${apiConfig.baseUrl}${candidate}`;
  }

  return candidate;
}

function formatSubmitError(error: unknown, fallbackMessage: string) {
  const detail = error instanceof Error ? error.message.trim() : '';
  if (!detail) {
    return fallbackMessage;
  }

  if (detail === fallbackMessage || detail.startsWith(fallbackMessage)) {
    return detail;
  }

  return `${fallbackMessage} ${detail}`;
}

function buildDraftImage(asset: ImagePicker.ImagePickerAsset, order: number): DraftImage | null {
  if (!asset.base64) {
    return null;
  }

  const mimeType = asset.mimeType || 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${asset.base64}`;
  return {
    previewUri: asset.uri ?? null,
    metadata: {
      source: 'gallery',
      mimeType,
      sizeBytes: asset.fileSize ?? 0,
      width: asset.width || null,
      height: asset.height || null,
      order,
      fileName: asset.fileName ?? null,
      dataUrl,
    },
  };
}

function getLocationSearchResultKey(result: LocationSearchResult) {
  return `${result.label.trim()}-${result.position.lat}-${result.position.lng}`;
}

function dedupeLocationSearchResults(results: LocationSearchResult[]) {
  const seen = new Set<string>();

  return results.filter((result) => {
    const key = getLocationSearchResultKey(result);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function hasRecoverableDraftContent(draft: AddOfferDraftSnapshot) {
  return (
    draft.images.length > 0 ||
    draft.description.trim().length > 0 ||
    draft.tags.length > 0 ||
    Boolean(draft.locationConfirmed) ||
    (draft.location !== null && draft.location.source !== 'auto')
  );
}

function sameErrors(left: Record<string, string>, right: Record<string, string>) {
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) {
    return false;
  }
  return keys.every((key) => left[key] === right[key]);
}

export function AddOfferScreen({ onDismissGuard }: { onDismissGuard?: (guard: () => boolean) => void } = {}) {
  const { api, closeOverlay, openTab, overlayRoute, preferences, t } = useApp();
  const theme = useTheme();
  const { isPending } = useAppStatus();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = resolveAddOfferColumns(width);
  const [images, setImages] = useState<DraftImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [suggestionTags, setSuggestionTags] = useState<string[]>([]);
  const [seedTags, setSeedTags] = useState<string[]>([]);
  const [dismissedTags, setDismissedTags] = useState<string[]>([]);
  const [location, setLocation] = useState<OfferLocationDto | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [mapCenter, setMapCenter] = useState<GeoPoint | null>(null);
  const [suggestionsSuppressed, setSuggestionsSuppressed] = useState(true);
  const [activeStep, setActiveStep] = useState<AddOfferStep>('photo');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<AddOfferDraftSnapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const [guidanceField, setGuidanceField] = useState<'location' | 'description' | 'tags' | null>(null);
  const [discardDialog, setDiscardDialog] = useState<'cancel' | 'draft' | null>(null);
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const locationSearchRequest = useAbortableRequest();
  const locationSearchSequence = useRef(0);
  const pinSequence = useRef(0);
  const dismissApproved = useRef(false);
  const tagLimitNotified = useRef(false);
  const touchedFields = useRef<Record<string, boolean>>({});
  const descriptionInputRef = useRef<{ focus: () => void } | null>(null);
  const locationInputRef = useRef<{ focus: () => void } | null>(null);
  const photoButtonRef = useRef<ElementRef<typeof View>>(null);
  const helpButtonRef = useRef<ElementRef<typeof View>>(null);
  const tRef = useRef(t);
  tRef.current = t;
  const isVisible = overlayRoute?.name === 'add-offer';
  const editingOfferId = overlayRoute?.name === 'add-offer' ? overlayRoute.offerId : undefined;
  const hasDraftContent =
    images.length > 0 ||
    description.trim().length > 0 ||
    tags.length > 0 ||
    locationConfirmed ||
    (location !== null && location.source !== 'auto');

  function currentSnapshot(): AddOfferDraftSnapshot {
    return {
      description,
      tags,
      images: images.map((image) => image.metadata),
      location,
      locationQuery,
      locationConfirmed,
      mapCenter,
    };
  }

  function applySnapshot(snapshot: AddOfferDraftSnapshot) {
    setDescription(snapshot.description);
    setTags(snapshot.tags);
    setSuggestionTags([]);
    setSeedTags(snapshot.tags);
    setDismissedTags([]);
    setImages(
      snapshot.images.map((image, index) => ({
        previewUri: resolveImagePreviewUri(image),
        metadata: { ...image, order: index },
      }))
    );
    setLocation(snapshot.location);
    setLocationQuery(snapshot.locationQuery ?? snapshot.location?.label ?? '');
    setLocationConfirmed(Boolean(snapshot.locationConfirmed));
    setMapCenter(snapshot.mapCenter ?? snapshot.location?.position ?? null);
    setLocationResults([]);
    setSuggestionsSuppressed(true);
    setActiveStep('photo');
  }

  function resetFields() {
    setImages([]);
    setSelectedImageIndex(0);
    setDescription('');
    setTags([]);
    setSuggestionTags([]);
    setSeedTags([]);
    setDismissedTags([]);
    setLocation(null);
    setLocationQuery('');
    setLocationConfirmed(false);
    setLocationResults([]);
    setSuggestionsSuppressed(true);
    setMapCenter(null);
    setFieldErrors({});
    touchedFields.current = {};
    setFocusTarget(null);
    setGuidanceField(null);
    setActiveStep('photo');
  }

  useEffect(() => {
    if (!isVisible || editingOfferId) {
      setHydrated(true);
      return;
    }

    let active = true;
    setHydrated(false);
    void loadAddOfferDraft()
      .then((snapshot) => {
        if (!active) {
          return;
        }
        if (snapshot && hasRecoverableDraftContent(snapshot)) {
          setResumeDraft(snapshot);
        }
        setHydrated(true);
      })
      .catch(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [isVisible, editingOfferId]);

  useEffect(() => {
    if (!isVisible || editingOfferId || !hydrated || resumeDraft || submitted || !hasDraftContent) {
      return;
    }
    void saveAddOfferDraft(currentSnapshot());
  }, [
    isVisible,
    editingOfferId,
    hydrated,
    resumeDraft,
    submitted,
    hasDraftContent,
    description,
    tags,
    images,
    location,
    locationQuery,
    locationConfirmed,
    mapCenter,
  ]);

  useEffect(() => {
    if (!isVisible || !focusTarget) {
      return;
    }
    if (focusTarget === 'description' || focusTarget === 'location') {
      const input = focusTarget === 'description' ? descriptionInputRef.current : locationInputRef.current;
      input?.focus();
      return;
    }
    const node = photoButtonRef.current;
    focusHandle(node ? findNodeHandle(node as never) ?? null : null);
  }, [focusTarget, isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    setFieldErrors((current) => {
      const next = { ...current };
      const invalid: Record<string, boolean> = {
        photo: images.length === 0,
        description: !description.trim(),
        tags: tags.length === 0,
        location: !location || !locationConfirmed,
      };
      const messages: Record<string, string> = {
        photo: tRef.current('add.photoRequired'),
        description: tRef.current('add.validationDescription'),
        tags: tRef.current('add.validationTags'),
        location: tRef.current('add.validationLocation'),
      };
      for (const field of Object.keys(invalid)) {
        if (!touchedFields.current[field] && !(field in current)) {
          continue;
        }
        if (invalid[field]) {
          next[field] = messages[field];
        } else {
          delete next[field];
        }
      }
      return sameErrors(next, current) ? current : next;
    });
  }, [isVisible, images, description, tags, location, locationConfirmed]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancel();
      return true;
    });

    return () => subscription.remove();
  }, [isVisible, hasDraftContent, t]);

  useEffect(() => {
    if (isVisible) {
      dismissApproved.current = false;
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !onDismissGuard) {
      return;
    }

    onDismissGuard(() => {
      if (dismissApproved.current || !hasDraftContent) {
        return true;
      }
      handleCancel();
      return false;
    });
  }, [hasDraftContent, isVisible, onDismissGuard, t]);

  function reportStatus(message: string | null, tone: StatusTone = 'neutral') {
    reportNotice(message, tone);
    announceStatus(message);
  }

  const statusColor =
    statusTone === 'error'
      ? theme.colors.error
      : statusTone === 'success'
        ? theme.colors.primary
        : theme.colors.onSurface;

  const searchFeedbackVisible = isVisible && !locationConfirmed && locationQuery.trim().length >= 3;
  const isSearching = searchFeedbackVisible && !suggestionsSuppressed && isPending('locations-search');

  function handleCancel() {
    if (discardDialog) {
      return;
    }

    if (!hasDraftContent) {
      closeOverlay();
      return;
    }

    setDiscardDialog('cancel');
  }

  function confirmDiscard() {
    const target = discardDialog;
    setDiscardDialog(null);

    if (target === 'cancel') {
      dismissApproved.current = true;
      void clearAddOfferDraft();
      closeOverlay();
      return;
    }

    if (target === 'draft') {
      void clearAddOfferDraft();
      resetFields();
      setResumeDraft(null);
      reportStatus(null);
    }
  }

  function resumeRetainedDraft() {
    if (!resumeDraft) {
      return;
    }
    applySnapshot(resumeDraft);
    touchedFields.current = {};
    setFieldErrors({});
    setResumeDraft(null);
    reportStatus(t('add.draftRestored'), 'success');
  }

  function discardRetainedDraft() {
    if (!resumeDraft || discardDialog) {
      return;
    }
    setDiscardDialog('draft');
  }

  function handleRetryLoad() {
    setLoadFailed(false);
    setLoadAttempt((current) => current + 1);
  }

  function handleRetrySearch() {
    setSearchFailed(false);
    setSearchAttempt((current) => current + 1);
  }

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    async function loadDraft() {
      reportStatus(null);
      setActiveStep('photo');
      setFieldErrors({});
      touchedFields.current = {};
      setSubmitted(false);
      setLoadFailed(false);

      if (editingOfferId) {
        try {
          const draft = await api.getMyOfferDraft(editingOfferId);
          if (!draft) {
            setLoadFailed(true);
            reportStatus(t('add.loadFailed'), 'error');
            return;
          }

          const draftTags = (draft.tags ?? [])
            .map((tag) => normalizeTag(tag).slice(0, maxTagLength))
            .filter(Boolean)
            .slice(0, maxDraftTags);
          setDescription(draft.description ?? '');
          setTags(draftTags);
          setSuggestionTags([]);
          setSeedTags(draftTags);
          setDismissedTags([]);
          setImages(
            (draft.images ?? []).map((image, index) => ({
              previewUri: resolveImagePreviewUri(image),
              metadata: {
                ...image,
                order: index,
              },
            }))
          );
          setLocation(draft.location ?? null);
          setLocationQuery(draft.location?.label ?? '');
          setLocationConfirmed(Boolean(draft.location));
          setSuggestionsSuppressed(true);
          setMapCenter(draft.location?.position ?? fallbackMapCenter);
        } catch {
          setLoadFailed(true);
          reportStatus(t('add.loadFailed'), 'error');
        }

        return;
      }

      setImages([]);
      setDescription('');
      setTags([]);
      setSuggestionTags([]);
      setSeedTags([]);
      setDismissedTags([]);
      setLocation(null);
      setLocationQuery('');
      setLocationConfirmed(false);
      setLocationResults([]);
      setSuggestionsSuppressed(true);
      setMapCenter(null);

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          setMapCenter(fallbackMapCenter);
          reportStatus(t('add.currentLocationUnavailable'), 'error');
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.Balanced,
        });
        const reverse = await api.reverseLocation(position.coords.latitude, position.coords.longitude);
        const label = reverse?.label || t('offers.currentLocation');
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation({
          source: 'auto',
          label,
          position: currentPosition,
        });
        setLocationQuery(label);
        setMapCenter(currentPosition);
        reportStatus(t('add.currentLocationAuto'));
      } catch {
        setMapCenter(fallbackMapCenter);
        reportStatus(t('add.currentLocationUnavailable'), 'error');
      }
    }

    void loadDraft();
  }, [isVisible, editingOfferId, loadAttempt]);

  useEffect(() => {
    if (!isVisible || locationConfirmed || suggestionsSuppressed) {
      setSearchCompleted(false);
      setSearchFailed(false);
      return;
    }

    const trimmedQuery = locationQuery.trim();
    if (trimmedQuery.length < 3) {
      setLocationResults([]);
      setSearchCompleted(false);
      setSearchFailed(false);
      return;
    }

    const sequence = locationSearchSequence.current + 1;
    locationSearchSequence.current = sequence;

    const timeoutId = setTimeout(() => {
      // A new lookup supersedes the one still in flight.
      const signal = locationSearchRequest.begin();

      void (async () => {
        try {
          const results = await api.searchLocations(trimmedQuery, { signal });
          if (sequence !== locationSearchSequence.current) {
            return;
          }

          const uniqueResults = dedupeLocationSearchResults(results);
          setLocationResults(uniqueResults);
          setSearchCompleted(uniqueResults.length === 0);
          setSearchFailed(false);
        } catch (error) {
          if (isRequestAborted(error) || sequence !== locationSearchSequence.current) {
            return;
          }

          setLocationResults([]);
          setSearchCompleted(false);
          setSearchFailed(true);
          announceStatus(t('add.locationSearchFailed'));
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      locationSearchRequest.abort();
    };
  }, [isVisible, locationConfirmed, locationQuery, suggestionsSuppressed, searchAttempt]);

  useEffect(() => {
    if (tags.length < maxDraftTags) {
      tagLimitNotified.current = false;
      return;
    }

    if (!tagLimitNotified.current) {
      tagLimitNotified.current = true;
      reportStatus(t('add.tagsLimit'));
    }
  }, [tags.length, t]);

  function handleMapDragEnd(point: GeoPoint) {
    const current = location?.position;
    if (
      current &&
      Math.abs(current.lat - point.lat) < 0.000001 &&
      Math.abs(current.lng - point.lng) < 0.000001
    ) {
      return;
    }

    void handleMapTap(point);
  }

  async function handleMapTap(point: GeoPoint) {
    touchedFields.current.location = true;
    const sequence = pinSequence.current + 1;
    pinSequence.current = sequence;

    const fallbackLabel = t('add.pinnedLocation');
    const position = { lat: point.lat, lng: point.lng };

    setLocationConfirmed(false);
    setLocation({ source: 'map', label: fallbackLabel, position });
    setLocationQuery(fallbackLabel);
    setLocationResults([]);
    setSuggestionsSuppressed(true);
    reportStatus(t('add.mapPinSelected'));

    try {
      const reverse = await api.reverseLocation(position.lat, position.lng);
      if (sequence !== pinSequence.current) {
        return;
      }

      const label = reverse?.label?.trim() || '';
      setLocation({ source: 'map', label: label || fallbackLabel, position });
      setLocationQuery(label || fallbackLabel);
    } catch {
      if (sequence !== pinSequence.current) {
        return;
      }

      reportStatus(t('add.mapPinAddressUnavailable'), 'error');
    }
  }

  if (!isVisible) {
    return null;
  }

  if (loadFailed) {
    return (
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
        style={{ backgroundColor: theme.colors.background }}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">{t('add.editTitle')}</Text>
        </View>
        <Surface elevation={1} style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {t('add.loadFailed')}
          </Text>
          <View style={styles.actionRow}>
            <Button
              accessibilityLabel={t('add.retry')}
              mode="contained-tonal"
              onPress={handleRetryLoad}
              style={styles.button}
              testID="add-retry-load"
            >
              {t('add.retry')}
            </Button>
            <Button
              accessibilityLabel={t('add.cancel')}
              mode="outlined"
              onPress={handleCancel}
              style={styles.button}
            >
              {t('add.cancel')}
            </Button>
          </View>
        </Surface>
      </ScrollView>
    );
  }

  function addTag(value: string, source: 'description' | 'manual' | 'suggestion' = 'description') {
    touchedFields.current.tags = true;
    const normalized = normalizeTag(value).slice(0, maxTagLength);
    if (!normalized || (source !== 'manual' && dismissedTags.includes(normalized)) || tags.includes(normalized)) {
      return;
    }

    if (tags.length >= maxDraftTags) {
      if (source === 'suggestion') {
        return;
      }

      const evicted = [...suggestionTags].reverse().find((tag) => tags.includes(tag));
      if (!evicted) {
        return;
      }

      setTags((current) => [...current.filter((tag) => tag !== evicted), normalized]);
      setSuggestionTags((current) => current.filter((tag) => tag !== evicted));
    } else {
      setTags((current) =>
        current.includes(normalized) || current.length >= maxDraftTags ? current : [...current, normalized]
      );
      if (source === 'suggestion') {
        setSuggestionTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
      }
    }

    if (source !== 'suggestion') {
      setSeedTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    }
    if (source === 'manual') {
      setDismissedTags((current) => current.filter((item) => item !== normalized));
    }
  }

  function removeTag(tag: string) {
    touchedFields.current.tags = true;
    setTags((current) => current.filter((item) => item !== tag));
    setSuggestionTags((current) => current.filter((item) => item !== tag));
    setSeedTags((current) => current.filter((item) => item !== tag));
    setDismissedTags((current) => (current.includes(tag) ? current : [...current, tag]));
  }

  function getFinalWordTag() {
    const lastWord = extractWords(description).at(-1);
    if (!lastWord) {
      return null;
    }

    const normalized = normalizeTag(lastWord).slice(0, maxTagLength);
    if (normalized.length < minAutoTagLength || dismissedTags.includes(normalized)) {
      return null;
    }

    return normalized;
  }

  function commitFinalWordTag() {
    const finalTag = getFinalWordTag();
    if (finalTag) {
      addTag(finalTag);
    }
  }

  async function pickFromCamera() {
    if (images.length >= maxPhotos) {
      reportStatus(t('add.maxPhotos'), 'error');
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      reportStatus(t('add.imageError'), 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      mediaTypes: ['images'],
      quality: 0.5,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const built = buildDraftImage(result.assets[0], images.length);
    if (!built) {
      reportStatus(t('add.imageError'), 'error');
      return;
    }

    touchedFields.current.photo = true;
    setImages((current) => [...current, built]);
    setSelectedImageIndex(images.length);
  }

  async function pickFromGallery() {
    if (images.length >= maxPhotos) {
      reportStatus(t('add.maxPhotos'), 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: true,
      mediaTypes: ['images'],
      orderedSelection: true,
      quality: 0.5,
      selectionLimit: maxPhotos - images.length,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const nextImages = result.assets
      .map((asset, index) => buildDraftImage(asset, images.length + index))
      .filter(Boolean) as DraftImage[];

    if (nextImages.length === 0) {
      reportStatus(t('add.imageError'), 'error');
      return;
    }

    touchedFields.current.photo = true;
    setImages((current) => [...current, ...nextImages]);
    setSelectedImageIndex(images.length);
  }

  function moveImage(delta: number) {
    setImages((current) => {
      const index = selectedImageIndex;
      const target = index + delta;
      if (index < 0 || index >= current.length || target < 0 || target >= current.length) {
        return current;
      }

      const next = current.slice();
      [next[index], next[target]] = [next[target], next[index]];
      setSelectedImageIndex(target);
      return next.map((image, order) => ({
        ...image,
        metadata: { ...image.metadata, order },
      }));
    });
  }

  function removeCurrentImage() {
    touchedFields.current.photo = true;
    setImages((current) => {
      const next = current.filter((_, index) => index !== selectedImageIndex);
      const nextIndex = Math.max(0, Math.min(selectedImageIndex, next.length - 1));
      setSelectedImageIndex(nextIndex);
      return next.map((image, order) => ({
        ...image,
        metadata: { ...image.metadata, order },
      }));
    });
  }

  function validate(currentTags: string[] = tags) {
    const errors: Record<string, string> = {};
    if (images.length === 0) {
      errors.photo = t('add.photoRequired');
    }
    if (!description.trim()) {
      errors.description = t('add.validationDescription');
    }
    if (currentTags.length === 0) {
      errors.tags = t('add.validationTags');
    }
    if (!location || !locationConfirmed) {
      errors.location = t('add.validationLocation');
    }

    touchedFields.current = { photo: true, description: true, tags: true, location: true };
    setFieldErrors(errors);
    const firstInvalid =
      activeStep === 'photo'
        ? 'photo'
        : activeStep === 'place'
          ? 'location'
          : errors.description
            ? 'description'
            : 'tags';
    const firstMessage = errors[firstInvalid];
    setFocusTarget(firstMessage ? firstInvalid : null);
    if (firstMessage) {
      announceStatus(firstMessage);
    }
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    const finalTag = getFinalWordTag();
    const submittedTags =
      finalTag && !tags.includes(finalTag) && tags.length < maxDraftTags ? [...tags, finalTag] : tags;
    if (!validate(submittedTags)) {
      return;
    }

    const payload = {
      description: description.trim(),
      tags: submittedTags,
      images: images.map((image, order) => ({
        ...image.metadata,
        order,
      })),
      location,
    };

    if (editingOfferId) {
      try {
        await api.updateOffer(editingOfferId, payload);
      } catch (error) {
        reportStatus(formatSubmitError(error, t('add.updateFailed')), 'error');
        return;
      }

      void clearAddOfferDraft();
      reportStatus(t('add.updated'), 'success');
      setSubmitted(true);
      return;
    }

    try {
      await api.createOffer(payload);
    } catch (error) {
      reportStatus(formatSubmitError(error, t('add.createFailed')), 'error');
      return;
    }

    void clearAddOfferDraft();
    reportStatus(t('add.created'), 'success');
    setSubmitted(true);
  }

  const detectedWords = extractWords(description).filter((word) => !tags.includes(normalizeTag(word)));
  const tagSuggestions = getSuggestedTags(seedTags, preferences.language).filter(
    (tag) =>
      normalizeTag(tag).length >= minAutoTagLength &&
      !tags.includes(tag) &&
      !dismissedTags.includes(tag)
  );
  const previewImage = images[selectedImageIndex];
  const activeStepIndex = stepOrder.indexOf(activeStep);

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={styles.keyboardView}
      testID="add-offer-keyboard-view"
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: theme.colors.background }}
        testID="add-offer-scroll"
      >
        <View style={styles.header}>
          <Text variant="titleLarge">{editingOfferId ? t('add.editTitle') : t('add.title')}</Text>
          <Button
            accessibilityLabel={t('add.cancel')}
            mode="text"
            onPress={handleCancel}
            testID="add-cancel"
          >
            {t('add.cancel')}
          </Button>
          <IconButton
            accessibilityLabel={t('common.why')}
            icon={({ size, color }) => (
              <PlatformTabIcon color={color} name="help" size={size} />
            )}
            onPress={() => setHelpVisible(true)}
            ref={helpButtonRef as never}
            testID="add-help"
          />
        </View>

        {resumeDraft ? (
          <Surface elevation={1} testID="add-draft-resume" style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
            <Text accessibilityLiveRegion="polite" variant="bodyMedium">
              {t('add.draftRestored')}
            </Text>
            <View style={styles.actionRow}>
              <Button
                accessibilityLabel={t('common.resume')}
                mode="contained-tonal"
                onPress={resumeRetainedDraft}
                style={styles.button}
                testID="add-draft-resume-button"
              >
                {t('common.resume')}
              </Button>
              <Button
                accessibilityLabel={t('add.discardConfirm')}
                mode="outlined"
                onPress={discardRetainedDraft}
                style={styles.button}
                testID="add-draft-discard"
              >
                {t('add.discardConfirm')}
              </Button>
            </View>
          </Surface>
        ) : null}

        <View testID="add-step-progress" style={styles.stepProgress}>
          <ProgressBar
            progress={(activeStepIndex + 1) / stepOrder.length}
            style={styles.progress}
            testID="add-progress-indicator"
          />
          {stepOrder.map((step, index) => (
            <Text
              key={step}
              testID={index === activeStepIndex ? 'add-active-step' : undefined}
              variant="labelMedium"
              style={[
                styles.stepLabel,
                index === activeStepIndex
                  ? { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }
                  : { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant },
              ]}
            >
              {t(`add.step.${step}`)}
            </Text>
          ))}
          <Text testID="add-steps-remaining" variant="labelSmall" style={styles.stepRemaining}>
            {stepOrder.length - activeStepIndex - 1} {t('add.stepsRemaining')}
          </Text>
        </View>

        <View
          style={columns === 2 ? styles.tabletRow : styles.stack}
          testID={columns === 2 ? 'add-offer-tablet-columns' : undefined}
        >
          <View style={styles.column} testID="add-offer-column-primary">
        {activeStep === 'photo' ? (
        <Surface elevation={1} testID="add-step-photo" style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge">{t('add.images')}</Text>
          {fieldErrors.photo ? (
            <HelperText
              accessibilityLiveRegion="polite"
              testID="add-error-photo"
              type="error"
              visible
            >
              {fieldErrors.photo}
            </HelperText>
          ) : null}
          <View style={[styles.imageStage, { backgroundColor: theme.colors.surfaceVariant }]}>
            {previewImage?.previewUri ? (
              <Image source={{ uri: previewImage.previewUri }} style={styles.previewImage} />
            ) : (
              <Text variant="bodyMedium">{t('add.noPhoto')}</Text>
            )}
          </View>
          {images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
              {images.map((image, index) => (
                <TouchableRipple
                  key={`${image.previewUri}-${index}`}
                  accessibilityLabel={`${t('offers.goToImage')} ${index + 1}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === selectedImageIndex }}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnailWrap,
                    {
                      borderColor:
                        index === selectedImageIndex ? theme.colors.primary : theme.colors.outlineVariant,
                    },
                  ]}
                >
                  {image.previewUri ? (
                    <Image source={{ uri: image.previewUri }} style={styles.thumbnail} />
                  ) : (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text variant="labelSmall">{t('add.photoPlaceholder')}</Text>
                    </View>
                  )}
                </TouchableRipple>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.actionRow}>
            <Button
              buttonColor={theme.colors.primaryContainer}
              contentStyle={styles.buttonContent}
              mode="contained-tonal"
              onPress={() => void pickFromCamera()}
              style={styles.button}
              testID="add-take-photo"
              textColor={theme.colors.onPrimaryContainer}
            >
              {t('add.takePhoto')}
            </Button>
            <Button
              buttonColor={theme.colors.primaryContainer}
              contentStyle={styles.buttonContent}
              mode="contained-tonal"
              onPress={() => void pickFromGallery()}
              style={styles.button}
              testID="add-upload"
              textColor={theme.colors.onPrimaryContainer}
              touchableRef={photoButtonRef as never}
            >
              {t('add.upload')}
            </Button>
          </View>
          {images.length > 0 ? (
            <View style={styles.actionRow}>
              <Button
                accessibilityLabel={t('add.moveLeft')}
                buttonColor={theme.colors.surfaceVariant}
                contentStyle={styles.buttonContent}
                mode="outlined"
                onPress={() => moveImage(-1)}
                style={styles.secondaryAction}
                testID="add-move-left"
              >
                {t('add.moveLeft')}
              </Button>
              <Button
                accessibilityLabel={t('add.moveRight')}
                buttonColor={theme.colors.surfaceVariant}
                contentStyle={styles.buttonContent}
                mode="outlined"
                onPress={() => moveImage(1)}
                style={styles.secondaryAction}
                testID="add-move-right"
              >
                {t('add.moveRight')}
              </Button>
              <Button
                accessibilityLabel={t('common.remove')}
                buttonColor={theme.colors.surfaceVariant}
                contentStyle={styles.buttonContent}
                mode="outlined"
                onPress={removeCurrentImage}
                style={styles.secondaryAction}
                testID="add-remove-image"
                textColor={theme.colors.error}
              >
                {t('common.remove')}
              </Button>
            </View>
          ) : null}
        </Surface>
        ) : null}

        {activeStep === 'place' ? (
        <Surface elevation={1} testID="add-step-place" style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge">{t('add.location')}</Text>
          {fieldErrors.location ? (
            <HelperText
              accessibilityLiveRegion="polite"
              testID="add-error-location"
              type="error"
              visible
            >
              {fieldErrors.location}
            </HelperText>
          ) : null}
          <Text variant="bodyMedium">
            {t('add.currentAddress')}: {location?.label ?? t('add.locationUnavailable')}
          </Text>
          {guidanceField === 'location' ? (
            <Text
              accessibilityLabel={t('add.guidance.location')}
              accessibilityLiveRegion="polite"
              testID="add-guidance-location"
            >
              {t('add.guidance.location')}
            </Text>
          ) : null}
          <TextInput
            accessibilityLabel={t('add.locationSearch')}
            autoFocus={focusTarget === 'location'}
            editable={!locationConfirmed}
            error={Boolean(fieldErrors.location)}
            label={t('add.locationSearch')}
            maxLength={locationQueryMaxLength}
            onChangeText={(value) => {
              touchedFields.current.location = true;
              setFocusTarget(null);
              setLocationQuery(value);
              setSuggestionsSuppressed(false);
            }}
            onBlur={() => {
              if (locationConfirmed) {
                setGuidanceField(null);
              }
            }}
            onFocus={() => setGuidanceField('location')}
            placeholder={t('add.locationSearch')}
            ref={locationInputRef as never}
            testID="add-location-input"
            value={locationQuery}
          />
          {locationQuery.trim().length > 0 && locationQuery.trim().length < 3 ? (
            <Text variant="bodyMedium">{t('add.locationPlaceholder')}</Text>
          ) : null}
          {isSearching ? (
            <Text accessibilityLiveRegion="polite" variant="bodyMedium">
              {t('add.searchingLocations')}
            </Text>
          ) : null}
          {!isSearching && searchFailed && searchFeedbackVisible ? (
            <View style={styles.searchFeedback}>
              <Text accessibilityLiveRegion="polite" variant="bodyMedium" style={{ color: theme.colors.error }}>
                {t('add.locationSearchFailed')}
              </Text>
              <Button
                accessibilityLabel={t('add.retry')}
                mode="text"
                onPress={handleRetrySearch}
                style={styles.inlineAction}
              >
                {t('add.retry')}
              </Button>
            </View>
          ) : null}
          {!isSearching && !searchFailed && searchCompleted && searchFeedbackVisible ? (
            <Text variant="bodyMedium">{t('add.noLocationResults')}</Text>
          ) : null}
          {locationResults.map((result) => (
            <TouchableRipple
              key={getLocationSearchResultKey(result)}
              accessibilityRole="button"
              style={[styles.resultRow, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                touchedFields.current.location = true;
                setLocation({
                  source: 'search',
                  label: result.label,
                  position: result.position,
                });
                setLocationQuery(result.label);
                setLocationConfirmed(false);
                setLocationResults([]);
                setSuggestionsSuppressed(true);
                setMapCenter(result.position);
                reportStatus(t('add.locationSelected'));
              }}
            >
              <Text variant="bodyMedium">{result.label}</Text>
            </TouchableRipple>
          ))}
          <Text variant="bodyMedium">{t('add.mapPinHint')}</Text>
          {location || mapCenter ? (
            <NativeMapPreview
              businesses={
                location
                  ? [
                      {
                        businessId: 'selected',
                        distanceMeters: 0,
                        location: location.position,
                        name: location.label ?? t('add.pinnedLocation'),
                      },
                    ]
                  : []
              }
              center={location?.position ?? mapCenter ?? fallbackMapCenter}
              height={300}
              radiusMeters={500}
              showUserMarker={false}
              showCoverage={false}
              interactive
              onMapTap={(point) => void handleMapTap(point)}
              onMapDragEnd={handleMapDragEnd}
            />
          ) : null}
          <Button
            accessibilityLabel={t('add.setPinAtCenter')}
            mode="contained-tonal"
            onPress={() => void handleMapTap(location?.position ?? mapCenter ?? fallbackMapCenter)}
            style={styles.button}
          >
            {t('add.setPinAtCenter')}
          </Button>
          <View style={styles.actionRow}>
            <TouchableRipple
              accessibilityLabel={t('add.confirmLocation')}
              accessibilityRole="button"
              accessibilityState={{ selected: locationConfirmed, disabled: !location || locationConfirmed }}
              disabled={!location || locationConfirmed}
              style={[
                styles.button,
                {
                  backgroundColor: locationConfirmed ? theme.colors.surfaceVariant : theme.colors.primaryContainer,
                  opacity: !location || locationConfirmed ? 0.45 : 1,
                },
              ]}
              onPress={() => {
                touchedFields.current.location = true;
                setFocusTarget(null);
                setGuidanceField(null);
                setLocationConfirmed(true);
                reportStatus(t('add.locationConfirmed'));
              }}
            >
              <Text variant="labelLarge">{t('add.confirmLocation')}</Text>
            </TouchableRipple>
            <Button
              accessibilityLabel={t('add.editLocation')}
              buttonColor={theme.colors.surfaceVariant}
              contentStyle={styles.buttonContent}
              disabled={!locationConfirmed}
              mode="outlined"
              onPress={() => {
                setLocationConfirmed(false);
                reportStatus(t('add.locationEditEnabled'));
              }}
              style={styles.button}
            >
              {t('add.editLocation')}
            </Button>
          </View>
        </Surface>
        ) : null}

          </View>
          <View style={styles.column} testID="add-offer-column-secondary">
        {activeStep === 'details' ? (
        <Surface elevation={1} testID="add-step-details" style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge">{t('add.description')}</Text>
          {fieldErrors.description ? (
            <HelperText
              accessibilityLiveRegion="polite"
              testID="add-error-description"
              type="error"
              visible
            >
              {fieldErrors.description}
            </HelperText>
          ) : null}
          {guidanceField === 'description' ? (
            <Text
              accessibilityLabel={t('add.guidance.description')}
              accessibilityLiveRegion="polite"
              testID="add-guidance-description"
            >
              {t('add.guidance.description')}
            </Text>
          ) : null}
          <TextInput
            accessibilityLabel={t('add.description')}
            autoFocus={focusTarget === 'description'}
            error={Boolean(fieldErrors.description)}
            label={t('add.description')}
            maxLength={descriptionMaxLength}
            multiline
            onChangeText={(value) => {
              const next = value.slice(0, descriptionMaxLength);
              touchedFields.current.description = true;
              setFocusTarget(null);
              setDescription(next);
              if (!next.trim()) {
                setTags([]);
                setSuggestionTags([]);
                setSeedTags([]);
                setDismissedTags([]);
                return;
              }

              const completedWord = extractCompletedWord(next);
              if (completedWord) {
                const normalized = normalizeTag(completedWord);
                if (normalized.length >= minAutoTagLength) {
                  addTag(normalized);
                }
              } else {
                const lastWord = extractWords(next).at(-1);
                if (lastWord && /[^\p{L}\p{Nd}]$/u.test(lastWord)) {
                  const normalized = normalizeTag(lastWord);
                  if (normalized.length >= minAutoTagLength) {
                    addTag(normalized);
                  }
                }
              }
            }}
            onBlur={() => {
              commitFinalWordTag();
              if (description.trim()) {
                setGuidanceField(null);
              }
            }}
            onFocus={() => setGuidanceField('description')}
            placeholder={t('add.descriptionPlaceholder')}
            ref={descriptionInputRef as never}
            style={styles.textarea}
            testID="add-description-input"
            value={description}
          />
          <HelperText style={styles.counter} testID="add-description-counter" type="info">
            {`${description.length}/${descriptionMaxLength}`}
          </HelperText>
          <HelperText type="info">{t('add.descriptionMaxHint')}</HelperText>
          <Text variant="labelMedium">{t('add.detectedWords')}</Text>
          <View style={styles.wordGrid}>
            {detectedWords.map((word) => (
              <Button
                key={word}
                buttonColor={theme.colors.surfaceVariant}
                contentStyle={styles.buttonContent}
                mode="contained-tonal"
                onPress={() => addTag(word, 'manual')}
                style={styles.wordChip}
              >
                {word}
              </Button>
            ))}
          </View>

          <View style={styles.header}>
            <Text variant="labelMedium">{t('add.tags')}</Text>
            <Button
              accessibilityLabel={t('common.why')}
              contentStyle={styles.buttonContent}
              mode="text"
              onPress={() => setGuidanceField((current) => (current === 'tags' ? null : 'tags'))}
              style={styles.inlineAction}
              testID="add-tags-why"
              textColor={theme.colors.primary}
            >
              {t('common.why')}
            </Button>
          </View>
          {guidanceField === 'tags' && tags.length === 0 ? (
            <Text
              accessibilityLabel={t('add.guidance.tags')}
              accessibilityLiveRegion="polite"
              testID="add-guidance-tags"
            >
              {t('add.guidance.tags')} {t('add.tagsHint')}
            </Text>
          ) : null}
          <Text variant="bodyMedium">{t('add.tagsAutoHint')}</Text>
          <Text variant="bodyMedium">{t('add.tagsLimitHint')}</Text>
          {fieldErrors.tags ? (
            <HelperText
              accessibilityLiveRegion="polite"
              testID="add-error-tags"
              type="error"
              visible
            >
              {fieldErrors.tags}
            </HelperText>
          ) : null}
          {tagSuggestions.length > 0 ? (
            <View testID="add-suggestions" style={styles.suggestionSection}>
              <Text variant="labelMedium">{t('add.suggestionsTitle')}</Text>
              {tagSuggestions.map((tag) => (
                <View key={tag} testID="add-suggestion" style={styles.suggestionRow}>
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {tag}
                  </Text>
                  <Checkbox.Item
                    accessibilityLabel={`${t('add.suggestionAdd')} ${tag}`}
                    label={t('add.suggestionAdd')}
                    onPress={() => addTag(tag, 'suggestion')}
                    status={tags.includes(tag) ? 'checked' : 'unchecked'}
                    style={styles.suggestionAction}
                    testID="add-suggestion-add"
                  />
                  <Button
                    accessibilityLabel={`${t('add.suggestionDismiss')} ${tag}`}
                    contentStyle={styles.buttonContent}
                    mode="text"
                    onPress={() => setDismissedTags((current) => [...current, tag])}
                    style={styles.suggestionAction}
                    testID="add-suggestion-dismiss"
                  >
                    {t('add.suggestionDismiss')}
                  </Button>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.wordGrid}>
            {tags.length === 0 ? <Text variant="bodyMedium">{t('add.noTags')}</Text> : null}
            {tags.map((tag) => (
              <Button
                key={tag}
                buttonColor={theme.colors.primaryContainer}
                contentStyle={styles.buttonContent}
                mode="contained-tonal"
                onPress={() => removeTag(tag)}
                style={styles.wordChip}
                testID="add-tag-chip"
                textColor={theme.colors.onPrimaryContainer}
              >
                {tag}
              </Button>
            ))}
          </View>
        </Surface>
        ) : null}

        <View style={styles.stepNav}>
          <Button
            accessibilityLabel={activeStepIndex === 0 ? t('add.cancel') : t('add.step.back')}
            mode="outlined"
            onPress={() => {
              if (activeStepIndex === 0) {
                handleCancel();
                return;
              }
              setActiveStep((current) => stepOrder[Math.max(0, stepOrder.indexOf(current) - 1)]);
            }}
            style={styles.stepNavButton}
            testID="add-step-back"
          >
            {t('add.step.back')}
          </Button>
          <Button
            accessibilityLabel={t('add.step.next')}
            disabled={activeStepIndex === stepOrder.length - 1}
            mode="contained-tonal"
            onPress={() =>
              setActiveStep((current) =>
                stepOrder[Math.min(stepOrder.length - 1, stepOrder.indexOf(current) + 1)]
              )
            }
            style={styles.stepNavButton}
            testID="add-step-next"
          >
            {t('add.step.next')}
          </Button>
        </View>

        {activeStep === 'details' ? (
          <Button
            accessibilityLabel={editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}
            mode="contained"
            onPress={() => void submit()}
            style={styles.submitButton}
            testID="add-submit-button"
          >
            {editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}
          </Button>
        ) : null}
          </View>
        </View>
      </ScrollView>
      <Dialog
        dismissable={false}
        dismissableBackButton={false}
        testID="add-success"
        visible={submitted}
      >
        <Dialog.Title accessibilityLiveRegion="polite" style={{ color: theme.colors.primary }}>
          {t(editingOfferId ? 'add.updated' : 'add.created')}
        </Dialog.Title>
        <Dialog.Actions>
          {!editingOfferId ? (
            <Button
              accessibilityLabel={t('add.viewOffer')}
              mode="contained-tonal"
              onPress={() => {
                closeOverlay();
                openTab('offers');
              }}
              testID="add-view-offer"
            >
              {t('add.viewOffer')}
            </Button>
          ) : null}
          <Button
            accessibilityLabel={t('common.done')}
            mode="outlined"
            onPress={() => {
              closeOverlay();
              if (editingOfferId) {
                openTab('account');
              }
            }}
            testID="add-done"
          >
            {t('common.done')}
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Dialog
        dismissable={false}
        dismissableBackButton={false}
        onDismiss={() => setDiscardDialog(null)}
        testID="add-discard-dialog"
        visible={discardDialog !== null}
      >
        <Dialog.Title>{t('add.discardTitle')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('add.discardBody')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            accessibilityLabel={t('add.keepEditing')}
            mode="text"
            onPress={() => setDiscardDialog(null)}
            testID="add-discard-keep"
          >
            {t('add.keepEditing')}
          </Button>
          <Button
            accessibilityLabel={t('add.discardConfirm')}
            buttonColor={theme.colors.error}
            mode="contained"
            onPress={confirmDiscard}
            testID="add-discard-confirm"
            textColor={theme.colors.onError}
          >
            {t('add.discardConfirm')}
          </Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar
        duration={Number.POSITIVE_INFINITY}
        onDismiss={() => {}}
        testID="add-status"
        visible={Boolean(status) && !submitted}
        wrapperStyle={styles.snackbarWrapper}
      >
        <Text variant="labelLarge" style={{ color: statusColor }}>
          {status}
        </Text>
      </Snackbar>
      <HelpSheet
        onClose={() => setHelpVisible(false)}
        returnFocusRef={helpButtonRef}
        topic="help.contribute"
        visible={helpVisible}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  tabletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
  },
  stack: {
    gap: 14,
  },
  column: {
    flex: 1,
    gap: 14,
  },
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panel: {
    gap: 12,
    padding: 18,
  },
  imageStage: {
    alignItems: 'center',
    borderRadius: 16,
    height: 230,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  thumbnailRow: {
    maxHeight: 74,
  },
  thumbnailWrap: {
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 68,
    width: 68,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineAction: {
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 8,
  },
  searchFeedback: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  buttonContent: {
    minHeight: platformTouchFloor,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 0,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  resultRow: {
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    paddingVertical: 16,
  },
  stepProgress: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progress: {
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  counter: {
    textAlign: 'right',
  },
  snackbarWrapper: {
    paddingHorizontal: 16,
  },
  stepLabel: {
    borderRadius: 16,
    minHeight: 36,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepRemaining: {
    marginLeft: 'auto',
  },
  stepNav: {
    flexDirection: 'row',
    gap: 10,
  },
  stepNavButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingVertical: 12,
  },
  suggestionSection: {
    gap: 8,
  },
  suggestionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  suggestionAction: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    minWidth: 56,
    paddingHorizontal: 10,
  },
});