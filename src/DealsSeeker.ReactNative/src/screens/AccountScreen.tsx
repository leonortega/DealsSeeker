import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OfferItemDto, UserProfileDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { shorten } from '../utils/format';

export function AccountScreen() {
  const { activeTab, api, logout, openAddOffer, palette, preferences, setLanguage, setNavigationMode, setThemeMode, t } =
    useApp();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [offers, setOffers] = useState<OfferItemDto[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'account') {
      return;
    }

    async function load() {
      const nextProfile = await api.getMyProfile();
      const nextOffers = await api.getMyOffers();
      setProfile(nextProfile);
      setOffers(nextOffers ?? []);
    }

    void load();
  }, [activeTab]);

  if (activeTab !== 'account') {
    return null;
  }

  async function removeOffer(offer: OfferItemDto) {
    Alert.alert(t('account.removeOffer'), t('account.removePrompt'), [
      { text: t('common.no') },
      {
        text: t('common.yes'),
        onPress: () => {
          void (async () => {
            const result = await api.deleteOffer(offer.offerId);
            if (!result.success) {
              setStatus(t('account.offerRemoveFailed'));
              return;
            }

            setOffers((current) => current.filter((item) => item.offerId !== offer.offerId));
            setStatus(t('account.offerRemoved'));
          })();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
        <View style={[styles.avatar, { backgroundColor: palette.accentMuted }]}>
          <Text style={[styles.avatarText, { color: palette.accent }]}>{(profile?.displayName ?? 'D').slice(0, 1)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: palette.ink }]}>{profile?.displayName ?? t('account.title')}</Text>
          <Text style={{ color: palette.inkMuted }}>{profile?.email ?? ''}</Text>
        </View>
        <Pressable style={[styles.logout, { backgroundColor: palette.danger }]} onPress={() => void logout()}>
          <Text style={styles.logoutLabel}>{t('account.logout')}</Text>
        </Pressable>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.panelTitle, { color: palette.ink }]}>{t('account.settings')}</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.choice, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={() => void setThemeMode(preferences.themeMode === 'dark' ? 'light' : 'dark')}
          >
            <Text style={{ color: palette.ink }}>
              {preferences.themeMode === 'dark' ? t('nav.darkTheme') : t('nav.lightTheme')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.choice, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={() => void setLanguage(preferences.language === 'en' ? 'es' : 'en')}
          >
            <Text style={{ color: palette.ink }}>{preferences.language.toUpperCase()}</Text>
          </Pressable>
          <Pressable
            style={[styles.choice, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={() => void setNavigationMode(preferences.navigationMode === 'car' ? 'pedestrian' : 'car')}
          >
            <Text style={{ color: palette.ink }}>
              {preferences.navigationMode === 'car' ? t('nav.car') : t('nav.pedestrian')}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.panelTitle, { color: palette.ink }]}>{t('account.offers')}</Text>
        {offers.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('account.noOffers')}</Text> : null}
        {offers.map((offer) => (
          <View key={offer.offerId} style={[styles.offerCard, { backgroundColor: palette.panel, borderColor: palette.border }]}>
            <Text style={[styles.offerTitle, { color: palette.ink }]}>{offer.businessName}</Text>
            <Text style={{ color: palette.inkMuted }}>{shorten(offer.description, 100)}</Text>
            <View style={styles.actionRow}>
              <Pressable style={[styles.smallButton, { backgroundColor: palette.accentMuted }]} onPress={() => openAddOffer(offer.offerId)}>
                <Text style={{ color: palette.accent }}>{t('account.editOffer')}</Text>
              </Pressable>
              <Pressable style={[styles.smallButton, { backgroundColor: palette.panelAlt }]} onPress={() => removeOffer(offer)}>
                <Text style={{ color: palette.danger }}>{t('account.removeOffer')}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      {status ? <Text style={[styles.status, { color: palette.ink }]}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  logout: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  logoutLabel: {
    color: '#fff',
    fontWeight: '800',
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  panelTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choice: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  offerCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  smallButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
