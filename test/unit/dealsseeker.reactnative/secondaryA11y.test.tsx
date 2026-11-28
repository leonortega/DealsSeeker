import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AccessibilityInfo } from 'react-native';
import { MD3LightTheme } from 'react-native-paper';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';
import { OfferReportSheet } from '../../../src/DealsSeeker.ReactNative/src/components/OfferReportSheet';
import { FavoritesScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen';
import { HelpSheet } from '../../../src/DealsSeeker.ReactNative/src/components/HelpSheet';

let mockActiveTab = 'suggestions';
let mockOverlayRoute: { name: string } | null = null;
const mockCloseOverlay = jest.fn();
const mockSubmitSuggestion = jest.fn();
const mockSubmitReport = jest.fn();
const mockGetFavorites = jest.fn();
const mockSetFavorite = jest.fn();
const mockOpenTab = jest.fn();
const mockCloseHelp = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: jest.fn(),
    closeSheet: jest.fn(),
    activeTab: mockActiveTab,
    api: {
      submitSuggestion: mockSubmitSuggestion,
      submitReport: mockSubmitReport,
      getFavorites: mockGetFavorites,
      setOfferFavorite: mockSetFavorite,
    },
    clearReportDraft: jest.fn(),
    closeOverlay: mockCloseOverlay,
    openTab: mockOpenTab,
    overlayRoute: mockOverlayRoute,
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(0,0,0,0.5)',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    session: { userId: 'u1' },
    t: (key: string) => key,
  }),
}));

describe('secondary surface accessibility (APP.ACCESSIBILITY.UX.002/003)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveTab = 'suggestions';
    mockOverlayRoute = null;
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    mockSubmitSuggestion.mockResolvedValue({ success: false });
    mockGetFavorites.mockResolvedValue([]);
    mockSetFavorite.mockResolvedValue({ success: true });
  });

  it('labels suggestion inputs and announces a failed submission', async () => {
    await render(<SuggestionsScreen />);
    expect(screen.getByLabelText('suggestions.message')).toBeTruthy();
    expect(screen.getByLabelText('suggestions.contact')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'suggestions.submit' }));
    await waitFor(() =>
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('suggestions.failed')
    );
  });

  it('labels the report sheet input without exposing internal identifiers', async () => {
    const draft = {
      offer: { offerId: 'o9', businessName: 'Draft Cafe', description: 'Draft offer' },
      userId: 'u1',
      reportedAtUtc: '2026-01-01T00:00:00.000Z',
      initialMessage: '',
    };
    await render(<OfferReportSheet draft={draft} onClose={jest.fn()} visible />);
    expect(screen.getByLabelText('reports.message')).toBeTruthy();
    expect(screen.queryByLabelText('reports.offerId')).toBeNull();
  });

  it('announces the help sheet as a modal with native dismissal', async () => {
    await render(<HelpSheet onClose={mockCloseHelp} visible />);
    expect(screen.getByTestId('help-sheet').props.accessibilityViewIsModal).toBe(true);
    expect(screen.queryByRole('button', { name: 'common.close' })).toBeNull();
    expect(screen.getByTestId('native-bottom-sheet').props.onClose).toBeDefined();
  });

  it('shows a failed submission as an error status', async () => {
    mockSubmitSuggestion.mockResolvedValue({ success: false });
    await render(<SuggestionsScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'suggestions.submit' }));
    const status = await screen.findByText('suggestions.failed');
    expect(StyleSheet.flatten(status.props.style).color).toBe(MD3LightTheme.colors.error);
  });
});
