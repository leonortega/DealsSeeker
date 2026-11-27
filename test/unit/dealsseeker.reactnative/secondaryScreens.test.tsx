import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { FavoritesScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen';
import { OfferReportSheet } from '../../../src/DealsSeeker.ReactNative/src/components/OfferReportSheet';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';

let mockActiveTab = 'favorites';
let mockOverlayRoute: { name: string } | null = { name: 'favorites' };
let mockReportDraft: unknown = null;
const mockOpenTab = jest.fn();
const mockCloseOverlay = jest.fn();
const mockClearReportDraft = jest.fn();
const mockSearchOffers = jest.fn();
const mockSetOfferFavorite = jest.fn();
const mockSubmitSuggestion = jest.fn();
const mockSubmitReport = jest.fn();
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
    activeTab: mockActiveTab,
    api: {
      searchOffers: mockSearchOffers,
      setOfferFavorite: mockSetOfferFavorite,
      submitReport: mockSubmitReport,
      submitSuggestion: mockSubmitSuggestion,
    },
    clearReportDraft: mockClearReportDraft,
    closeOverlay: mockCloseOverlay,
    closeSheet: jest.fn(),
    openSheet: jest.fn(),
    openTab: mockOpenTab,
    overlayRoute: mockOverlayRoute,
    palette: {
      accent: '#b85c38',
      backgroundRaised: '#efe5d8',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    reportDraft: mockReportDraft,
    session: { userId: 'u1' },
    t: (key: string) => key,
  }),
}));

const offer = {
  offerId: 'o1',
  businessName: 'Main Street Cafe',
  description: 'Coffee and snacks',
  location: { lat: 40.7, lng: -74 },
} as never;

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'favorites' };
    mockSearchOffers.mockResolvedValue({ offers: [offer] });
    mockSetOfferFavorite.mockResolvedValue({ success: true });
  });

  it('renders nothing outside the favorites overlay', async () => {
    mockOverlayRoute = null;
    await render(<FavoritesScreen />);
    expect(screen.queryByText('favorites.title')).toBeNull();
  });

  it('loads and lists favorite offers with a favorites-only search', async () => {
    await render(<FavoritesScreen />);

    expect(await screen.findByText('Main Street Cafe')).toBeTruthy();
    expect(screen.queryByText('app.title')).toBeNull();
    expect(mockSearchOffers).toHaveBeenCalledWith(
      expect.objectContaining({ favoritesOnly: true, query: '', radiusMeters: 5000 })
    );
  });

  it('removes an offer from the list after a successful unfavorite', async () => {
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    await fireEvent.press(screen.getByText('offers.favoriteRemove'));

    await waitFor(() =>
      expect(mockSetOfferFavorite).toHaveBeenCalledWith('o1', { isFavorite: false })
    );
    expect(screen.queryByText('Main Street Cafe')).toBeNull();
  });

  it('shows a failure message when loading fails', async () => {
    mockSearchOffers.mockRejectedValue(new Error('offline'));
    await render(<FavoritesScreen />);
    expect(await screen.findByText('favorites.loadFailed')).toBeTruthy();
  });

  it('renders favorites through a recycling list', async () => {
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    const scroll = screen.getByTestId('favorites-scroll');
    expect(scroll.props.data).toEqual([expect.objectContaining({ offerId: 'o1' })]);
    expect(typeof scroll.props.renderItem).toBe('function');
  });
});

