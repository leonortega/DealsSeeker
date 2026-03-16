import { useEffect, useState } from 'react';
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
import { apiConfig } from '../api/config';
import { OfferImageDto, OfferLocationDto } from '../api/types';
import { MapPreview } from '../components/MapPreview';
import { useApp } from '../hooks/useApp';
import { extractWords } from '../utils/format';
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
  const [images, setImages] = useState<DraftImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState<OfferLocationDto | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const isVisible = overlayRoute?.name === 'add-offer';
  const editingOfferId = overlayRoute?.name === 'add-offer' ? overlayRoute.offerId : undefined;

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    async function loadDraft() {
      setStatus(null);

      if (editingOfferId) {
        const draft = await api.getMyOfferDraft(editingOfferId);
        if (!draft) {
          setStatus(t('add.loadFailed'));
          return;
        }

        setDescription(draft.description ?? '');
        setTags((draft.tags ?? []).map(normalizeTag).filter(Boolean));
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
        return;
      }

      setImages([]);
      setDescription('');
      setTags([]);
      setLocation(null);
      setLocationQuery('');
      setLocationConfirmed(false);
      setLocationResults([]);

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          setStatus(t('add.currentLocationUnavailable'));
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.Balanced,
        });
        const reverse = await api.reverseLocation(position.coords.latitude, position.coords.longitude);
        const label = reverse?.label || t('offers.currentLocation');
        setLocation({
          source: 'auto',
          label,
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        setLocationQuery(label);
        setStatus(t('add.currentLocationAuto'));
      } catch {
        setStatus(t('add.currentLocationUnavailable'));
      }
    }

    void loadDraft();
  }, [isVisible, editingOfferId]);

  useEffect(() => {
    if (!isVisible || locationConfirmed) {
      return;
    }

    const trimmedQuery = locationQuery.trim();
    if (trimmedQuery.length < 3) {
      setLocationResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      void (async () => {
        try {
          const results = await api.searchLocations(trimmedQuery);
          setLocationResults(dedupeLocationSearchResults(results));
        } catch {
          setStatus(t('add.locationSearchFailed'));
        }
      })();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isVisible, locationConfirmed, locationQuery]);

  if (!isVisible) {
    return null;
  }

  function addTag(value: string) {
    const normalized = normalizeTag(value);
    if (!normalized || tags.includes(normalized)) {
      return;
    }

    setTags((current) => [...current, normalized]);
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  async function pickFromCamera() {
    if (images.length >= maxPhotos) {
      setStatus(t('add.maxPhotos'));
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setStatus(t('add.imageError'));
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
      setStatus(t('add.imageError'));
      return;
    }

    setImages((current) => [...current, built]);
    setSelectedImageIndex(images.length);
  }

  async function pickFromGallery() {
    if (images.length >= maxPhotos) {
      setStatus(t('add.maxPhotos'));
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
      setStatus(t('add.imageError'));
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

  function validate() {
    const errors: string[] = [];
    if (images.length === 0) {
      errors.push(t('add.photoRequired'));
    }
    if (!description.trim()) {
      errors.push(t('add.validationDescription'));
    }
    if (tags.length === 0) {
      errors.push(t('add.validationTags'));
    }
    if (!location || !locationConfirmed) {
      errors.push(t('add.validationLocation'));
    }

    setStatus(errors.join(' '));
    return errors.length === 0;
  }

  async function submit() {
    if (!validate()) {
      return;
    }

    const payload = {
      description: description.trim(),
      tags,
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
        setStatus(formatSubmitError(error, t('add.updateFailed')));
        return;
      }

      setStatus(t('add.updated'));
      closeOverlay();
      openTab('account');
      return;
    }

    try {
      await api.createOffer(payload);
    } catch (error) {
      setStatus(formatSubmitError(error, t('add.createFailed')));
      return;
    }

    setStatus(t('add.created'));
    closeOverlay();
    openTab('offers');
  }

  const detectedWords = extractWords(description);
  const suggestedTags = getSuggestedTags(tags, preferences.language);
  const previewImage = images[selectedImageIndex];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.ink }]}>{editingOfferId ? t('add.editTitle') : t('add.title')}</Text>
        <Pressable onPress={closeOverlay}>
          <Text style={{ color: palette.accent, fontWeight: '700' }}>{t('common.back')}</Text>
        </Pressable>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.images')}</Text>
        <View style={[styles.imageStage, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
          {previewImage?.previewUri ? (
            <Image source={{ uri: previewImage.previewUri }} style={styles.previewImage} />
          ) : (
            <Text style={[styles.emptyImage, { color: palette.inkMuted }]}>◎</Text>
          )}
        </View>
        {images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
            {images.map((image, index) => (
              <Pressable
                key={`${image.previewUri}-${index}`}
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
                    <Text style={[styles.thumbnailPlaceholderText, { color: palette.inkMuted }]}>◎</Text>
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
            <Pressable style={[styles.button, { backgroundColor: palette.panel }]} onPress={() => moveImage(-1)}>
              <Text style={{ color: palette.ink }}>←</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: palette.panel }]} onPress={() => moveImage(1)}>
              <Text style={{ color: palette.ink }}>→</Text>
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
          editable={!locationConfirmed}
          onChangeText={setLocationQuery}
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
              setStatus(t('add.locationSelected'));
            }}
          >
            <Text style={{ color: palette.ink }}>{result.label}</Text>
          </Pressable>
        ))}
        {location ? (
          <MapPreview
            businesses={[
              {
                businessId: 'selected',
                distanceMeters: 0,
                location: location.position,
                name: location.label ?? 'Selected location',
              },
            ]}
            center={location.position}
            radiusMeters={500}
            showUserMarker={false}
          />
        ) : null}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.button, { backgroundColor: locationConfirmed ? palette.panel : palette.accentMuted }]}
            onPress={() => {
              if (!location) {
                return;
              }
              setLocationConfirmed(true);
              setStatus(t('add.locationConfirmed'));
            }}
          >
            <Text style={{ color: locationConfirmed ? palette.inkMuted : palette.accent }}>{t('add.confirmLocation')}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: locationConfirmed ? palette.panel : palette.panelAlt }]}
            onPress={() => {
              setLocationConfirmed(false);
              setStatus(t('add.locationEditEnabled'));
            }}
          >
            <Text style={{ color: palette.ink }}>{t('add.editLocation')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t('add.description')}</Text>
        <TextInput
          multiline
          onChangeText={(value) => {
            setDescription(value);
            if (!value.trim()) {
              setTags([]);
            }
          }}
          placeholder={t('add.descriptionPlaceholder')}
          placeholderTextColor={palette.inkMuted}
          style={[
            styles.textarea,
            { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink },
          ]}
          value={description}
        />
        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('add.detectedWords')}</Text>
        <Text style={{ color: palette.inkMuted }}>{t('add.tapWord')}</Text>
        <View style={styles.wordGrid}>
          {detectedWords.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('add.noWords')}</Text> : null}
          {detectedWords.map((word) => (
            <Pressable
              key={word}
              style={[styles.wordChip, { backgroundColor: palette.panel, borderColor: palette.border }]}
              onPress={() => addTag(word)}
            >
              <Text style={{ color: palette.ink }}>{word}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('add.tags')}</Text>
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

        <Text style={[styles.label, { color: palette.inkMuted }]}>{t('add.suggestedTags')}</Text>
        <Text style={{ color: palette.inkMuted }}>{t('add.suggestionsHint')}</Text>
        <View style={styles.wordGrid}>
          {tags.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('add.selectTagFirst')}</Text> : null}
          {suggestedTags.map((tag) => (
            <Pressable
              key={tag}
              style={[styles.wordChip, { backgroundColor: palette.panel, borderColor: palette.border }]}
              onPress={() => addTag(tag)}
            >
              <Text style={{ color: palette.ink }}>{tag}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={[styles.submitButton, { backgroundColor: palette.accent }]} onPress={() => void submit()}>
        <Text style={styles.submitLabel}>{editingOfferId ? t('add.submitEdit') : t('add.submitCreate')}</Text>
      </Pressable>
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
    borderRadius: 16,
    flex: 1,
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
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitButton: {
    borderRadius: 20,
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
