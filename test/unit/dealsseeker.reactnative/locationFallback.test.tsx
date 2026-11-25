import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

const mockRequestPermission = jest.fn();
const mockGetCurrentPosition = jest.fn();
const mockSearchOffers = jest.fn();
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
    isPending: () => false,
    openAddOffer: jest.fn(),
    openImmersiveOffers: jest.fn(),
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    setReportDraft: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed', () => ({
  ImmersiveOfferFeed: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({
  OfferDetailModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({
  OfferCommentsModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/StandardHeader', () => ({
  StandardHeader: () => null,
}));

describe('fallback location disclosure (APP.LOCATION.FALLBACK.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImmersive = false;
    mockRequestPermission.mockResolvedValue({ granted: false });
    mockGetCurrentPosition.mockResolvedValue({ coords: { latitude: 40.7128, longitude: -74.006 } });
    mockReverseLocation.mockResolvedValue(null);
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('discloses an approximate area instead of the current area when permission is denied', async () => {
    await render(<OffersScreen />);
    expect(await screen.findByText('offers.locationFallbackNotice')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.useMyLocation' })).toBeTruthy();
    expect(screen.queryByText('offers.location: offers.currentLocation')).toBeNull();
  });

  it('uses the configured emulator location without a fallback notice', async () => {
    process.env['EXPO_PUBLIC_EMULATOR_LOCATION'] = '40.7128,-74.006';
    try {
      await render(<OffersScreen />);

      expect(await screen.findByText('offers.location: offers.currentLocation')).toBeTruthy();
      expect(screen.queryByText('offers.locationFallbackNotice')).toBeNull();
      expect(mockRequestPermission).not.toHaveBeenCalled();
    } finally {
      delete process.env['EXPO_PUBLIC_EMULATOR_LOCATION'];
    }
  });

  it('removes the notice and uses the resolved area after a successful retry', async () => {
    await render(<OffersScreen />);
    await screen.findByText('offers.locationFallbackNotice');

    mockRequestPermission.mockResolvedValue({ granted: true });
    mockReverseLocation.mockResolvedValue({ label: 'Central Station' });
    await fireEvent.press(screen.getByRole('button', { name: 'offers.useMyLocation' }));

    await waitFor(() => expect(screen.queryByText('offers.locationFallbackNotice')).toBeNull());
    expect(screen.getByText(/Central Station/)).toBeTruthy();
  });

  it('reports a failed retry without removing the notice or results', async () => {
    await render(<OffersScreen />);
    await screen.findByText('offers.locationFallbackNotice');

    mockRequestPermission.mockResolvedValue({ granted: true });
    mockGetCurrentPosition.mockRejectedValue(new Error('no fix'));
    await fireEvent.press(screen.getByRole('button', { name: 'offers.useMyLocation' }));

    expect(await screen.findByText('offers.locationRetryFailed')).toBeTruthy();
    expect(screen.getByText('offers.locationFallbackNotice')).toBeTruthy();
    expect(mockSearchOffers).toHaveBeenCalled();
  });

  it('keeps browsing when the notice is dismissed', async () => {
    mockSearchOffers.mockResolvedValue({
      offers: [{ offerId: 'o1' }],
      businesses: [],
    });
    await render(<OffersScreen />);
    await screen.findByText('offers.locationFallbackNotice');

    await fireEvent.press(screen.getByRole('button', { name: 'offers.dismissNotice' }));

    await waitFor(() => expect(screen.queryByText('offers.locationFallbackNotice')).toBeNull());
    expect(mockSearchOffers).toHaveBeenCalled();
  });

  it('paints the immersive content area behind state panels', async () => {
    mockImmersive = true;
    await render(<OffersScreen />);

    expect(await screen.findByText('offers.emptyTitle')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('immersive-content').props.style).backgroundColor).toBe('#181421');
  });

  it('shows the same disclosure in the immersive presentation', async () => {
    mockImmersive = true;
    await render(<OffersScreen />);
    expect(await screen.findByText('offers.locationFallbackNotice')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.useMyLocation' })).toBeTruthy();
  });
});
