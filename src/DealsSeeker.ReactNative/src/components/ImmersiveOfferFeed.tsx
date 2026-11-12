import { FlatList, Image, LayoutChangeEvent, PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { isSvgImageUri, resolveOfferImageUri } from '../utils/images';
import { formatDistanceMeters, shorten } from '../utils/format';
import { openDirections } from '../utils/maps';
import { ImmersiveActionCaption, ImmersiveActionIconGlyph, ImmersiveFooterBar } from './ImmersiveFooterBar';
import { ImmersiveFeedTab, ImmersiveFeedTabs } from './ImmersiveFeedTabs';
import { COVERAGE_DISTANCE_OPTIONS, ImmersiveSearchOverlay } from './ImmersiveSearchOverlay';

const NARROW_BREAKPOINT = 768;

interface ImmersiveOfferFeedProps {
  offers: OfferItemDto[];
  onRadiusChange: (radiusMeters: number) => void;
  radiusMeters: number;
  query: string;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onSearch: (query: string) => void;
  feedTab: ImmersiveFeedTab;
  onFeedTabChange: (tab: ImmersiveFeedTab) => void;
}

function ImmersiveOfferImage({ imageUrl, placeholderSymbol }: { imageUrl: string; placeholderSymbol: string }) {
  const imageUri = useOfferImageUri(imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);
  const [imageFailed, setImageFailed] = useState(false);

  if (canRenderImage && !imageFailed) {
    return (
      <Image
        resizeMode="contain"
        source={{ uri: imageUri ?? undefined }}
        style={styles.backgroundImage}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View style={[styles.backgroundImage, { alignItems: 'center', backgroundColor: '#2a2a2a', justifyContent: 'center' }]}>
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
}: {
  offer: OfferItemDto;
  showCaptions: boolean;
  showPhotoArrows: boolean;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
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

  useEffect(() => {
    if (!hasMultipleImages || Platform.OS !== 'web') {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        showPreviousImage();
      } else if (event.key === 'ArrowRight') {
        showNextImage();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasMultipleImages, selectedImageIndex, carouselWidth, images.length]);

  return (
    <View style={styles.page} onLayout={handlePageLayout}>
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
          accessibilityLabel={t('offers.action.favorite')}
          accessibilityRole="button"
          style={styles.railAction}
          onPress={() => onFavorite(offer)}
        >
          <View style={styles.railButton}>
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
          <View style={styles.railButton}>
            <ImmersiveActionIconGlyph kind="directions" />
          </View>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.directions')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.available')}
          accessibilityRole="button"
          disabled={offer.hasCurrentUserVoted}
          style={[styles.railAction, offer.hasCurrentUserVoted && styles.disabled]}
          onPress={() => onVote(offer, 1)}
        >
          <View style={styles.railButton}>
            <ImmersiveActionIconGlyph kind="votePositive" />
          </View>
          <Text style={styles.railCount}>{offer.positiveAvailabilityCount}</Text>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.available')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.unavailable')}
          accessibilityRole="button"
          disabled={offer.hasCurrentUserVoted}
          style={[styles.railAction, offer.hasCurrentUserVoted && styles.disabled]}
          onPress={() => onVote(offer, 2)}
        >
          <View style={styles.railButton}>
            <ImmersiveActionIconGlyph kind="voteNegative" />
          </View>
          <Text style={styles.railCount}>{offer.negativeAvailabilityCount}</Text>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.unavailable')} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('offers.action.report')}
          accessibilityRole="button"
          style={styles.railAction}
          onPress={() => onReport(offer)}
        >
          <View style={styles.railButton}>
            <ImmersiveActionIconGlyph kind="report" />
          </View>
          {showCaptions ? <ImmersiveActionCaption label={t('offers.action.report')} /> : null}
        </Pressable>
      </View>

      <View style={styles.bottomOverlay}>
        {hasMultipleImages ? (
          <View pointerEvents="box-none" style={styles.immersivePhotoNav}>
            {showPhotoArrows ? (
              <Pressable accessibilityLabel={t('offers.previousImage')} onPress={showPreviousImage} style={styles.immersivePhotoNavButton}>
                <Text style={styles.immersivePhotoNavLabel}>‹</Text>
              </Pressable>
            ) : null}
            <View style={styles.immersivePhotoDots}>
              {images.map((_, index) => (
                <Pressable
                  key={`photo-dot-${index}`}
                  onPress={() => updateSelectedImage(index)}
                  style={[
                    styles.immersivePhotoDot,
                    index === selectedImageIndex ? styles.immersivePhotoDotActive : null,
                  ]}
                />
              ))}
            </View>
            {showPhotoArrows ? (
              <Pressable accessibilityLabel={t('offers.nextImage')} onPress={showNextImage} style={styles.immersivePhotoNavButton}>
                <Text style={styles.immersivePhotoNavLabel}>›</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <View style={[styles.bottomOverlayText, showCaptions && styles.bottomOverlayTextWithCaptions]}>
          {offer.isPromoted ? (
            <View style={[styles.badge, { backgroundColor: palette.accent }]}>
              <Text style={styles.badgeLabel}>{t('offers.promoted')}</Text>
            </View>
          ) : null}
          {offer.isReported ? (
            <View style={[styles.badge, { backgroundColor: palette.danger }]}>
              <Text style={styles.badgeLabel}>{t('offers.reported')}</Text>
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
  onSearch,
  feedTab,
  onFeedTabChange,
}: ImmersiveOfferFeedProps) {
  const { height, width } = useWindowDimensions();
  const {
    closeImmersiveOffers,
    openAddOffer,
    openTab,
    palette,
    t,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchVisible, setSearchVisible] = useState(false);
  const [feedHeight, setFeedHeight] = useState(0);
  const isNarrow = width < NARROW_BREAKPOINT;
  const pageHeight = Math.max(320, feedHeight || height);

  function handleFeedAreaLayout(event: LayoutChangeEvent) {
    setFeedHeight(event.nativeEvent.layout.height);
  }

  function handleCreateOffer() {
    closeImmersiveOffers();
    openAddOffer();
  }

  function handleOpenMapMode() {
    closeImmersiveOffers();
    openTab('offers');
  }

  function handleApplySearch() {
    onSearch(searchQuery);
    setSearchVisible(false);
  }

  const leftPanel = (
    <View style={styles.leftPanel}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.appName}>{t('app.title')}</Text>
      <ImmersiveFeedTabs activeTab={feedTab} onChangeTab={onFeedTabChange} variant="panel" />
      <TextInput
        onSubmitEditing={() => onSearch(searchQuery)}
        placeholder={t('offers.searchPlaceholder')}
        placeholderTextColor="#aaa"
        returnKeyType="search"
        style={styles.leftInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.radiusRow}>
        {COVERAGE_DISTANCE_OPTIONS.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.radiusChip,
              {
                backgroundColor: option === radiusMeters ? '#ffffff' : 'rgba(255,255,255,0.18)',
              },
            ]}
            onPress={() => onRadiusChange(option)}
          >
            <Text style={{ color: option === radiusMeters ? '#000000' : '#ffffff', fontSize: 11, fontWeight: '700' }}>
              {option} m
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.leftButton} onPress={handleOpenMapMode}>
        <Text style={styles.leftButtonText}>🗺️ {t('offers.mapMode')}</Text>
      </Pressable>
      <Pressable style={styles.leftButton} onPress={() => openTab('account')}>
        <Text style={styles.leftButtonText}>👤 {t('nav.account')}</Text>
      </Pressable>
      <Pressable style={styles.leftButton} onPress={() => openTab('suggestions')}>
        <Text style={styles.leftButtonText}>✏️ {t('nav.suggestions')}</Text>
      </Pressable>
      <Pressable style={styles.leftButton} onPress={() => openTab('reports')}>
        <Text style={styles.leftButtonText}>🚩 {t('nav.reports')}</Text>
      </Pressable>
      <Pressable style={styles.leftButton} onPress={handleCreateOffer}>
        <Text style={styles.leftButtonText}>➕ {t('nav.createOffer')}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        {isNarrow ? null : leftPanel}

        <View onLayout={handleFeedAreaLayout} style={styles.feedArea}>
          <FlatList
            style={{ flex: 1 }}
            data={offers}
            keyExtractor={(item) => item.offerId}
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
                  showCaptions={!isNarrow}
                  showPhotoArrows={!isNarrow}
                  onDirections={onDirections}
                  onFavorite={onFavorite}
                  onReport={onReport}
                  onVote={onVote}
                />
              </View>
            )}
            ListEmptyComponent={
              <View style={[styles.empty, { height: pageHeight }]}>
                <Text style={{ color: palette.inkMuted }}>{t('offers.noResults')}</Text>
              </View>
            }
          />

          {isNarrow ? (
            <View pointerEvents="box-none" style={styles.topBar}>
              <Image source={require('../../assets/icon.png')} style={styles.topBarLogo} />
              <ImmersiveFeedTabs activeTab={feedTab} onChangeTab={onFeedTabChange} />
              <Pressable
                accessibilityLabel={t('offers.search')}
                accessibilityRole="button"
                onPress={() => setSearchVisible(true)}
                style={styles.searchIconButton}
              >
                <Text style={styles.searchIcon}>🔍</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      {isNarrow ? (
        <ImmersiveFooterBar
          onCreateOffer={handleCreateOffer}
          onOpenAccount={() => openTab('account')}
          onOpenMapMode={handleOpenMapMode}
          onOpenReports={() => openTab('reports')}
          onOpenSuggestions={() => openTab('suggestions')}
        />
      ) : null}

      <ImmersiveSearchOverlay
        onChangeQuery={setSearchQuery}
        onChangeRadius={onRadiusChange}
        onClose={() => setSearchVisible(false)}
        onSearch={handleApplySearch}
        query={searchQuery}
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  topBarLogo: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    height: 40,
    resizeMode: 'contain',
    width: 40,
  },
  searchIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    color: '#fff',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  page: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    backgroundColor: '#2a2a2a',
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
  leftPanel: {
    backgroundColor: '#000000',
    gap: 8,
    padding: 12,
    width: 220,
  },
  logo: {
    height: 48,
    resizeMode: 'contain',
    width: 48,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  radiusChip: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  leftInput: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  leftButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  leftButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  appName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  railAction: {
    alignItems: 'center',
    gap: 2,
  },
  railButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  railCount: {
    color: '#fff',
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
    color: '#fff',
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
    height: 32,
    justifyContent: 'center',
    width: 32,
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