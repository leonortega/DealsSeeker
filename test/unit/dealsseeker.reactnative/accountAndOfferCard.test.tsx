import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  IconButton,
  MD3LightTheme,
  PaperProvider,
  Text as PaperText,
  TouchableRipple,
} from 'react-native-paper';
import { Alert, Platform, StyleSheet } from 'react-native';

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

/** Whether a rendered control descends from the given Material 3 component. */
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

function hasVariant(instance: any, variant: keyof typeof MD3LightTheme.fonts): boolean {
  return StyleSheet.flatten(instance.props.style).fontSize === MD3LightTheme.fonts[variant].fontSize;
}
import { OfferCard } from '../../../src/DealsSeeker.ReactNative/src/components/OfferCard';
import { AccountScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AccountScreen';
import { platformTouchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const glyph = (prefix: string) => ({ name, ...props }: { name: string }) =>
    React.createElement(Text, { ...props, testID: `${prefix}-${name}` });
  return {
    Ionicons: glyph('ionicon'),
    MaterialIcons: glyph('materialicon'),
    MaterialCommunityIcons: glyph('materialicon'),
  };
});

function setPlatform(os: 'ios' | 'android') {
  (Platform as unknown as { OS: string }).OS = os;
}

function glyphs(id: string | RegExp) {
  return screen.getAllByTestId(id, { includeHiddenElements: true });
}

function renderAccount() {
  return render(
    <PaperProvider>
      <AccountScreen />
    </PaperProvider>
  );
}

let mockActiveTab = 'account';
let mockPreferences = { language: 'en', navigationMode: 'pedestrian', themeMode: 'light', themeWorld: 'tangerine' };
const mockGetMyProfile = jest.fn();
const mockGetMyOffers = jest.fn();
const mockDeleteOffer = jest.fn();
const mockLogout = jest.fn();
const mockOpenAddOffer = jest.fn();
const mockSaveAvatar = jest.fn();
const mockSetLanguage = jest.fn();
const mockSetNavigationMode = jest.fn();
const mockSetThemeMode = jest.fn();
const mockSetThemeWorld = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    api: {
      deleteOffer: mockDeleteOffer,
      getMyOffers: mockGetMyOffers,
      getMyProfile: mockGetMyProfile,
    },
    avatarId: 'avatar-1',
    logout: mockLogout,
    openAddOffer: mockOpenAddOffer,
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      background: '#17201d',
      backgroundRaised: '#efe5d8',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(0,0,0,0.5)',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
      shadow: 'rgba(0,0,0,0.1)',
    },
    preferences: mockPreferences,
    saveAvatar: mockSaveAvatar,
    setLanguage: mockSetLanguage,
    setNavigationMode: mockSetNavigationMode,
    setThemeMode: mockSetThemeMode,
    setThemeWorld: mockSetThemeWorld,
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: jest.fn(() => null),
}));

const offer = {
  offerId: 'o1',
  businessId: 'b1',
  businessName: 'Main Street Cafe',
  description: 'Coffee and snacks',
  tags: ['coffee', 'snacks'],
  imageUrl: '',
  imageUrls: [],
  isPromoted: true,
  isReported: false,
  isFavorite: false,
  distanceMeters: 500,
  hasCurrentUserVoted: false,
  positiveAvailabilityCount: 3,
  negativeAvailabilityCount: 1,
  location: { lat: 40.7, lng: -74 },
} as never;

