import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import * as Location from 'expo-location';
import {
  ActivityIndicator as PaperActivityIndicator,
  Button,
  Card,
  Snackbar,
  Text as PaperText,
} from 'react-native-paper';
import { LoadingOverlay } from '../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay';
import { FavoritesScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen';

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
import { OfferReportSheet } from '../../../src/DealsSeeker.ReactNative/src/components/OfferReportSheet';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';

// Paper primitives keep testID/accessibilityRole/style so the authored assertions still hold.
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Pressable, TextInput, Text } = require('react-native');
  const basic = (Component: any) => ({
    children, label, testID, style, accessibilityLabel, accessibilityRole, accessibilityState,
    onPress, disabled, placeholder, placeholderTextColor, value, onChangeText, maxLength,
    accessibilityHint, accessibilityLiveRegion, inputStyle, visible,
  }: any) => {
    if (visible === false) {
      return null;
    }
    const content = children ?? label;
    const rendered = typeof content === 'string' && Component !== Text
      ? React.createElement(Text, null, content)
      : content;
    return React.createElement(Component, {
      testID,
      style: style ?? inputStyle,
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      accessibilityHint,
      accessibilityLiveRegion,
      disabled,
      onPress,
      placeholder,
      placeholderTextColor,
      value,
      onChangeText,
      maxLength,
    }, rendered);
  };
  const button = (props: any) =>
    basic(Pressable)({ accessibilityRole: 'button', accessible: true, ...props });
  const radioItem = ({ status, ...props }: any) =>
    basic(Pressable)({
      accessibilityRole: 'radio',
      accessibilityState: { checked: status === 'checked', disabled: false },
      ...props,
    });
  const RadioButton = { Group: basic(View) };
  RadioButton.Android = radioItem;
  RadioButton.Item = radioItem;
  return {
    useTheme: () => ({ colors: { primary: '#b85c38', onPrimary: '#ffffff', primaryContainer: '#ffdbcf', surface: '#fffdf8', surfaceVariant: '#f5ded6', background: '#fffdf8', onSurface: '#1f3128', onSurfaceVariant: '#53433e', outline: '#d7c9b5', outlineVariant: '#d8c2bb', error: '#ba1a1a', onError: '#ffffff', elevation: { level1: '#fff' } }, fonts: {} }),
    MD3LightTheme: { colors: {}, fonts: {} },
    MD3DarkTheme: { colors: {}, fonts: {} },
    DefaultTheme: { colors: {}, fonts: {} },
    Searchbar: basic(TextInput),
    Chip: basic(Pressable),
    Button: button,
    TouchableRipple: basic(Pressable),
    Card: basic(View),
    Badge: basic(View),
    FAB: basic(Pressable),
    TextInput: basic(TextInput),
    HelperText: basic(Text),
    ActivityIndicator: basic(View),
    Dialog: Object.assign(basic(View), {
      Title: basic(Text),
      Content: basic(View),
      Actions: basic(View),
    }),
    RadioButton,
    Snackbar: basic(View),
    Surface: basic(View),
    Text: basic(Text),
    Divider: basic(View),
    Switch: basic(Pressable),
    Avatar: { Text: basic(Text), Icon: basic(View) },
    List: { Section: basic(View), Item: basic(Pressable), Subheader: basic(Text) },
    Appbar: Object.assign(basic(View), { Header: basic(View), Content: basic(Text), Action: basic(Pressable), BackAction: basic(Pressable) }),
    SegmentedButtons: basic(View),
    Checkbox: Object.assign(basic(Pressable), { Item: basic(Pressable) }),
    Portal: ({ children }: any) => children,
    IconButton: button,
    ProgressBar: basic(View),
  };
});

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
  const requestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
  const getPosition = Location.getCurrentPositionAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'favorites' };
    requestPermission.mockResolvedValue({ granted: true });
    getPosition.mockResolvedValue({ coords: { latitude: 10.25, longitude: -20.5 } });
    mockSearchOffers.mockResolvedValue({ offers: [offer] });
    mockSetOfferFavorite.mockResolvedValue({ success: true });
    delete process.env['EXPO_PUBLIC_EMULATOR_LOCATION'];
  });

  afterEach(() => {
    delete process.env['EXPO_PUBLIC_EMULATOR_LOCATION'];
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

  it('does not search a fabricated coordinate when permission is denied', async () => {
    requestPermission.mockResolvedValue({ granted: false });

    await render(<FavoritesScreen />);

    expect(await screen.findByText('offers.locationUnavailable')).toBeTruthy();
    expect(screen.getByText('offers.locationUnavailableHint')).toBeTruthy();
    expect(screen.getByTestId('favorites-location-unavailable')).toBeTruthy();
    expect(mockSearchOffers).not.toHaveBeenCalled();
  });

  it('keeps the screen mounted with one retry action when the lookup fails', async () => {
    getPosition.mockRejectedValue(new Error('provider unavailable'));

    await render(<FavoritesScreen />);

    expect(await screen.findByText('offers.locationUnavailable')).toBeTruthy();
    expect(screen.getAllByText('offers.retryLocation')).toHaveLength(1);
    expect(screen.getByTestId('favorites-location-retry')).toBeTruthy();
    expect(screen.queryByText('Main Street Cafe')).toBeNull();
    expect(mockSearchOffers).not.toHaveBeenCalled();
  });

  it('runs the favorites search after a successful retry', async () => {
    requestPermission.mockResolvedValue({ granted: false });
    await render(<FavoritesScreen />);
    await screen.findByText('offers.locationUnavailable');

    requestPermission.mockResolvedValue({ granted: true });
    getPosition.mockResolvedValue({ coords: { latitude: 12.5, longitude: -33.25 } });
    await fireEvent.press(screen.getByTestId('favorites-location-retry'));

    expect(await screen.findByText('Main Street Cafe')).toBeTruthy();
    expect(mockSearchOffers).toHaveBeenCalledWith(
      expect.objectContaining({
        userLocation: { lat: 12.5, lng: -33.25 },
        favoritesOnly: true,
      })
    );
    expect(screen.queryByText('offers.locationUnavailable')).toBeNull();
  });

  it('keeps the unavailable state with a failure message after a failed retry', async () => {
    requestPermission.mockResolvedValue({ granted: false });
    await render(<FavoritesScreen />);
    await screen.findByText('offers.locationUnavailable');

    await fireEvent.press(screen.getByTestId('favorites-location-retry'));

    expect(await screen.findByText('offers.locationRetryFailed')).toBeTruthy();
    expect(screen.getByText('offers.locationUnavailable')).toBeTruthy();
    expect(screen.getByTestId('favorites-location-retry')).toBeTruthy();
    expect(mockSearchOffers).not.toHaveBeenCalled();
  });

  it('honors an explicit developer location override', async () => {
    process.env['EXPO_PUBLIC_EMULATOR_LOCATION'] = '10.5,-20.25';
    requestPermission.mockResolvedValue({ granted: false });

    await render(<FavoritesScreen />);

    expect(await screen.findByText('Main Street Cafe')).toBeTruthy();
    expect(mockSearchOffers).toHaveBeenCalledWith(
      expect.objectContaining({ userLocation: { lat: 10.5, lng: -20.25 } })
    );
    expect(screen.queryByText('offers.locationUnavailable')).toBeNull();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('exposes no raw coordinates in the unavailable state', async () => {
    requestPermission.mockResolvedValue({ granted: false });
    await render(<FavoritesScreen />);
    await screen.findByText('offers.locationUnavailable');

    expect(screen.queryByText(/40\.7128|-74\.006|10\.25|-20\.5/)).toBeNull();
  });

  it('offers one undo that restores a removed favorite to its previous position (OFFERS.FAVORITES.001-R12)', async () => {
    const secondOffer = { ...offer, offerId: 'o2', businessName: 'Second Cafe' } as never;
    mockSearchOffers.mockResolvedValue({ offers: [offer, secondOffer] });
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    await fireEvent.press(screen.getAllByRole('button', { name: 'offers.favoriteRemove' })[0]);

    expect(await screen.findByText('offers.favoriteReverted')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'common.undo' })).toHaveLength(1);
    expect(screen.queryByText('Main Street Cafe')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'common.undo' }));

    await waitFor(() => expect(mockSetOfferFavorite).toHaveBeenCalledWith('o1', { isFavorite: true }));
    const titles = screen.getAllByText(/Cafe/u).map((node) => node.props.children);
    expect(titles).toEqual(['Main Street Cafe', 'Second Cafe']);
    expect(screen.queryByText('offers.favoriteReverted')).toBeNull();
  });

  it('shows a pending indication while a removal is in flight (APP.FEEDBACK.001-R10)', async () => {
    let resolveRemoval: ((value: { success: boolean }) => void) | null = null;
    mockSetOfferFavorite.mockImplementation(
      () => new Promise<{ success: boolean }>((resolve) => { resolveRemoval = resolve; })
    );
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    await fireEvent.press(screen.getByRole('button', { name: 'offers.favoriteRemove' }));

    expect(await screen.findByText('common.saving')).toBeTruthy();
    await act(async () => resolveRemoval?.({ success: true }));
    expect(screen.queryByText('common.saving')).toBeNull();
  });

  it('offers no undo when a removal fails (APP.FEEDBACK.001-R11)', async () => {
    mockSetOfferFavorite.mockResolvedValue({ success: false });
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    await fireEvent.press(screen.getByRole('button', { name: 'offers.favoriteRemove' }));

    expect(await screen.findByText('favorites.removeFailed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'common.undo' })).toBeNull();
    expect(screen.getByText('Main Street Cafe')).toBeTruthy();
  });

  it('announces the removal action with a canonical name and an offer-specific state (OFFERS.FAVORITES.001-R13)', async () => {
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    const removal = screen.getByRole('button', { name: 'offers.favoriteRemove' });
    expect(removal.props.accessibilityRole).toBe('button');
    expect(removal.props.accessibilityState).toMatchObject({ selected: true });
  });

  it('uses Material 3 card, button and snackbar surfaces (OFFERS.FAVORITES.001-R15)', async () => {
    await render(<FavoritesScreen />);
    await screen.findByText('Main Street Cafe');

    expect(hasComponent(screen.root, Card)).toBe(true);
    expect(hasComponent(screen.root, Button)).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'offers.favoriteRemove' }));
    expect(await screen.findByText('offers.favoriteReverted')).toBeTruthy();
    expect(hasComponent(screen.root, Snackbar)).toBe(true);
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

  async function chooseReason() {
    await fireEvent.press(screen.getByRole('radio', { name: 'reports.reason.closed', includeHiddenElements: true }));
  }

  async function requestSend() {
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));
    await fireEvent.press(screen.getByTestId('report-confirm-send', { includeHiddenElements: true }));
  }

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
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), '');
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));

    expect(screen.getByText('reports.messageRequired')).toBeTruthy();
    expect(mockSubmitReport).not.toHaveBeenCalled();
  });

  it('requires a fixed reason before the send action is available', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);

    expect(screen.getByRole('radio', { name: 'reports.reason.closed', includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'reports.reason.inaccurate', includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'reports.reason.unavailable', includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'reports.reason.other', includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'reports.submit' }).props.accessibilityState?.disabled).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));
    expect(mockSubmitReport).not.toHaveBeenCalled();
    expect(screen.queryByTestId('report-confirm-send', { includeHiddenElements: true })).toBeNull();
  });

  it('confirms the reason, message and offer before sending anything', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));

    expect(screen.getByText('reports.confirmTitle', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('reports.reason.closed', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('Closed down', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getAllByText('Draft Cafe', { includeHiddenElements: true }).length).toBeGreaterThan(0);
    expect(mockSubmitReport).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('report-confirm-send', { includeHiddenElements: true }));
    await waitFor(() => expect(mockSubmitReport).toHaveBeenCalledTimes(1));
  });

  it('uses a Material dialog for the send confirmation', async () => {
    const view = await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));

    await waitFor(() => expect(view.getByText('reports.confirmTitle', { includeHiddenElements: true })).toBeTruthy());
    expect(view.getByTestId('report-confirm-send', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByText('reports.reason.closed', { includeHiddenElements: true })).toBeTruthy();
  });

  it('cancel returns to the form with everything preserved and sends nothing', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));
    await fireEvent.press(screen.getByTestId('report-confirm-cancel', { includeHiddenElements: true }));

    expect(mockSubmitReport).not.toHaveBeenCalled();
    expect(screen.queryByText('reports.confirmTitle', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByRole('radio', { name: 'reports.reason.closed', includeHiddenElements: true }).props.accessibilityState).toMatchObject({
      checked: true,
    });
    expect(screen.getByPlaceholderText('reports.message').props.value).toBe('Closed down');
  });

  it('system Back from the confirmation behaves as cancel', async () => {
    let backHandler: (() => boolean) | undefined;
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandler = handler as () => boolean;
      return { remove: jest.fn() };
    });

    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));
    expect(backHandler).toBeDefined();

    await act(async () => {
      expect(backHandler?.()).toBe(true);
    });

    expect(mockSubmitReport).not.toHaveBeenCalled();
    expect(screen.queryByText('reports.confirmTitle', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByPlaceholderText('reports.message').props.value).toBe('Closed down');
  });

  it('never shows the machine timestamp or identifier in user-facing text', async () => {
    const view = await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await chooseReason();
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));

    const tree = JSON.stringify(view.toJSON());
    expect(tree).not.toContain('2026-01-01T00:00:00.000Z');
    expect(screen.queryByLabelText('reports.reportedAt')).toBeNull();
    expect(screen.queryByLabelText('reports.offerId')).toBeNull();
    expect(screen.queryByLabelText('reports.userId')).toBeNull();
  });

  it('attaches guidance to the message field while it is active', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await fireEvent(screen.getByPlaceholderText('reports.message'), 'focus');

    const guidance = screen.getByTestId('report-guidance');
    expect(guidance.props.accessibilityLabel).toBeTruthy();
    expect(screen.getByPlaceholderText('reports.message').props.value).toBe('Report draft for o9');
  });

  it('submits, keeps success visible, then closes via Done', async () => {
    await render(<OfferReportSheet draft={mockReportDraft} onClose={onClose} visible />);
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await requestSend();

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
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await requestSend();
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
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await requestSend();

    expect(await screen.findByText('reports.failed', { includeHiddenElements: true })).toBeTruthy();
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
    await chooseReason();
    await fireEvent.changeText(screen.getByPlaceholderText('reports.message'), 'Closed down');
    await requestSend();

    await waitFor(() =>
      expect(mockSubmitReport).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Closed down', userId: 'u1', offerId: 'o9' })
      )
    );
  });
});

describe('LoadingOverlay', () => {
  it('renders the pending message and spinner with Material 3 Paper primitives', async () => {
    const view = await render(<LoadingOverlay visible />);

    expect(screen.getByText('app.loading')).toBeTruthy();
    expect(hasComponent(view.root, PaperActivityIndicator)).toBe(true);
    expect(hasComponent(view.root, PaperText)).toBe(true);
  });
});
