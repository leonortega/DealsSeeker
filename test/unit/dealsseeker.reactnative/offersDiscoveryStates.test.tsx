import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Button, IconButton, Searchbar, Text as PaperText } from 'react-native-paper';
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

function hasAncestor(instance: any, component: unknown): boolean {
  let fiber = instance?.unstable_fiber;
  while (fiber) {
    if (fiber.type === component) {
      return true;
    }
    fiber = fiber.return;
  }
  return false;
}

const mockSearchOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();
const mockOpenAddOffer = jest.fn();
const mockVote = jest.fn();
let mockIsAuthenticated = true;

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
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: mockVote,
    },
    immersiveOffers: false,
    closeSheet: jest.fn(),
    isAuthenticated: mockIsAuthenticated,
    isPending: () => false,
    openSheet: jest.fn(),
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
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  return {
    OfferCard: ({ offer, selectionMode, selected, onToggleSelection }: {
      offer: { offerId: string };
      selectionMode?: boolean;
      selected?: boolean;
      onToggleSelection?: (offerId: string) => void;
    }) =>
      selectionMode
        ? React.createElement(Pressable, {
            accessibilityLabel: `Select ${offer.offerId}`,
            accessibilityRole: 'checkbox',
            accessibilityState: { checked: Boolean(selected) },
            testID: `card-selection-${offer.offerId}`,
            onPress: () => onToggleSelection?.(offer.offerId),
          })
        : null,
  };
});
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

describe('Offers discovery states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = true;
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('shows a retryable search error when the request fails', async () => {
    mockSearchOffers.mockRejectedValueOnce(new Error('offline'));

    await render(<OffersScreen />);
    await chooseFallbackArea();

    expect(await screen.findByText('offers.searchFailed')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'offers.retry' }));
    await waitFor(() => expect(mockSearchOffers).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText('offers.searchFailed')).toBeNull());
  });

  it('offers to clear filters when a query returns no results', async () => {
    await render(<OffersScreen />);
    await chooseFallbackArea();
    await fireEvent.changeText(screen.getByPlaceholderText('offers.searchPlaceholder'), 'coffee');

    const clearAction = await screen.findByRole('button', { name: 'offers.clearFilters' }, { timeout: 3000 });
    await fireEvent.press(clearAction);

    await waitFor(() =>
      expect(mockSearchOffers.mock.calls.some(([request]) => request.query === '')).toBe(true)
    );
  });

  it('caps the standard search query at 200 characters', async () => {
    await render(<OffersScreen />);

    const input = screen.getByPlaceholderText('offers.searchPlaceholder');
    await fireEvent.changeText(input, 'x'.repeat(250));

    expect(input.props.value).toHaveLength(200);
  });

  it('shows authored guidance instead of a blank surface when no offers exist', async () => {
    await render(<OffersScreen />);
    await chooseFallbackArea();

    expect(await screen.findByText('offers.emptyTitle')).toBeTruthy();
    expect(screen.getByText('offers.emptyHint')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.createFirstOffer' })).toBeTruthy();
    expect(screen.getByPlaceholderText('offers.searchPlaceholder')).toBeTruthy();
  });
});

