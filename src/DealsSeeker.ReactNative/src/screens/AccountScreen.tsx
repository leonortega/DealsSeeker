import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OfferItemDto, UserProfileDto } from '../api/types';
import { AvatarPicker } from '../components/AvatarPicker';
import { StandardHeader } from '../components/StandardHeader';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { statusColor, type StatusTone } from '../utils/statusNotice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { avatarEmoji } from '../utils/avatars';
import { shorten } from '../utils/format';

export function AccountScreen() {
  const { activeTab, api, avatarId, logout, openAddOffer, palette, preferences, saveAvatar, setLanguage, setNavigationMode, setThemeMode, t } =
    useApp();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [offers, setOffers] = useState<OfferItemDto[]>([]);
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();

  function reportStatus(message: string | null, tone: StatusTone = 'neutral') {
    reportNotice(message, tone);
    announceStatus(message);
  }

  async function selectAvatar(nextAvatarId: string) {
    const saved = await saveAvatar(nextAvatarId);
    if (!saved) {
      reportStatus(t('account.avatarSaveFailed'), 'error');
      return;
    }

    setProfile((current) => (current ? { ...current, avatarId: nextAvatarId } : current));
  }

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
              reportStatus(t('account.offerRemoveFailed'), 'error');
              return;
            }

            setOffers((current) => current.filter((item) => item.offerId !== offer.offerId));
            reportStatus(t('account.offerRemoved'));
          })();
        },
      },
    ]);
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
      style={{ backgroundColor: palette.background }}
      testID="account-scroll"
    >
      <StandardHeader />
      <View style={[styles.hero, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
        <View style={[styles.avatar, { backgroundColor: palette.accentMuted }]}>
          <Text style={[styles.avatarText, { color: palette.accent }]}>{avatarEmoji(profile?.avatarId ?? avatarId)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: palette.ink }]}>{profile?.displayName ?? t('account.title')}</Text>
          <View style={styles.accountDetails}>
            <Text style={[styles.email, { color: palette.inkMuted }]}>{profile?.email ?? ''}</Text>
            <Pressable
              accessibilityLabel={t('account.logout')}
              accessibilityRole="button"
              style={[styles.logout, { backgroundColor: palette.danger }]}
              onPress={() => void logout()}
            >
              <Text style={styles.logoutLabel}>{t('account.logout')}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.panelTitle, { color: palette.ink }]}>{t('account.settings')}</Text>
        <View style={styles.row}>
          <Pressable
            accessibilityLabel={preferences.themeMode === 'dark' ? t('nav.darkTheme') : t('nav.lightTheme')}
            accessibilityRole="button"
            accessibilityState={{ selected: preferences.themeMode === 'dark' }}
            style={[styles.choice, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={() => void setThemeMode(preferences.themeMode === 'dark' ? 'light' : 'dark')}
          >
            <Text style={{ color: palette.ink }}>
              {preferences.themeMode === 'dark' ? t('nav.darkTheme') : t('nav.lightTheme')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t('nav.language')}
            accessibilityRole="button"
            style={[styles.choice, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={() => void setLanguage(preferences.language === 'en' ? 'es' : 'en')}
          >
            <Text style={{ color: palette.ink }}>{preferences.language.toUpperCase()}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={preferences.navigationMode === 'car' ? t('nav.car') : t('nav.pedestrian')}
            accessibilityRole="button"
            accessibilityState={{ selected: preferences.navigationMode === 'car' }}
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
        <Text style={[styles.panelTitle, { color: palette.ink }]}>{t('settings.avatar')}</Text>
        <AvatarPicker selectedAvatarId={avatarId} onSelect={(nextAvatarId) => void selectAvatar(nextAvatarId)} />
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.panelTitle, { color: palette.ink }]}>{t('account.offers')}</Text>
        {offers.length === 0 ? <Text style={{ color: palette.inkMuted }}>{t('account.noOffers')}</Text> : null}
        {offers.map((offer) => (
          <View key={offer.offerId} style={[styles.offerCard, { backgroundColor: palette.panel, borderColor: palette.border }]}>
            <Text style={[styles.offerTitle, { color: palette.ink }]}>{offer.businessName}</Text>
            <Text style={{ color: palette.inkMuted }}>{shorten(offer.description, 100)}</Text>
            <View style={styles.actionRow}>
              <Pressable
                accessibilityLabel={t('account.editOffer')}
                accessibilityRole="button"
                style={[styles.smallButton, { backgroundColor: palette.accentMuted }]}
                onPress={() => openAddOffer(offer.offerId)}
              >
                <Text style={{ color: palette.accent }}>{t('account.editOffer')}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={t('account.removeOffer')}
                accessibilityRole="button"
                style={[styles.smallButton, { backgroundColor: palette.panelAlt }]}
                onPress={() => removeOffer(offer)}
              >
                <Text style={{ color: palette.danger }}>{t('account.removeOffer')}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      {status ? (
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>
          {status}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 26,
  },
  heroTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  accountDetails: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  email: {
    flexShrink: 1,
  },
  logout: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 44,
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
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
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
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
