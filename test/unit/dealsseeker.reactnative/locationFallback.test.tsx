import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

const mockRequestPermission = jest.fn();
const mockGetCurrentPosition = jest.fn();
const mockSearchOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();
const mockReverseLocation = jest.fn();

let mockImmersive = false;

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: () => mockRequestPermission(),
  getCurrentPositionAsync: () => mockGetCurrentPosition(),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: 'offers',
    api: {
      reverseLocation: mockReverseLocation,
      searchOffers: mockSearchOffers,
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: jest.fn(),
    },
    get immersiveOffers() {
      return mockImmersive;
    },
    closeImmersiveOffers: jest.fn(),
    closeSheet: jest.fn(),
    isAuthenticated: true,
    isPending: () => false,
    openAddOffer: jest.fn(),
    openImmersiveOffers: jest.fn(),
    openSheet: jest.fn(),
    palette: {
      accent: '#b85c38',
      backdrop: '#121417',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    runOperation: mockRunOperation,
    setReportDraft: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed', () => ({
  ImmersiveOfferFeed: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({
  OfferDetailModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({
  OfferCommentsModal: () => null,
}));

describe('location unavailable state (APP.LOCATION.FALLBACK.001 v2.0)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImmersive = false;
    mockRequestPermission.mockResolvedValue({ granted: false });
    mockGetCurrentPosition.mockResolvedValue({ coords: { latitude: 40.7128, longitude: -74.006 } });
    mockReverseLocation.mockResolvedValue(null);
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('shows an honest location-unavailable state instead of an approximate area', async () => {
    await render(<OffersScreen />);

    expect(await screen.findByText('offers.locationUnavailable')).toBeTruthy();
    expect(screen.getByText('offers.locationUnavailableHint')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.retry' })).toBeTruthy();
    expect(screen.queryByText('offers.locationFallbackNotice')).toBeNull();
    expect(screen.queryByText('offers.browseApproximateArea')).toBeNull();
  });

  it('never searches with a fabricated coordinate', async () => {
    await render(<OffersScreen />);
    await screen.findByText('offers.locationUnavailable');

    expect(mockSearchOffers).not.toHaveBeenCalled();
    expect(screen.queryByText('40.7128')).toBeNull();
    expect(screen.queryByText('-74.006')).toBeNull();
  });

  it('uses the configured emulator location without an unavailable state', async () => {
    process.env['EXPO_PUBLIC_EMULATOR_LOCATION'] = '40.7128,-74.006';
    try {
      await render(<OffersScreen />);

      expect(await screen.findByText('offers.location: offers.currentLocation')).toBeTruthy();
      expect(screen.queryByText('offers.locationUnavailable')).toBeNull();
      expect(mockRequestPermission).not.toHaveBeenCalled();
      await waitFor(() => expect(mockSearchOffers).toHaveBeenCalled());
    } finally {
      delete process.env['EXPO_PUBLIC_EMULATOR_LOCATION'];
    }
  });

  it('clears the unavailable state and searches after a successful retry', async () => {
    await render(<OffersScreen />);
    await screen.findByText('offers.locationUnavailable');

    mockRequestPermission.mockResolvedValue({ granted: true });
    mockReverseLocation.mockResolvedValue({ label: 'Central Station' });
    await fireEvent.press(screen.getByRole('button', { name: 'offers.retry' }));

    await waitFor(() => expect(screen.queryByText('offers.locationUnavailable')).toBeNull());
    expect(screen.getByText(/Central Station/)).toBeTruthy();
    await waitFor(() => expect(mockSearchOffers).toHaveBeenCalled());
  });

  it('reports a failed retry while keeping the unavailable state', async () => {
    await render(<OffersScreen />);
    await screen.findByText('offers.locationUnavailable');

    mockRequestPermission.mockResolvedValue({ granted: true });
    mockGetCurrentPosition.mockRejectedValue(new Error('no fix'));
    await fireEvent.press(screen.getByRole('button', { name: 'offers.retry' }));

    expect(await screen.findByText('offers.locationRetryFailed')).toBeTruthy();
    expect(screen.getByText('offers.locationUnavailable')).toBeTruthy();
    expect(mockSearchOffers).not.toHaveBeenCalled();
  });

  it('shows the same honest state in the immersive presentation', async () => {
    mockImmersive = true;
    await render(<OffersScreen />);

    expect(await screen.findByText('offers.locationUnavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.retry' })).toBeTruthy();
    expect(screen.queryByText('offers.browseApproximateArea')).toBeNull();
  });
});
