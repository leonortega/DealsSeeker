import { render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';
import { keyboardAvoidanceBehavior } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

let mockOverlayRoute: { name: string; offerId?: string } | null = { name: 'add-offer' };
const mockGetMyOfferDraft = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      createOffer: jest.fn(),
      updateOffer: jest.fn(),
      getMyOfferDraft: mockGetMyOfferDraft,
      searchLocations: jest.fn(),
      reverseLocation: jest.fn(),
    },
    isPending: () => false,
    closeOverlay: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: mockOverlayRoute,
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
      success: '#2f6e46',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    t: (key: string) => key,
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

describe('Add Offer keyboard-safe layout (ADD.OFFER.KEYBOARD.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'add-offer' };
    mockGetMyOfferDraft.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wraps the form in a keyboard-avoiding view', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getByTestId('add-offer-keyboard-view')).toBeTruthy();
  });

  it('maps each platform to its keyboard-avoidance behavior', () => {
    expect(keyboardAvoidanceBehavior('ios')).toBe('padding');
    expect(keyboardAvoidanceBehavior('android')).toBe('height');
    expect(keyboardAvoidanceBehavior('web')).toBe('height');
    expect(keyboardAvoidanceBehavior(Platform.OS)).toBe(Platform.OS === 'ios' ? 'padding' : 'height');
  });

  it('lets taps on other controls work while the keyboard is open', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getByTestId('add-offer-scroll').props.keyboardShouldPersistTaps).toBe('handled');
  });

  it('preserves the bottom safe-area padding while the form avoids the keyboard', async () => {
    await render(<AddOfferScreen />);

    const scroll = screen.getByTestId('add-offer-scroll');
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(58);
  });

  it('applies keyboard avoidance in edit mode too', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    mockGetMyOfferDraft.mockResolvedValue({
      description: ' prefilled ',
      tags: ['coffee'],
      images: [],
      location: null,
    });

    await render(<AddOfferScreen />);

    expect(screen.getByTestId('add-offer-keyboard-view')).toBeTruthy();
    expect(screen.getByTestId('add-offer-scroll').props.keyboardShouldPersistTaps).toBe('handled');
  });
});
