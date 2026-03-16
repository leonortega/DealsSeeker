import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { useApp } from '../hooks/useApp';
import { isSvgImageUri } from '../utils/images';
import { formatDistanceMeters, shorten } from '../utils/format';

interface OfferCardProps {
  offer: OfferItemDto;
  query: string;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onOpenDetail: (offer: OfferItemDto) => void;
}

function HighlightedDescription({ description, query }: { description: string; query: string }) {
  const { palette } = useApp();
  const words = Array.from(
    new Set(query.split(/\s+/u).map((word) => word.trim()).filter(Boolean))
  );

  if (words.length === 0) {
    return <Text style={[styles.description, { color: palette.ink }]}>{shorten(description)}</Text>;
  }

  const reduced = shorten(description);
  const parts = reduced.split(new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('|')})`, 'giu'));

  return (
    <Text style={[styles.description, { color: palette.ink }]}>
      {parts.map((part, index) => {
        const highlighted = words.some((word) => part.toLowerCase() === word.toLowerCase());
        return (
          <Text
            key={`${part}-${index}`}
            style={highlighted ? { backgroundColor: palette.accentMuted, color: palette.accent } : undefined}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

export function OfferCard({
  offer,
  onDirections,
  onFavorite,
  onOpenDetail,
  onReport,
  onVote,
  query,
}: OfferCardProps) {
  const { palette, preferences, t } = useApp();
  const imageUri = useOfferImageUri(offer.imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri, offer.offerId]);

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
      <Pressable style={[styles.visual, { backgroundColor: palette.accentMuted }]} onPress={() => onOpenDetail(offer)}>
        {canRenderImage && !imageFailed ? (
          <Image
            resizeMode="cover"
            source={{ uri: imageUri ?? undefined }}
            style={styles.visualImage}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.visualPlaceholder}>
            <Text style={styles.visualEmoji}>{offer.imageUrls.length > 1 ? '▣' : '▤'}</Text>
          </View>
        )}
        <View style={styles.badgeRow}>
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
        </View>
        <View style={styles.visualMeta}>
          <View style={[styles.metaChip, { backgroundColor: palette.overlay }]}>
            <Text style={styles.metaChipLabel}>{formatDistanceMeters(offer.distanceMeters)}</Text>
          </View>
          {offer.imageUrls.length > 1 ? (
            <View style={[styles.metaChip, { backgroundColor: palette.overlay }]}>
              <Text style={styles.metaChipLabel}>{offer.imageUrls.length}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.businessName, { color: palette.ink }]}>{offer.businessName}</Text>
        <HighlightedDescription description={offer.description} query={query} />

        {offer.tags.length > 0 ? (
          <View style={styles.tags}>
            {offer.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: palette.panel, borderColor: palette.border }]}>
                <Text style={[styles.tagLabel, { color: palette.inkMuted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={[styles.meta, { color: palette.inkMuted }]}>
          {t('offers.distance')}: {formatDistanceMeters(offer.distanceMeters)}
        </Text>
        {offer.isReported ? (
          <Text style={[styles.warning, { color: palette.danger }]}>{t('offers.reportedWarning')}</Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: offer.isFavorite ? palette.accentMuted : palette.panel }]}
            onPress={() => onFavorite(offer)}
          >
            <Text style={{ color: offer.isFavorite ? palette.accent : palette.ink }}>{t('offers.favorite')}</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: palette.panel }]} onPress={() => onDirections(offer)}>
            <Text style={{ color: palette.ink }}>
              {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.voteSection, { borderColor: palette.border }]}>
          <Text style={[styles.meta, { color: palette.ink }]}>{t('offers.available')}</Text>
          <View style={styles.voteRow}>
            <Pressable
              disabled={offer.hasCurrentUserVoted}
              onPress={() => onVote(offer, 1)}
              style={[
                styles.voteButton,
                { backgroundColor: palette.panel },
                offer.hasCurrentUserVoted && styles.disabled,
              ]}
            >
              <Text style={{ color: palette.ink }}>👍 {offer.positiveAvailabilityCount}</Text>
            </Pressable>
            <Pressable
              disabled={offer.hasCurrentUserVoted}
              onPress={() => onVote(offer, 2)}
              style={[
                styles.voteButton,
                { backgroundColor: palette.panel },
                offer.hasCurrentUserVoted && styles.disabled,
              ]}
            >
              <Text style={{ color: palette.ink }}>👎 {offer.negativeAvailabilityCount}</Text>
            </Pressable>
            <Pressable style={[styles.voteButton, { backgroundColor: palette.panel }]} onPress={() => onReport(offer)}>
              <Text style={{ color: palette.ink }}>{t('offers.report')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  visual: {
    height: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 14,
    position: 'relative',
  },
  visualImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  visualPlaceholder: {
    alignItems: 'flex-start',
    bottom: 0,
    justifyContent: 'flex-start',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  visualEmoji: {
    fontSize: 48,
    opacity: 0.35,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  visualMeta: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChipLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    gap: 10,
    padding: 16,
  },
  businessName: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
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
  tagLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    fontWeight: '700',
  },
  warning: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  voteSection: {
    borderTopWidth: 1,
    gap: 10,
    paddingTop: 12,
  },
  voteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voteButton: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.45,
  },
});
