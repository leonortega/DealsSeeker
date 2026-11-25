import {
  FlatList,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { isSvgImageUri, resolveOfferImageUri } from '../utils/images';
import { formatDistanceMeters, shorten } from '../utils/format';
import { resolveFeedRestoreIndex } from '../utils/feedPosition';
import { openDirections } from '../utils/maps';
import { immersiveInk, immersiveInkMuted } from '../utils/theme';
import { ImmersiveActionCaption, ImmersiveActionIconGlyph } from './ImmersiveActionGlyphs';
import { ImmersiveFeedTab, ImmersiveFeedTabs } from './ImmersiveFeedTabs';
import { ImmersiveSearchOverlay } from './ImmersiveSearchOverlay';
import { OfferTopBar } from './OfferTopBar';

export const NARROW_BREAKPOINT = 768;

export function shouldShowImmersiveCaptions(isNarrow: boolean, fontScale: number, availableHeight = Infinity) {
  return !isNarrow && fontScale < 1.5 && availableHeight >= 640;
}

interface ImmersiveOfferFeedProps {
  offers: OfferItemDto[];
  onRadiusChange: (radiusMeters: number) => void;
  radiusMeters: number;
  query: string;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onComments: (offer: OfferItemDto) => void;
  onSearch: (query: string) => void;
  feedTab: ImmersiveFeedTab;
  onFeedTabChange: (tab: ImmersiveFeedTab) => void;
  headerControl?: ReactNode;
  helpControl?: ReactNode;
  returnFocusRef?: RefObject<unknown>;
}

function ImmersiveOfferImage({ imageUrl, placeholderSymbol }: { imageUrl: string; placeholderSymbol: string }) {
  const { palette } = useApp();
  const imageUri = useOfferImageUri(imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);
  const [imageFailed, setImageFailed] = useState(false);

  if (canRenderImage && !imageFailed) {
    return (
      <Image
        resizeMode="contain"
        source={{ uri: imageUri ?? undefined }}
        style={[styles.backgroundImage, { backgroundColor: palette.backdrop }]}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.backgroundImage,
        { alignItems: 'center', backgroundColor: palette.backdrop, justifyContent: 'center' },
      ]}
    >
      <Text style={{ color: '#fff', fontSize: 76, opacity: 0.45 }}>{placeholderSymbol}</Text>
    </View>
  );
}