describe('AccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveTab = 'account';
    mockPreferences = { language: 'en', navigationMode: 'pedestrian', themeMode: 'light', themeWorld: 'tangerine' };
    mockGetMyProfile.mockResolvedValue({
      displayName: 'Tester',
      email: 'tester@example.com',
      avatarId: 'avatar-2',
    });
    mockGetMyOffers.mockResolvedValue([offer]);
    mockDeleteOffer.mockResolvedValue({ success: true });
  });

  it('shows a platform chevron on each settings control', async () => {
    setPlatform('ios');
    await renderAccount();

    expect(glyphs('ionicon-chevron-forward-outline')).toHaveLength(2);
    expect(screen.queryByText('›')).toBeNull();
    expect(screen.queryByText('app.title')).toBeNull();
  });

  it('uses Material chevrons on Android', async () => {
    setPlatform('android');
    await renderAccount();

    expect(glyphs('materialicon-chevron-right')).toHaveLength(2);
    expect(screen.queryByText('›')).toBeNull();
  });

  it('bounds the email to two lines so no fragment is stranded', async () => {
    await renderAccount();

    expect(screen.getByText('tester@example.com').props.numberOfLines).toBe(2);
  });

  it('paints the scrollable content area with the Material 3 background role', async () => {
    await renderAccount();

    const scroll = screen.getByTestId('account-scroll');
    expect(scroll.props.style.backgroundColor).toBe(MD3LightTheme.colors.background);
  });

  it('uses the Material 3 type scale instead of an authored landmark font', async () => {
    await renderAccount();

    expect(StyleSheet.flatten(screen.getByText('Tester').props.style).fontFamily).not.toBe('Georgia');
    expect(StyleSheet.flatten(screen.getByText('account.settings').props.style).fontFamily).not.toBe('Georgia');
  });

  it('renders owned offers through a recycling list', async () => {
    await renderAccount();

    const scroll = screen.getByTestId('account-scroll');
    expect(Array.isArray(scroll.props.data)).toBe(true);
    expect(typeof scroll.props.renderItem).toBe('function');
  });

  it('renders nothing outside the account tab', async () => {
    mockActiveTab = 'offers';
    await renderAccount();
    expect(screen.queryByText('account.settings')).toBeNull();
  });

  it('loads the profile and owned offers', async () => {
    await renderAccount();
    expect(await screen.findByText('Tester')).toBeTruthy();
    expect(screen.getByText('tester@example.com')).toBeTruthy();
    expect(screen.getByText('Main Street Cafe')).toBeTruthy();
  });

  it('shows a newly saved avatar immediately', async () => {
    mockGetMyProfile.mockResolvedValue({
      displayName: 'Tester',
      email: 'tester@example.com',
      avatarId: 'smile',
    });
    mockSaveAvatar.mockResolvedValue({ success: true });

    await renderAccount();
    await screen.findByText('Tester');
    expect(screen.getAllByText('🙂')).toHaveLength(2);

    await fireEvent.press(screen.getByLabelText('settings.avatar cat'));

    await waitFor(() => expect(screen.getAllByText('🐱')).toHaveLength(2));
    expect(mockSaveAvatar).toHaveBeenCalledWith('cat');
  });

  it('selects a palette world', async () => {
    await renderAccount();
    expect(screen.getByRole('radio', { name: 'theme.tangerine' }).props.accessibilityState.checked).toBe(true);

    await fireEvent.press(screen.getByText('theme.golden'));
    expect(mockSetThemeWorld).toHaveBeenCalledWith('golden');
  });

  it('selects a theme, language and navigation mode', async () => {
    await renderAccount();
    expect(screen.getByRole('radio', { name: 'nav.lightTheme' }).props.accessibilityState.checked).toBe(true);
    await fireEvent.press(screen.getByText('nav.darkTheme'));
    await fireEvent.press(screen.getByText('EN'));
    await fireEvent.press(screen.getByText('nav.pedestrian'));
    expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
    expect(mockSetNavigationMode).toHaveBeenCalledWith('car');
  });

  it('logs out from the hero', async () => {
    await renderAccount();
    await fireEvent.press(screen.getByText('account.logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('opens the selected offer for editing', async () => {
    await renderAccount();
    await screen.findByText('Main Street Cafe');
    await fireEvent.press(screen.getByText('account.editOffer'));
    expect(mockOpenAddOffer).toHaveBeenCalledWith('o1');
  });

  it('gives account controls the platform touch floor', async () => {
    await renderAccount();
    await screen.findByText('Tester');

    const controls = [
      screen.getByText('account.logout').parent,
      screen.getByText('theme.tangerine').parent,
      screen.getByText('nav.lightTheme').parent,
      screen.getByRole('button', { name: 'nav.language' }),
      screen.getByText('account.editOffer').parent,
      screen.getByText('account.removeOffer').parent,
    ];
    for (const control of controls) {
      expect(StyleSheet.flatten(control.props.style).minHeight).toBeGreaterThanOrEqual(platformTouchFloor);
    }
  });

  it('removes an offer through a Material 3 confirmation dialog', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderAccount();
    await screen.findByText('Main Street Cafe');

    await fireEvent.press(screen.getByText('account.removeOffer'));

    expect(screen.getByText('account.removePrompt')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'common.no' })).toBeTruthy();
    await fireEvent.press(screen.getByText('common.yes'));

    await waitFor(() => expect(mockDeleteOffer).toHaveBeenCalledWith('o1'));
    expect(screen.queryByText('Main Street Cafe')).toBeNull();
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('OfferCard', () => {
  const callbacks = {
    onComments: jest.fn(),
    onDirections: jest.fn(),
    onFavorite: jest.fn(),
    onOpenDetail: jest.fn(),
    onReport: jest.fn(),
    onVote: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  async function renderCard(overrides: Record<string, unknown> = {}) {
    return await render(
      <OfferCard {...callbacks} offer={{ ...offer, ...overrides } as never} query="" />
    );
  }

  it('opens the existing offer actions on long press', async () => {
    await renderCard();

    await fireEvent(screen.getByLabelText('offers.openDetail'), 'longPress');

    expect(callbacks.onOpenDetail).toHaveBeenCalledTimes(1);
  });

  it('keeps short press as the open-detail behavior', async () => {
    await renderCard();

    await fireEvent.press(screen.getByLabelText('offers.openDetail'));

    expect(callbacks.onOpenDetail).toHaveBeenCalledTimes(1);
  });

  it('shows the business name, promotion badge, tags and distance', async () => {
    await renderCard();
    expect(screen.getByText('Main Street Cafe')).toBeTruthy();
    expect(screen.getByText('offers.promoted')).toBeTruthy();
    expect(screen.getByText('coffee')).toBeTruthy();
    expect(screen.getAllByText('500 m').length).toBeGreaterThan(0);
  });

  it('renders a labelled neutral panel instead of placeholder art', async () => {
    await renderCard();

    expect(screen.getByText('add.photoPlaceholder')).toBeTruthy();
    expect(screen.queryByText('▤')).toBeNull();
    expect(screen.queryByText('▣')).toBeNull();
  });

  it('opens the detail view from the visual', async () => {
    await renderCard();
    await fireEvent.press(screen.getByLabelText('offers.openDetail'));
    expect(callbacks.onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ offerId: 'o1' }));
  });

  it('invokes favorite, directions, comments and report actions', async () => {
    await renderCard();
    await fireEvent.press(screen.getByText('offers.favorite'));
    await fireEvent.press(screen.getByText('offers.directions.walk'));
    await fireEvent.press(screen.getByText('offers.action.comments'));
    await fireEvent.press(screen.getByRole('button', { name: 'offers.action.more' }));
    await fireEvent.press(screen.getByText('offers.report'));

    expect(callbacks.onFavorite).toHaveBeenCalledTimes(1);
    expect(callbacks.onDirections).toHaveBeenCalledTimes(1);
    expect(callbacks.onComments).toHaveBeenCalledTimes(1);
    expect(callbacks.onReport).toHaveBeenCalledTimes(1);
  });

  it('keeps maintenance actions behind a labelled card disclosure', async () => {
    await renderCard();

    const disclosure = screen.getByRole('button', { name: 'offers.action.more' });
    expect(disclosure).toBeTruthy();
    expect(screen.queryByLabelText('offers.action.available 3')).toBeNull();

    await fireEvent.press(disclosure);
    expect(screen.getByLabelText('offers.action.available 3')).toBeTruthy();
    expect(screen.getByLabelText('offers.report')).toBeTruthy();
  });

  it('submits positive and negative availability votes', async () => {
    await renderCard();
    await fireEvent.press(screen.getByRole('button', { name: 'offers.action.more' }));
    await fireEvent.press(screen.getByLabelText('offers.action.available 3'));
    await fireEvent.press(screen.getByLabelText('offers.action.unavailable 1'));
    expect(callbacks.onVote).toHaveBeenNthCalledWith(1, expect.anything(), 1);
    expect(callbacks.onVote).toHaveBeenNthCalledWith(2, expect.anything(), 2);
  });

  it('shows the reported warning for a reported offer', async () => {
    await renderCard({ isReported: true });
    expect(screen.getByText('offers.reported')).toBeTruthy();
    expect(screen.getByText('offers.reportedWarning')).toBeTruthy();
  });

  it('memoizes the row so unrelated state changes do not re-render every card', () => {
    expect((OfferCard as never as { $$typeof?: symbol }).$$typeof).toBe(Symbol.for('react.memo'));
  });

  it('uses authored glyphs instead of emoji for vote actions', async () => {
    await renderCard();
    expect(screen.queryAllByText(/[👍👎]/)).toHaveLength(0);
  });

  it('renders the canonical actions with glyphs in the canonical order', async () => {
    await renderCard();

    const order = glyphs(/^offer-card-action-/u).map((node) => node.props.testID);
    expect(order).toEqual([
      'offer-card-action-directions',
      'offer-card-action-favorite',
      'offer-card-action-comments',
    ]);
    expect(glyphs('offer-action-glyph').length).toBeGreaterThanOrEqual(3);
  });

  it('uses Material 3 card, badge and chip surfaces (OFFERS.GRID.CARDS.001-R7)', async () => {
    await renderCard();

    expect(hasComponent(screen.root, Card)).toBe(true);
    expect(hasComponent(screen.root, Badge)).toBe(true);
    expect(hasComponent(screen.root, Chip)).toBe(true);
  });

  it('uses Material 3 buttons for the primary card actions (OFFERS.GRID.CARDS.001-R8)', async () => {
    await renderCard();

    expect(hasComponent(screen.root, Button)).toBe(true);
    expect(hasComponent(screen.root, IconButton)).toBe(true);
  });

  it('builds every card press surface from Material 3 ripple and icon buttons (APP.PLATFORM.CHROME.001-R18)', async () => {
    await render(
      <OfferCard {...callbacks} offer={offer as never} query="" selectionMode selected />
    );

    expect(hasAncestor(screen.getByTestId('offer-card-action-directions'), TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByTestId('offer-card-selection'), TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByLabelText('offers.openDetail'), TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByTestId('offer-card-more'), IconButton)).toBe(true);
  });

  it('renders card copy with Material 3 type roles and the default face (APP.TYPOGRAPHY.001-R1/R7)', async () => {
    await renderCard();

    expect(hasComponent(screen.root, PaperText)).toBe(true);
    const businessName = screen.getByText('Main Street Cafe');
    const family = StyleSheet.flatten(businessName.props.style).fontFamily;
    expect(family).not.toBe('Georgia');
    expect(family).not.toBe('serif');
    expect(hasVariant(screen.getByText('Main Street Cafe'), 'titleLarge')).toBe(true);
    expect(hasVariant(screen.getByText('Coffee and snacks'), 'bodyMedium')).toBe(true);
  });
});
