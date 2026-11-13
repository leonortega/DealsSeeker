import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as Localization from 'expo-localization';
import { createDealsSeekerApi } from '../api/client';
import { apiConfig } from '../api/config';
import {
  AuthSessionDto,
  Language,
  MainTab,
  OfferItemDto,
  OfferReportDraft,
  ThemeMode,
  UserPreferences,
} from '../api/types';
import {
  DEFAULT_PREFERENCES,
  clearSession,
  loadPreferences,
  loadSession,
  savePreferences,
  saveSession,
} from '../utils/storage';
import { translate } from '../utils/translations';
import { resolveTheme } from '../utils/theme';
import { DEFAULT_AVATAR_ID } from '../utils/avatars';

type AuthScreen = 'login' | 'register';
type OverlayRoute =
  | { name: 'add-offer'; offerId?: string }
  | { name: 'favorites' }
  | null;

interface AppContextValue {
  authScreen: AuthScreen;
  overlayRoute: OverlayRoute;
  activeTab: MainTab;
  bootstrapped: boolean;
  session: AuthSessionDto | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  palette: ReturnType<typeof resolveTheme>;
  reportDraft: OfferReportDraft | null;
  loadingCount: number;
  api: ReturnType<typeof createDealsSeekerApi>;
  t: (key: string) => string;
  showRegister: () => void;
  showLogin: () => void;
  openTab: (tab: MainTab) => void;
  openAddOffer: (offerId?: string) => void;
  immersiveOffers: boolean;
  openImmersiveOffers: () => void;
  closeImmersiveOffers: () => void;
  menuVisible: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  openFavorites: () => void;
  closeOverlay: () => void;
  setReportDraft: (offer: OfferItemDto | null) => void;
  clearReportDraft: () => void;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setNavigationMode: (mode: UserPreferences['navigationMode']) => Promise<void>;
  avatarId: string;
  saveAvatar: (avatarId: string) => Promise<boolean>;
  setSession: (session: AuthSessionDto) => Promise<void>;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

function resolveDeviceLanguage(): Language {
  const locale = Localization.getLocales()[0];
  return locale?.languageCode?.toLowerCase() === 'es' ? 'es' : 'en';
}

export function AppProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [session, setSessionState] = useState<AuthSessionDto | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
    language: resolveDeviceLanguage(),
  });
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<MainTab>('offers');
  const [overlayRoute, setOverlayRoute] = useState<OverlayRoute>(null);
  const [menuVisible, setMenuVisibleState] = useState(false);
  const [immersiveOffers, setImmersiveOffers] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);
  const [reportDraft, setReportDraftState] = useState<OfferReportDraft | null>(null);
  const [avatarId, setAvatarId] = useState<string>(DEFAULT_AVATAR_ID);

  async function persistPreferences(nextPreferences: UserPreferences, nextUserId?: string | null) {
    setPreferences(nextPreferences);
    await savePreferences(nextPreferences, nextUserId ?? session?.userId);
  }

  const handleUnauthorized = useCallback(async () => {
    await clearSession();
    setSessionState(null);
    setOverlayRoute(null);
    setActiveTab('offers');
    setAuthScreen('login');
  }, []);

  const runBlocking = useCallback(async <T,>(task: () => Promise<T>) => {
    setLoadingCount((current) => current + 1);
    try {
      return await task();
    } finally {
      setLoadingCount((current) => Math.max(0, current - 1));
    }
  }, []);

  const apiBase = useMemo(
    () =>
      createDealsSeekerApi({
        baseUrl: apiConfig.baseUrl,
        getAccessToken: () => session?.accessToken ?? null,
        onUnauthorized: handleUnauthorized,
      }),
    [session?.accessToken, handleUnauthorized]
  );

  const api: ReturnType<typeof createDealsSeekerApi> = useMemo(
    () => ({
      registerUser: (requestBody) => runBlocking(() => apiBase.registerUser(requestBody)),
      login: (requestBody) => runBlocking(() => apiBase.login(requestBody)),
      logout: () => runBlocking(() => apiBase.logout()),
      getMyProfile: () => runBlocking(() => apiBase.getMyProfile()),
      getMyOffers: () => runBlocking(() => apiBase.getMyOffers()),
      getMyOfferDraft: (offerId) => runBlocking(() => apiBase.getMyOfferDraft(offerId)),
      setMyAvatar: (requestBody) => runBlocking(() => apiBase.setMyAvatar(requestBody)),
      getOfferComments: (offerId) => runBlocking(() => apiBase.getOfferComments(offerId)),
      createOfferComment: (offerId, requestBody) =>
        runBlocking(() => apiBase.createOfferComment(offerId, requestBody)),
      searchOffers: (requestBody) => runBlocking(() => apiBase.searchOffers(requestBody)),
      voteOfferAvailability: (offerId, requestBody) =>
        runBlocking(() => apiBase.voteOfferAvailability(offerId, requestBody)),
      reportOffer: (offerId, requestBody) => runBlocking(() => apiBase.reportOffer(offerId, requestBody)),
      setOfferFavorite: (offerId, requestBody) =>
        runBlocking(() => apiBase.setOfferFavorite(offerId, requestBody)),
      createOffer: (requestBody) => runBlocking(() => apiBase.createOffer(requestBody)),
      updateOffer: (offerId, requestBody) => runBlocking(() => apiBase.updateOffer(offerId, requestBody)),
      deleteOffer: (offerId) => runBlocking(() => apiBase.deleteOffer(offerId)),
      searchLocations: (query) => runBlocking(() => apiBase.searchLocations(query)),
      reverseLocation: (lat, lng) => runBlocking(() => apiBase.reverseLocation(lat, lng)),
      submitSuggestion: (requestBody) => runBlocking(() => apiBase.submitSuggestion(requestBody)),
      submitReport: (requestBody) => runBlocking(() => apiBase.submitReport(requestBody)),
    }),
    [apiBase, runBlocking]
  );

  const translateKey = useCallback((key: string) => translate(preferences.language, key), [preferences.language]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const splashDelay = new Promise((resolve) => setTimeout(resolve, 2000));
      const deviceLanguage = resolveDeviceLanguage();
      const storedSession = await loadSession<AuthSessionDto>();
      let activeSession = storedSession;
      let profileAvatarId: string | null = null;

      if (storedSession?.accessToken) {
        try {
          const profileApi = createDealsSeekerApi({
            baseUrl: apiConfig.baseUrl,
            getAccessToken: () => storedSession.accessToken,
          });
          const profile = await profileApi.getMyProfile();
          if (!profile) {
            activeSession = null;
            await clearSession();
          } else {
            profileAvatarId = profile.avatarId;
          }
        } catch {
          activeSession = null;
          await clearSession();
        }
      }

      const loadedPreferences = await loadPreferences(deviceLanguage, activeSession?.userId);
      await splashDelay;

      if (!isMounted) {
        return;
      }

      setSessionState(activeSession);
      setPreferences(loadedPreferences);
      setAvatarId(profileAvatarId ?? DEFAULT_AVATAR_ID);
      setAuthScreen('login');
      setActiveTab('offers');
      setBootstrapped(true);
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function setSession(nextSession: AuthSessionDto) {
    await saveSession(nextSession);
    const nextPreferences = await loadPreferences(resolveDeviceLanguage(), nextSession.userId);
    setSessionState(nextSession);
    setPreferences(nextPreferences);
    try {
      const profileApi = createDealsSeekerApi({
        baseUrl: apiConfig.baseUrl,
        getAccessToken: () => nextSession.accessToken,
      });
      const profile = await profileApi.getMyProfile();
      setAvatarId(profile?.avatarId ?? DEFAULT_AVATAR_ID);
    } catch {
      setAvatarId(DEFAULT_AVATAR_ID);
    }
    setAuthScreen('login');
    setActiveTab('offers');
    setImmersiveOffers(true);
    setOverlayRoute(null);
  }

  async function logout() {
    try {
      await api.logout();
    } finally {
      await clearSession();
      setSessionState(null);
      setOverlayRoute(null);
      setActiveTab('offers');
      setAuthScreen('login');
    }
  }

  async function saveAvatar(nextAvatarId: string) {
    const result = await api.setMyAvatar({ avatarId: nextAvatarId });
    if (result.success) {
      setAvatarId(nextAvatarId);
      return true;
    }

    return false;
  }

  function setReportDraft(offer: OfferItemDto | null) {
    if (!offer) {
      setReportDraftState(null);
      return;
    }

    const now = new Date().toISOString();
    const userId = session?.userId ?? translate(preferences.language, 'common.unknown');
    const dateStamp = now.replace('T', ' ').replace(/\.\d{3}Z$/u, ' UTC');
    const initialMessage =
      preferences.language === 'es'
        ? `Reporte para la oferta ${offer.offerId} abierto en ${dateStamp}.`
        : `Report draft for offer ${offer.offerId} opened at ${dateStamp}.`;

    setReportDraftState({
      offer,
      userId,
      reportedAtUtc: now,
      initialMessage,
    });
    setActiveTab('reports');
  }

  const value: AppContextValue = {
    authScreen,
    overlayRoute,
    activeTab,
    bootstrapped,
    session,
    isAuthenticated: Boolean(session?.accessToken),
    preferences,
    palette: resolveTheme(preferences.themeMode, systemScheme === 'light' ? 'light' : systemScheme === 'dark' ? 'dark' : null),
    reportDraft,
    loadingCount,
    api,
    t: translateKey,
    showRegister: () => setAuthScreen('register'),
    showLogin: () => setAuthScreen('login'),
    openTab: (tab) => {
      setOverlayRoute(null);
      setActiveTab(tab);
    },
    menuVisible,
    openMenu: () => setMenuVisibleState(true),
    closeMenu: () => setMenuVisibleState(false),
    immersiveOffers,
    openImmersiveOffers: () => setImmersiveOffers(true),
    closeImmersiveOffers: () => setImmersiveOffers(false),
    openAddOffer: (offerId) => setOverlayRoute({ name: 'add-offer', offerId }),
    openFavorites: () => setOverlayRoute({ name: 'favorites' }),
    closeOverlay: () => setOverlayRoute(null),
    setReportDraft,
    clearReportDraft: () => setReportDraftState(null),
    setThemeMode: async (themeMode) => {
      const nextPreferences = { ...preferences, themeMode };
      await persistPreferences(nextPreferences);
    },
    setLanguage: async (language) => {
      const nextPreferences = { ...preferences, language };
      await persistPreferences(nextPreferences);
    },
    setNavigationMode: async (navigationMode) => {
      const nextPreferences = { ...preferences, navigationMode };
      await persistPreferences(nextPreferences);
    },
    avatarId,
    saveAvatar,
    setSession,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
