import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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

function clampScale(value: number) {
  return Math.max(1, Math.min(4, value));
}

function getTouchDistance(touches: readonly { pageX: number; pageY: number }[]) {
  if (touches.length < 2) {
    return 0;
  }

  const [firstTouch, secondTouch] = touches;
  return Math.hypot(secondTouch.pageX - firstTouch.pageX, secondTouch.pageY - firstTouch.pageY);
}

function ZoomableImage({
  imageUrl,
  placeholderSymbol,
}: {
  imageUrl?: string | null;
  placeholderSymbol: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = useOfferImageUri(imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ width: 1, height: 1 });
  const gestureRef = useRef({
    mode: 'none' as 'none' | 'pan' | 'pinch',
    startDistance: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
  });

  useEffect(() => {
    setImageFailed(false);
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  }, [imageUri, scale, translateX, translateY]);

  function clampOffset(axis: 'x' | 'y', value: number, nextScale = scaleRef.current) {
    const size = axis === 'x' ? boundsRef.current.width : boundsRef.current.height;
    const maxOffset = Math.max(0, (size * (nextScale - 1)) / 2);
    return Math.max(-maxOffset, Math.min(maxOffset, value));
  }

  function applyTransform(nextScale: number, nextTranslateX: number, nextTranslateY: number) {
    scaleRef.current = nextScale;
    translateRef.current = { x: nextTranslateX, y: nextTranslateY };
    scale.setValue(nextScale);
    translateX.setValue(nextTranslateX);
    translateY.setValue(nextTranslateY);
  }

  function settleTransform() {
    const nextScale = clampScale(scaleRef.current);
    const nextTranslateX = nextScale <= 1.01 ? 0 : clampOffset('x', translateRef.current.x, nextScale);
    const nextTranslateY = nextScale <= 1.01 ? 0 : clampOffset('y', translateRef.current.y, nextScale);

    scaleRef.current = nextScale <= 1.01 ? 1 : nextScale;
    translateRef.current = { x: nextTranslateX, y: nextTranslateY };

    Animated.parallel([
      Animated.spring(scale, {
        damping: 18,
        stiffness: 170,
        toValue: scaleRef.current,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        damping: 18,
        stiffness: 170,
        toValue: translateRef.current.x,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        damping: 18,
        stiffness: 170,
        toValue: translateRef.current.y,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function beginGesture(event: GestureResponderEvent) {
    const touches = event.nativeEvent.touches;

    if (touches.length >= 2) {
      gestureRef.current = {
        mode: 'pinch',
        startDistance: Math.max(1, getTouchDistance(touches)),
        startScale: scaleRef.current,
        startX: 0,
        startY: 0,
        startTranslateX: translateRef.current.x,
        startTranslateY: translateRef.current.y,
      };
      return;
    }

    const touch = touches[0];
    gestureRef.current = {
      mode: 'pan',
      startDistance: 0,
      startScale: scaleRef.current,
      startX: touch?.pageX ?? event.nativeEvent.pageX,
      startY: touch?.pageY ?? event.nativeEvent.pageY,
      startTranslateX: translateRef.current.x,
      startTranslateY: translateRef.current.y,
    };
  }

  function updateGesture(event: GestureResponderEvent) {
    const touches = event.nativeEvent.touches;

    if (touches.length >= 2) {
      if (gestureRef.current.mode !== 'pinch') {
        beginGesture(event);
      }

      const nextScale = clampScale(
        gestureRef.current.startScale * (getTouchDistance(touches) / Math.max(1, gestureRef.current.startDistance))
      );
      applyTransform(
        nextScale,
        clampOffset('x', gestureRef.current.startTranslateX, nextScale),
        clampOffset('y', gestureRef.current.startTranslateY, nextScale)
      );
      return;
    }

    if (scaleRef.current <= 1.01) {
      return;
    }

    if (gestureRef.current.mode !== 'pan') {
      beginGesture(event);
    }

    const touch = touches[0];
    const nextX = (touch?.pageX ?? event.nativeEvent.pageX) - gestureRef.current.startX;
    const nextY = (touch?.pageY ?? event.nativeEvent.pageY) - gestureRef.current.startY;
    applyTransform(
      scaleRef.current,
      clampOffset('x', gestureRef.current.startTranslateX + nextX),
      clampOffset('y', gestureRef.current.startTranslateY + nextY)
    );
  }

  function endGesture() {
    gestureRef.current.mode = 'none';
    settleTransform();
  }

  if (canRenderImage && !imageFailed) {
    return (
      <View
        style={styles.zoomSurface}
        onLayout={(event: LayoutChangeEvent) => {
          boundsRef.current = event.nativeEvent.layout;
        }}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={beginGesture}
        onResponderMove={updateGesture}
        onResponderRelease={endGesture}
        onResponderTerminate={endGesture}
        onStartShouldSetResponder={() => true}
      >
        <Animated.Image
          resizeMode="contain"
          source={{ uri: imageUri ?? undefined }}
          style={[
            styles.zoomImage,
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}
          onError={() => setImageFailed(true)}
        />
      </View>
    );
  }

  return (
    <View style={styles.fullscreenPlaceholder}>
      <Text style={styles.gallerySymbol}>{placeholderSymbol}</Text>
    </View>
  );
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
  const { width: viewportWidth } = useWindowDimensions();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const detailScrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    setFullscreenVisible(false);
  }, [offer?.offerId, visible]);

  const detailImages = offer
    ? (offer.imageUrls.length > 0 ? offer.imageUrls : [offer.imageUrl]).filter(
        (imageUrl) => resolveOfferImageUri(imageUrl) !== null
      )
    : [];
  const carouselWidth = Math.max(220, viewportWidth - 132);

  function scrollToImage(index: number, animated: boolean) {
    detailScrollRef.current?.scrollTo({ x: index * carouselWidth, y: 0, animated });
  }

  function updateSelectedImage(index: number, animated: boolean) {
    setSelectedImageIndex(index);
    scrollToImage(index, animated);
  }

  function showPreviousImage() {
    if (!hasMultipleImages) {
      return;
    }

    updateSelectedImage((selectedImageIndex - 1 + detailImages.length) % detailImages.length, true);
  }

  function showNextImage() {
    if (!hasMultipleImages) {
      return;
    }

    updateSelectedImage((selectedImageIndex + 1) % detailImages.length, true);
  }

  function handleCarouselEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (carouselWidth <= 0) {
      return;
    }

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);
    setSelectedImageIndex(Math.max(0, Math.min(nextIndex, Math.max(detailImages.length - 1, 0))));
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handle = setTimeout(() => {
      scrollToImage(selectedImageIndex, false);
    }, 0);

    return () => clearTimeout(handle);
  }, [carouselWidth, selectedImageIndex, visible]);

  if (!offer) {
    return null;
  }

  const hasMultipleImages = detailImages.length > 1;
  const currentImage = detailImages[Math.min(selectedImageIndex, Math.max(detailImages.length - 1, 0))] ?? offer.imageUrl;

  return (
    <>
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
              onPress={showPreviousImage}
              style={[styles.galleryButton, !hasMultipleImages && styles.galleryButtonDisabled]}
            >
              <Text style={[styles.galleryButtonLabel, { color: palette.ink }]}>‹</Text>
            </Pressable>

            <View style={styles.galleryPanel}>
              <ScrollView
                ref={detailScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleCarouselEnd}
                scrollEventThrottle={16}
              >
                {detailImages.map((imageUrl, index) => (
                  <Pressable
                    key={`${imageUrl ?? 'placeholder'}-${index}`}
                    onPress={() => setFullscreenVisible(true)}
                    style={[styles.gallerySlide, { width: carouselWidth }]}
                  >
                    <OfferGalleryImage imageUrl={imageUrl} placeholderSymbol={hasMultipleImages ? '▣' : '▤'} />
                  </Pressable>
                ))}
              </ScrollView>
              <View style={[styles.galleryCounter, { backgroundColor: palette.overlay }]}>
                <Text style={styles.galleryCounterLabel}>
                  {detailImages.length === 0 ? '0 / 0' : `${selectedImageIndex + 1} / ${detailImages.length}`}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel={t('offers.nextImage')}
              disabled={!hasMultipleImages}
              onPress={showNextImage}
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

      <Modal animationType="fade" transparent visible={fullscreenVisible} onRequestClose={() => setFullscreenVisible(false)}>
        <View style={[styles.fullscreenBackdrop, { backgroundColor: palette.overlay }]}> 
          <View style={[styles.fullscreenSheet, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={styles.header}>
              <Text numberOfLines={1} style={[styles.title, { color: palette.ink }]}>{offer.businessName}</Text>
              <Pressable hitSlop={8} onPress={() => setFullscreenVisible(false)} style={styles.closeButton}>
                <Text style={[styles.close, { color: palette.ink }]}>{t('offers.fullscreenClose')}</Text>
              </Pressable>
            </View>

            <View style={styles.fullscreenFrame}>
              {hasMultipleImages ? (
                <Pressable accessibilityLabel={t('offers.previousImage')} onPress={showPreviousImage} style={styles.fullscreenNavButton}>
                  <Text style={[styles.galleryButtonLabel, { color: palette.ink }]}>‹</Text>
                </Pressable>
              ) : null}

              <View style={styles.fullscreenImageWrap}>
                <ZoomableImage imageUrl={currentImage} placeholderSymbol={hasMultipleImages ? '▣' : '▤'} />
                <View style={[styles.galleryCounter, styles.fullscreenCounter, { backgroundColor: palette.overlay }]}> 
                  <Text style={styles.galleryCounterLabel}>
                    {detailImages.length === 0 ? '0 / 0' : `${selectedImageIndex + 1} / ${detailImages.length}`}
                  </Text>
                </View>
              </View>

              {hasMultipleImages ? (
                <Pressable accessibilityLabel={t('offers.nextImage')} onPress={showNextImage} style={styles.fullscreenNavButton}>
                  <Text style={[styles.galleryButtonLabel, { color: palette.ink }]}>›</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fullscreenBackdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    gap: 14,
    maxHeight: '88%',
    padding: 20,
  },
  fullscreenSheet: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    maxHeight: '94%',
    padding: 20,
    width: '100%',
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
  gallerySlide: {
    height: 200,
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
  fullscreenFrame: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 320,
  },
  fullscreenImageWrap: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
    position: 'relative',
  },
  fullscreenPlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  fullscreenNavButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  fullscreenCounter: {
    bottom: 16,
    right: 16,
  },
  zoomSurface: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  zoomImage: {
    height: '100%',
    width: '100%',
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
