import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { FavoritesScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen';
import { ReportsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/ReportsScreen';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';

let mockActiveTab = 'favorites';
let mockOverlayRoute: { name: string } | null = { name: 'favorites' };
let mockReportDraft: unknown = null;
const mockOpenTab = jest.fn();
const mockClearReportDraft = jest.fn();
const mockSearchOffers = jest.fn();
const mockSetOfferFavorite = jest.fn();
const mockSubmitSuggestion = jest.fn();
const mockSubmitReport = jest.fn();

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

  it('submits a trimmed suggestion, shows success, then returns to Offers', async () => {
    jest.useFakeTimers();
    await render(<SuggestionsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.message'), '  More deals please  ');
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.contact'), ' ');
    await fireEvent.press(screen.getByText('suggestions.submit'));

    await waitFor(() =>
      expect(mockSubmitSuggestion).toHaveBeenCalledWith({ message: 'More deals please', contact: null })
    );
    expect(await screen.findByText('suggestions.success')).toBeTruthy();
    expect(mockOpenTab).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
    jest.useRealTimers();
  });

  it('cancels the pending Offers redirect when the user leaves before it fires', async () => {
    jest.useFakeTimers();
    const view = await render(<SuggestionsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.message'), 'More deals please');
    await fireEvent.press(screen.getByText('suggestions.submit'));
    await waitFor(() => expect(mockSubmitSuggestion).toHaveBeenCalled());

    mockActiveTab = 'reports';
    await act(async () => {
      view.rerender(<SuggestionsScreen />);
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOpenTab).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('reports a failed submission without leaving the view', async () => {
    mockSubmitSuggestion.mockResolvedValue({ success: false });
    await render(<SuggestionsScreen />);
    await fireEvent.press(screen.getByText('suggestions.submit'));

    expect(await screen.findByText('suggestions.failed')).toBeTruthy();
    expect(mockOpenTab).not.toHaveBeenCalled();
  });
});

describe('ReportsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveTab = 'reports';
    mockReportDraft = null;
    mockSubmitReport.mockResolvedValue({ success: true });
  });

  it('requires a message before submitting', async () => {
    await render(<ReportsScreen />);
    await fireEvent.press(screen.getByText('reports.submit'));
    expect(screen.getByText('reports.messageRequired')).toBeTruthy();
  });

  it('prefills the form from a report draft and locks the offer id', async () => {
    mockReportDraft = {
      offer: { offerId: 'o9', businessName: 'Draft Cafe', description: 'Draft offer' },
      userId: 'u1',
      reportedAtUtc: '2026-01-01T00:00:00.000Z',
      initialMessage: 'Report draft for o9',
    };
    await render(<ReportsScreen />);

    expect(screen.getByText('Draft Cafe')).toBeTruthy();
    expect(screen.getByPlaceholderText('reports.message').props.value).toBe('Report draft for o9');
  });

  it('submits a report, clears the draft, shows success, then returns to Offers', async () => {
    jest.useFakeTimers();
    await render(<ReportsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));

    await waitFor(() => expect(mockSubmitReport).toHaveBeenCalled());
    expect(mockClearReportDraft).toHaveBeenCalled();
    expect(await screen.findByText('reports.success')).toBeTruthy();
    expect(mockOpenTab).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
    jest.useRealTimers();
  });

  it('cancels the pending Offers redirect when the user leaves before it fires', async () => {
    jest.useFakeTimers();
    const view = await render(<ReportsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));
    await waitFor(() => expect(mockSubmitReport).toHaveBeenCalled());

    mockActiveTab = 'account';
    await act(async () => {
      view.rerender(<ReportsScreen />);
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOpenTab).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('reports a failed submission', async () => {
    mockSubmitReport.mockResolvedValue({ success: false });
    await render(<ReportsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByText('reports.submit'));

    expect(await screen.findByText('reports.failed')).toBeTruthy();
  });
});
