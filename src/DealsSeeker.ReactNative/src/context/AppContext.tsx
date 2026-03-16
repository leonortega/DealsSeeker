import { PropsWithChildren, createContext, useEffect, useState } from 'react';
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
  openFavorites: () => void;
  closeOverlay: () => void;
  setReportDraft: (offer: OfferItemDto | null) => void;
  clearReportDraft: () => void;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setNavigationMode: (mode: UserPreferences['navigationMode']) => Promise<void>;
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
  const [loadingCount, setLoadingCount] = useState(0);
  const [reportDraft, setReportDraftState] = useState<OfferReportDraft | null>(null);

  async function persistPreferences(nextPreferences: UserPreferences, nextUserId?: string | null) {
    setPreferences(nextPreferences);
    await savePreferences(nextPreferences, nextUserId ?? session?.userId);
  }

  async function handleUnauthorized() {
    await clearSession();
    setSessionState(null);
    setOverlayRoute(null);
    setActiveTab('offers');
    setAuthScreen('login');
  }

  async function runBlocking<T>(task: () => Promise<T>) {
    setLoadingCount((current) => current + 1);
    try {
      return await task();
    } finally {
      setLoadingCount((current) => Math.max(0, current - 1));
    }
  }

  const apiBase = createDealsSeekerApi({
    baseUrl: apiConfig.baseUrl,
    getAccessToken: () => session?.accessToken ?? null,
    onUnauthorized: handleUnauthorized,
  });

  const api: ReturnType<typeof createDealsSeekerApi> = {
    registerUser: (requestBody) => runBlocking(() => apiBase.registerUser(requestBody)),
    login: (requestBody) => runBlocking(() => apiBase.login(requestBody)),
    logout: () => runBlocking(() => apiBase.logout()),
    getMyProfile: () => runBlocking(() => apiBase.getMyProfile()),
    getMyOffers: () => runBlocking(() => apiBase.getMyOffers()),
    getMyOfferDraft: (offerId) => runBlocking(() => apiBase.getMyOfferDraft(offerId)),
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
  };

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const splashDelay = new Promise((resolve) => setTimeout(resolve, 2000));
      const deviceLanguage = resolveDeviceLanguage();
      const storedSession = await loadSession<AuthSessionDto>();
      let activeSession = storedSession;

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
    setAuthScreen('login');
    setActiveTab('offers');
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
    palette: resolveTheme(preferences.themeMode, systemScheme === 'unspecified' ? null : systemScheme),
    reportDraft,
    loadingCount,
    api,
    t: (key) => translate(preferences.language, key),
    showRegister: () => setAuthScreen('register'),
    showLogin: () => setAuthScreen('login'),
    openTab: (tab) => {
      setOverlayRoute(null);
      setActiveTab(tab);
    },
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
    setSession,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
