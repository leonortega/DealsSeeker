import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

/**
 * Header used by every standard (non-immersive) view. It lives inside each
 * screen's scrollable content so it scrolls away together with the view.
 */
export function StandardHeader() {
  const { activeTab, overlayRoute, palette, t } = useApp();

  const sectionLabel = overlayRoute?.name === 'add-offer'
    ? t('nav.addOffer')
    : overlayRoute?.name === 'favorites'
      ? t('nav.favorites')
      : activeTab === 'account'
        ? t('nav.account')
        : activeTab === 'suggestions'
          ? t('nav.suggestions')
          : activeTab === 'reports'
            ? t('nav.reports')
            : t('nav.offers');

  return (
    <View style={[styles.header, { backgroundColor: palette.backgroundRaised, borderBottomColor: palette.border }]}>
      <View>
        <Text style={[styles.brand, { color: palette.ink }]}>{t('app.title')}</Text>
        <Text style={{ color: palette.inkMuted }}>{sectionLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -16,
    paddingHorizontal: 34,
    paddingVertical: 14,
  },
  brand: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
  },
});
