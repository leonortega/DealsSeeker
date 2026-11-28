import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ProgressBar, Snackbar, Text as PaperText } from 'react-native-paper';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

function hasComponent(node: any, component: unknown): boolean {
  const visit = (fiber: any): boolean => {
    if (!fiber) {
      return false;
    }
    if (fiber.type === component) {
      return true;
    }
    return visit(fiber.child) || visit(fiber.sibling);
  };
  let top = node.unstable_fiber;
  while (top?.return) {
    top = top.return;
  }
  return visit(top);
}

const mockVote = jest.fn();
const mockSetFavorite = jest.fn();
const mockSearchOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();
const mockSelectionFeedback = jest.fn();
const mockSuccessFeedback = jest.fn();
let mockIsAuthenticated = true;
let mockFeedFavorite = false;

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/haptics', () => ({
  selectionFeedback: (...args: unknown[]) => mockSelectionFeedback(...args),
  successFeedback: (...args: unknown[]) => mockSuccessFeedback(...args),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn().mockResolvedValue({ coords: { latitude: 40.7128, longitude: -74.006 } }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
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
    isAuthenticated: mockIsAuthenticated,
    closeSheet: jest.fn(),
    isPending: () => false,
    openSheet: jest.fn(),
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
  return {
    ImmersiveOfferFeed: ({ onFavorite, onVote }: { onFavorite: (o: unknown) => void; onVote: (o: unknown, v: number) => void }) => {
      const feedOffer = {
        offerId: 'o1', businessName: 'Cafe', description: 'Coffee', tags: [], imageUrl: '', imageUrls: [],
        isPromoted: false, isReported: false, isFavorite: mockFeedFavorite, distanceMeters: 100,
        hasCurrentUserVoted: false, positiveAvailabilityCount: 0, negativeAvailabilityCount: 0,
        location: { lat: 40.7, lng: -74 },
      };
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(Pressable, { accessibilityLabel: 'favorite', accessibilityRole: 'button', onPress: () => onFavorite(feedOffer) }),
        React.createElement(Pressable, { accessibilityLabel: 'vote', accessibilityRole: 'button', onPress: () => onVote(feedOffer, 1) })
      );
    },
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
    mockIsAuthenticated = true;
    mockSearchOffers.mockResolvedValue({ offers: [offer], businesses: [] });
    mockVote.mockResolvedValue({ success: true });
    mockSetFavorite.mockResolvedValue({ success: true });
  });

  it('applies favorite and vote outcomes without re-running the search', async () => {
    jest.useFakeTimers();
    await render(<OffersScreen />);
    await waitFor(() => expect(mockSearchOffers).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByRole('button', { name: 'favorite' }));
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));

    await act(async () => {
      jest.advanceTimersByTime(4300);
    });
    expect(mockVote).toHaveBeenCalledTimes(1);
    expect(mockSearchOffers).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('shows a confirmation when a vote succeeds', async () => {
    jest.useFakeTimers();
    await render(<OffersScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(4300);
    });
    expect(mockSuccessFeedback).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('shows a failure message when a vote is rejected after the undo window', async () => {
    jest.useFakeTimers();
    mockVote.mockResolvedValue({ success: false, message: 'Conflict' });
    await render(<OffersScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(4300);
    });
    expect(await screen.findByText('offers.voteFailed')).toBeTruthy();
    expect(mockSuccessFeedback).not.toHaveBeenCalled();
    jest.useRealTimers();
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
    jest.useFakeTimers();
    await render(<OffersScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();

    mockVote.mockResolvedValue({ success: false, message: 'Conflict' });
    await fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    await act(async () => {
      jest.advanceTimersByTime(4300);
    });
    expect(await screen.findByText('offers.voteFailed')).toBeTruthy();
    jest.useRealTimers();
  });

  it('shows pending until the favorite request resolves to one outcome (APP.FEEDBACK.001-R10)', async () => {
    let resolveFavorite: ((value: { success: boolean }) => void) | null = null;
    mockSetFavorite.mockImplementation(
      () => new Promise<{ success: boolean }>((resolve) => { resolveFavorite = resolve; })
    );

    await render(<OffersScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'favorite' }));

    expect(await screen.findByText('common.saving')).toBeTruthy();
    await act(async () => resolveFavorite?.({ success: true }));
    expect(screen.queryByText('common.saving')).toBeNull();
    expect(screen.getByText('offers.favoriteUpdated')).toBeTruthy();
  });

  it('uses one status surface in the feed and keeps a persistent message dismissible (APP.POLISH.UX.001-R15)', async () => {
    mockIsAuthenticated = false;
    await render(<OffersScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'favorite' }));

    expect(await screen.findByText('auth.signInToContribute')).toBeTruthy();
    expect(screen.getAllByTestId('offers-status-surface')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'offers.dismissNotice' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'offers.dismissNotice' }));
    expect(screen.queryByText('auth.signInToContribute')).toBeNull();
  });

  it('keeps undo for a favorite toggle in sync with the prior state (OFFERS.ACTION.UNDO.001-R4)', async () => {
    jest.useFakeTimers();
    mockFeedFavorite = true;
    await render(<OffersScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'favorite' }));
    expect(await screen.findByText('offers.favoriteUpdated')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'common.undo' }));
    expect(mockSetFavorite).toHaveBeenLastCalledWith('o1', { isFavorite: true });
    mockFeedFavorite = false;
    jest.useRealTimers();
  });

  it('uses the Material 3 snackbar pattern for the one status surface (APP.FEEDBACK.001-R15)', async () => {
    await render(<OffersScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();

    expect(hasComponent(screen.root, Snackbar)).toBe(true);
    expect(screen.getAllByTestId('offers-status-surface')).toHaveLength(1);
  });

  it('renders status feedback with a Material 3 type role (APP.TYPOGRAPHY.001-R7)', async () => {
    await render(<OffersScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'vote' }));
    expect(await screen.findByText('offers.feedbackRegistered')).toBeTruthy();

    expect(hasComponent(screen.root, PaperText)).toBe(true);
  });

  it('shows pending feedback through a Material 3 progress indicator (APP.FEEDBACK.001-R10)', async () => {
    let resolveFavorite: ((value: { success: boolean }) => void) | null = null;
    mockSetFavorite.mockImplementation(
      () => new Promise<{ success: boolean }>((resolve) => { resolveFavorite = resolve; })
    );

    await render(<OffersScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'favorite' }));
    expect(await screen.findByText('common.saving')).toBeTruthy();
    expect(hasComponent(screen.root, ProgressBar)).toBe(true);

    await act(async () => resolveFavorite?.({ success: true }));
  });
});
