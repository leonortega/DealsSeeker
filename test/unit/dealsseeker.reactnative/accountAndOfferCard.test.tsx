import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { OfferCard } from '../../../src/DealsSeeker.ReactNative/src/components/OfferCard';
import { AccountScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AccountScreen';

let mockActiveTab = 'account';
let mockPreferences = { language: 'en', navigationMode: 'pedestrian', themeMode: 'light' };
const mockGetMyProfile = jest.fn();
const mockGetMyOffers = jest.fn();
const mockDeleteOffer = jest.fn();
const mockLogout = jest.fn();
const mockOpenAddOffer = jest.fn();
const mockSaveAvatar = jest.fn();
const mockSetLanguage = jest.fn();
const mockSetNavigationMode = jest.fn();
const mockSetThemeMode = jest.fn();

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
    mockPreferences = { language: 'en', navigationMode: 'pedestrian', themeMode: 'light' };
    mockGetMyProfile.mockResolvedValue({
      displayName: 'Tester',
      email: 'tester@example.com',
      avatarId: 'avatar-2',
    });
    mockGetMyOffers.mockResolvedValue([offer]);
    mockDeleteOffer.mockResolvedValue({ success: true });
  });

  it('shows a change affordance on each settings control', async () => {
    await render(<AccountScreen />);

    expect(screen.getAllByText('›')).toHaveLength(3);
  });

  it('bounds the email to two lines so no fragment is stranded', async () => {
    await render(<AccountScreen />);

    expect(screen.getByText('tester@example.com').props.numberOfLines).toBe(2);
  });

  it('paints the scrollable content area with the active theme background', async () => {
    await render(<AccountScreen />);

    const scroll = screen.getByTestId('account-scroll');
    expect(scroll.props.style.backgroundColor).toBe('#17201d');
  });

  it('renders nothing outside the account tab', async () => {
    mockActiveTab = 'offers';
    await render(<AccountScreen />);
    expect(screen.queryByText('account.settings')).toBeNull();
  });

  it('loads the profile and owned offers', async () => {
    await render(<AccountScreen />);
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

    await render(<AccountScreen />);
    await screen.findByText('Tester');
    expect(screen.getAllByText('🙂')).toHaveLength(2);

    await fireEvent.press(screen.getByLabelText('settings.avatar cat'));

    await waitFor(() => expect(screen.getAllByText('🐱')).toHaveLength(2));
    expect(mockSaveAvatar).toHaveBeenCalledWith('cat');
  });

  it('toggles theme, language and navigation mode', async () => {
    await render(<AccountScreen />);
    await fireEvent.press(screen.getByText('nav.lightTheme'));
    await fireEvent.press(screen.getByText('EN'));
    await fireEvent.press(screen.getByText('nav.pedestrian'));
    expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
    expect(mockSetNavigationMode).toHaveBeenCalledWith('car');
  });

  it('logs out from the hero', async () => {
    await render(<AccountScreen />);
    await fireEvent.press(screen.getByText('account.logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('opens the selected offer for editing', async () => {
    await render(<AccountScreen />);
    await screen.findByText('Main Street Cafe');
    await fireEvent.press(screen.getByText('account.editOffer'));
    expect(mockOpenAddOffer).toHaveBeenCalledWith('o1');
  });

  it('removes an offer after confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.[1]?.onPress?.();
    });
    await render(<AccountScreen />);
    await screen.findByText('Main Street Cafe');

    await fireEvent.press(screen.getByText('account.removeOffer'));

    await waitFor(() => expect(mockDeleteOffer).toHaveBeenCalledWith('o1'));
    expect(screen.queryByText('Main Street Cafe')).toBeNull();
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

  it('opens the detail view from the visual', async () => {
    await renderCard();
    await fireEvent.press(screen.getByText('▤'));
    expect(callbacks.onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ offerId: 'o1' }));
  });

  it('invokes favorite, directions, comments and report actions', async () => {
    await renderCard();
    await fireEvent.press(screen.getByText('offers.favorite'));
    await fireEvent.press(screen.getByText('offers.directions.walk'));
    await fireEvent.press(screen.getByText('offers.action.comments'));
    await fireEvent.press(screen.getByText('offers.report'));

    expect(callbacks.onFavorite).toHaveBeenCalledTimes(1);
    expect(callbacks.onDirections).toHaveBeenCalledTimes(1);
    expect(callbacks.onComments).toHaveBeenCalledTimes(1);
    expect(callbacks.onReport).toHaveBeenCalledTimes(1);
  });

  it('submits positive and negative availability votes', async () => {
    await renderCard();
    await fireEvent.press(screen.getByText('👍 3'));
    await fireEvent.press(screen.getByText('👎 1'));
    expect(callbacks.onVote).toHaveBeenNthCalledWith(1, expect.anything(), 1);
    expect(callbacks.onVote).toHaveBeenNthCalledWith(2, expect.anything(), 2);
  });

  it('shows the reported warning for a reported offer', async () => {
    await renderCard({ isReported: true });
    expect(screen.getByText('offers.reported')).toBeTruthy();
    expect(screen.getByText('offers.reportedWarning')).toBeTruthy();
  });
});
