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
import { platformTouchFloor } from '../utils/layout';
import { openDirections } from '../utils/maps';
import {
  immersiveDivider,
  immersiveDot,
  immersiveInk,
  immersiveInkMuted,
  immersivePhotoNav,
  immersiveScrim,
  immersiveTagSurface,
} from '../utils/theme';
import { landmarkFontFamily } from '../utils/typography';
import { ImmersiveActionIconGlyph } from './ImmersiveActionGlyphs';
import { OFFER_ACTION_LABEL_KEYS } from './OfferActionVocabulary';
import { ImmersiveFeedTab, ImmersiveFeedTabs } from './ImmersiveFeedTabs';
import { ImmersiveSearchOverlay } from './ImmersiveSearchOverlay';
import { OfferTopBar } from './OfferTopBar';

export const NARROW_BREAKPOINT = 768;

export function shouldShowImmersiveCaptions(availableHeight: number, fontScale = 1) {
  return fontScale < 1.4 && availableHeight >= 560;
}

function ImmersiveEmptyState({ onWiden }: { onWiden: () => void }) {
  const { isAuthenticated, openAddOffer, palette, t } = useApp();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.emptyState, { backgroundColor: palette.backdrop }]}
      testID="immersive-empty-state"
    >
      <Text style={[styles.emptyTitle, { color: palette.ink }]}>{t('offers.emptyTitle')}</Text>
      <Text style={[styles.emptyHint, { color: palette.inkMuted }]}>{t('offers.emptyHint')}</Text>
      <Pressable
        accessibilityLabel={t('offers.createFirstOffer')}
        accessibilityRole="button"
        onPress={() => {
          if (isAuthenticated) {
            openAddOffer();
          }
        }}
        style={styles.emptyAction}
      >
        <Text style={[styles.emptyActionLabel, { color: palette.onAccent }]}>{t('offers.createFirstOffer')}</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={t('offers.widenSearch')}
        accessibilityRole="button"
        onPress={onWiden}
        style={styles.emptyAction}
      >
        <Text style={[styles.emptyActionLabel, { color: palette.accentText }]}>{t('offers.widenSearch')}</Text>
      </Pressable>
    </View>
  );
}

