import { AppState } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { AppProvider } from '../../../src/DealsSeeker.ReactNative/src/context/AppContext';
import { useApp } from '../../../src/DealsSeeker.ReactNative/src/hooks/useApp';

const mockDefaultPreferences = { themeMode: 'system', language: 'en', navigationMode: 'pedestrian' };
const mockLoadSession = jest.fn();
const mockLoadPreferences = jest.fn();
const mockSavePreferences = jest.fn();
const mockClearSession = jest.fn();
const mockApi = {
  registerUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getMyProfile: jest.fn(),
  getMyOffers: jest.fn(),
  getMyOfferDraft: jest.fn(),
  setMyAvatar: jest.fn(),
  getOfferComments: jest.fn(),
  createOfferComment: jest.fn(),
  searchOffers: jest.fn(),
  voteOfferAvailability: jest.fn(),
  reportOffer: jest.fn(),
  setOfferFavorite: jest.fn(),
  createOffer: jest.fn(),
  updateOffer: jest.fn(),
  deleteOffer: jest.fn(),
  searchLocations: jest.fn(),
  reverseLocation: jest.fn(),
  submitSuggestion: jest.fn(),
  submitReport: jest.fn(),
} as Record<string, jest.Mock>;

jest.mock('../../../src/DealsSeeker.ReactNative/src/api/client', () => ({
  createDealsSeekerApi: jest.fn(() => mockApi),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/storage', () => ({
  DEFAULT_PREFERENCES: mockDefaultPreferences,
  loadSession: (...args: unknown[]) => mockLoadSession(...args),
  loadPreferences: (...args: unknown[]) => mockLoadPreferences(...args),
  savePreferences: (...args: unknown[]) => mockSavePreferences(...args),
  saveSession: jest.fn(),
  clearSession: () => mockClearSession(),
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

let mockAppStateHandler: ((state: string) => void) | null = null;

let context: ReturnType<typeof useApp> | null = null;

function Probe() {
  context = useApp();
  return null;
}

const session = { accessToken: 'tok', userId: 'u1', displayName: 'Tester' } as never;

async function renderProvider() {
  const result = await render(
    <AppProvider>
      <Probe />
    </AppProvider>
  );
  await act(async () => {
    jest.advanceTimersByTime(2000);
    await Promise.resolve();
  });
  return result;
}

describe('AppProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
      mockAppStateHandler = handler as (state: string) => void;
      return { remove: jest.fn() } as never;
    });
    mockAppStateHandler = null;
    context = null;
    mockLoadSession.mockResolvedValue(null);
    mockLoadPreferences.mockResolvedValue(mockDefaultPreferences);
    mockApi.getMyProfile.mockResolvedValue(null);
    mockApi.logout.mockResolvedValue(undefined);
    mockApi.setMyAvatar.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('bootstraps to the unauthenticated login view with Feed as default', async () => {
    await renderProvider();

    expect(context?.bootstrapped).toBe(true);
    expect(context?.isAuthenticated).toBe(false);
    expect(context?.authScreen).toBe('login');
    expect(context?.activeTab).toBe('offers');
    expect(context?.immersiveOffers).toBe(true);
  });

  it('keeps the context value identity stable across parent re-renders', async () => {
    const view = await renderProvider();
    const first = context;

    await act(async () => {
      view.rerender(
        <AppProvider>
          <Probe />
        </AppProvider>
      );
    });

    expect(context).toBe(first);
  });

  it('restores a valid stored session and its profile avatar', async () => {
    mockLoadSession.mockResolvedValue(session);
    mockApi.getMyProfile.mockResolvedValue({ userId: 'u1', avatarId: 'avatar-2' });

    await renderProvider();

    expect(context?.isAuthenticated).toBe(true);
    expect(context?.avatarId).toBe('avatar-2');
  });

  it('clears an invalid stored session', async () => {
    mockLoadSession.mockResolvedValue(session);
    mockApi.getMyProfile.mockResolvedValue(null);

    await renderProvider();

    expect(context?.isAuthenticated).toBe(false);
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('revalidates the session when the app returns to the foreground', async () => {
    mockLoadSession.mockResolvedValue(session);
    mockApi.getMyProfile.mockResolvedValue({ userId: 'u1', avatarId: 'avatar-2' });
    await renderProvider();
    mockApi.getMyProfile.mockClear();

    await act(async () => {
      mockAppStateHandler?.('active');
      await Promise.resolve();
    });

    expect(mockApi.getMyProfile).toHaveBeenCalledTimes(1);
    expect(context?.isAuthenticated).toBe(true);
  });

  it('returns to login with a message when the foreground session is no longer valid', async () => {
    mockLoadSession.mockResolvedValue(session);
    mockApi.getMyProfile.mockResolvedValue({ userId: 'u1', avatarId: 'avatar-2' });
    await renderProvider();
    mockApi.getMyProfile.mockClear();
    mockApi.getMyProfile.mockResolvedValue(null);

    await act(async () => {
      mockAppStateHandler?.('active');
      await Promise.resolve();
    });

    expect(context?.isAuthenticated).toBe(false);
    expect(context?.sessionNotice).toBe('account.sessionExpired');
    expect(mockClearSession).toHaveBeenCalled();
  });

  it('keeps the session when the foreground check cannot reach the API', async () => {
    mockLoadSession.mockResolvedValue(session);
    mockApi.getMyProfile.mockResolvedValue({ userId: 'u1', avatarId: 'avatar-2' });
    await renderProvider();
    mockApi.getMyProfile.mockClear();
    mockApi.getMyProfile.mockRejectedValue(new Error('offline'));

    await act(async () => {
      mockAppStateHandler?.('active');
      await Promise.resolve();
    });

    expect(context?.isAuthenticated).toBe(true);
    expect(mockClearSession).not.toHaveBeenCalled();
  });

  it('switching tabs clears any open overlay', async () => {
    await renderProvider();
    await act(() => context?.openAddOffer());
    expect(context?.overlayRoute?.name).toBe('add-offer');

    await act(() => context?.openTab('suggestions'));

    expect(context?.activeTab).toBe('suggestions');
    expect(context?.overlayRoute).toBeNull();
  });

  it('does not treat a trigger event as an offer id when creating', async () => {
    await renderProvider();

    await act(() => (context?.openAddOffer as ((offerId?: unknown) => void) | undefined)?.({ nativeEvent: {} }));

    expect(context?.overlayRoute).toEqual({ name: 'add-offer', offerId: undefined });
  });

  it('opens and closes the immersive presentation', async () => {
    await renderProvider();

    await act(() => context?.openImmersiveOffers());
    expect(context?.immersiveOffers).toBe(true);

    await act(() => context?.closeImmersiveOffers());
    expect(context?.immersiveOffers).toBe(false);
  });

  it('tracks nested overlay sheets so the create action can stay hidden', async () => {
    await renderProvider();

    expect(context?.sheetCount).toBe(0);

    await act(() => context?.openSheet());
    await act(() => context?.openSheet());
    expect(context?.sheetCount).toBe(2);

    await act(() => context?.closeSheet());
    expect(context?.sheetCount).toBe(1);

    await act(() => context?.closeSheet());
    expect(context?.sheetCount).toBe(0);

    await act(() => context?.closeSheet());
    expect(context?.sheetCount).toBe(0);
  });

  it('persists preference changes and updates the palette', async () => {
    await renderProvider();

    await act(async () => context?.setThemeMode('dark'));

    expect(mockSavePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ themeMode: 'dark' }),
      undefined
    );
    expect(context?.palette.mode).toBe('dark');
  });

  it('creates a localized report draft and opens the report overlay', async () => {
    await renderProvider();
    const offer = { offerId: 'o1' } as never;

    await act(() => context?.setReportDraft(offer));

    expect(context?.overlayRoute).toBeNull();
    expect(context?.reportDraft?.initialMessage).not.toContain('o1');
    expect(context?.reportDraft?.initialMessage).toContain('offer');
    await act(() => context?.clearReportDraft());
    expect(context?.reportDraft).toBeNull();
  });

  it('tracks scoped operations without blocking the whole UI', async () => {
    await renderProvider();
    let resolveSearch: (() => void) | undefined;
    mockApi.searchOffers.mockImplementation(
      () => new Promise<void>((resolve) => { resolveSearch = resolve; })
    );

    let pending: Promise<unknown> | undefined;
    await act(() => { pending = context?.api.searchOffers({} as never); });
    expect(context?.isPending('offers-search')).toBe(true);
    expect(context?.loadingCount).toBe(0);

    await act(async () => { resolveSearch?.(); await pending; });
    expect(context?.isPending('offers-search')).toBe(false);
  });

  it('delegates every wrapped API operation to the client', async () => {
    await renderProvider();
    Object.values(mockApi).forEach((fn) => fn.mockResolvedValue({} as never));

    await act(async () => {
      await context?.api.registerUser({} as never);
      await context?.api.login({} as never);
      await context?.api.getMyOffers();
      await context?.api.getMyOfferDraft('off-1');
      await context?.api.getOfferComments('off-1', 10);
      await context?.api.createOfferComment('off-1', {} as never);
      await context?.api.voteOfferAvailability('off-1', {} as never);
      await context?.api.reportOffer('off-1', {} as never);
      await context?.api.setOfferFavorite('off-1', {} as never);
      await context?.api.createOffer({} as never);
      await context?.api.updateOffer('off-1', {} as never);
      await context?.api.deleteOffer('off-1');
      await context?.api.searchLocations('coffee');
      await context?.api.reverseLocation(1, 2);
      await context?.api.submitSuggestion({} as never);
      await context?.api.submitReport({} as never);
      await context?.setLanguage('es');
      await context?.setNavigationMode('car');
    });

    expect(mockApi.getMyOffers).toHaveBeenCalledTimes(1);
    expect(mockApi.deleteOffer).toHaveBeenCalledWith('off-1', undefined);
    expect(mockApi.submitReport).toHaveBeenCalledTimes(1);
    expect(mockSavePreferences).toHaveBeenCalledWith(expect.objectContaining({ language: 'es' }), undefined);
  });

  it('logs out and resets navigation state', async () => {
    mockLoadSession.mockResolvedValue(session);
    await renderProvider();
    await act(() => context?.openAddOffer());

    await act(async () => context?.logout());

    expect(context?.isAuthenticated).toBe(false);
    expect(context?.overlayRoute).toBeNull();
    expect(context?.activeTab).toBe('offers');
    expect(mockClearSession).toHaveBeenCalled();
  });
});