describe('Offers search accelerators and inline validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = true;
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('records a successful query as a recent search without issuing a lookup while displayed (OFFERS.SEARCH.RECENTS.001-R1/R9)', async () => {
    jest.useFakeTimers();
    await render(<OffersScreen />);
    const input = screen.getByPlaceholderText('offers.searchPlaceholder');

    await fireEvent.changeText(input, 'coffee');
    await act(async () => jest.advanceTimersByTime(400));

    expect(screen.getByRole('button', { name: 'coffee' })).toBeTruthy();
    expect(screen.getByText('offers.recentSearches')).toBeTruthy();
    const calls = mockSearchOffers.mock.calls.length;
    await act(async () => jest.advanceTimersByTime(1000));
    expect(mockSearchOffers).toHaveBeenCalledTimes(calls);
    jest.useRealTimers();
  });

  it('selecting a recent supersedes an in-flight typed lookup (APP.SEARCH.INTERACTION.001-R8)', async () => {
    jest.useFakeTimers();
    await render(<OffersScreen />);
    const input = screen.getByPlaceholderText('offers.searchPlaceholder');

    await fireEvent.changeText(input, 'coffee');
    await act(async () => jest.advanceTimersByTime(400));
    await fireEvent.changeText(input, 'cof');
    const before = mockSearchOffers.mock.calls.length;

    await fireEvent.press(screen.getByRole('button', { name: 'coffee' }));

    expect(mockSearchOffers.mock.calls.length).toBe(before + 1);
    expect(mockSearchOffers).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'coffee' }),
      expect.anything()
    );
    await act(async () => jest.advanceTimersByTime(1000));
    expect(mockSearchOffers.mock.calls.length).toBe(before + 1);
    jest.useRealTimers();
  });

  it('still issues a typed lookup after a recent was recalled', async () => {
    jest.useFakeTimers();
    await render(<OffersScreen />);
    const input = screen.getByPlaceholderText('offers.searchPlaceholder');

    await fireEvent.changeText(input, 'coffee');
    await act(async () => jest.advanceTimersByTime(400));
    await fireEvent.press(screen.getByRole('button', { name: 'coffee' }));

    await fireEvent.changeText(input, 'tea');
    await act(async () => jest.advanceTimersByTime(400));

    expect(mockSearchOffers).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'tea' }),
      expect.anything()
    );
    jest.useRealTimers();
  });

  it('bounds and deduplicates recents and lets the user clear them (OFFERS.SEARCH.RECENTS.001-R5/R11)', async () => {
    jest.useFakeTimers();
    await render(<OffersScreen />);
    const input = screen.getByPlaceholderText('offers.searchPlaceholder');

    for (const value of ['one', 'two', 'THREE', 'three', 'four', 'five', 'six']) {
      await fireEvent.changeText(input, value);
      await act(async () => jest.advanceTimersByTime(400));
    }

    expect(screen.getAllByRole('button', { name: /^(one|two|three|four|five|six)$/u })).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: /^three$/iu })).toHaveLength(1);

    await fireEvent.press(screen.getByRole('button', { name: 'offers.clearRecents' }));
    expect(screen.queryByRole('button', { name: 'one' })).toBeNull();
    jest.useRealTimers();
  });

  it('saves and reapplies a radius preset without any coordinate (OFFERS.SEARCH.RECENTS.001-R3/R6)', async () => {
    await render(<OffersScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'offers.savePreset' }));
    expect(screen.getByText('offers.savedPresets')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('coverage-distance-control'));
    await fireEvent.press(screen.getByRole('radio', { name: '500 m' }));

    const preset = screen.getByRole('button', { name: /offers.savedPresets 1500 m/u });
    await fireEvent.press(preset);

    expect(mockSearchOffers).toHaveBeenLastCalledWith(
      expect.objectContaining({ radiusMeters: 1500 }),
      expect.anything()
    );
    expect(screen.queryByText(/-?\d+\.\d{4,}/u)).toBeNull();
  });

  it('announces an inline search validation message and clears it when corrected (APP.VALIDATION.001-R12/R14)', async () => {
    await render(<OffersScreen />);
    const input = screen.getByPlaceholderText('offers.searchPlaceholder');

    await fireEvent.changeText(input, 'x');
    expect(screen.getByTestId('offers-search-validation')).toBeTruthy();
    expect(input.props.accessibilityHint).toBe('offers.searchMinLength');

    await fireEvent.changeText(input, 'co');
    expect(screen.queryByTestId('offers-search-validation')).toBeNull();
    expect(input.props.accessibilityHint).toBeUndefined();
  });

  it('offers a labelled batch selection mode with an explicit exit', async () => {
    mockSearchOffers.mockResolvedValue({
      offers: [{ offerId: 'o1', businessName: 'Cafe', description: '', tags: [], imageUrl: '', imageUrls: [] }],
      businesses: [],
    });
    await render(<OffersScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'offers.select' }));
    const toggle = await screen.findByTestId('card-selection-o1');
    await fireEvent.press(toggle);
    expect(toggle.props.accessibilityState).toEqual({ checked: true });

    await fireEvent.press(screen.getByRole('button', { name: 'offers.batchFavorite' }));
    expect(screen.queryByRole('button', { name: 'offers.select' })).toBeNull();
    expect(screen.getByRole('button', { name: 'offers.batchDone' })).toBeTruthy();
  });

  it('supports a batch availability vote for selected offers (OFFERS.SEARCH.001-R18)', async () => {
    mockVote.mockResolvedValue({ success: true });
    mockSearchOffers.mockResolvedValue({
      offers: [{ offerId: 'o1', businessName: 'Cafe', description: '', tags: [], imageUrl: '', imageUrls: [], hasCurrentUserVoted: false }],
      businesses: [],
    });
    await render(<OffersScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'offers.select' }));
    await fireEvent.press(await screen.findByTestId('card-selection-o1'));
    await fireEvent.press(screen.getByRole('button', { name: 'offers.action.available' }));

    expect(mockVote).toHaveBeenCalledWith('o1', { vote: 1 });
    expect(screen.getByText('offers.feedbackRegistered')).toBeTruthy();
  });

  it('uses the Material 3 search field and buttons for discovery controls (OFFERS.SEARCH.001-R20)', async () => {
    const view = await render(<OffersScreen />);

    expect(hasComponent(view.root, Searchbar)).toBe(true);
    expect(hasComponent(view.root, Button)).toBe(true);
  });

  it('uses Material 3 icon buttons, ripple surfaces and type roles for search chrome (APP.PLATFORM.CHROME.001-R18/R19)', async () => {
    jest.useFakeTimers();
    const view = await render(<OffersScreen />);
    const input = screen.getByPlaceholderText('offers.searchPlaceholder');
    await fireEvent.changeText(input, 'coffee');
    await act(async () => jest.advanceTimersByTime(400));

    expect(hasAncestor(screen.getByLabelText('common.remove coffee'), IconButton)).toBe(true);
    expect(hasComponent(view.root, PaperText)).toBe(true);
    jest.useRealTimers();
  });
});
