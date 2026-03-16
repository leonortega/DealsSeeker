import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { OfferItemDto } from '../api/types';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { useApp } from '../hooks/useApp';
import { isSvgImageUri, resolveOfferImageUri } from '../utils/images';
import { formatDistanceMeters } from '../utils/format';

interface OfferDetailModalProps {
  visible: boolean;
  offer: OfferItemDto | null;
  onClose: () => void;
  onFavorite: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
}

function OfferGalleryImage({
  imageUrl,
  placeholderSymbol,
}: {
  imageUrl?: string | null;
  placeholderSymbol: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = useOfferImageUri(imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  if (canRenderImage && !imageFailed) {
    return (
      <Image
        resizeMode="cover"
        source={{ uri: imageUri ?? undefined }}
        style={styles.galleryImage}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View style={styles.galleryPanel}>
      <Text style={styles.gallerySymbol}>{placeholderSymbol}</Text>
    </View>
  );
}

export function OfferDetailModal({ offer, onClose, onDirections, onFavorite, visible }: OfferDetailModalProps) {
  const { palette, preferences, t } = useApp();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [offer?.offerId, visible]);

  const detailImages = offer
    ? (offer.imageUrls.length > 0 ? offer.imageUrls : [offer.imageUrl]).filter(
        (imageUrl) => resolveOfferImageUri(imageUrl) !== null
      )
    : [];

  if (!offer) {
    return null;
  }

  const hasMultipleImages = detailImages.length > 1;
  const currentImage = detailImages[Math.min(selectedImageIndex, Math.max(detailImages.length - 1, 0))] ?? offer.imageUrl;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.header}>
            <Text numberOfLines={2} style={[styles.title, { color: palette.ink }]}>{offer.businessName}</Text>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.close, { color: palette.ink }]}>{t('offers.fullscreenClose')}</Text>
            </Pressable>
          </View>

          <View style={[styles.gallery, { backgroundColor: palette.accentMuted }]}>
            <Pressable
              accessibilityLabel={t('offers.previousImage')}
              disabled={!hasMultipleImages}
              onPress={() =>
                setSelectedImageIndex((current) => (current - 1 + detailImages.length) % detailImages.length)
              }
              style={[styles.galleryButton, !hasMultipleImages && styles.galleryButtonDisabled]}
            >
              <Text style={[styles.galleryButtonLabel, { color: palette.ink }]}>‹</Text>
            </Pressable>

            <View style={styles.galleryPanel}>
              <OfferGalleryImage imageUrl={currentImage} placeholderSymbol={hasMultipleImages ? '▣' : '▤'} />
              <View style={[styles.galleryCounter, { backgroundColor: palette.overlay }]}>
                <Text style={styles.galleryCounterLabel}>
                  {detailImages.length === 0 ? '0 / 0' : `${selectedImageIndex + 1} / ${detailImages.length}`}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel={t('offers.nextImage')}
              disabled={!hasMultipleImages}
              onPress={() => setSelectedImageIndex((current) => (current + 1) % detailImages.length)}
              style={[styles.galleryButton, !hasMultipleImages && styles.galleryButtonDisabled]}
            >
              <Text style={[styles.galleryButtonLabel, { color: palette.ink }]}>›</Text>
            </Pressable>
          </View>

          <Text style={[styles.description, { color: palette.ink }]}>{offer.description}</Text>
          <Text style={[styles.meta, { color: palette.inkMuted }]}>
            {t('offers.distance')}: {formatDistanceMeters(offer.distanceMeters)}
          </Text>

          <View style={styles.tags}>
            {offer.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: palette.panel, borderColor: palette.border }]}>
                <Text style={{ color: palette.inkMuted }}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.actionButton, { backgroundColor: palette.panel }]} onPress={() => onFavorite(offer)}>
              <Text style={{ color: palette.ink }}>{t('offers.favorite')}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: palette.accentMuted }]} onPress={() => onDirections(offer)}>
              <Text style={{ color: palette.accent }}>
                {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    gap: 14,
    maxHeight: '88%',
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    marginRight: 12,
  },
  closeButton: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    paddingVertical: 4,
  },
  close: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  gallery: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 10,
    minHeight: 220,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  galleryButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  galleryButtonDisabled: {
    opacity: 0.35,
  },
  galleryButtonLabel: {
    fontSize: 28,
    fontWeight: '600',
  },
  galleryPanel: {
    alignItems: 'center',
    flex: 1,
    height: 200,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    height: '100%',
    width: '100%',
  },
  galleryCounter: {
    borderRadius: 999,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    right: 12,
  },
  galleryCounterLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  gallerySymbol: {
    fontSize: 76,
    opacity: 0.45,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    borderRadius: 16,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
