import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

const mockVote = jest.fn();
const mockSetFavorite = jest.fn();
const mockSearchOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();
const mockSelectionFeedback = jest.fn();
const mockSuccessFeedback = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/haptics', () => ({
  selectionFeedback: (...args: unknown[]) => mockSelectionFeedback(...args),
  successFeedback: (...args: unknown[]) => mockSuccessFeedback(...args),
}));

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
      setOfferFavorite: mockSetFavorite,
      voteOfferAvailability: mockVote,
    },
    closeImmersiveOffers: jest.fn(),
    immersiveOffers: true,
    isAuthenticated: true,
    isPending: () => false,
    openAddOffer: jest.fn(),
    openImmersiveOffers: jest.fn(),
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

const offer = {
  offerId: 'o1',
  businessName: 'Cafe',
  description: 'Coffee',
  tags: [],
  imageUrl: '',
  imageUrls: [],
  isPromoted: false,
  isReported: false,
  isFavorite: false,
  distanceMeters: 100,
  hasCurrentUserVoted: false,
  positiveAvailabilityCount: 0,
  negativeAvailabilityCount: 0,
  location: { lat: 40.7, lng: -74 },
} as never;

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  const feedOffer = {
    offerId: 'o1', businessName: 'Cafe', description: 'Coffee', tags: [], imageUrl: '', imageUrls: [],
    isPromoted: false, isReported: false, isFavorite: false, distanceMeters: 100,
    hasCurrentUserVoted: false, positiveAvailabilityCount: 0, negativeAvailabilityCount: 0,
    location: { lat: 40.7, lng: -74 },
  };
  return {
    ImmersiveOfferFeed: ({ onFavorite, onVote }: { onFavorite: (o: unknown) => void; onVote: (o: unknown, v: number) => void }) =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Pressable, { accessibilityLabel: 'favorite', accessibilityRole: 'button', onPress: () => onFavorite(feedOffer) }),
        React.createElement(Pressable, { accessibilityLabel: 'vote', accessibilityRole: 'button', onPress: () => onVote(feedOffer, 1) })
      ),
  };
});

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({
  OfferDetailModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({
  OfferCommentsModal: () => null,
}));

async function chooseFallbackArea() {
  const browse = screen.queryByRole('button', { name: 'offers.browseApproximateArea' });
  if (browse) {
    await fireEvent.press(browse);
  }
}

describe('immersive action feedback (OFFERS.UX.002)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchOffers.mockResolvedValue({ offers: [offer], businesses: [] });
    mockVote.mockResolvedValue({ success: true });
    mockSetFavorite.mockResolvedValue({ success: true });
  });

  it('applies favorite and vote outcomes without re-running the search', async () => {
    await render(<OffersScreen />);
    await chooseFallbackArea();
    await waitFor(() => expect(mockSearchOffers).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByRole('button', { name: 'favorite' }));
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));

    await waitFor(() => expect(mockSuccessFeedback).toHaveBeenCalledTimes(1));
    expect(mockSearchOffers).toHaveBeenCalledTimes(1);
  });

  it('shows a confirmation when a vote succeeds', async () => {
    await render(<OffersScreen />);
    await chooseFallbackArea();
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();
    expect(mockSuccessFeedback).toHaveBeenCalledTimes(1);
  });

  it('shows a failure message when a vote is rejected', async () => {
    mockVote.mockResolvedValue({ success: false, message: 'Conflict' });
    await render(<OffersScreen />);
    await chooseFallbackArea();
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.voteFailed')).toBeTruthy();
    expect(mockSuccessFeedback).not.toHaveBeenCalled();
  });

  it('confirms a successful favorite toggle and stays silent on failure', async () => {
    await render(<OffersScreen />);
    await chooseFallbackArea();
    await fireEvent.press(screen.getByRole('button', { name: 'favorite' }));
    expect(mockSelectionFeedback).toHaveBeenCalledTimes(1);

    mockSetFavorite.mockResolvedValue({ success: false });
    await fireEvent.press(screen.getByRole('button', { name: 'favorite' }));
    expect(mockSelectionFeedback).toHaveBeenCalledTimes(1);
  });

  it('replaces earlier feedback with the latest outcome', async () => {
    await render(<OffersScreen />);
    await chooseFallbackArea();
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();

    mockVote.mockResolvedValue({ success: false, message: 'Conflict' });
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    await waitFor(() => expect(screen.queryByText('offers.feedbackRegistered')).toBeNull());
    expect(await screen.findByText('offers.voteFailed')).toBeTruthy();
  });
});
