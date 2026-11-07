import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { isSvgImageUri } from '../utils/images';
import { formatDistanceMeters, shorten } from '../utils/format';
import { openDirections } from '../utils/maps';
import { MapPreview } from './MapPreview';

interface ImmersiveOfferFeedProps {
  offers: OfferItemDto[];
  businesses: any[];
  userLocation: { lat: number; lng: number };
  onRadiusChange: (radiusMeters: number) => void;
  radiusMeters: number;
  query: string;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onOpenDetail: (offer: OfferItemDto) => void;
  onSearch: (query: string) => void;
  onBack: () => void;
}

function ImmersiveOfferPage({
  offer,
  onFavorite,
  onVote,
  onReport,
  onDirections,
  onOpenDetail,
}: {
  offer: OfferItemDto;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onOpenDetail: (offer: OfferItemDto) => void;
}) {
  const { palette, preferences, t } = useApp();
  const imageUri = useOfferImageUri(offer.imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);
  const [imageFailed, setImageFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.page}>
      {canRenderImage && !imageFailed ? (
        <Image
          resizeMode="contain"
          source={{ uri: imageUri ?? undefined }}
          style={styles.backgroundImage}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[styles.backgroundImage, { backgroundColor: '#2a2a2a' }]} />
      )}

      <View style={styles.overlay} />

      <View style={styles.rightRail}>
        <Pressable style={styles.railButton} onPress={() => onFavorite(offer)}>
          <Text style={styles.railButtonText}>{t('offers.favorite')}</Text>
        </Pressable>
        <Pressable style={styles.railButton} onPress={() => void onDirections(offer)}>
          <Text style={styles.railButtonText}>
            {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
          </Text>
        </Pressable>
        <Pressable
          disabled={offer.hasCurrentUserVoted}
          style={[styles.railButton, offer.hasCurrentUserVoted && styles.disabled]}
          onPress={() => onVote(offer, 1)}
        >
          <Text style={styles.railButtonText}>👍 {offer.positiveAvailabilityCount}</Text>
        </Pressable>
        <Pressable
          disabled={offer.hasCurrentUserVoted}
          style={[styles.railButton, offer.hasCurrentUserVoted && styles.disabled]}
          onPress={() => onVote(offer, 2)}
        >
          <Text style={styles.railButtonText}>👎 {offer.negativeAvailabilityCount}</Text>
        </Pressable>
        <Pressable style={styles.railButton} onPress={() => onReport(offer)}>
          <Text style={styles.railButtonText}>{t('offers.report')}</Text>
        </Pressable>
        <Pressable style={styles.railButton} onPress={() => onOpenDetail(offer)}>
          <Text style={styles.railButtonText}>{t('offers.details')}</Text>
        </Pressable>
      </View>

      <View style={styles.bottomOverlay}>
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
          <View style={styles.tags}>
            {offer.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagLabel}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable onPress={() => setExpanded((current) => !current)}>
          <Text style={styles.moreButton}>{expanded ? t('common.back') : t('offers.more')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ImmersiveOfferFeed({
  offers,
  businesses,
  onRadiusChange,
  userLocation,
  radiusMeters,
  query,
  onFavorite,
  onVote,
  onReport,
  onDirections,
  onOpenDetail,
  onSearch,
  onBack,
}: ImmersiveOfferFeedProps) {
  const { height } = useWindowDimensions();
  const {
    closeImmersiveMap,
    closeImmersiveOffers,
    immersiveMapVisible,
    openFavorites,
    openImmersiveMap,
    openTab,
    palette,
    preferences,
    setLanguage,
    setNavigationMode,
    setThemeMode,
    t,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState(query);
  const pageHeight = Math.max(320, height);

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.appName}>{t('app.title')}</Text>
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
          {[500, 1000, 1500, 2500, 5000].map((option) => (
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
        <Pressable style={styles.leftButton} onPress={openImmersiveMap}>
          <Text style={styles.leftButtonText}>🗺️ {t('offers.map')}</Text>
        </Pressable>
        <Pressable style={styles.leftButton} onPress={openFavorites}>
          <Text style={styles.leftButtonText}>⭐ {t('nav.favorites')}</Text>
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
        <Pressable style={styles.leftButton} onPress={closeImmersiveOffers}>
          <Text style={styles.leftButtonText}>↩️ {t('common.back')}</Text>
        </Pressable>
      </View>

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
              onDirections={onDirections}
              onFavorite={onFavorite}
              onOpenDetail={onOpenDetail}
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

      <Modal visible={immersiveMapVisible} animationType="slide" onRequestClose={closeImmersiveMap}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('offers.map')}</Text>
            <Pressable onPress={closeImmersiveMap}>
              <Text style={styles.topButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <MapPreview
            businesses={businesses}
            center={userLocation}
            onSelectMarker={(marker) => void onDirections(marker as any)}
            radiusMeters={radiusMeters}
          />
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  topBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  topButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topButtonText: {
    color: '#fff',
    fontWeight: '700',
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
  railButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  railButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rightRail: {
    gap: 10,
    position: 'absolute',
    right: 12,
    top: '25%',
    width: 100,
  },
  bottomOverlay: {
    bottom: 16,
    left: 12,
    position: 'absolute',
    right: 120,
  },
  businessName: {
    color: '#fff',
    fontSize: 24,
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
    borderRadius: 999,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
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
  modal: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
});