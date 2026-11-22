import { render, screen } from '@testing-library/react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

let mockColumns = 1;

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/layout', () => ({
  resolveAddOfferColumns: () => mockColumns,
  keyboardAvoidanceBehavior: () => 'padding',
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      createOffer: jest.fn(),
      updateOffer: jest.fn(),
      getMyOfferDraft: jest.fn().mockResolvedValue(null),
      searchLocations: jest.fn(),
      reverseLocation: jest.fn(),
    },
    isPending: () => false,
    closeOverlay: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: { name: 'add-offer' },
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

describe('Add Offer tablet composition (ADD.OFFER.TABLET.LAYOUT.001)', () => {
  beforeEach(() => {
    mockColumns = 1;
  });

  afterEach(() => jest.restoreAllMocks());

  it('keeps a single column on phone width', async () => {
    await render(<AddOfferScreen />);

    expect(screen.queryByTestId('add-offer-tablet-columns')).toBeNull();
  });

  it('uses two columns on native tablet width with each control once', async () => {
    mockColumns = 2;
    await render(<AddOfferScreen />);

    expect(screen.getByTestId('add-offer-tablet-columns')).toBeTruthy();
    expect(screen.getByTestId('add-offer-column-primary')).toBeTruthy();
    expect(screen.getByTestId('add-offer-column-secondary')).toBeTruthy();
    expect(screen.getAllByPlaceholderText('add.descriptionPlaceholder')).toHaveLength(1);
    expect(screen.getAllByText('add.submitCreate')).toHaveLength(1);
  });

  it('uses the native column helper at tablet width', async () => {
    mockColumns = 2;
    await render(<AddOfferScreen />);

    expect(screen.getByTestId('add-offer-tablet-columns')).toBeTruthy();
  });
});
