import { platformTouchFloor } from '../utils/layout';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Badge, Button, Card, Chip, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { memo, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { OfferAvailabilityVoteType, OfferItemDto } from '../api/types';
import { useOfferImageUri } from '../hooks/useOfferImageUri';
import { useApp } from '../hooks/useApp';
import { isSvgImageUri } from '../utils/images';
import { immersiveInk } from '../utils/theme';
import { ImmersiveActionIconGlyph } from './ImmersiveActionGlyphs';
import { OfferActionGlyph, OFFER_ACTION_GLYPHS, OFFER_ACTION_LABEL_KEYS } from './OfferActionVocabulary';
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
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelection?: (offerId: string) => void;
}

function HighlightedDescription({ description, query }: { description: string; query: string }) {
  const { palette } = useApp();
  const words = useMemo(
    () => Array.from(new Set(query.split(/\s+/u).map((word) => word.trim()).filter(Boolean))),
    [query]
  );
  const reduced = useMemo(() => shorten(description), [description]);
  const parts = useMemo(() => {
    if (words.length === 0) {
      return [reduced];
    }
    const pattern = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('|');
    return reduced.split(new RegExp(`(${pattern})`, 'giu'));
  }, [reduced, words]);

  if (words.length === 0) {
    return (
      <Text variant="bodyMedium" style={{ color: palette.ink }}>
        {reduced}
      </Text>
    );
  }

  return (
    <Text variant="bodyMedium" style={{ color: palette.ink }}>
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

/**
 * TouchableRipple is the press surface because Paper's Button hard-codes its
 * own accessibilityState; the ripple wrapper keeps the canonical announced
 * name, role and selected/disabled state while a Paper button supplies the M3 visual.
 */
function M3CardAction({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled,
  glyph,
  onPress,
  style,
  testID,
}: {
  accessibilityLabel: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  children?: ReactNode;
  disabled?: boolean;
  glyph: ReactNode;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  testID: string;
}) {
  const theme = useTheme();
  return (
    <TouchableRipple
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
      onPress={onPress}
      rippleColor={theme.colors.primary}
      style={style}
      testID={testID}
    >
      <View style={styles.actionContent}>
        <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
          <Button children={null} icon={() => glyph} onPress={onPress} style={styles.m3Action} />
        </View>
        {children}
      </View>
    </TouchableRipple>
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
  selectionMode = false,
  selected = false,
  onToggleSelection,
}: OfferCardProps) {
  const { palette, preferences, t } = useApp();
  const theme = useTheme();
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
    <Card style={styles.card}>
      {selectionMode ? (
        <TouchableRipple
          accessibilityLabel={`${t('offers.select')} ${offer.businessName}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          onPress={() => onToggleSelection?.(offer.offerId)}
          rippleColor={theme.colors.primary}
          style={styles.selectionToggle}
          testID="offer-card-selection"
        >
          <Text variant="labelLarge" style={{ color: palette.ink }}>
            {selected ? '✓' : '○'}
          </Text>
        </TouchableRipple>
      ) : null}
      <TouchableRipple
        accessibilityLabel={t('offers.openDetail')}
        accessibilityRole="button"
        style={[styles.visual, { backgroundColor: palette.accentMuted }]}
        onPress={() => onOpenDetail(offer)}
        onLongPress={() => onOpenDetail(offer)}
        rippleColor={theme.colors.primary}
      >
        <View style={styles.visualContent}>
          {canRenderImage && !imageFailed ? (
            <Image
              resizeMode="cover"
              source={{ uri: imageUri ?? undefined }}
              style={styles.visualImage}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View
              style={[styles.visualPlaceholder, { backgroundColor: palette.panel, borderColor: palette.border }]}
            >
              <Text variant="labelSmall" style={{ color: palette.inkMuted }}>
                {t('add.photoPlaceholder')}
              </Text>
            </View>
          )}
          <View style={styles.badgeRow}>
            {offer.isPromoted ? (
              <Badge style={[styles.badge, { backgroundColor: palette.highlight, color: palette.onHighlight }]}>
                {t('offers.promoted')}
              </Badge>
            ) : null}
            {offer.isReported ? (
              <Badge style={[styles.badge, { backgroundColor: palette.danger, color: palette.onDanger }]}>
                {t('offers.reported')}
              </Badge>
            ) : null}
          </View>
          <View style={styles.visualMeta}>
            <Badge style={[styles.metaChip, { backgroundColor: palette.overlay, color: immersiveInk }]}>
              {formatDistanceMeters(offer.distanceMeters)}
            </Badge>
            {offer.imageUrls.length > 1 ? (
              <Badge style={[styles.metaChip, { backgroundColor: palette.overlay, color: immersiveInk }]}>
                {String(offer.imageUrls.length)}
              </Badge>
            ) : null}
          </View>
        </View>
      </TouchableRipple>

      <View style={styles.body}>
        <Text variant="titleLarge" style={{ color: palette.ink }}>
          {offer.businessName}
        </Text>
        <HighlightedDescription description={offer.description} query={query} />

        {offer.tags.length > 0 ? (
          <View style={styles.tags}>
            {offer.tags.slice(0, 4).map((tag) => (
              <Chip
                key={tag}
                style={[styles.tag, { backgroundColor: palette.panel, borderColor: palette.border }]}
                textStyle={{ color: palette.inkMuted }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        ) : null}

        <Text variant="bodySmall" style={{ color: palette.inkMuted }}>
          {t('offers.distance')}: {formatDistanceMeters(offer.distanceMeters)}
        </Text>
        {offer.isReported ? (
          <Text variant="bodySmall" style={{ color: palette.danger }}>
            {t('offers.reportedWarning')}
          </Text>
        ) : null}

        <View style={[styles.actions, stackActions && styles.actionsStacked]}>
          <M3CardAction
            accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.directions)}
            glyph={<OfferActionGlyph glyph={OFFER_ACTION_GLYPHS.directions} prominent testID="offer-action-glyph" />}
            onPress={() => onDirections(offer)}
            style={[styles.actionButton, !stackActions && styles.actionButtonRow, { backgroundColor: palette.accentMuted }]}
            testID="offer-card-action-directions"
          >
            <Text variant="labelLarge" style={[styles.actionLabel, { color: palette.accentText }]}>
              {preferences.navigationMode === 'car' ? t('offers.directions.car') : t('offers.directions.walk')}
            </Text>
          </M3CardAction>
          <M3CardAction
            accessibilityLabel={t(OFFER_ACTION_LABEL_KEYS.favorite)}
            accessibilityState={{ selected: offer.isFavorite }}
            glyph={<OfferActionGlyph active={offer.isFavorite} glyph={OFFER_ACTION_GLYPHS.favorite} testID="offer-action-glyph" />}
            onPress={() => onFavorite(offer)}
            style={[styles.actionButton, !stackActions && styles.actionButtonRow, { backgroundColor: offer.isFavorite ? palette.accentMuted : palette.panel }]}
            testID="offer-card-action-favorite"
          >
            <Text
              variant="labelLarge"
              style={[styles.actionLabel, { color: offer.isFavorite ? palette.accentText : palette.ink }]}
            >
              {t('offers.favorite')}
            </Text>
          </M3CardAction>
          <M3CardAction
            accessibilityLabel={t('offers.action.comments')}
            glyph={<OfferActionGlyph glyph={OFFER_ACTION_GLYPHS.comments} testID="offer-action-glyph" />}
            onPress={() => onComments(offer)}
            style={[styles.actionButton, !stackActions && styles.actionButtonRow, { backgroundColor: palette.panel }]}
            testID="offer-card-action-comments"
          >
            <Text variant="labelLarge" style={[styles.actionLabel, { color: palette.ink }]}>
              {t('offers.action.comments')}
            </Text>
          </M3CardAction>
        </View>

        <IconButton
          accessibilityLabel={t('offers.action.more')}
          accessibilityRole="button"
          accessibilityState={{ expanded: maintenanceOpen }}
          icon={() => (
            <Text variant="labelLarge" style={[styles.actionLabel, { color: palette.ink }]}>
              {t('offers.cardMoreActions')}
            </Text>
          )}
          onPress={() => setMaintenanceOpen((current) => !current)}
          style={[styles.actionButton, { backgroundColor: palette.panelAlt }]}
          testID="offer-card-more"
        />
        {maintenanceOpen ? (
          <View style={[styles.voteSection, { borderColor: palette.border }]}>
            <Text variant="labelLarge" style={{ color: palette.ink }}>
              {t('offers.available')}
            </Text>
            <View style={styles.voteRow}>
              <M3CardAction
                accessibilityLabel={`${t('offers.action.available')} ${offer.positiveAvailabilityCount}`}
                accessibilityState={{ disabled: offer.hasCurrentUserVoted }}
                disabled={offer.hasCurrentUserVoted}
                glyph={<ImmersiveActionIconGlyph kind="votePositive" />}
                onPress={() => onVote(offer, 1)}
                style={[
                  styles.voteButton,
                  { backgroundColor: palette.panel },
                  offer.hasCurrentUserVoted && styles.disabled,
                ]}
                testID="offer-card-vote-available"
              >
                <View style={styles.voteContent}>
                  <Text variant="labelLarge" style={{ color: palette.ink }}>
                    {offer.positiveAvailabilityCount}
                  </Text>
                </View>
              </M3CardAction>
              <M3CardAction
                accessibilityLabel={`${t('offers.action.unavailable')} ${offer.negativeAvailabilityCount}`}
                accessibilityState={{ disabled: offer.hasCurrentUserVoted }}
                disabled={offer.hasCurrentUserVoted}
                glyph={<ImmersiveActionIconGlyph kind="voteNegative" />}
                onPress={() => onVote(offer, 2)}
                style={[
                  styles.voteButton,
                  { backgroundColor: palette.panel },
                  offer.hasCurrentUserVoted && styles.disabled,
                ]}
                testID="offer-card-vote-unavailable"
              >
                <View style={styles.voteContent}>
                  <Text variant="labelLarge" style={{ color: palette.ink }}>
                    {offer.negativeAvailabilityCount}
                  </Text>
                </View>
              </M3CardAction>
              <M3CardAction
                accessibilityLabel={t('offers.report')}
                glyph={<ImmersiveActionIconGlyph kind={OFFER_ACTION_GLYPHS.report} />}
                onPress={() => onReport(offer)}
                style={[styles.voteButton, { backgroundColor: palette.panel }]}
                testID="offer-card-report"
              >
                <View style={styles.voteContent}>
                  <Text variant="labelLarge" style={{ color: palette.ink }}>
                    {t('offers.report')}
                  </Text>
                </View>
              </M3CardAction>
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

export const OfferCard = memo(OfferCardRow);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  selectionToggle: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
  },
  visual: {
    height: 160,
    overflow: 'hidden',
    padding: 14,
    position: 'relative',
  },
  visualContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  visualImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  visualPlaceholder: {
    alignItems: 'center',
    borderWidth: 1,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  body: {
    gap: 10,
    padding: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsStacked: {
    flexDirection: 'column',
    gap: 8,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtonRow: {
    flex: 1,
  },
  m3Action: {
    margin: 0,
  },
  actionLabel: {
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
    minHeight: platformTouchFloor,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.45,
  },
});
