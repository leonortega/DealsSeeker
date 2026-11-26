import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

const mockSearchOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();
const mockOpenAddOffer = jest.fn();

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: 'offers',
    api: {
      reverseLocation: jest.fn().mockResolvedValue(null),
      searchOffers: mockSearchOffers,
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: jest.fn(),
    },
    immersiveOffers: false,
    isPending: () => false,
    openAddOffer: mockOpenAddOffer,
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
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

describe('Offers discovery states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('shows a retryable search error when the request fails', async () => {
    mockSearchOffers.mockRejectedValueOnce(new Error('offline'));

    await render(<OffersScreen />);

    expect(await screen.findByText('offers.searchFailed')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'offers.retry' }));
    await waitFor(() => expect(mockSearchOffers).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText('offers.searchFailed')).toBeNull());
  });

  it('offers to clear filters when a query returns no results', async () => {
    await render(<OffersScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('offers.searchPlaceholder'), 'coffee');

    const clearAction = await screen.findByRole('button', { name: 'offers.clearFilters' }, { timeout: 3000 });
    await fireEvent.press(clearAction);

    await waitFor(() =>
      expect(mockSearchOffers.mock.calls.some(([request]) => request.query === '')).toBe(true)
    );
  });

  it('keeps the Offers controls usable when no offers exist', async () => {
    await render(<OffersScreen />);

    expect(screen.queryByText('offers.emptyTitle')).toBeNull();
    expect(screen.queryByRole('button', { name: 'offers.createFirstOffer' })).toBeNull();
    expect(screen.getByPlaceholderText('offers.searchPlaceholder')).toBeTruthy();
  });
});
