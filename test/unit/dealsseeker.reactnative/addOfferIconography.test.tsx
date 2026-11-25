import { fireEvent, render, screen } from '@testing-library/react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';
import { translate } from '../../../src/DealsSeeker.ReactNative/src/utils/translations';

let mockLanguage = 'en';
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => {
  const { translate } = jest.requireActual('../../../src/DealsSeeker.ReactNative/src/utils/translations');
  return {
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
      preferences: { language: mockLanguage, navigationMode: 'pedestrian' },
      t: (key: string) => translate(mockLanguage, key),
    }),
  };
});

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));


describe('Add Offer control labels (ADD.OFFER.ICONOGRAPHY.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLanguage = 'en';
  });

  it('shows a plain-language label in the empty image area', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getByText('No photo selected')).toBeTruthy();
    expect(screen.queryByText('▤')).toBeNull();
  });

  it('labels reorder controls and keeps their accessible names in sync', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'AAA', uri: 'file://photo.jpg', mimeType: 'image/jpeg' }],
    });
    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByText('Upload Photos'));
    await screen.findByText('Move left');

    expect(screen.getByText('Move left')).toBeTruthy();
    expect(screen.getByText('Move right')).toBeTruthy();
    expect(screen.getByLabelText('Move left')).toBeTruthy();
    expect(screen.getByLabelText('Move right')).toBeTruthy();
    expect(screen.queryByText('←')).toBeNull();
    expect(screen.queryByText('→')).toBeNull();
  });

  it('renders tag chips without a trailing removal glyph', async () => {
    await render(<AddOfferScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('Describe the offer'), 'fresh coffee ');
    await screen.findByText('coffee');

    expect(screen.getByText('coffee').props.children).toBe('coffee');
    expect(screen.queryByText(/×/u)).toBeNull();
  });

  it('shows the labels in Spanish when the active language is Spanish', async () => {
    mockLanguage = 'es';
    await render(<AddOfferScreen />);

    expect(screen.getByText('Sin foto seleccionada')).toBeTruthy();
  });
});
