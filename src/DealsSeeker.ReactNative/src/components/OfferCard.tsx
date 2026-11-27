import { landmarkFontFamily } from '../utils/typography';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { memo, useEffect, useState } from 'react';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { useApp } from '../hooks/useApp';
import { isSvgImageUri } from '../utils/images';
import { immersiveInk } from '../utils/theme';
import { ImmersiveActionIconGlyph } from './ImmersiveActionGlyphs';
import { formatDistanceMeters, shorten } from '../utils/format';

interface OfferCardProps {
  offer: OfferItemDto;
  query: string;
  onFavorite: (offer: OfferItemDto) => void;
  onVote: (offer: OfferItemDto, vote: OfferAvailabilityVoteType) => void;
  onReport: (offer: OfferItemDto) => void;
  onDirections: (offer: OfferItemDto) => void;
  onOpenDetail: (offer: OfferItemDto) => void;
  onComments: (offer: OfferItemDto) => void;
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
            style={highlighted ? { backgroundColor: palette.accentMuted, color: palette.accentText } : undefined}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

function OfferCardRow({
  offer,
  onComments,
  onDirections,
  onFavorite,
  onOpenDetail,
  onReport,
  onVote,
  query,
}: OfferCardProps) {
  const { palette, preferences, t } = useApp();
  const { width } = useWindowDimensions();
  const stackActions = width < 720;
  const imageUri = useOfferImageUri(offer.imageUrl);
  const canRenderImage = Boolean(imageUri) && !isSvgImageUri(imageUri);
  const [imageFailed, setImageFailed] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setMaintenanceOpen(false);
  }, [imageUri, offer.offerId]);

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
      <Pressable
        accessibilityLabel={t('offers.openDetail')}
        accessibilityRole="button"
        style={[styles.visual, { backgroundColor: palette.accentMuted }]}
        onPress={() => onOpenDetail(offer)}
        onLongPress={() => onOpenDetail(offer)}
      >
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
            <View style={[styles.badge, { backgroundColor: palette.highlight }]}>
              <Text style={[styles.badgeLabel, { color: palette.onHighlight }]}>{t('offers.promoted')}</Text>
            </View>
          ) : null}
          {offer.isReported ? (
            <View style={[styles.badge, { backgroundColor: palette.danger }]}>
              <Text style={[styles.badgeLabel, { color: palette.onDanger }]}>{t('offers.reported')}</Text>
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

        <View style={[styles.actions, stackActions && styles.actionsStacked]}>
          <Pressable
            accessibilityLabel={t('offers.favorite')}
            accessibilityRole="button"
            accessibilityState={{ selected: offer.isFavorite }}
            style={[styles.actionButton, !stackActions && styles.actionButtonRow, { backgroundColor: offer.isFavorite ? palette.accentMuted : palette.panel }]}
            onPress={() => onFavorite(offer)}
          >
            <Text style={[styles.actionLabel, { color: offer.isFavorite ? palette.accentText : palette.ink }]}>
              {t('offers.favorite')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
            accessibilityRole="button"
            style={[styles.actionButton, !stackActions && styles.actionButtonRow, { backgroundColor: palette.panel }]}
            onPress={() => onDirections(offer)}
          >
            <Text style={[styles.actionLabel, { color: palette.ink }]}>
              {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('offers.action.comments')}
            accessibilityRole="button"
            style={[styles.actionButton, !stackActions && styles.actionButtonRow, { backgroundColor: palette.panel }]}
            onPress={() => onComments(offer)}
          >
            <Text style={[styles.actionLabel, { color: palette.ink }]}>{t('offers.action.comments')}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel={t('offers.cardMoreActions')}
          accessibilityRole="button"
          accessibilityState={{ expanded: maintenanceOpen }}
          onPress={() => setMaintenanceOpen((current) => !current)}
          style={[styles.actionButton, { backgroundColor: palette.panelAlt }]}
          testID="offer-card-more"
        >
          <Text style={[styles.actionLabel, { color: palette.ink }]}>{t('offers.cardMoreActions')}</Text>
        </Pressable>
        {maintenanceOpen ? (
          <View style={[styles.voteSection, { borderColor: palette.border }]}>
            <Text style={[styles.meta, { color: palette.ink }]}>{t('offers.available')}</Text>
            <View style={styles.voteRow}>
            <Pressable
              accessibilityLabel={`${t('offers.action.available')} ${offer.positiveAvailabilityCount}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: offer.hasCurrentUserVoted }}
              disabled={offer.hasCurrentUserVoted}
              onPress={() => onVote(offer, 1)}
              style={[
                styles.voteButton,
                { backgroundColor: palette.panel },
                offer.hasCurrentUserVoted && styles.disabled,
              ]}
            >
              <View style={styles.voteContent}>
                <ImmersiveActionIconGlyph kind="votePositive" />
                <Text style={{ color: palette.ink }}>{offer.positiveAvailabilityCount}</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityLabel={`${t('offers.action.unavailable')} ${offer.negativeAvailabilityCount}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: offer.hasCurrentUserVoted }}
              disabled={offer.hasCurrentUserVoted}
              onPress={() => onVote(offer, 2)}
              style={[
                styles.voteButton,
                { backgroundColor: palette.panel },
                offer.hasCurrentUserVoted && styles.disabled,
              ]}
            >
              <View style={styles.voteContent}>
                <ImmersiveActionIconGlyph kind="voteNegative" />
                <Text style={{ color: palette.ink }}>{offer.negativeAvailabilityCount}</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityLabel={t('offers.report')}
              accessibilityRole="button"
              style={[styles.voteButton, { backgroundColor: palette.panel }]}
              onPress={() => onReport(offer)}
            >
              <Text style={{ color: palette.ink }}>{t('offers.report')}</Text>
            </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const OfferCard = memo(OfferCardRow);

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    elevation: 8,
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
    color: immersiveInk,
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    gap: 10,
    padding: 16,
  },
  businessName: {
    fontFamily: landmarkFontFamily(),
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
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
  actionsStacked: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtonRow: {
    flex: 1,
  },
  actionLabel: {
    fontWeight: '700',
    textAlign: 'center',
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
  voteContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  voteButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.45,
  },
});