function RailActionButton({
  accessibilityLabel,
  disabled,
  glyph,
  label,
  onPress,
  prominent,
  selected,
  testID,
  count,
  showLabel = true,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  glyph: 'comments' | 'directions' | 'favorite' | 'report' | 'voteNegative' | 'votePositive';
  label: string;
  onPress: () => void;
  prominent?: boolean;
  selected?: boolean;
  testID: string;
  count?: number;
  showLabel?: boolean;
}) {
  const { palette } = useApp();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.railAction, disabled && styles.disabled]}
      testID={testID}
    >
      <View
        testID={prominent ? 'rail-primary-action' : 'rail-secondary-action'}
        style={[styles.railButton, { backgroundColor: prominent ? palette.accent : palette.panel }]}
      >
        <ImmersiveActionIconGlyph active={selected} kind={glyph} prominent={prominent} />
      </View>
      {count === undefined ? null : (
        <Text style={[styles.railCount, { color: immersiveInkMuted }]}>{count}</Text>
      )}
      {showLabel ? <Text style={[styles.railCaption, { color: immersiveInkMuted }]}>{label}</Text> : null}
    </Pressable>
  );
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
        resizeMode="cover"
        source={{ uri: imageUri ?? undefined }}
        testID="offer-image"
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
      <Text style={{ color: immersiveInk, fontSize: 76, opacity: 0.45 }}>{placeholderSymbol}</Text>
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
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const selectedImageIndexRef = useRef(0);

  const carouselWidth = Math.max(320, pageWidth || viewportWidth - 220);
  const carouselHeight = pageHeight || Math.max(320, viewportHeight);

  const pageMeasured = useRef(false);

  function handlePageLayout(event: LayoutChangeEvent) {
    if (pageMeasured.current) {
      return;
    }
    const { width, height } = event.nativeEvent.layout;
    pageMeasured.current = true;
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
    setActionsExpanded(false);
  }, [offer.offerId]);

  return (
    <View testID="immersive-offer-page" style={[styles.page, { backgroundColor: palette.backdrop }]} onLayout={handlePageLayout}>
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
        <RailActionButton
          accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.directions)}
          glyph="directions"
          label={t(OFFER_ACTION_LABEL_KEYS.directions)}
          onPress={() => void onDirections(offer)}
          prominent
          showLabel={showCaptions}
          testID="rail-action-directions"
        />
        <RailActionButton
          accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.favorite)}
          glyph="favorite"
          label={t(OFFER_ACTION_LABEL_KEYS.favorite)}
          onPress={() => onFavorite(offer)}
          selected={offer.isFavorite}
          showLabel={showCaptions}
          testID="rail-action-favorite"
        />
        <RailActionButton
          accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.comments)}
          glyph="comments"
          label={t(OFFER_ACTION_LABEL_KEYS.comments)}
          onPress={() => onComments(offer)}
          showLabel={showCaptions}
          testID="rail-action-comments"
        />
        <RailActionButton
          accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.available)}
          disabled={offer.hasCurrentUserVoted}
          glyph="votePositive"
          label={t(OFFER_ACTION_LABEL_KEYS.available)}
          onPress={() => onVote(offer, 1)}
          showLabel={showCaptions}
          testID="rail-action-available"
        />
        <Pressable
          accessibilityLabel={t('offers.action.more')}
          accessibilityRole="button"
          accessibilityState={{ expanded: actionsExpanded }}
          onPress={() => setActionsExpanded((current) => !current)}
          style={styles.railAction}
          testID="offer-more-actions"
        >
          <View style={[styles.railButton, { backgroundColor: palette.panel }]}>
            <Text style={{ color: palette.ink, fontSize: 20, fontWeight: '700' }}>…</Text>
          </View>
          <Text style={[styles.railCaption, { color: immersiveInkMuted }]}>{t('offers.action.more')}</Text>
        </Pressable>
      </View>
      {actionsExpanded ? (
        <View style={[styles.morePanel, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          {!showCaptions ? (
            <>
              <RailActionButton
                accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.directions)}
                glyph="directions"
                label={t(OFFER_ACTION_LABEL_KEYS.directions)}
                onPress={() => void onDirections(offer)}
                prominent
                testID="rail-action-directions"
              />
              <RailActionButton
                accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.favorite)}
                glyph="favorite"
                label={t(OFFER_ACTION_LABEL_KEYS.favorite)}
                onPress={() => onFavorite(offer)}
                selected={offer.isFavorite}
                testID="rail-action-favorite"
              />
              <RailActionButton
                accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.comments)}
                glyph="comments"
                label={t(OFFER_ACTION_LABEL_KEYS.comments)}
                onPress={() => onComments(offer)}
                testID="rail-action-comments"
              />
            </>
          ) : null}
          <RailActionButton
            accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.available)}
            count={offer.positiveAvailabilityCount}
            disabled={offer.hasCurrentUserVoted}
            glyph="votePositive"
            label={t(OFFER_ACTION_LABEL_KEYS.available)}
            onPress={() => onVote(offer, 1)}
            testID="offer-available-button"
          />
          <RailActionButton
            accessibilityLabel={t('offers.action.unavailable')}
            count={offer.negativeAvailabilityCount}
            disabled={offer.hasCurrentUserVoted}
            glyph="voteNegative"
            label={t('offers.action.unavailable')}
            onPress={() => onVote(offer, 2)}
            testID="offer-unavailable-button"
          />
          <RailActionButton
            accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.report)}
            glyph="report"
            label={t(OFFER_ACTION_LABEL_KEYS.report)}
            onPress={() => onReport(offer)}
            testID="rail-action-report"
          />
        </View>
      ) : null}

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

  const feedAreaMeasured = useRef(false);

  function handleFeedAreaLayout(event: LayoutChangeEvent) {
    if (feedAreaMeasured.current) {
      return;
    }
    feedAreaMeasured.current = true;
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
          testID="immersive-feed-area"
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
                  showCaptions={shouldShowImmersiveCaptions(pageHeight, fontScale)}
                  showPhotoArrows={!isNarrow}
                  onDirections={onDirections}
                  onFavorite={onFavorite}
                  onComments={onComments}
                  onReport={onReport}
                  onVote={onVote}
                />
              </View>
            )}
            ListEmptyComponent={
              <ImmersiveEmptyState
                onWiden={() => onRadiusChange(Math.min(radiusMeters + 1000, 10000))}
              />
            }
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
    backgroundColor: immersiveScrim,
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
    minHeight: platformTouchFloor,
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  railDivider: {
    backgroundColor: immersiveDivider,
    height: 1,
    marginVertical: 2,
    width: 28,
  },
  railCount: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  railCaption: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  rightRail: {
    alignItems: 'center',
    bottom: 140,
    gap: 12,
    position: 'absolute',
    right: 10,
  },
  rightRailWithCaptions: {
    right: 16,
  },
  morePanel: {
    borderWidth: 1,
    borderRadius: 18,
    bottom: 220,
    gap: 8,
    padding: 10,
    position: 'absolute',
    right: 84,
    zIndex: 4,
  },
  morePanelLabel: {
    fontSize: 11,
    fontWeight: '700',
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
    color: immersiveInk,
    fontFamily: landmarkFontFamily(),
    fontSize: 18,
    fontWeight: '700',
  },
  distance: {
    color: immersiveInk,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  description: {
    color: immersiveInk,
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
    color: immersiveInk,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  tag: {
    backgroundColor: immersiveTagSurface,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagLabel: {
    color: immersiveInk,
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    color: immersiveInk,
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
  emptyState: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyTitle: {
    fontFamily: landmarkFontFamily(),
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyAction: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: platformTouchFloor,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyActionLabel: {
    fontSize: 15,
    fontWeight: '800',
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
    backgroundColor: immersivePhotoNav,
    borderRadius: 999,
    height: platformTouchFloor,
    justifyContent: 'center',
    width: platformTouchFloor,
  },
  immersivePhotoNavLabel: {
    color: immersiveInk,
    fontSize: 20,
    fontWeight: '700',
  },
  immersivePhotoDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  immersivePhotoDot: {
    backgroundColor: immersiveDot,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  immersivePhotoDotActive: {
    backgroundColor: immersiveInk,
    height: 10,
    width: 10,
  },
});
