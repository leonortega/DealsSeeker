import {
  FlatList,
  Image,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { isSvgImageUri, resolveOfferImageUri } from '../utils/images';
import { formatDistanceMeters, shorten } from '../utils/format';
import { resolveFeedRestoreIndex } from '../utils/feedPosition';
import { platformTouchFloor } from '../utils/layout';
import { openDirections } from '../utils/maps';
import {
  ensureMinContrast,
  immersiveDivider,
  immersiveDot,
  immersiveInk,
  immersiveInkMuted,
  immersivePhotoNav,
  immersiveScrim,
  immersiveTagSurface,
} from '../utils/theme';
import { ImmersiveActionIconGlyph } from './ImmersiveActionGlyphs';
import { OFFER_ACTION_LABEL_KEYS } from './OfferActionVocabulary';
import { ImmersiveFeedTab, ImmersiveFeedTabs } from './ImmersiveFeedTabs';
import { ImmersiveSearchOverlay } from './ImmersiveSearchOverlay';
import { OfferTopBar } from './OfferTopBar';
import { PlatformTabIcon } from './PlatformTabIcon';

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
      <Text variant="headlineSmall" style={{ color: palette.ink }}>
        {t('offers.emptyTitle')}
      </Text>
      <Text variant="bodyMedium" style={{ color: palette.inkMuted }}>
        {t('offers.emptyHint')}
      </Text>
      <Button
        accessibilityLabel={t('offers.createFirstOffer')}
        accessibilityRole="button"
        buttonColor={palette.accent}
        mode="contained"
        onPress={() => {
          if (isAuthenticated) {
            openAddOffer();
          }
        }}
        style={styles.emptyAction}
        textColor={palette.onAccent}
      >
        {t('offers.createFirstOffer')}
      </Button>
      <Button
        accessibilityLabel={t('offers.widenSearch')}
        accessibilityRole="button"
        mode="text"
        onPress={onWiden}
        style={styles.emptyAction}
        textColor={palette.accentText}
      >
        {t('offers.widenSearch')}
      </Button>
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
  const theme = useTheme();
  const glyphIcon = () => <ImmersiveActionIconGlyph active={selected} kind={glyph} prominent={prominent} />;

  return (
    <TouchableRipple
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      rippleColor={theme.colors.primary}
      style={[styles.railAction, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={styles.railActionContent}>
        <View
          testID={prominent ? 'rail-primary-action' : 'rail-secondary-action'}
          style={[styles.railButton, { backgroundColor: prominent ? ensureMinContrast(palette.accent, palette.backdrop, 3) : palette.panel }]}
        >
          <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
            {prominent ? (
              <Button children={null} icon={glyphIcon} onPress={onPress} style={styles.railM3Button} />
            ) : (
              <IconButton disabled={disabled} icon={glyphIcon} onPress={onPress} style={styles.railM3Button} />
            )}
          </View>
        </View>
        {count === undefined ? null : (
          <Text variant="labelSmall" style={[styles.railCount, { color: immersiveInkMuted }]}>
            {count}
          </Text>
        )}
        {showLabel ? (
          <Text variant="labelSmall" style={[styles.railCaption, { color: immersiveInkMuted }]}>
            {label}
          </Text>
        ) : null}
      </View>
    </TouchableRipple>
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
  searchAccelerators?: ReactNode;
  selectionMode?: boolean;
  selectedOfferIds?: string[];
  onToggleSelection?: (offerId: string) => void;
  onSelectMode?: () => void;
  onExitSelection?: () => void;
}

function ImmersiveOfferImage({ imageUrl }: { imageUrl: string }) {
  const { palette, t } = useApp();
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
      <View
        style={[styles.placeholderPanel, { backgroundColor: palette.panel, borderColor: palette.border }]}
      >
        <Text variant="labelSmall" style={{ color: palette.inkMuted }}>
          {t('add.photoPlaceholder')}
        </Text>
      </View>
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
  selectionMode = false,
  selected = false,
  onToggleSelection,
}: {
  offer: OfferItemDto;
  showCaptions: boolean;
  showPhotoArrows: boolean;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onComments: (offer: OfferItemDto) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelection?: (offerId: string) => void;
}) {
  const { palette, t } = useApp();
  const theme = useTheme();
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
      {selectionMode ? (
        <TouchableRipple
          accessibilityLabel={`${t('offers.select')} ${offer.businessName}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          onPress={() => onToggleSelection?.(offer.offerId)}
          rippleColor={theme.colors.primary}
          style={styles.selectionToggle}
          testID="immersive-selection-toggle"
        >
          <Text variant="labelLarge" style={{ color: immersiveInk }}>
            {selected ? '✓' : '○'}
          </Text>
        </TouchableRipple>
      ) : null}
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
              <ImmersiveOfferImage imageUrl={imageUrl} />
            </View>
          ))}
        </View>
      ) : (
        <ImmersiveOfferImage imageUrl={images[0] ?? offer.imageUrl} />
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
        <IconButton
          accessibilityLabel={t('offers.action.more')}
          accessibilityRole="button"
          accessibilityState={{ expanded: actionsExpanded }}
          icon={() => (
            <View>
              <View style={[styles.railButton, { backgroundColor: palette.panel }]}>
                <Text variant="titleLarge" style={{ color: palette.ink }}>
                  …
                </Text>
              </View>
              <Text variant="labelSmall" style={[styles.railCaption, { color: immersiveInkMuted }]}>
                {t('offers.action.more')}
              </Text>
            </View>
          )}
          onPress={() => setActionsExpanded((current) => !current)}
          style={styles.railAction}
          testID="offer-more-actions"
        />
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
              <IconButton
                accessibilityLabel={t('offers.previousImage')}
                accessibilityRole="button"
                contentStyle={styles.immersivePhotoNavTouchable}
                icon={() => <PlatformTabIcon color={immersiveInk} name="chevronBackward" size={24} />}
                onPress={showPreviousImage}
                size={24}
                style={styles.immersivePhotoNavButton}
              />
            ) : null}
            <View style={styles.immersivePhotoDots}>
              {images.map((_, index) => (
                <TouchableRipple
                  key={`photo-dot-${index}`}
                  accessibilityLabel={`${t('offers.goToImage')} ${index + 1}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === selectedImageIndex }}
                  hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
                  onPress={() => updateSelectedImage(index)}
                  rippleColor={theme.colors.primary}
                  style={[
                    styles.immersivePhotoDot,
                    index === selectedImageIndex ? styles.immersivePhotoDotActive : null,
                  ]}
                >
                  <View style={styles.immersivePhotoDotFill} />
                </TouchableRipple>
              ))}
            </View>
            {showPhotoArrows ? (
              <IconButton
                accessibilityLabel={t('offers.nextImage')}
                accessibilityRole="button"
                contentStyle={styles.immersivePhotoNavTouchable}
                icon={() => <PlatformTabIcon color={immersiveInk} name="chevronForward" size={24} />}
                onPress={showNextImage}
                size={24}
                style={styles.immersivePhotoNavButton}
              />
            ) : null}
          </View>
        ) : null}
        <View style={[styles.bottomOverlayText, showCaptions && styles.bottomOverlayTextWithCaptions]}>
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
          <Text variant="titleLarge" style={styles.businessName}>
            {offer.businessName}
          </Text>
          <Text variant="labelMedium" style={styles.distance}>
            {t('offers.distance')}: {formatDistanceMeters(offer.distanceMeters)}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {expanded ? offer.description : shorten(offer.description, 100)}
          </Text>
          {offer.tags.length > 0 && expanded ? (
            <Text variant="bodySmall" style={styles.tagsText}>
              {offer.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          ) : null}
          {!expanded ? (
            <TouchableRipple onPress={() => setExpanded(true)} rippleColor={theme.colors.primary}>
              <Text variant="labelLarge" style={styles.moreButton}>
                {t('offers.more')}
              </Text>
            </TouchableRipple>
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
  searchAccelerators,
  selectionMode = false,
  selectedOfferIds = [],
  onToggleSelection,
  onSelectMode,
  onExitSelection,
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
      {searchAccelerators ? (
        <View pointerEvents="box-none" style={styles.acceleratorsOverlay} testID="immersive-search-accelerators">
          {searchAccelerators}
        </View>
      ) : null}
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
                  selectionMode={selectionMode}
                  selected={selectedOfferIds.includes(item.offerId)}
                  onToggleSelection={onToggleSelection}
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
            {selectionMode ? (
              <Button
                accessibilityLabel={t('offers.batchDone')}
                accessibilityRole="button"
                mode="text"
                onPress={onExitSelection}
                style={styles.selectionExit}
                textColor={immersiveInk}
              >
                {t('offers.batchDone')}
              </Button>
            ) : (
              <Button
                accessibilityLabel={t('offers.select')}
                accessibilityRole="button"
                mode="text"
                onPress={onSelectMode}
                style={styles.selectionExit}
                textColor={immersiveInk}
              >
                {t('offers.select')}
              </Button>
            )}
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
  acceleratorsOverlay: {
    left: 12,
    maxHeight: 200,
    position: 'absolute',
    right: 12,
    top: 150,
    zIndex: 4,
  },
  selectionExit: {
    alignSelf: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectionToggle: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
    position: 'absolute',
    right: 12,
    top: 150,
    zIndex: 3,
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
  placeholderPanel: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
  },
  railActionContent: {
    alignItems: 'center',
    gap: 2,
  },
  railM3Button: {
    margin: 0,
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
    marginTop: 2,
  },
  railCaption: {
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
  },
  distance: {
    color: immersiveInk,
    marginTop: 4,
  },
  description: {
    color: immersiveInk,
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
    marginTop: 8,
  },
  tag: {
    backgroundColor: immersiveTagSurface,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreButton: {
    color: immersiveInk,
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
    textAlign: 'center',
  },
  emptyHint: {
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
    backgroundColor: immersivePhotoNav,
    borderRadius: 999,
    height: platformTouchFloor,
    width: platformTouchFloor,
  },
  immersivePhotoNavTouchable: {
    height: platformTouchFloor,
    width: platformTouchFloor,
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
  immersivePhotoDotFill: {
    borderRadius: 999,
    height: '100%',
    width: '100%',
  },
});
