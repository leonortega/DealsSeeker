import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, useColorScheme } from 'react-native';
import * as Localization from 'expo-localization';
import { RequestOptions, createDealsSeekerApi } from '../api/client';
import { apiConfig } from '../api/config';
import {
  AuthSessionDto,
  Language,
  MainTab,
  OfferItemDto,
  OfferReportDraft,
  ThemeMode,
  ThemeWorld,
  UserPreferences,
  UserProfileDto,
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
  sessionNotice: string | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  palette: ReturnType<typeof resolveTheme>;
  reportDraft: OfferReportDraft | null;
  openSheet: () => void;
  closeSheet: () => void;
  runOperation: <T>(operationKey: string | null, task: () => Promise<T>) => Promise<T>;
  api: ReturnType<typeof createDealsSeekerApi>;
  t: (key: string) => string;
  showRegister: () => void;
  showLogin: () => void;
  openTab: (tab: MainTab) => void;
  openAddOffer: (offerId?: string) => void;
  immersiveOffers: boolean;
  openImmersiveOffers: () => void;
  closeImmersiveOffers: () => void;
  closeOverlay: () => void;
  setReportDraft: (offer: OfferItemDto | null) => void;
  clearReportDraft: () => void;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  setThemeWorld: (themeWorld: ThemeWorld) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setNavigationMode: (mode: UserPreferences['navigationMode']) => Promise<void>;
  avatarId: string;
  saveAvatar: (avatarId: string) => Promise<boolean>;
  setSession: (session: AuthSessionDto) => Promise<void>;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export interface AppStatusValue {
  loadingCount: number;
  sheetCount: number;
  pendingOperations: string[];
  isPending: (operationKey: string) => boolean;
}

export const AppStatusContext = createContext<AppStatusValue | null>(null);

function resolveDeviceLanguage(): Language {
  const locale = Localization.getLocales()[0];
  return locale?.languageCode?.toLowerCase() === 'es' ? 'es' : 'en';
}

export function AppProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [session, setSessionState] = useState<AuthSessionDto | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
    language: resolveDeviceLanguage(),
  });
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<MainTab>('offers');
  const [overlayRoute, setOverlayRoute] = useState<OverlayRoute>(null);
  // Approved default per OFFERS.MODE.SWITCH.001-R4 and OFFERS.FEED.IMMERSIVE.001-R43.
  const [immersiveOffers, setImmersiveOffers] = useState(true);
  const [sheetCount, setSheetCount] = useState(0);
  const openSheet = useCallback(() => setSheetCount((count) => count + 1), []);
  const closeSheet = useCallback(() => setSheetCount((count) => Math.max(0, count - 1)), []);
  const [loadingCount, setLoadingCount] = useState(0);
  const [pendingOperations, setPendingOperations] = useState<string[]>([]);
  const [cachedProfile, setCachedProfile] = useState<UserProfileDto | null>(null);
  const [reportDraft, setReportDraftState] = useState<OfferReportDraft | null>(null);
  const [avatarId, setAvatarId] = useState<string>(DEFAULT_AVATAR_ID);

  const persistPreferences = useCallback(
    async (nextPreferences: UserPreferences, nextUserId?: string | null) => {
      setPreferences(nextPreferences);
      await savePreferences(nextPreferences, nextUserId ?? session?.userId);
    },
    [session?.userId]
  );

  const handleUnauthorized = useCallback(async () => {
    await clearSession();
    setSessionState(null);
    setCachedProfile(null);
    setOverlayRoute(null);
    setActiveTab('offers');
    setAuthScreen('login');
    setSessionNotice('account.sessionExpired');
  }, []);

  /**
   * Runs an operation.
   *
   * When an operation key is supplied the operation is tracked as a scoped, non-blocking
   * indicator, so the user can keep interacting while a lookup is in flight. Without a key the
   * operation shows the global blocking indicator.
   */
  const runOperation = useCallback(async <T,>(operationKey: string | null, task: () => Promise<T>) => {
    if (operationKey) {
      setPendingOperations((current) => [...current, operationKey]);
    } else {
      setLoadingCount((current) => current + 1);
    }

    try {
      return await task();
    } finally {
      if (operationKey) {
        setPendingOperations((current) => current.filter((key) => key !== operationKey));
      } else {
        setLoadingCount((current) => Math.max(0, current - 1));
      }
    }
  }, []);

  const isPending = useCallback(
    (operationKey: string) => pendingOperations.includes(operationKey),
    [pendingOperations]
  );

  const apiBase = useMemo(
    () =>
      createDealsSeekerApi({
        baseUrl: apiConfig.baseUrl,
        getAccessToken: () => session?.accessToken ?? null,
        onUnauthorized: handleUnauthorized,
      }),
    [session?.accessToken, handleUnauthorized]
  );

  useEffect(() => {
    if (!bootstrapped || !session?.accessToken) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        return;
      }

      void (async () => {
        try {
          const profile = await apiBase.getMyProfile();
          if (!profile) {
            await handleUnauthorized();
          }
        } catch {
          // A transient failure must not discard a valid session.
        }
      })();
    });

    return () => subscription.remove();
  }, [apiBase, bootstrapped, handleUnauthorized, session?.accessToken]);

  const api: ReturnType<typeof createDealsSeekerApi> = useMemo(
    () => ({
      registerUser: (requestBody, requestOptions) =>
        runOperation(null, () => apiBase.registerUser(requestBody, requestOptions)),
      login: (requestBody, requestOptions) =>
        runOperation(null, () => apiBase.login(requestBody, requestOptions)),
      logout: (requestOptions) => runOperation(null, () => apiBase.logout(requestOptions)),
      getMyProfile: (requestOptions) =>
        runOperation(null, async () => {
          const cached = cachedProfile;
          if (cached && cached.userId === session?.userId) {
            return cached;
          }

          const profile = await apiBase.getMyProfile(requestOptions);
          if (profile) {
            setCachedProfile(profile);
          }
          return profile;
        }),
      getMyOffers: (requestOptions) =>
        runOperation(null, () => apiBase.getMyOffers(requestOptions)),
      getMyOfferDraft: (offerId, requestOptions) =>
        runOperation(null, () => apiBase.getMyOfferDraft(offerId, requestOptions)),
      setMyAvatar: (requestBody, requestOptions) =>
        runOperation(null, () => apiBase.setMyAvatar(requestBody, requestOptions)),
      getOfferComments: (offerId, limit, after, requestOptions) =>
        runOperation(null, () => apiBase.getOfferComments(offerId, limit, after, requestOptions)),
      createOfferComment: (offerId, requestBody, requestOptions) =>
        runOperation(null, () => apiBase.createOfferComment(offerId, requestBody, requestOptions)),
      searchOffers: (requestBody, requestOptions) =>
        runOperation('offers-search', () => apiBase.searchOffers(requestBody, requestOptions)),
      voteOfferAvailability: (offerId, requestBody, requestOptions) =>
        runOperation(null, () => apiBase.voteOfferAvailability(offerId, requestBody, requestOptions)),
      reportOffer: (offerId, requestBody, requestOptions) =>
        runOperation(null, () => apiBase.reportOffer(offerId, requestBody, requestOptions)),
      setOfferFavorite: (offerId, requestBody, requestOptions) =>
        runOperation(null, () => apiBase.setOfferFavorite(offerId, requestBody, requestOptions)),
      createOffer: (requestBody, requestOptions) =>
        runOperation(null, () => apiBase.createOffer(requestBody, requestOptions)),
      updateOffer: (offerId, requestBody, requestOptions) =>
        runOperation(null, () => apiBase.updateOffer(offerId, requestBody, requestOptions)),
      deleteOffer: (offerId, requestOptions) =>
        runOperation(null, () => apiBase.deleteOffer(offerId, requestOptions)),
      searchLocations: (query, requestOptions) =>
        runOperation('locations-search', () => apiBase.searchLocations(query, requestOptions)),
      reverseLocation: (lat, lng, requestOptions) =>
        runOperation(null, () => apiBase.reverseLocation(lat, lng, requestOptions)),
      submitSuggestion: (requestBody, requestOptions) =>
        runOperation(null, () => apiBase.submitSuggestion(requestBody, requestOptions)),
      submitReport: (requestBody, requestOptions) =>
        runOperation(null, () => apiBase.submitReport(requestBody, requestOptions)),
    }),
    [apiBase, runOperation, cachedProfile, session?.userId]
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

  const setSession = useCallback(async (nextSession: AuthSessionDto) => {
    await saveSession(nextSession);
    const nextPreferences = await loadPreferences(resolveDeviceLanguage(), nextSession.userId);
    setSessionState(nextSession);
    setSessionNotice(null);
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      await clearSession();
      setSessionState(null);
      setSessionNotice(null);
      setCachedProfile(null);
      setOverlayRoute(null);
      setActiveTab('offers');
      setAuthScreen('login');
    }
  }, [api]);

  const saveAvatar = useCallback(async (nextAvatarId: string) => {
    const result = await api.setMyAvatar({ avatarId: nextAvatarId });
    if (result.success) {
      setAvatarId(nextAvatarId);
      return true;
    }

    return false;
  }, [api]);

  const setReportDraft = useCallback((offer: OfferItemDto | null) => {
    if (!offer) {
      setReportDraftState(null);
      return;
    }

    const now = new Date().toISOString();
    const userId = session?.userId ?? translate(preferences.language, 'common.unknown');
    const dateStamp = now.replace('T', ' ').replace(/\.\d{3}Z$/u, ' UTC');
    const initialMessage =
      preferences.language === 'es'
        ? `Reporte para esta oferta abierto el ${dateStamp}.`
        : `Report for this offer opened at ${dateStamp}.`;

    setReportDraftState({
      offer,
      userId,
      reportedAtUtc: now,
      initialMessage,
    });
  }, [preferences.language, session?.userId]);

  const value: AppContextValue = useMemo(() => ({
    authScreen,
    overlayRoute,
    activeTab,
    bootstrapped,
    session,
    sessionNotice,
    isAuthenticated: Boolean(session?.accessToken),
    preferences,
    palette: resolveTheme(
      preferences.themeMode,
      systemScheme === 'light' ? 'light' : systemScheme === 'dark' ? 'dark' : null,
      preferences.themeWorld
    ),
    reportDraft,
    openSheet,
    closeSheet,
    runOperation,
    api,
    t: translateKey,
    showRegister: () => setAuthScreen('register'),
    showLogin: () => setAuthScreen('login'),
    openTab: (tab) => {
      setOverlayRoute(null);
      setActiveTab(tab);
    },
    immersiveOffers,
    openImmersiveOffers: () => setImmersiveOffers(true),
    closeImmersiveOffers: () => setImmersiveOffers(false),
    openAddOffer: (offerId) =>
      setOverlayRoute({
        name: 'add-offer',
        offerId: typeof offerId === 'string' ? offerId : undefined,
      }),
    closeOverlay: () => setOverlayRoute(null),
    setReportDraft,
    clearReportDraft: () => setReportDraftState(null),
    setThemeMode: async (themeMode) => {
      const nextPreferences = { ...preferences, themeMode };
      await persistPreferences(nextPreferences);
    },
    setThemeWorld: async (themeWorld) => {
      const nextPreferences = { ...preferences, themeWorld };
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
  }), [
    authScreen,
    overlayRoute,
    activeTab,
    bootstrapped,
    session,
    sessionNotice,
    preferences,
    systemScheme,
    reportDraft,
    openSheet,
    closeSheet,
    runOperation,
    api,
    translateKey,
    immersiveOffers,
    setReportDraft,
    persistPreferences,
    avatarId,
    saveAvatar,
    setSession,
    logout,
  ]);

  const statusValue: AppStatusValue = useMemo(
    () => ({ loadingCount, sheetCount, pendingOperations, isPending }),
    [loadingCount, sheetCount, pendingOperations, isPending]
  );

  return (
    <AppStatusContext.Provider value={statusValue}>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </AppStatusContext.Provider>
  );
}
