import { landmarkFontFamily } from '../utils/typography';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isRequestAborted } from '../api/client';
import { apiConfig } from '../api/config';
import { GeoPoint, OfferImageDto, OfferLocationDto } from '../api/types';
import { NativeMapPreview } from '../components/NativeMapPreview';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { statusColor, type StatusTone } from '../utils/statusNotice';
import { extractCompletedWord, extractWords } from '../utils/format';
import { keyboardAvoidanceBehavior, resolveAddOfferColumns } from '../utils/layout';
import { getSuggestedTags, maxDraftTags, normalizeTag } from '../utils/tagLexicon';

interface DraftImage {
  previewUri: string | null;
  metadata: OfferImageDto;
}

interface LocationSearchResult {
  label: string;
  position: { lat: number; lng: number };
}

const maxPhotos = 8;
const minAutoTagLength = 3;
const maxTagLength = 40;
const successDwellMs = 3000;
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

export function AddOfferScreen({ onDismissGuard }: { onDismissGuard?: (guard: () => boolean) => void } = {}) {
  const { api, closeOverlay, isPending, openTab, overlayRoute, palette, preferences, t } = useApp();
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
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const locationSearchRequest = useAbortableRequest();
  const locationSearchSequence = useRef(0);
  const pinSequence = useRef(0);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const discardPromptOpen = useRef(false);
  const dismissApproved = useRef(false);
  const tagLimitNotified = useRef(false);
  const isVisible = overlayRoute?.name === 'add-offer';
  const hasDraftContent =
    images.length > 0 ||
    description.trim().length > 0 ||
    tags.length > 0 ||
    locationConfirmed ||
    (location !== null && location.source !== 'auto');

  useEffect(
    () => () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    },
    []
  );

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

  const searchFeedbackVisible = isVisible && !locationConfirmed && locationQuery.trim().length >= 3;
  const isSearching = searchFeedbackVisible && !suggestionsSuppressed && isPending('locations-search');

  function handleCancel() {
    if (discardPromptOpen.current) {
      return;
    }

    if (!hasDraftContent) {
      closeOverlay();
      return;
    }

    discardPromptOpen.current = true;
    Alert.alert(t('add.discardTitle'), t('add.discardBody'), [
      {
        text: t('add.keepEditing'),
        style: 'cancel',
        onPress: () => {
          discardPromptOpen.current = false;
        },
      },
      {
        text: t('add.discardConfirm'),
        style: 'destructive',
        onPress: () => {
          discardPromptOpen.current = false;
          dismissApproved.current = true;
          closeOverlay();
        },
      },
    ]);
  }

  function handleRetryLoad() {
    setLoadFailed(false);
    setLoadAttempt((current) => current + 1);
  }

  function handleRetrySearch() {
    setSearchFailed(false);
    setSearchAttempt((current) => current + 1);
  }

  const editingOfferId = overlayRoute?.name === 'add-offer' ? overlayRoute.offerId : undefined;

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    async function loadDraft() {
      reportStatus(null);
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
    if (!isVisible) {
      return;
    }

    const candidates = getSuggestedTags(seedTags, preferences.language).filter(
      (tag) => normalizeTag(tag).length >= minAutoTagLength
    );
    candidates.forEach((tag) => {
      if (!tags.includes(tag) && !dismissedTags.includes(tag)) {
        addTag(tag, 'suggestion');
      }
    });
  }, [isVisible, seedTags, tags, dismissedTags, preferences.language]);

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
        style={{ backgroundColor: palette.background }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{t('add.editTitle')}</Text>
        </View>
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.status, { color: palette.danger }]}>{t('add.loadFailed')}</Text>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel={t('add.retry')}
              accessibilityRole="button"
              onPress={handleRetryLoad}
              style={[styles.button, { backgroundColor: palette.accentMuted }]}
            >
              <Text style={{ color: palette.accentText }}>{t('add.retry')}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('add.cancel')}
              accessibilityRole="button"
              onPress={handleCancel}
              style={[styles.button, { backgroundColor: palette.panel }]}
            >
              <Text style={{ color: palette.ink }}>{t('add.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  function addTag(value: string, source: 'description' | 'manual' | 'suggestion' = 'description') {
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
      quality: 0.7,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const built = buildDraftImage(result.assets[0], images.length);
    if (!built) {
      reportStatus(t('add.imageError'), 'error');
      return;
    }

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
      quality: 0.7,
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
    const errors: string[] = [];
    if (images.length === 0) {
      errors.push(t('add.photoRequired'));
    }
    if (!description.trim()) {
      errors.push(t('add.validationDescription'));
    }
    if (currentTags.length === 0) {
      errors.push(t('add.validationTags'));
    }
    if (!location || !locationConfirmed) {
      errors.push(t('add.validationLocation'));
    }

    reportStatus(errors.join(' '), 'error');
    return errors.length === 0;
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

      reportStatus(t('add.updated'), 'success');
      navigationTimer.current = setTimeout(() => {
        closeOverlay();
        openTab('account');
      }, successDwellMs);
      return;
    }

    try {
      await api.createOffer(payload);
    } catch (error) {
      reportStatus(formatSubmitError(error, t('add.createFailed')), 'error');
      return;
    }

    reportStatus(t('add.created'), 'success');
    navigationTimer.current = setTimeout(() => {
      closeOverlay();
      openTab('offers');
    }, successDwellMs);
  }

  const detectedWords = extractWords(description).filter((word) => !tags.includes(normalizeTag(word)));
  const previewImage = images[selectedImageIndex];

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={styles.keyboardView}
      testID="add-offer-keyboard-view"
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: palette.background }}
        testID="add-offer-scroll"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{editingOfferId ? t('add.editTitle') : t('add.title')}</Text>
          <Pressable
            accessibilityLabel={t('add.cancel')}
            accessibilityRole="button"
            onPress={handleCancel}
            style={styles.inlineAction}
          >
            <Text style={{ color: palette.inkMuted }}>{t('add.cancel')}</Text>
          </Pressable>
        </View>

        <View
          style={columns === 2 ? styles.tabletRow : styles.stack}
          testID={columns === 2 ? 'add-offer-tablet-columns' : undefined}
        >
          <View style={styles.column} testID="add-offer-column-primary">
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.images')}</Text>
          <View style={[styles.imageStage, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
            {previewImage?.previewUri ? (
              <Image source={{ uri: previewImage.previewUri }} style={styles.previewImage} />
            ) : (
              <Text style={[styles.emptyImage, { color: palette.inkMuted }]}>{t('add.noPhoto')}</Text>
            )}
          </View>
          {images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
              {images.map((image, index) => (
                <Pressable
                  key={`${image.previewUri}-${index}`}
                  accessibilityLabel={`${t('offers.goToImage')} ${index + 1}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === selectedImageIndex }}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnailWrap,
                    {
                      borderColor: index === selectedImageIndex ? palette.accentText : palette.border,
                    },
                  ]}
                >
                  {image.previewUri ? (
                    <Image source={{ uri: image.previewUri }} style={styles.thumbnail} />
                  ) : (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: palette.panelAlt }]}>
                      <Text style={[styles.thumbnailPlaceholderText, { color: palette.inkMuted }]}>
                        {t('add.photoPlaceholder')}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.actionRow}>
            <Pressable
              testID="add-take-photo"
              style={[styles.button, { backgroundColor: palette.panel }]}
              onPress={() => void pickFromCamera()}
            >
              <Text style={{ color: palette.ink }}>{t('add.takePhoto')}</Text>
            </Pressable>
            <Pressable
              testID="add-upload"
              style={[styles.button, { backgroundColor: palette.accentMuted }]}
              onPress={() => void pickFromGallery()}
            >
              <Text style={{ color: palette.accentText }}>{t('add.upload')}</Text>
            </Pressable>
          </View>
          {images.length > 0 ? (
            <View style={styles.actionRow}>
              <Pressable
                testID="add-move-left"
                accessibilityLabel={t('add.moveLeft')}
                accessibilityRole="button"
                style={[styles.secondaryAction, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={() => moveImage(-1)}
              >
                <Text style={{ color: palette.inkMuted }}>{t('add.moveLeft')}</Text>
              </Pressable>
              <Pressable
                testID="add-move-right"
                accessibilityLabel={t('add.moveRight')}
                accessibilityRole="button"
                style={[styles.secondaryAction, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={() => moveImage(1)}
              >
                <Text style={{ color: palette.inkMuted }}>{t('add.moveRight')}</Text>
              </Pressable>
              <Pressable
                testID="add-remove-image"
                accessibilityLabel={t('common.remove')}
                accessibilityRole="button"
                style={[styles.secondaryAction, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={removeCurrentImage}
              >
                <Text style={{ color: palette.danger }}>{t('common.remove')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.location')}</Text>
          <Text style={{ color: palette.inkMuted }}>
            {t('add.currentAddress')}: {location?.label ?? t('add.locationUnavailable')}
          </Text>
          <TextInput
            accessibilityLabel={t('add.locationSearch')}
            editable={!locationConfirmed}
            maxLength={locationQueryMaxLength}
            onChangeText={(value) => {
              setLocationQuery(value);
              setSuggestionsSuppressed(false);
            }}
            placeholder={t('add.locationSearch')}
            placeholderTextColor={palette.inkMuted}
            style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
            value={locationQuery}
          />
          {locationQuery.trim().length > 0 && locationQuery.trim().length < 3 ? (
            <Text style={{ color: palette.inkMuted }}>{t('add.locationPlaceholder')}</Text>
          ) : null}
          {isSearching ? (
            <Text accessibilityLiveRegion="polite" style={{ color: palette.inkMuted }}>
              {t('add.searchingLocations')}
            </Text>
          ) : null}
          {!isSearching && searchFailed && searchFeedbackVisible ? (
            <View style={styles.searchFeedback}>
              <Text accessibilityLiveRegion="polite" style={{ color: palette.danger }}>
                {t('add.locationSearchFailed')}
              </Text>
              <Pressable
                accessibilityLabel={t('add.retry')}
                accessibilityRole="button"
                onPress={handleRetrySearch}
                style={styles.inlineAction}
              >
                <Text style={{ color: palette.accentText }}>{t('add.retry')}</Text>
              </Pressable>
            </View>
          ) : null}
          {!isSearching && !searchFailed && searchCompleted && searchFeedbackVisible ? (
            <Text style={{ color: palette.inkMuted }}>{t('add.noLocationResults')}</Text>
          ) : null}
          {locationResults.map((result) => (
            <Pressable
              key={getLocationSearchResultKey(result)}
              style={[styles.resultRow, { backgroundColor: palette.panel, borderColor: palette.border }]}
              onPress={() => {
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
              <Text style={{ color: palette.ink }}>{result.label}</Text>
            </Pressable>
          ))}
          <Text style={{ color: palette.inkMuted }}>{t('add.mapPinHint')}</Text>
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
          <Pressable
            accessibilityLabel={t('add.setPinAtCenter')}
            accessibilityRole="button"
            onPress={() => void handleMapTap(location?.position ?? mapCenter ?? fallbackMapCenter)}
            style={[styles.button, { backgroundColor: palette.panelAlt }]}
          >
            <Text style={{ color: palette.ink }}>{t('add.setPinAtCenter')}</Text>
          </Pressable>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel={t('add.confirmLocation')}
              accessibilityRole="button"
              accessibilityState={{ selected: locationConfirmed, disabled: !location || locationConfirmed }}
              disabled={!location || locationConfirmed}
              style={[
                styles.button,
                {
                  backgroundColor: locationConfirmed ? palette.panel : palette.accentMuted,
                  opacity: !location || locationConfirmed ? 0.45 : 1,
                },
              ]}
              onPress={() => {
                setLocationConfirmed(true);
                reportStatus(t('add.locationConfirmed'));
              }}
            >
              <Text style={{ color: locationConfirmed ? palette.inkMuted : palette.accent }}>{t('add.confirmLocation')}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('add.editLocation')}
              accessibilityRole="button"
              accessibilityState={{ disabled: !locationConfirmed }}
              disabled={!locationConfirmed}
              style={[
                styles.button,
                {
                  backgroundColor: locationConfirmed ? palette.panel : palette.panelAlt,
                  opacity: locationConfirmed ? 1 : 0.45,
                },
              ]}
              onPress={() => {
                setLocationConfirmed(false);
                reportStatus(t('add.locationEditEnabled'));
              }}
            >
              <Text style={{ color: palette.ink }}>{t('add.editLocation')}</Text>
            </Pressable>
          </View>
        </View>

          </View>
          <View style={styles.column} testID="add-offer-column-secondary">
        <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.description')}</Text>
          <TextInput
            accessibilityLabel={t('add.description')}
            maxLength={descriptionMaxLength}
            multiline
            onChangeText={(value) => {
              const next = value.slice(0, descriptionMaxLength);
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
            onBlur={() => commitFinalWordTag()}
            placeholder={t('add.descriptionPlaceholder')}
            placeholderTextColor={palette.inkMuted}
            style={[
              styles.textarea,
              { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink },
            ]}
            value={description}
          />
          <Text style={{ color: palette.inkMuted, textAlign: 'right' }}>{`${description.length}/${descriptionMaxLength}`}</Text>
          <Text style={{ color: palette.inkMuted }}>{t('add.descriptionMaxHint')}</Text>
          <Text style={[styles.label, { color: palette.inkMuted }]}>{t('add.detectedWords')}</Text>
          <View style={styles.wordGrid}>
            {detectedWords.map((word) => (
              <Pressable
                key={word}
                style={[styles.wordChip, { backgroundColor: palette.panel, borderColor: palette.border }]}
                onPress={() => addTag(word, 'manual')}
              >
                <Text style={{ color: palette.ink }}>{word}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: palette.inkMuted }]}>{t('add.tags')}</Text>
          <Text style={{ color: palette.inkMuted }}>{t('add.tagsHint')}</Text>
          <Text style={{ color: palette.inkMuted }}>{t('add.tagsAutoHint')}</Text>
          <Text style={{ color: palette.inkMuted }}>{t('add.tagsLimitHint')}</Text>
          <View style={styles.wordGrid}>
            {tags.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('add.noTags')}</Text> : null}
            {tags.map((tag) => (
              <Pressable
                key={tag}
                testID="add-tag-chip"
                style={[styles.wordChip, { backgroundColor: palette.accentMuted, borderColor: palette.border }]}
                onPress={() => removeTag(tag)}
              >
                <Text style={{ color: palette.accentText }}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityLabel={editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}
          accessibilityRole="button"
          testID="add-submit-button"
          style={[styles.submitButton, { backgroundColor: palette.accent }]}
          onPress={() => void submit()}
        >
          <Text style={[styles.submitLabel, { color: palette.onAccent }]}>
            {editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}
          </Text>
        </Pressable>
        {status ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>
            {status}
          </Text>
        ) : null}
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontFamily: landmarkFontFamily(),
    fontSize: 28,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  sectionTitle: {
    fontFamily: landmarkFontFamily(),
    fontSize: 22,
    fontWeight: '700',
  },
  imageStage: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 230,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  emptyImage: {
    fontSize: 15,
    fontWeight: '700',
  },
  thumbnailRow: {
    maxHeight: 74,
  },
  thumbnailWrap: {
    borderRadius: 14,
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
  thumbnailPlaceholderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineAction: {
    justifyContent: 'center',
    minHeight: 44,
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
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 0,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textarea: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 140,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  resultRow: {
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    borderRadius: 28,
    paddingVertical: 16,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});