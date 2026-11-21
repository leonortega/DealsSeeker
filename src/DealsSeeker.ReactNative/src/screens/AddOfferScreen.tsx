import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { MapPreview } from '../components/MapPreview';
import { StandardHeader } from '../components/StandardHeader';
import { useAbortableRequest } from '../hooks/useAbortableRequest';
import { useApp } from '../hooks/useApp';
import { announceStatus } from '../utils/announce';
import { statusColor, type StatusTone } from '../utils/statusNotice';
import { extractCompletedWord, extractWords } from '../utils/format';
import { getSuggestedTags, normalizeTag } from '../utils/tagLexicon';

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

export function AddOfferScreen() {
  const { api, closeOverlay, openTab, overlayRoute, palette, preferences, t } = useApp();
  const insets = useSafeAreaInsets();
  const [images, setImages] = useState<DraftImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [seedTags, setSeedTags] = useState<string[]>([]);
  const [dismissedTags, setDismissedTags] = useState<string[]>([]);
  const [location, setLocation] = useState<OfferLocationDto | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [mapCenter, setMapCenter] = useState<GeoPoint | null>(null);
  const [suggestionsSuppressed, setSuggestionsSuppressed] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>('neutral');
  const locationSearchRequest = useAbortableRequest();
  const locationSearchSequence = useRef(0);
  const pinSequence = useRef(0);

  function reportStatus(message: string | null, tone: StatusTone = 'neutral') {
    setStatus(message);
    setStatusTone(tone);
    announceStatus(message);
  }

  const isVisible = overlayRoute?.name === 'add-offer';
  const editingOfferId = overlayRoute?.name === 'add-offer' ? overlayRoute.offerId : undefined;

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    async function loadDraft() {
      reportStatus(null);

      if (editingOfferId) {
        const draft = await api.getMyOfferDraft(editingOfferId);
        if (!draft) {
          reportStatus(t('add.loadFailed'), 'error');
          return;
        }

        const draftTags = (draft.tags ?? []).map(normalizeTag).filter(Boolean);
        setDescription(draft.description ?? '');
        setTags(draftTags);
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
        return;
      }

      setImages([]);
      setDescription('');
      setTags([]);
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
  }, [isVisible, editingOfferId]);

  useEffect(() => {
    if (!isVisible || locationConfirmed || suggestionsSuppressed) {
      return;
    }

    const trimmedQuery = locationQuery.trim();
    if (trimmedQuery.length < 3) {
      setLocationResults([]);
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
          setLocationResults(dedupeLocationSearchResults(results));
        } catch (error) {
          if (isRequestAborted(error) || sequence !== locationSearchSequence.current) {
            return;
          }
          reportStatus(t('add.locationSearchFailed'), 'error');
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      locationSearchRequest.abort();
    };
  }, [isVisible, locationConfirmed, locationQuery, suggestionsSuppressed]);

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

  function addTag(value: string, source: 'description' | 'manual' | 'suggestion' = 'description') {
    const normalized = normalizeTag(value);
    if (!normalized || (source !== 'manual' && dismissedTags.includes(normalized))) {
      return;
    }

    setTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    if (source !== 'suggestion') {
      setSeedTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    }
    if (source === 'manual') {
      setDismissedTags((current) => current.filter((item) => item !== normalized));
    }
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
    setSeedTags((current) => current.filter((item) => item !== tag));
    setDismissedTags((current) => (current.includes(tag) ? current : [...current, tag]));
  }

  function getFinalWordTag() {
    const lastWord = extractWords(description).at(-1);
    if (!lastWord) {
      return null;
    }

    const normalized = normalizeTag(lastWord);
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
    const submittedTags = finalTag && !tags.includes(finalTag) ? [...tags, finalTag] : tags;
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

      reportStatus(t('add.updated'));
      setTimeout(() => {
        closeOverlay();
        openTab('account');
      }, 900);
      return;
    }

    try {
      await api.createOffer(payload);
    } catch (error) {
      reportStatus(formatSubmitError(error, t('add.createFailed')), 'error');
      return;
    }

    reportStatus(t('add.created'));
    setTimeout(() => {
      closeOverlay();
      openTab('offers');
    }, 900);
  }

  const detectedWords = extractWords(description).filter((word) => !tags.includes(normalizeTag(word)));
  const previewImage = images[selectedImageIndex];

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
      <StandardHeader />
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.ink }]}>{editingOfferId ? t('add.editTitle') : t('add.title')}</Text>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.images')}</Text>
        <View style={[styles.imageStage, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
          {previewImage?.previewUri ? (
            <Image source={{ uri: previewImage.previewUri }} style={styles.previewImage} />
          ) : (
            <Text style={[styles.emptyImage, { color: palette.inkMuted }]}>▤</Text>
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
                    borderColor: index === selectedImageIndex ? palette.accent : palette.border,
                  },
                ]}
              >
                {image.previewUri ? (
                  <Image source={{ uri: image.previewUri }} style={styles.thumbnail} />
                ) : (
                  <View style={[styles.thumbnailPlaceholder, { backgroundColor: palette.panelAlt }]}>
                    <Text style={[styles.thumbnailPlaceholderText, { color: palette.inkMuted }]}>▤</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.actionRow}>
          <Pressable style={[styles.button, { backgroundColor: palette.panel }]} onPress={() => void pickFromCamera()}>
            <Text style={{ color: palette.ink }}>{t('add.takePhoto')}</Text>
          </Pressable>
          <Pressable style={[styles.button, { backgroundColor: palette.accentMuted }]} onPress={() => void pickFromGallery()}>
            <Text style={{ color: palette.accent }}>{t('add.upload')}</Text>
          </Pressable>
        </View>
        {images.length > 0 ? (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel={t('offers.previousImage')}
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: palette.panel }]}
              onPress={() => moveImage(-1)}
            >
              <Text accessible={false} style={{ color: palette.ink }}>←</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('offers.nextImage')}
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: palette.panel }]}
              onPress={() => moveImage(1)}
            >
              <Text accessible={false} style={{ color: palette.ink }}>→</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: palette.panelAlt }]} onPress={removeCurrentImage}>
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
          <MapPreview
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
            accessibilityState={{ selected: locationConfirmed }}
            style={[styles.button, { backgroundColor: locationConfirmed ? palette.panel : palette.accentMuted }]}
            onPress={() => {
              if (!location) {
                return;
              }
              setLocationConfirmed(true);
              reportStatus(t('add.locationConfirmed'));
            }}
          >
            <Text style={{ color: locationConfirmed ? palette.inkMuted : palette.accent }}>{t('add.confirmLocation')}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('add.editLocation')}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: locationConfirmed ? palette.panel : palette.panelAlt }]}
            onPress={() => {
              setLocationConfirmed(false);
              reportStatus(t('add.locationEditEnabled'));
            }}
          >
            <Text style={{ color: palette.ink }}>{t('add.editLocation')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.description')}</Text>
        <TextInput
          accessibilityLabel={t('add.description')}
          multiline
          onChangeText={(value) => {
            setDescription(value);
            if (!value.trim()) {
              setTags([]);
              setSeedTags([]);
              setDismissedTags([]);
              return;
            }

            const completedWord = extractCompletedWord(value);
            if (completedWord) {
              const normalized = normalizeTag(completedWord);
              if (normalized.length >= minAutoTagLength) {
                addTag(normalized);
              }
            } else {
              const lastWord = extractWords(value).at(-1);
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
        <View style={styles.wordGrid}>
          {tags.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('add.noTags')}</Text> : null}
          {tags.map((tag) => (
            <Pressable
              key={tag}
              style={[styles.wordChip, { backgroundColor: palette.accentMuted, borderColor: palette.border }]}
              onPress={() => removeTag(tag)}
            >
              <Text style={{ color: palette.accent }}>{tag} ×</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityLabel={editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}
        accessibilityRole="button"
        style={[styles.submitButton, { backgroundColor: palette.accent }]}
        onPress={() => void submit()}
      >
        <Text style={styles.submitLabel}>{editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}</Text>
      </Pressable>
      {status ? (
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>
          {status}
        </Text>
      ) : null}
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
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  sectionTitle: {
    fontFamily: 'Georgia',
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
    fontSize: 72,
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
    fontSize: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
