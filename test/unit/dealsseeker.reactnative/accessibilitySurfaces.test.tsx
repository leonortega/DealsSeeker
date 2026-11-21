import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { RegisterScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/RegisterScreen';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';
import { OfferDetailModal } from '../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal';
import { ImmersiveSearchOverlay } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveSearchOverlay';
import { ImmersiveFeedTabs } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveFeedTabs';

const mockRegisterUser = jest.fn();
const mockLogin = jest.fn();
const mockReverseLocation = jest.fn();
const mockCreateOffer = jest.fn();
const mockSetSession = jest.fn();
const mockShowLogin = jest.fn();
const mockCloseOverlay = jest.fn();
const mockOpenTab = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      registerUser: mockRegisterUser,
      login: mockLogin,
      reverseLocation: mockReverseLocation,
      createOffer: mockCreateOffer,
      getMyOfferDraft: jest.fn().mockResolvedValue(null),
    },
    closeOverlay: mockCloseOverlay,
    openTab: mockOpenTab,
    overlayRoute: { name: 'add-offer' },
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      background: '#f4efe6',
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
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    setSession: mockSetSession,
    showLogin: mockShowLogin,
    t: (key: string) => key,
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: jest.fn(() => null),
}));

const detailOffer = {
  offerId: 'o1',
  businessName: 'Cafe',
  description: 'Coffee',
  tags: [],
  imageUrl: 'https://example.com/a.jpg',
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

describe('accessible contribution and auth surfaces (APP.ACCESSIBILITY.UX.002)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReverseLocation.mockResolvedValue(null);
    mockRegisterUser.mockResolvedValue({ success: true });
    mockLogin.mockResolvedValue({ accessToken: 'tok' });
  });

  it('labels every registration input and announces validation errors', async () => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    await render(<RegisterScreen />);
    expect(screen.getByLabelText('auth.displayName')).toBeTruthy();
    expect(screen.getByLabelText('auth.email')).toBeTruthy();
    expect(screen.getByLabelText('auth.password')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'auth.loginLink' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'auth.registerButton' }));
    await waitFor(() =>
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('auth.nameRequired')
    );
  });

  it('offers a labelled accessible action to set the pin at the map center', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    const action = screen.getByRole('button', { name: 'add.setPinAtCenter' });
    await fireEvent.press(action);
    expect(await screen.findByText(/add\.pinnedLocation/)).toBeTruthy();
  });

  it('labels the search-overlay chips and buttons with their state', async () => {
    await render(
      <ImmersiveSearchOverlay
        visible
        query=""
        radiusMeters={1500}
        onChangeQuery={jest.fn()}
        onChangeRadius={jest.fn()}
        onSearch={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /1500 m/ }).props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByRole('button', { name: 'common.cancel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'common.search' })).toBeTruthy();
  });

  it('keeps immersive feed tabs at the 44-unit touch floor', async () => {
    await render(<ImmersiveFeedTabs activeTab="viewAll" onChangeTab={jest.fn()} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    tabs.forEach((tab) => expect(tab.props.style.minHeight).toBeGreaterThanOrEqual(44));
  });
});

describe('focused dialogs (APP.ACCESSIBILITY.UX.003)', () => {
  it('confines assistive technology focus to the detail dialog and labels its close control', async () => {
    await render(
      <OfferDetailModal
        offer={detailOffer}
        onClose={jest.fn()}
        onComments={jest.fn()}
        onDirections={jest.fn()}
        onFavorite={jest.fn()}
        visible
      />
    );
    expect(screen.getByTestId('offer-detail-sheet').props.accessibilityViewIsModal).toBe(true);
    expect(screen.getByRole('button', { name: 'offers.close' })).toBeTruthy();
  });
});
