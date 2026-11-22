import { act, render } from '@testing-library/react-native';
import { AppProvider } from '../../../src/DealsSeeker.ReactNative/src/context/AppContext';
import { useApp } from '../../../src/DealsSeeker.ReactNative/src/hooks/useApp';

const mockDefaultPreferences = { themeMode: 'system', language: 'en', navigationMode: 'pedestrian' };
const mockLoadSession = jest.fn();
const mockLoadPreferences = jest.fn();
const mockSavePreferences = jest.fn();
const mockClearSession = jest.fn();
const mockApi = {
  getMyProfile: jest.fn(),
  logout: jest.fn(),
  searchOffers: jest.fn(),
  setMyAvatar: jest.fn(),
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
    expect(context?.immersiveOffers).toBe(false);
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

  it('switching tabs clears any open overlay', async () => {
    await renderProvider();
    await act(() => context?.openAddOffer());
    expect(context?.overlayRoute?.name).toBe('add-offer');

    await act(() => context?.openTab('reports'));

    expect(context?.activeTab).toBe('reports');
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

  it('persists preference changes and updates the palette', async () => {
    await renderProvider();

    await act(async () => context?.setThemeMode('dark'));

    expect(mockSavePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ themeMode: 'dark' }),
      undefined
    );
    expect(context?.palette.mode).toBe('dark');
  });

  it('creates a localized report draft and switches to Reports', async () => {
    await renderProvider();
    const offer = { offerId: 'o1' } as never;

    await act(() => context?.setReportDraft(offer));

    expect(context?.activeTab).toBe('reports');
    expect(context?.reportDraft?.initialMessage).toContain('o1');
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