describe('SuggestionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveTab = 'suggestions';
    mockSubmitSuggestion.mockResolvedValue({ success: true });
  });

  it('renders nothing outside the suggestions tab', async () => {
    mockActiveTab = 'offers';
    await render(<SuggestionsScreen />);
    expect(screen.queryByText('suggestions.title')).toBeNull();
  });

  it('submits a trimmed suggestion, keeps success visible, then returns via Done', async () => {
    await render(<SuggestionsScreen />);
    expect(screen.queryByText('app.title')).toBeNull();
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.message'), '  More deals please  ');
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.contact'), ' ');
    await fireEvent.press(screen.getByText('suggestions.submit'));

    await waitFor(() =>
      expect(mockSubmitSuggestion).toHaveBeenCalledWith({ message: 'More deals please', contact: null })
    );
    expect(await screen.findByText('suggestions.success')).toBeTruthy();
    expect(mockSuccessFeedback).toHaveBeenCalledTimes(1);
    expect(mockOpenTab).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('suggestions-done'));
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
  });

  it('does not auto-navigate after a successful suggestion', async () => {
    jest.useFakeTimers();
    await render(<SuggestionsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.message'), 'More deals please');
    await fireEvent.press(screen.getByText('suggestions.submit'));
    await waitFor(() => expect(mockSubmitSuggestion).toHaveBeenCalled());
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockOpenTab).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('shows a live message counter that stops at 120 characters', async () => {
    await render(<SuggestionsScreen />);

    const input = screen.getByPlaceholderText('suggestions.message');
    expect(screen.getByText('0/120')).toBeTruthy();

    await fireEvent.changeText(input, 'Short');
    expect(screen.getByText('5/120')).toBeTruthy();

    await fireEvent.changeText(input, 'x'.repeat(130));
    expect(input.props.value).toHaveLength(120);
    expect(screen.getByText('120/120')).toBeTruthy();
  });

  it('caps the optional contact at 254 characters', async () => {
    await render(<SuggestionsScreen />);

    const input = screen.getByPlaceholderText('suggestions.contact');
    await fireEvent.changeText(input, 'x'.repeat(300));

    expect(input.props.value).toHaveLength(254);
  });

  it('reports a failed submission without leaving the view', async () => {
    mockSubmitSuggestion.mockResolvedValue({ success: false });
    await render(<SuggestionsScreen />);
    await fireEvent.press(screen.getByText('suggestions.submit'));

    expect(await screen.findByText('suggestions.failed')).toBeTruthy();
    expect(mockOpenTab).not.toHaveBeenCalled();
    expect(mockSuccessFeedback).not.toHaveBeenCalled();
  });
});

describe('OfferReportSheet', () => {
  const draft = {
    offer: { offerId: 'o9', businessName: 'Draft Cafe', description: 'Draft offer' },
    userId: 'u1',
    reportedAtUtc: '2026-01-01T00:00:00.000Z',
    initialMessage: 'Report draft for o9',
  };
  let onClose: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportDraft = draft;
    mockSubmitReport.mockResolvedValue({ success: true });
    onClose = jest.fn();
  });

  it('shows the offer preview and prefilled message', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);

    expect(screen.getByText('Draft Cafe')).toBeTruthy();
    expect(screen.getByPlaceholderText('reports.message').props.value).toBe('Report draft for o9');
    expect(screen.getByTestId('native-bottom-sheet')).toBeTruthy();
  });

  it('shows a live message counter that stops at 120 characters', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);

    const input = screen.getByPlaceholderText('reports.message');
    expect(screen.getByText(`${draft.initialMessage.length}/120`)).toBeTruthy();

    await fireEvent.changeText(input, 'x'.repeat(130));
    expect(input.props.value).toHaveLength(120);
    expect(screen.getByText('120/120')).toBeTruthy();
  });

  it('requires a message before submitting', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), '');
    await fireEvent.press(screen.getByText('reports.submit'));

    expect(screen.getByText('reports.messageRequired')).toBeTruthy();
    expect(mockSubmitReport).not.toHaveBeenCalled();
  });

  it('submits, keeps success visible, then closes via Done', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));

    await waitFor(() => expect(mockSubmitReport).toHaveBeenCalled());
    expect(await screen.findByText('reports.success')).toBeTruthy();
    expect(mockSuccessFeedback).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(mockOpenTab).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('report-done'));
    expect(mockClearReportDraft).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
  });

  it('does not auto-navigate when the sheet unmounts after a successful report', async () => {
    jest.useFakeTimers();
    const view = await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));
    await waitFor(() => expect(mockSubmitReport).toHaveBeenCalled());

    await act(async () => {
      view.unmount();
    });
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockOpenTab).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('reports a failed submission without closing', async () => {
    mockSubmitReport.mockResolvedValue({ success: false });
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));

    expect(await screen.findByText('reports.failed')).toBeTruthy();
    expect(mockSuccessFeedback).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not expose raw identifiers', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);

    expect(screen.queryByText('reports.userId')).toBeNull();
    expect(screen.queryByText('reports.offerId')).toBeNull();
    expect(screen.queryByLabelText('reports.offerId')).toBeNull();
  });

  it('attaches the authenticated user id without showing it', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));

    await waitFor(() =>
      expect(mockSubmitReport).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Closed down', userId: 'u1', offerId: 'o9' })
      )
    );
  });
});
