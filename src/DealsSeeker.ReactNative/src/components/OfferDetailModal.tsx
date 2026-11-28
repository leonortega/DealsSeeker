import { platformTouchFloor } from '../utils/layout';
import { immersiveInk } from '../utils/theme';
import React, { type RefObject, useEffect, useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { OfferItemDto } from '../api/types';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { useApp } from '../hooks/useApp';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { isSvgImageUri, resolveOfferImageUri } from '../utils/images';
import { resolveMotionPreferences } from '../utils/motion';
import { restoreFocus } from '../utils/focusReturn';
import { NativeBottomSheet } from './NativeBottomSheet';
import { PlatformTabIcon } from './PlatformTabIcon';
import { OfferActionGlyph, OFFER_ACTION_GLYPHS, OFFER_ACTION_LABEL_KEYS } from './OfferActionVocabulary';
import { formatDistanceMeters } from '../utils/format';

interface OfferDetailModalProps {
  visible: boolean;
  offer: OfferItemDto | null;
  onClose: () => void;
  returnFocusRef?: RefObject<unknown>;
  onFavorite: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onComments: (offer: OfferItemDto) => void;
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
  const motion = resolveMotionPreferences(useReduceMotion());
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

  function zoomAnimation(value: Animated.Value, toValue: number) {
    return motion.springEnabled
      ? Animated.spring(value, { damping: 18, stiffness: 170, toValue, useNativeDriver: true })
      : Animated.timing(value, { duration: 0, toValue, useNativeDriver: true });
  }

  function settleTransform() {
    const nextScale = clampScale(scaleRef.current);
    const nextTranslateX = nextScale <= 1.01 ? 0 : clampOffset('x', translateRef.current.x, nextScale);
    const nextTranslateY = nextScale <= 1.01 ? 0 : clampOffset('y', translateRef.current.y, nextScale);

    scaleRef.current = nextScale <= 1.01 ? 1 : nextScale;
    translateRef.current = { x: nextTranslateX, y: nextTranslateY };

    Animated.parallel([
      zoomAnimation(scale, scaleRef.current),
      zoomAnimation(translateX, translateRef.current.x),
      zoomAnimation(translateY, translateRef.current.y),
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
        testID="offer-zoom-surface"
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
      <Text variant="displayLarge" style={styles.gallerySymbol}>
        {placeholderSymbol}
      </Text>
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
      <Text variant="displayLarge" style={styles.gallerySymbol}>
        {placeholderSymbol}
      </Text>
    </View>
  );
}

/** Paper Button fixes its own accessibilityState, so the ripple carries the announced state. */
function M3DetailAction({
  accessibilityLabel,
  accessibilityState,
  backgroundColor,
  glyph,
  label,
  labelColor,
  onPress,
  testID,
}: {
  accessibilityLabel: string;
  accessibilityState?: { selected?: boolean };
  backgroundColor: string;
  glyph: React.ReactNode;
  label: string;
  labelColor: string;
  onPress: () => void;
  testID: string;
}) {
  const theme = useTheme();
  return (
    <TouchableRipple
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      rippleColor={theme.colors.primary}
      style={[styles.actionButton, { backgroundColor }]}
      testID={testID}
    >
      <View style={styles.actionContent}>
        <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
          <Button children={null} icon={() => glyph} onPress={onPress} style={styles.m3Action} />
        </View>
        <Text variant="labelLarge" style={{ color: labelColor }}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

export function OfferDetailModal({ offer, onClose, onDirections, onFavorite, onComments, visible, returnFocusRef }: OfferDetailModalProps) {
  const { palette, preferences, t } = useApp();
  const theme = useTheme();

  function close() {
    onClose();
    restoreFocus(returnFocusRef);
  }

  function closeFullscreen() {
    setFullscreenVisible(false);
    restoreFocus(fullscreenReturnRef);
  }

  const motion = resolveMotionPreferences(useReduceMotion());
  const { width: viewportWidth } = useWindowDimensions();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const detailScrollRef = useRef<FlatList<string> | null>(null);
  const fullscreenReturnRef = useRef<React.ComponentRef<typeof View> | null>(null);

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
    detailScrollRef.current?.scrollToOffset({ offset: index * carouselWidth, animated: animated && motion.animatedScroll });
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
      <NativeBottomSheet visible={visible} onClose={close}>
          <View accessibilityViewIsModal testID="offer-detail-sheet" style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.header}>
            <Text numberOfLines={2} variant="headlineSmall" style={{ color: palette.ink, flex: 1, marginRight: 12 }}>
              {offer.businessName}
            </Text>
          </View>

          <View style={[styles.gallery, { backgroundColor: palette.accentMuted }]}>
            <IconButton
              accessibilityLabel={t('offers.previousImage')}
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasMultipleImages }}
              contentStyle={styles.galleryTouchable}
              disabled={!hasMultipleImages}
              icon={() => <PlatformTabIcon color={palette.ink} name="chevronBackward" size={24} />}
              onPress={showPreviousImage}
              size={24}
              style={[styles.galleryButton, !hasMultipleImages && styles.galleryButtonDisabled]}
            />

            <View style={styles.galleryPanel}>
              <FlatList
                ref={detailScrollRef}
                data={detailImages}
                horizontal
                keyExtractor={(imageUrl, index) => `${imageUrl ?? 'placeholder'}-${index}`}
                pagingEnabled
                renderItem={({ item: imageUrl, index }: { item: string; index: number }) => (
                  <TouchableRipple
                    ref={selectedImageIndex === index ? (fullscreenReturnRef as never) : undefined}
                    testID="offer-gallery-slide"
                    onPress={() => setFullscreenVisible(true)}
                    rippleColor={theme.colors.primary}
                    style={[styles.gallerySlide, { width: carouselWidth }]}
                  >
                    <OfferGalleryImage imageUrl={imageUrl} placeholderSymbol={hasMultipleImages ? '▣' : '▤'} />
                  </TouchableRipple>
                )}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleCarouselEnd}
              />
              <View style={[styles.galleryCounter, { backgroundColor: palette.overlay }]}>
                <Text style={styles.galleryCounterLabel} variant="labelSmall">
                  {detailImages.length === 0 ? '0 / 0' : `${selectedImageIndex + 1} / ${detailImages.length}`}
                </Text>
              </View>
            </View>

            <IconButton
              accessibilityLabel={t('offers.nextImage')}
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasMultipleImages }}
              contentStyle={styles.galleryTouchable}
              disabled={!hasMultipleImages}
              icon={() => <PlatformTabIcon color={palette.ink} name="chevronForward" size={24} />}
              onPress={showNextImage}
              size={24}
              style={[styles.galleryButton, !hasMultipleImages && styles.galleryButtonDisabled]}
            />
          </View>

          <View testID="offer-detail-badges" style={styles.badges}>
            {offer.isPromoted ? (
              <View style={[styles.badge, { backgroundColor: palette.highlight }]}>
                <Text variant="labelSmall" style={{ color: palette.onHighlight }}>
                  {t('offers.promoted')}
                </Text>
              </View>
            ) : null}
            {offer.isReported ? (
              <View style={[styles.badge, { backgroundColor: palette.danger }]}>
                <Text variant="labelSmall" style={{ color: palette.onDanger }}>
                  {t('offers.reported')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="bodyMedium" style={{ color: palette.ink }}>
            {offer.description}
          </Text>
          <Text variant="bodySmall" style={{ color: palette.inkMuted }}>
            {t('offers.distance')}: {formatDistanceMeters(offer.distanceMeters)}
          </Text>
          {offer.isReported ? (
            <Text variant="bodySmall" style={{ color: palette.danger }}>
              {t('offers.reportedWarning')}
            </Text>
          ) : null}

          <View style={styles.tags}>
            {offer.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: palette.panel, borderColor: palette.border }]}>
                <Text variant="bodyMedium" style={{ color: palette.inkMuted }}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <M3DetailAction
              accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.directions)}
              backgroundColor={palette.accentMuted}
              glyph={<OfferActionGlyph glyph={OFFER_ACTION_GLYPHS.directions} prominent testID="offer-detail-action-glyph" />}
              label={preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
              labelColor={palette.accentText}
              onPress={() => onDirections(offer)}
              testID="offer-detail-action-directions"
            />
            <M3DetailAction
              accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.favorite)}
              accessibilityState={{ selected: offer.isFavorite }}
              backgroundColor={palette.panel}
              glyph={<OfferActionGlyph active={offer.isFavorite} glyph={OFFER_ACTION_GLYPHS.favorite} testID="offer-detail-action-glyph" />}
              label={t('offers.favorite')}
              labelColor={palette.ink}
              onPress={() => onFavorite(offer)}
              testID="offer-detail-action-favorite"
            />
            <M3DetailAction
              accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.comments)}
              backgroundColor={palette.panel}
              glyph={<OfferActionGlyph glyph={OFFER_ACTION_GLYPHS.comments} testID="offer-detail-action-glyph" />}
              label={t('offers.action.comments')}
              labelColor={palette.ink}
              onPress={() => onComments(offer)}
              testID="offer-detail-action-comments"
            />
          </View>
        </View>
      </NativeBottomSheet>

      <NativeBottomSheet visible={fullscreenVisible} onClose={closeFullscreen}>
        <View
          accessibilityViewIsModal
          testID="offer-fullscreen-sheet"
          style={[styles.fullscreenSheet, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <View style={styles.header}>
            <Text numberOfLines={1} variant="headlineSmall" style={{ color: palette.ink, flex: 1, marginRight: 12 }}>
              {offer.businessName}
            </Text>
            <Button
              accessibilityLabel={t('offers.fullscreenClose')}
              accessibilityRole="button"
              hitSlop={8}
              mode="text"
              onPress={closeFullscreen}
              style={styles.closeButton}
              testID="offer-fullscreen-close"
              textColor={theme.colors.onSurface}
            >
              {t('offers.fullscreenClose')}
            </Button>
          </View>

          <View style={styles.fullscreenFrame}>
            {hasMultipleImages ? (
              <IconButton
                accessibilityLabel={t('offers.previousImage')}
                accessibilityRole="button"
                contentStyle={styles.galleryTouchable}
                icon={() => <PlatformTabIcon color={palette.ink} name="chevronBackward" size={24} />}
                onPress={showPreviousImage}
                size={24}
                style={styles.fullscreenNavButton}
              />
            ) : null}

            <View style={styles.fullscreenImageWrap}>
              <ZoomableImage imageUrl={currentImage} placeholderSymbol={hasMultipleImages ? '▣' : '▤'} />
              <View style={[styles.galleryCounter, styles.fullscreenCounter, { backgroundColor: palette.overlay }]}>
                <Text style={styles.galleryCounterLabel} variant="labelSmall">
                  {detailImages.length === 0 ? '0 / 0' : `${selectedImageIndex + 1} / ${detailImages.length}`}
                </Text>
              </View>
            </View>

            {hasMultipleImages ? (
              <IconButton
                accessibilityLabel={t('offers.nextImage')}
                accessibilityRole="button"
                contentStyle={styles.galleryTouchable}
                icon={() => <PlatformTabIcon color={palette.ink} name="chevronForward" size={24} />}
                onPress={showNextImage}
                size={24}
                style={styles.fullscreenNavButton}
              />
            ) : null}
          </View>
        </View>
      </NativeBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    flex: 1,
    gap: 14,
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
  closeButton: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
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
    height: platformTouchFloor,
    justifyContent: 'center',
    width: platformTouchFloor,
  },
  galleryButtonDisabled: {
    opacity: 0.35,
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
    color: immersiveInk,
  },
  galleryTouchable: {
    height: platformTouchFloor,
    width: platformTouchFloor,
  },
  gallerySymbol: {
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
    height: platformTouchFloor,
    justifyContent: 'center',
    width: platformTouchFloor,
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    minHeight: platformTouchFloor,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  m3Action: {
    margin: 0,
  },
});
