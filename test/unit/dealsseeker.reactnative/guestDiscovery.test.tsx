import { AppState } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { AppProvider } from '../../../src/DealsSeeker.ReactNative/src/context/AppContext';
import { useApp } from '../../../src/DealsSeeker.ReactNative/src/hooks/useApp';

const mockDefaultPreferences = { themeMode: 'system', language: 'en', navigationMode: 'pedestrian' };
const mockLoadSession = jest.fn();
const mockLoadPreferences = jest.fn();
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
  savePreferences: jest.fn(),
  saveSession: jest.fn(),
  clearSession: jest.fn(),
}));

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));

let context: ReturnType<typeof useApp> | null = null;

function Probe() {
  context = useApp();
  return null;
}

async function renderProvider() {
  await render(
    <AppProvider>
      <Probe />
    </AppProvider>
  );
  await act(async () => {
    jest.advanceTimersByTime(2000);
    await Promise.resolve();
  });
}

describe('guest discovery session (OFFERS.GUEST.001, APP.SHELL.001)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      () => ({ remove: jest.fn() }) as never
    );
    context = null;
    mockLoadSession.mockResolvedValue(null);
    mockLoadPreferences.mockResolvedValue(mockDefaultPreferences);
    mockApi.getMyProfile.mockResolvedValue(null);
  });

  afterEach(() => jest.useRealTimers());

  it('starts without a guest session', async () => {
    await renderProvider();
    expect(context?.guestMode).toBe(false);
    expect(context?.isAuthenticated).toBe(false);
  });

  it('lets an unauthenticated user enter a read-only guest session', async () => {
    await renderProvider();
    await act(async () => {
      context?.enterGuestMode();
      await Promise.resolve();
    });
    expect(context?.guestMode).toBe(true);
    expect(context?.isAuthenticated).toBe(false);
  });

  it('returns to login when the guest leaves guest mode', async () => {
    await renderProvider();
    await act(async () => {
      context?.enterGuestMode();
      await Promise.resolve();
    });
    await act(async () => {
      context?.exitGuestMode();
      await Promise.resolve();
    });
    expect(context?.guestMode).toBe(false);
    expect(context?.authScreen).toBe('login');
  });

  it('clears guest mode when a real session is established', async () => {
    mockApi.getMyProfile.mockResolvedValue({ userId: 'u1', avatarId: 'avatar-1' });
    await renderProvider();
    await act(async () => {
      context?.enterGuestMode();
      await Promise.resolve();
    });
    await act(async () => {
      await context?.setSession({ accessToken: 'tok', userId: 'u1', displayName: 'Tester' } as never);
    });
    expect(context?.guestMode).toBe(false);
    expect(context?.isAuthenticated).toBe(true);
  });
});
