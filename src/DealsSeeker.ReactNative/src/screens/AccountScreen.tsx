import { landmarkFontFamily } from '../utils/typography';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { OfferItemDto, ThemeMode, ThemeWorld, UserProfileDto } from '../api/types';
import { AvatarPicker } from '../components/AvatarPicker';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { statusColor, type StatusTone } from '../utils/statusNotice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { avatarEmoji } from '../utils/avatars';
import { shorten } from '../utils/format';
import { platformTouchFloor } from '../utils/layout';

const themeOptions: Array<{ mode: ThemeMode; labelKey: string }> = [
  { mode: 'system', labelKey: 'nav.systemTheme' },
  { mode: 'light', labelKey: 'nav.lightTheme' },
  { mode: 'dark', labelKey: 'nav.darkTheme' },
];

const themeWorlds: Array<{ world: ThemeWorld; labelKey: string }> = [
  { world: 'golden', labelKey: 'theme.golden' },
  { world: 'market', labelKey: 'theme.market' },
  { world: 'tangerine', labelKey: 'theme.tangerine' },
];

export function AccountScreen() {
  const { activeTab, api, avatarId, logout, openAddOffer, palette, preferences, saveAvatar, setLanguage, setNavigationMode, setThemeMode, setThemeWorld, t } =
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
    <FlatList
      contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
      data={offers}
      keyExtractor={(item) => item.offerId}
      style={{ backgroundColor: palette.background }}
      testID="account-scroll"
      ListHeaderComponent={
        <>
          <View style={[styles.hero, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
        <View style={styles.heroTop}>
          <View style={[styles.avatar, { backgroundColor: palette.accentMuted }]}>
            <Text style={[styles.avatarText, { color: palette.accentText }]}>{avatarEmoji(profile?.avatarId ?? avatarId)}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: palette.ink }]}>{profile?.displayName ?? t('account.title')}</Text>
        </View>
        <View style={styles.accountDetails}>
          <Text numberOfLines={2} style={[styles.email, { color: palette.inkMuted }]}>{profile?.email ?? ''}</Text>
          <Pressable
            accessibilityLabel={t('account.logout')}
            accessibilityRole="button"
            style={[styles.logout, { backgroundColor: palette.danger }]}
            onPress={() => void logout()}
          >
            <Text style={[styles.logoutLabel, { color: palette.onDanger }]}>{t('account.logout')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.panelTitle, { color: palette.ink }]}>{t('account.settings')}</Text>
        <View style={styles.settingGroup}>
          <Text style={[styles.settingLabel, { color: palette.inkMuted }]}>{t('settings.world')}</Text>
          <View accessibilityLabel={t('settings.world')} accessibilityRole="radiogroup" style={styles.row}>
            {themeWorlds.map(({ world, labelKey }) => {
              const selected = preferences.themeWorld === world;
              return (
                <Pressable
                  key={world}
                  accessibilityLabel={t(labelKey)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    styles.choice,
                    { backgroundColor: selected ? palette.accent : palette.panel, borderColor: palette.border },
                  ]}
                  onPress={() => void setThemeWorld(world)}
                >
                  <Text style={{ color: selected ? palette.onAccent : palette.ink }}>{t(labelKey)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.settingGroup}>
          <Text style={[styles.settingLabel, { color: palette.inkMuted }]}>{t('settings.theme')}</Text>
          <View accessibilityLabel={t('settings.theme')} accessibilityRole="radiogroup" style={styles.row}>
            {themeOptions.map(({ mode, labelKey }) => {
              const selected = preferences.themeMode === mode;
              return (
                <Pressable
                  key={mode}
                  accessibilityLabel={t(labelKey)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    styles.choice,
                    { backgroundColor: selected ? palette.accent : palette.panel, borderColor: palette.border },
                  ]}
                  onPress={() => void setThemeMode(mode)}
                >
                  <Text style={{ color: selected ? palette.onAccent : palette.ink }}>{t(labelKey)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.row}>
          <Pressable
            accessibilityLabel={t('nav.language')}
            accessibilityRole="button"
            style={[styles.choice, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={() => void setLanguage(preferences.language === 'en' ? 'es' : 'en')}
          >
            <Text style={{ color: palette.ink }}>{preferences.language.toUpperCase()}</Text>
            <Text style={[styles.chevron, { color: palette.inkMuted }]}>›</Text>
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
            <Text style={[styles.chevron, { color: palette.inkMuted }]}>›</Text>
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
          </View>
        </>
      }
      ListFooterComponent={
        status ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: statusColor(palette, statusTone) }]}>
            {status}
          </Text>
        ) : undefined
      }
      renderItem={({ item: offer }) => (
        <View style={[styles.offerCard, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[styles.offerTitle, { color: palette.ink }]}>{offer.businessName}</Text>
          <Text style={{ color: palette.inkMuted }}>{shorten(offer.description, 100)}</Text>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel={t('account.editOffer')}
              accessibilityRole="button"
              style={[styles.smallButton, { backgroundColor: palette.accentMuted }]}
              onPress={() => openAddOffer(offer.offerId)}
            >
              <Text style={{ color: palette.accentText }}>{t('account.editOffer')}</Text>
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
      )}
    />
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
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
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
    fontFamily: landmarkFontFamily(),
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
    minHeight: platformTouchFloor,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  logoutLabel: {
    fontWeight: '800',
  },
  panel: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  panelTitle: {
    fontFamily: landmarkFontFamily(),
    fontSize: 24,
    fontWeight: '700',
  },
  settingGroup: {
    gap: 8,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '700',
  },
  choice: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
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
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