function ImmersiveOfferPage({
  offer,
  showCaptions,
  showPhotoArrows,
  onFavorite,
  onVote,
  onReport,
  onDirections,
  onComments,
}: {
  offer: OfferItemDto;
  showCaptions: boolean;
  showPhotoArrows: boolean;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onComments: (offer: OfferItemDto) => void;
}) {
  const { palette, t } = useApp();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const sourceImages = Array.isArray(offer.imageUrls) && offer.imageUrls.length > 0 ? offer.imageUrls : [offer.imageUrl];
  const detailImages = sourceImages.filter((imageUrl) => resolveOfferImageUri(imageUrl) !== null);
  const images = detailImages.length > 0 ? detailImages : [offer.imageUrl];
  const hasMultipleImages = images.length > 1;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const selectedImageIndexRef = useRef(0);

  const carouselWidth = Math.max(320, pageWidth || viewportWidth - 220);
  const carouselHeight = pageHeight || Math.max(320, viewportHeight);

  function handlePageLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setPageWidth(width);
    setPageHeight(height);
  }

  function updateSelectedImage(index: number) {
    const nextIndex = Math.max(0, Math.min(index, images.length - 1));
    selectedImageIndexRef.current = nextIndex;
    setSelectedImageIndex(nextIndex);
  }

  function showPreviousImage() {
    if (!hasMultipleImages) {
      return;
    }

    updateSelectedImage((selectedImageIndexRef.current - 1 + images.length) % images.length);
  }

  function showNextImage() {
    if (!hasMultipleImages) {
      return;
    }

    updateSelectedImage((selectedImageIndexRef.current + 1) % images.length);
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          hasMultipleImages && Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onMoveShouldSetPanResponder: (_event, gesture) =>
          hasMultipleImages && Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          setDragOffset(0);
        },
        onPanResponderMove: (_event, gesture) => {
          setDragOffset(gesture.dx);
        },
        onPanResponderRelease: (_event, gesture) => {
          const threshold = Math.max(40, carouselWidth * 0.18);
          const swipe = Math.abs(gesture.dx) > threshold ? Math.sign(gesture.dx) : 0;
          setDragOffset(0);

          if (swipe === 0) {
            return;
          }

          updateSelectedImage(
            (selectedImageIndexRef.current + (swipe < 0 ? 1 : -1) + images.length) % images.length,
          );
        },
        onPanResponderTerminate: () => {
          setDragOffset(0);
        },
      }),
    [carouselWidth, hasMultipleImages, images.length],
  );

  useEffect(() => {
    selectedImageIndexRef.current = 0;
    setSelectedImageIndex(0);
    setDragOffset(0);
  }, [offer.offerId]);

  return (
    <View style={[styles.page, { backgroundColor: palette.backdrop }]} onLayout={handlePageLayout}>
      {hasMultipleImages ? (
        <View
          {...panResponder.panHandlers}
          style={[
            styles.photoTrack,
            {
              height: carouselHeight,
              transform: [{ translateX: -selectedImageIndex * carouselWidth + dragOffset }],
              width: carouselWidth * images.length,
            },
          ]}
        >
          {images.map((imageUrl, index) => (
            <View key={`photo-${index}`} style={{ height: carouselHeight, width: carouselWidth }}>
              <ImmersiveOfferImage imageUrl={imageUrl} placeholderSymbol="▣" />
            </View>
          ))}
        </View>
      ) : (
        <ImmersiveOfferImage imageUrl={images[0] ?? offer.imageUrl} placeholderSymbol="▤" />
      )}

      <View pointerEvents="none" style={styles.overlay} />

      <View style={[styles.rightRail, showCaptions && styles.rightRailWithCaptions]}>
        <Pressable
          accessibilityLabel={t('offers.action.comments')}
          accessibilityRole="button"
          testID="offer-comments-button"
          style={styles.railAction}
          onPress={() => onComments(offer)}
        >
          <View testID="rail-secondary-action" style={[styles.railButton, { backgroundColor: palette.panel }]}>
            <ImmersiveActionIconGlyph kind="comments" />
          </View>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.comments')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.favorite')}
          accessibilityRole="button"
          accessibilityState={{ selected: offer.isFavorite }}
          style={styles.railAction}
          onPress={() => onFavorite(offer)}
        >
          <View style={[styles.railButton, { backgroundColor: palette.panel }]}>
            <ImmersiveActionIconGlyph active={offer.isFavorite} kind="favorite" />
          </View>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.favorite')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.directions')}
          accessibilityRole="button"
          style={styles.railAction}
          onPress={() => void onDirections(offer)}
        >
          <View testID="rail-primary-action" style={[styles.railButton, { backgroundColor: palette.accent }]}>
            <ImmersiveActionIconGlyph kind="directions" prominent />
          </View>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.directions')} /> : null}
        </Pressable>
        <View style={styles.railDivider} />
        <Pressable
          accessibilityLabel={t('offers.action.report')}
          accessibilityRole="button"
          testID="offer-report-button"
          style={styles.railAction}
          onPress={() => onReport(offer)}
        >
          <View style={[styles.railButton, { backgroundColor: palette.panel }]}>
            <ImmersiveActionIconGlyph kind="report" />
          </View>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.report')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.available')}
          accessibilityRole="button"
          testID="offer-available-button"
          accessibilityState={{ disabled: offer.hasCurrentUserVoted }}
          disabled={offer.hasCurrentUserVoted}
          style={[styles.railAction, offer.hasCurrentUserVoted && styles.disabled]}
          onPress={() => onVote(offer, 1)}
        >
          <View style={[styles.railButton, { backgroundColor: palette.panel }]}>
            <ImmersiveActionIconGlyph kind="votePositive" />
          </View>
          <Text style={[styles.railCount, { color: immersiveInkMuted }]}>{offer.positiveAvailabilityCount}</Text>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.available')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.unavailable')}
          accessibilityRole="button"
          accessibilityState={{ disabled: offer.hasCurrentUserVoted }}
          disabled={offer.hasCurrentUserVoted}
          style={[styles.railAction, offer.hasCurrentUserVoted && styles.disabled]}
          onPress={() => onVote(offer, 2)}
        >
          <View style={[styles.railButton, { backgroundColor: palette.panel }]}>
            <ImmersiveActionIconGlyph kind="voteNegative" />
          </View>
          <Text style={[styles.railCount, { color: immersiveInkMuted }]}>{offer.negativeAvailabilityCount}</Text>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.unavailable')} /> : null}
        </Pressable>
      </View>

      <View style={styles.bottomOverlay}>
        {hasMultipleImages ? (
          <View pointerEvents="box-none" style={styles.immersivePhotoNav}>
            {showPhotoArrows ? (
              <Pressable accessibilityLabel={t('offers.previousImage')} accessibilityRole="button" onPress={showPreviousImage} style={styles.immersivePhotoNavButton}>
                <Text style={styles.immersivePhotoNavLabel}>‹</Text>
              </Pressable>
            ) : null}
            <View style={styles.immersivePhotoDots}>
              {images.map((_, index) => (
                <Pressable
                  key={`photo-dot-${index}`}
                  accessibilityLabel={`${t('offers.goToImage')} ${index + 1}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === selectedImageIndex }}
                  hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
                  onPress={() => updateSelectedImage(index)}
                  style={[
                    styles.immersivePhotoDot,
                    index === selectedImageIndex ? styles.immersivePhotoDotActive : null,
                  ]}
                />
              ))}
            </View>
            {showPhotoArrows ? (
              <Pressable accessibilityLabel={t('offers.nextImage')} accessibilityRole="button" onPress={showNextImage} style={styles.immersivePhotoNavButton}>
                <Text style={styles.immersivePhotoNavLabel}>›</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <View style={[styles.bottomOverlayText, showCaptions && styles.bottomOverlayTextWithCaptions]}>
          {offer.isPromoted ? (
            <View style={[styles.badge, { backgroundColor: palette.highlight }]}>
              <Text style={[styles.badgeLabel, { color: palette.onHighlight }]}>{t('offers.promoted')}</Text>
            </View>
          ) : null}
          {offer.isReported ? (
            <View style={[styles.badge, { backgroundColor: palette.danger }]}>
              <Text style={[styles.badgeLabel, { color: palette.onDanger }]}>{t('offers.reported')}</Text>
            </View>
          ) : null}
          <Text style={styles.businessName}>{offer.businessName}</Text>
          <Text style={styles.distance}>{t('offers.distance')}: {formatDistanceMeters(offer.distanceMeters)}</Text>
          <Text style={styles.description}>
            {expanded ? offer.description : shorten(offer.description, 100)}
          </Text>
          {offer.tags.length > 0 && expanded ? (
            <Text style={styles.tagsText}>
              {offer.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          ) : null}
          {!expanded ? (
            <Pressable onPress={() => setExpanded(true)}>
              <Text style={styles.moreButton}>{t('offers.more')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function ImmersiveOfferFeed({
  offers,
  onRadiusChange,
  radiusMeters,
  query,
  onFavorite,
  onVote,
  onReport,
  onDirections,
  onComments,
  onSearch,
  feedTab,
  onFeedTabChange,
  headerControl,
  helpControl,
  returnFocusRef,
}: ImmersiveOfferFeedProps) {
  const { fontScale, height, width } = useWindowDimensions();
  const { palette, t } = useApp();
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchVisible, setSearchVisible] = useState(false);
  const [feedHeight, setFeedHeight] = useState(0);
  const isNarrow = width < NARROW_BREAKPOINT;
  const pageHeight = Math.max(320, feedHeight || height);
  const listRef = useRef<FlatList<OfferItemDto> | null>(null);
  const activeOfferId = useRef<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ isViewable?: boolean | null; item: unknown }> }) => {
      const visible = viewableItems.find((token) => token.isViewable);
      activeOfferId.current = (visible?.item as OfferItemDto | undefined)?.offerId ?? null;
    }
  ).current;

  useEffect(() => {
    const index = resolveFeedRestoreIndex(offers, activeOfferId.current);
    if (index === null) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [offers, pageHeight]);

  function handleFeedAreaLayout(event: LayoutChangeEvent) {
    setFeedHeight(event.nativeEvent.layout.height);
  }

  function handleApplySearch() {
    onSearch(searchQuery);
    setSearchVisible(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.backdrop }]}>
      <View style={styles.contentRow}>
        <View
          onLayout={handleFeedAreaLayout}
          style={[styles.feedArea, { backgroundColor: palette.backdrop }]}
        >
          <FlatList
            ref={listRef}
            style={{ flex: 1 }}
            testID="immersive-offer-list"
            data={offers}
            keyExtractor={(item) => item.offerId}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={pageHeight}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={{ height: pageHeight }}>
                <ImmersiveOfferPage
                  offer={item}
                  showCaptions={shouldShowImmersiveCaptions(isNarrow, fontScale, pageHeight)}
                  showPhotoArrows={!isNarrow}
                  onDirections={onDirections}
                  onFavorite={onFavorite}
                  onComments={onComments}
                  onReport={onReport}
                  onVote={onVote}
                />
              </View>
            )}
            ListEmptyComponent={<View style={[styles.empty, { height: pageHeight }]} />}
          />

          <View pointerEvents="box-none" style={styles.topBar}>
            <OfferTopBar
              headerControl={headerControl}
              helpControl={helpControl}
              isNarrow={isNarrow}
              onSearch={() => setSearchVisible(true)}
              palette={palette}
              searchLabel={t('offers.search')}
              title={t('app.title')}
              titleColor={immersiveInk}
            />
            <View style={styles.tabsRow}>
              <ImmersiveFeedTabs activeTab={feedTab} onChangeTab={onFeedTabChange} />
            </View>
          </View>
        </View>
      </View>

      <ImmersiveSearchOverlay
        onChangeQuery={setSearchQuery}
        onChangeRadius={onRadiusChange}
        onClose={() => setSearchVisible(false)}
        onSearch={handleApplySearch}
        query={searchQuery}
        returnFocusRef={returnFocusRef}
        radiusMeters={radiusMeters}
        visible={searchVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  feedArea: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  tabsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  page: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  photoTrack: {
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  leftRail: {
    gap: 10,
    left: 12,
    position: 'absolute',
    top: 12,
    width: 110,
  },
  railAction: {
    alignItems: 'center',
    gap: 2,
  },
  railButton: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  railDivider: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    height: 1,
    marginVertical: 2,
    width: 28,
  },
  railCount: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  rightRail: {
    alignItems: 'center',
    bottom: 20,
    gap: 12,
    position: 'absolute',
    right: 10,
  },
  rightRailWithCaptions: {
    right: 16,
  },
  bottomOverlay: {
    bottom: 16,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bottomOverlayText: {
    paddingLeft: 12,
    paddingRight: 70,
  },
  bottomOverlayTextWithCaptions: {
    paddingRight: 110,
  },
  businessName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  distance: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagsText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    color: '#fff',
    fontWeight: '800',
    marginTop: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginBottom: 6,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  immersivePhotoNav: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  immersivePhotoNavButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  immersivePhotoNavLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  immersivePhotoDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  immersivePhotoDot: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  immersivePhotoDotActive: {
    backgroundColor: '#ffffff',
    height: 10,
    width: 10,
  },
});