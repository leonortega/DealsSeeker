import { StyleSheet, View } from 'react-native';
import type { ImmersiveActionIcon } from './ImmersiveActionGlyphs';
import { ImmersiveActionIconGlyph } from './ImmersiveActionGlyphs';

/**
 * The single action vocabulary shared by cards, the feed rail and the detail sheet.
 * The order is the canonical order required by OFFERS.ACTIONS.LABELS.001-R7.
 */
export const OFFER_ACTION_ORDER = ['directions', 'favorite', 'comments', 'available', 'report'] as const;

export type OfferActionKind = (typeof OFFER_ACTION_ORDER)[number];

export const OFFER_ACTION_GLYPHS: Record<OfferActionKind, ImmersiveActionIcon> = {
  directions: 'directions',
  favorite: 'favorite',
  comments: 'comments',
  available: 'votePositive',
  report: 'report',
};

export const OFFER_ACTION_LABEL_KEYS: Record<OfferActionKind, string> = {
  directions: 'offers.action.directions',
  favorite: 'offers.action.favorite',
  comments: 'offers.action.comments',
  available: 'offers.action.available',
  report: 'offers.action.report',
};

export function OfferActionGlyph({
  glyph,
  testID,
  active,
  prominent,
}: {
  glyph: ImmersiveActionIcon;
  testID?: string;
  active?: boolean;
  prominent?: boolean;
}) {
  return (
    <View testID={testID} style={styles.glyph}>
      <ImmersiveActionIconGlyph active={active} kind={glyph} prominent={prominent} />
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
