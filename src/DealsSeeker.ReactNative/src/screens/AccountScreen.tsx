import {
  Avatar,
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  RadioButton,
  Snackbar,
  Surface,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { OfferItemDto, ThemeMode, ThemeWorld, UserProfileDto } from '../api/types';
import { AvatarPicker } from '../components/AvatarPicker';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import type { StatusTone } from '../utils/statusNotice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { avatarEmoji } from '../utils/avatars';
import { shorten } from '../utils/format';
import { platformTouchFloor } from '../utils/layout';
import { PlatformTabIcon } from '../components/PlatformTabIcon';

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
  const { activeTab, api, avatarId, logout, openAddOffer, preferences, saveAvatar, setLanguage, setNavigationMode, setThemeMode, setThemeWorld, t } =
    useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [offers, setOffers] = useState<OfferItemDto[]>([]);
  const [pendingRemoval, setPendingRemoval] = useState<OfferItemDto | null>(null);
  const { status, statusTone, reportStatus: reportNotice } = useStatusNotice();
  const carMode = preferences.navigationMode === 'car';

  function reportStatus(message: string | null, tone: StatusTone = 'neutral') {
    reportNotice(message, tone);
    announceStatus(message);
  }

  function toggleNavigationMode() {
    void setNavigationMode(carMode ? 'pedestrian' : 'car');
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

  async function confirmRemoval() {
    const offer = pendingRemoval;
    setPendingRemoval(null);
    if (!offer) {
      return;
    }

    const result = await api.deleteOffer(offer.offerId);
    if (!result.success) {
      reportStatus(t('account.offerRemoveFailed'), 'error');
      return;
    }

    setOffers((current) => current.filter((item) => item.offerId !== offer.offerId));
    reportStatus(t('account.offerRemoved'));
  }

  const statusColor =
    statusTone === 'error'
      ? theme.colors.error
      : statusTone === 'success'
        ? theme.colors.primary
        : theme.colors.inverseOnSurface;

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: 180 + insets.bottom }]}
        data={offers}
        keyExtractor={(item) => item.offerId}
        style={{ backgroundColor: theme.colors.background }}
        testID="account-scroll"
        ListHeaderComponent={
          <>
            <Surface elevation={1} style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.heroTop}>
                <Avatar.Text
                  color={theme.colors.onPrimaryContainer}
                  label={avatarEmoji(profile?.avatarId ?? avatarId)}
                  size={56}
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                />
                <Text variant="titleLarge">{profile?.displayName ?? t('account.title')}</Text>
              </View>
              <View style={styles.accountDetails}>
                <Text numberOfLines={2} variant="bodyMedium">
                  {profile?.email ?? ''}
                </Text>
                <Button
                  accessibilityLabel={t('account.logout')}
                  buttonColor={theme.colors.error}
                  contentStyle={styles.buttonContent}
                  mode="contained"
                  onPress={() => void logout()}
                  style={styles.logout}
                  textColor={theme.colors.onError}
                >
                  {t('account.logout')}
                </Button>
              </View>
            </Surface>

            <Surface elevation={1} style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleLarge">{t('account.settings')}</Text>
              <List.Section>
                <Text variant="labelMedium">{t('settings.world')}</Text>
                <RadioButton.Group
                  onValueChange={(value) => void setThemeWorld(value as ThemeWorld)}
                  value={preferences.themeWorld}
                >
                  {themeWorlds.map(({ world, labelKey }) => (
                    <RadioButton.Item
                      accessibilityLabel={t(labelKey)}
                      key={world}
                      label={t(labelKey)}
                      style={styles.choice}
                      value={world}
                    />
                  ))}
                </RadioButton.Group>
                <Divider />
                <Text variant="labelMedium">{t('settings.theme')}</Text>
                <RadioButton.Group
                  onValueChange={(value) => void setThemeMode(value as ThemeMode)}
                  value={preferences.themeMode}
                >
                  {themeOptions.map(({ mode, labelKey }) => (
                    <RadioButton.Item
                      accessibilityLabel={t(labelKey)}
                      key={mode}
                      label={t(labelKey)}
                      style={styles.choice}
                      value={mode}
                    />
                  ))}
                </RadioButton.Group>
                <Divider />
                <List.Item
                  accessibilityLabel={t('nav.language')}
                  accessibilityRole="button"
                  left={() => <Text variant="labelLarge">{preferences.language.toUpperCase()}</Text>}
                  onPress={() => void setLanguage(preferences.language === 'en' ? 'es' : 'en')}
                  right={() => (
                    <PlatformTabIcon color={theme.colors.onSurfaceVariant} name="chevronForward" size={18} />
                  )}
                  style={styles.listItem}
                  title={t('nav.language')}
                />
                <List.Item
                  accessibilityLabel={carMode ? t('nav.car') : t('nav.pedestrian')}
                  accessibilityRole="button"
                  onPress={toggleNavigationMode}
                  right={() => (
                    <View style={styles.navAffordance}>
                      <Switch
                        accessibilityLabel={carMode ? t('nav.car') : t('nav.pedestrian')}
                        onValueChange={toggleNavigationMode}
                        value={carMode}
                      />
                      <PlatformTabIcon color={theme.colors.onSurfaceVariant} name="chevronForward" size={18} />
                    </View>
                  )}
                  style={styles.listItem}
                  title={carMode ? t('nav.car') : t('nav.pedestrian')}
                />
              </List.Section>
            </Surface>

            <Surface elevation={1} style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleLarge">{t('settings.avatar')}</Text>
              <AvatarPicker selectedAvatarId={avatarId} onSelect={(nextAvatarId) => void selectAvatar(nextAvatarId)} />
            </Surface>

            <Surface elevation={1} style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleLarge">{t('account.offers')}</Text>
              {offers.length === 0 ? <Text variant="bodyMedium">{t('account.noOffers')}</Text> : null}
            </Surface>
          </>
        }
        renderItem={({ item: offer }) => (
          <Surface elevation={1} style={[styles.offerCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium">{offer.businessName}</Text>
            <Text variant="bodyMedium">{shorten(offer.description, 100)}</Text>
            <View style={styles.actionRow}>
              <Button
                accessibilityLabel={t('account.editOffer')}
                contentStyle={styles.buttonContent}
                mode="contained-tonal"
                onPress={() => openAddOffer(offer.offerId)}
                style={styles.smallButton}
              >
                {t('account.editOffer')}
              </Button>
              <Button
                accessibilityLabel={t('account.removeOffer')}
                contentStyle={styles.buttonContent}
                mode="text"
                onPress={() => setPendingRemoval(offer)}
                style={styles.smallButton}
                textColor={theme.colors.error}
              >
                {t('account.removeOffer')}
              </Button>
            </View>
          </Surface>
        )}
      />

      <Portal>
        <Dialog onDismiss={() => setPendingRemoval(null)} visible={pendingRemoval !== null}>
          <Dialog.Title>{t('account.removeOffer')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('account.removePrompt')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingRemoval(null)}>{t('common.no')}</Button>
            <Button onPress={() => void confirmRemoval()}>{t('common.yes')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        duration={Number.POSITIVE_INFINITY}
        onDismiss={() => reportStatus(null)}
        visible={Boolean(status)}
        wrapperStyle={styles.statusWrapper}
      >
        <Text style={{ color: statusColor, fontWeight: '700' }}>{status}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  panel: {
    gap: 14,
    padding: 18,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  accountDetails: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
    marginTop: 4,
  },
  logout: {
    alignSelf: 'flex-start',
  },
  buttonContent: {
    minHeight: platformTouchFloor,
  },
  choice: {
    backgroundColor: 'transparent',
    minHeight: platformTouchFloor,
  },
  listItem: {
    minHeight: platformTouchFloor,
  },
  navAffordance: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  offerCard: {
    gap: 8,
    padding: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  smallButton: {
    flex: 1,
  },
  statusWrapper: {
    paddingHorizontal: 16,
  },
});
